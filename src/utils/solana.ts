import { SYSTEM_PROGRAM_ADDRESS } from '@solana-program/system'
import {
  AccountRole,
  address,
  appendTransactionMessageInstruction,
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
  createTransactionMessage,
  devnet,
  fixCodecSize,
  getArrayCodec,
  getBase58Codec,
  getBase64Codec,
  getBytesCodec,
  getProgramDerivedAddress,
  getStructCodec,
  getTransactionMessageSize,
  getU8Codec,
  getU32Codec,
  getU64Codec,
  lamports,
  mainnet,
  pipe,
  setTransactionMessageFeePayerSigner,
  TRANSACTION_SIZE_LIMIT,
  type Address,
  type Epoch,
  type Instruction,
  type Lamports,
  type TransactionMessage,
  type TransactionMessageWithFeePayer,
  type TransactionSigner,
} from '@solana/kit'

// ---------------------------------------------------------------------------
// Assert
// ---------------------------------------------------------------------------

const makeNamedError = (name: string) =>
  class extends Error {
    constructor(message: string) {
      super(message)
      this.name = name
    }
  }

const AssertError = makeNamedError('AssertError')

export function assert<T>(val: T | null | undefined, msg = `Expected ${val} to be truthy`): asserts val is T {
  if (!val) throw new AssertError(msg)
}

// ---------------------------------------------------------------------------
// RPC
// ---------------------------------------------------------------------------

/** Module-level RPC client built from EXPO_PUBLIC_SOLANA_* env vars */
export const rpc = (() => {
  const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
  const network = process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? 'devnet'
  const url = network === 'mainnet-beta' ? mainnet(rpcUrl) : devnet(rpcUrl)
  const transport = createDefaultRpcTransport({ url })
  return createSolanaRpcFromTransport(transport)
})()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrawKind = 'regular' | 'big'

export interface DrawConfig {
  admin: Address
  operator: Address
  dealer: Address
  drawDeadline: number
  regularDrawInterval: number
  nextBigDrawEpoch: Epoch
  bigDrawDurationEpoch: number
  isEnabled: boolean
}

export type Winner = {
  stakeId: bigint
  winnerId: bigint
  stake: bigint
  withdrawer: Address
  proof: string[]
  prize: Lamports
  /** Slot for regular draws, epoch for big draws — identifies which draw this prize is from */
  epochOrSlot: bigint
  /** undefined means unclaimed */
  claimPda: Address | undefined
  kind: DrawKind
  /** Slot when draw was revealed */
  revealedAt: bigint
  revealedAtDate?: Date
}

export type InstructionBatch = { instructions: Instruction[]; indices: number[] }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder()

export const PROGRAM_ID = address(process.env.EXPO_PUBLIC_SOLANA_PROGRAM_ID ?? '')

export const CONFIG_SEED = textEncoder.encode('config')
export const METRICS_SEED = textEncoder.encode('metrics')
export const REGULAR_DRAW_SEED = textEncoder.encode('regular_draw')
export const BIG_DRAW_SEED = textEncoder.encode('big_draw')
export const CLAIMED_SEED = textEncoder.encode('claimed')

export const StateDiscriminators = {
  Config: 1,
  Participants: 2,
  RegularDraw: 3,
  BigDraw: 4,
  Metrics: 5,
  Claimed: 6,
} as const

export const DrawProgramInstructions = {
  Claim: 7,
} as const

export const SOLANA_SLOT_MS = 400

/** Fixed amount of SOL spent on a claim account */
export const DRAW_CLAIM_RENT = lamports(1447680n)
export const MIN_BALANCE_FOR_TX = lamports(10000n)

// Pre-calculated values for UI (real rent is calculated during TX creation)
export const ACCOUNT_CREATION_COST = lamports(2280000n)
export const TX_RENT = lamports(2280000n)
export const STAKE_TX_PRECALCULATED_COST = lamports(MIN_BALANCE_FOR_TX * 5n + ACCOUNT_CREATION_COST + TX_RENT)

/** Max wait time for draw reveal */
export const REGULAR_DRAW_TIMEOUT_MS = 5 * 60 * 1000

// ---------------------------------------------------------------------------
// Codecs
// ---------------------------------------------------------------------------

export const base58Codec = getBase58Codec()
export const base64Codec = getBase64Codec()

export const AccountHeaderCodec = getStructCodec([
  ['discriminator', getU8Codec()],
  ['version', getU8Codec()],
  ['bump', getU8Codec()],
  ['_reserved', fixCodecSize(getBytesCodec(), 5)],
])
export const AccountHeaderSize = AccountHeaderCodec.fixedSize

export const ConfigCodec = getStructCodec([
  ['admin', fixCodecSize(getBytesCodec(), 32)],
  ['operator', fixCodecSize(getBytesCodec(), 32)],
  ['dealer', fixCodecSize(getBytesCodec(), 32)],
  ['drawDeadline', getU32Codec()],
  ['regularDrawInterval', getU32Codec()],
  ['nextBigDrawEpoch', getU64Codec()],
  ['bigDrawDurationEpoch', getU8Codec()],
  ['isEnabled', getU8Codec()],
  ['_reserved', fixCodecSize(getBytesCodec(), 6)],
])

const ClaimInstructionBodyCodec = getStructCodec([
  ['discriminator', getU8Codec()],
  ['kind', getU8Codec()],
  ['winner_id', getU64Codec()],
  ['stake_id', getU64Codec()],
  ['stake', getU64Codec()],
  ['proof', getArrayCodec(fixCodecSize(getBytesCodec(), 32), { size: 'remainder' })],
])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bigIntToBufferLE(value: bigint): Uint8Array {
  const buffer = new Uint8Array(8)
  for (let i = 0; i < 8; i++) {
    buffer[i] = Number((value >> (BigInt(i) * 8n)) & 0xffn)
  }
  return buffer
}

// ---------------------------------------------------------------------------
// prepareClaimInstruction
// ---------------------------------------------------------------------------

/** Build an unsigned claim instruction for a single winner */
export async function prepareClaimInstruction(winner: Winner, wallet: Address): Promise<Instruction> {
  const isBigDraw = winner.kind === 'big'
  const txSigner = { address: wallet } as TransactionSigner

  const [claimedPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [
      CLAIMED_SEED,
      new Uint8Array([isBigDraw ? 1 : 0]),
      bigIntToBufferLE(winner.epochOrSlot),
      bigIntToBufferLE(winner.winnerId),
    ],
  })

  const [configPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [CONFIG_SEED],
  })

  const [metricsPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [METRICS_SEED],
  })

  const drawSeed = isBigDraw ? BIG_DRAW_SEED : REGULAR_DRAW_SEED
  const [drawPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [drawSeed, bigIntToBufferLE(winner.epochOrSlot)],
  })

  const claimIxData = ClaimInstructionBodyCodec.encode({
    discriminator: DrawProgramInstructions.Claim,
    kind: isBigDraw ? 1 : 0,
    winner_id: winner.winnerId,
    stake_id: winner.stakeId,
    stake: winner.stake,
    proof: winner.proof.map((p) => Uint8Array.from(base58Codec.encode(p))),
  })

  return {
    programAddress: PROGRAM_ID,
    data: claimIxData,
    accounts: [
      { address: txSigner.address, role: AccountRole.WRITABLE_SIGNER },
      { address: txSigner.address, role: AccountRole.WRITABLE },
      { address: address(configPda), role: AccountRole.READONLY },
      { address: address(drawPda), role: AccountRole.WRITABLE },
      { address: address(claimedPda), role: AccountRole.WRITABLE },
      { address: address(metricsPda), role: AccountRole.WRITABLE },
      { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
    ],
  }
}

// ---------------------------------------------------------------------------
// batchInstructions
// ---------------------------------------------------------------------------

/** Pack instructions into transaction-size-limited batches */
export function batchInstructions(instructions: Instruction[], signer: TransactionSigner): InstructionBatch[] {
  const batches: InstructionBatch[] = []
  let currentBatch: InstructionBatch = { instructions: [], indices: [] }

  // This is used to properly calculate instruction size together with message info
  const createBaseMessage = () =>
    pipe(createTransactionMessage({ version: 0 }), (msg) => setTransactionMessageFeePayerSigner(signer, msg))

  let testMessage: TransactionMessage & TransactionMessageWithFeePayer = createBaseMessage()

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i]!
    const testWithIx: TransactionMessage & TransactionMessageWithFeePayer = appendTransactionMessageInstruction(
      ix,
      testMessage,
    )

    const size = getTransactionMessageSize(testWithIx)

    if (size <= TRANSACTION_SIZE_LIMIT) {
      currentBatch.instructions.push(ix)
      currentBatch.indices.push(i)
      testMessage = testWithIx
    } else if (currentBatch.instructions.length === 0) {
      console.warn('Instruction too large for single transaction, skipping:', ix.data?.byteLength)
    } else {
      batches.push(currentBatch)
      currentBatch = { instructions: [ix], indices: [i] }
      testMessage = appendTransactionMessageInstruction(ix, createBaseMessage())
    }
  }

  if (currentBatch.instructions.length > 0) batches.push(currentBatch)
  return batches
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export const lamportsToSol = (lamportsValue: Lamports): number => Number(lamportsValue) / 1e9
