import {
  type AccountInfoBase,
  type AccountInfoWithBase64EncodedData,
  type AccountInfoWithPubkey,
  type Address,
  type ClusterUrl,
  type Epoch,
  type Instruction,
  type Lamports,
  type Rpc,
  type RpcResponse,
  type RpcTransport,
  type SendableTransaction,
  type Signature,
  type SolanaRpcApi,
  type SolanaRpcResponse,
  type Transaction,
  type TransactionSigner,
  AccountRole,
  TRANSACTION_SIZE_LIMIT,
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  compileTransaction,
  createSolanaRpc,
  createSolanaRpcFromTransport,
  createTransactionMessage,
  devnet,
  generateKeyPairSigner,
  getBase64EncodedWireTransaction,
  getProgramDerivedAddress,
  getTransactionCodec,
  getTransactionMessageSize,
  lamports,
  mainnet,
  partiallySignTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
export type { Lamports, Address } from '@solana/kit';

import { createHttpTransport } from '@solana/rpc-transport-http';

import {
  getCompiledTransactionMessageCodec,
  type TransactionMessage,
  type TransactionMessageWithFeePayer,
} from '@solana/transaction-messages';

import {
  getBase58Codec,
  getBase64Codec,
  getStructCodec,
  getU64Codec,
  getU32Codec,
  getU8Codec,
  getBytesCodec,
  fixCodecSize,
  transformCodec,
  getArrayCodec,
  type ReadonlyUint8Array,
} from '@solana/codecs';
import { getCreateAccountInstruction, SYSTEM_PROGRAM_ADDRESS } from '@solana-program/system';
import { getDeactivateInstruction, getSplitInstruction, STAKE_PROGRAM_ADDRESS } from '@solana-program/stake';

import { SOLANA_MAINNET_CHAIN, SOLANA_DEVNET_CHAIN } from '@solana/wallet-standard-chains';
import { keccak_256 } from '@noble/hashes/sha3.js';

import { assert, bigIntToBufferLE, jsonApiClient, compareBytes, wait } from './utils';
import config from './config';
// ----- Data Client -----

export type SolanaRpc = ReturnType<typeof createSolanaRpc>;
export type SolanaAccountNotification = SolanaRpcResponse<AccountInfoBase & AccountInfoWithBase64EncodedData>;

const MAX_RETRIES = 5;
const BASE_RETRY_TIME = 2000;
const MAX_RETRY_TIME_MS = 5000;
const MAX_COOLDOWN_MS = 10000;
const RATE_LIMIT_WINDOW_MS = 1100 as const;
const RATE_LIMIT_RATE = 4 as const;

function createRetryingTransport(url: ClusterUrl): <T>(...args: Parameters<RpcTransport>) => Promise<RpcResponse<T>> {
  const defaultTransport = createHttpTransport({ url });

  // Rate limiting state
  const rateLimitTimestamps: number[] = [];
  let rateLimitLock: Promise<void> = Promise.resolve();
  let currentCooldownMs = 0;

  const rateLimit = async (): Promise<void> => {
    const purge = () => {
      while (rateLimitTimestamps.length > 0 && rateLimitTimestamps[0]! < Date.now() - RATE_LIMIT_WINDOW_MS) {
        rateLimitTimestamps.shift();
      }
    };

    rateLimitLock = rateLimitLock.then(async () => {
      purge();
      if (rateLimitTimestamps.length >= RATE_LIMIT_RATE) {
        await wait(rateLimitTimestamps[0]! + RATE_LIMIT_WINDOW_MS - Date.now());
        purge();
      }
      if (currentCooldownMs > 0) {
        await wait(currentCooldownMs);
      }
      rateLimitTimestamps.push(Date.now());
    });

    return rateLimitLock;
  };

  return async <T>(...args: Parameters<RpcTransport>): Promise<RpcResponse<T>> => {
    let reqError;
    for (let attempt = 0; attempt < MAX_RETRIES; ++attempt) {
      try {
        await rateLimit();
        const result = await defaultTransport<T>(...args);
        currentCooldownMs = Math.max(0, currentCooldownMs / 2);
        return result;
      } catch (err: any) {
        reqError = err;
        currentCooldownMs = Math.min(1000 * Math.pow(2, attempt), MAX_COOLDOWN_MS);

        if (attempt < MAX_RETRIES - 1) {
          const baseWait = BASE_RETRY_TIME * Math.pow(2, attempt);
          const waitTime = Math.min(baseWait, MAX_RETRY_TIME_MS);
          const method = (args[0].payload as any)?.['method'] ?? 'UNKNOWN METHOD';
          console.warn(`RPC retry for ${method} ${attempt + 1}/${MAX_RETRIES - 1}, waiting ${Math.round(waitTime)}ms`);
          await wait(waitTime);
        }
      }
    }
    throw reqError;
  };
}

export function createRetryingRpc(url: ClusterUrl): SolanaRpc {
  return createSolanaRpcFromTransport(createRetryingTransport(url));
}

export const retryingClient = createRetryingRpc(getNetUrl());

export type ValidatorStakeData = {
  totalStakedSol: Lamports;
  totalStakedUsd: number;
  totalRewards: number;
  delegators: number;
  stakeAccs: AccountInfoWithPubkey<AccountInfoBase>[];
};

export type DistributionMetrics = {
  totalDrawn: Lamports;
  totalClaimed: Lamports;
  totalWithdrawn: Lamports;
  totalDrawnUsd: number;
  totalClaimedUsd: number;
  totalWithdrawnUsd: number;
};

export interface DrawConfig {
  admin: Address;
  operator: Address;
  dealer: Address;
  drawDeadline: number;
  regularDrawInterval: number;
  nextBigDrawEpoch: Epoch;
  bigDrawDurationEpoch: number;
  isEnabled: boolean;
}

export type UserStakeAccount = {
  pubkey: Address;
  lamports: Lamports;
  state: 'active' | 'inactive' | 'deactivating' | 'activating';
  rentExemptReserve: number;
  delegatedStake: number;
  voter: string;
  activationEpoch: string;
  deactivationEpoch: string;
};

export type RegularDrawParticipationStatus = 'inactive' | 'activating' | 'participating';
export type RegularDrawParticipation = {
  status: RegularDrawParticipationStatus;
};

export type BigDrawParticipationStatus = 'inactive' | 'activating' | 'participating';
export type BigDrawParticipation = {
  status: BigDrawParticipationStatus;
  epochs: number;
  duration: number;
};

export type DrawKind = 'regular' | 'big';

export enum DrawStage {
  Draw = 0,
  Reveal = 1,
}

/**
 */
export type Draw = {
  /** Epoch or Slot for which draw has been called */
  epochOrSlot: bigint;
  /** Prize fund*/
  prizeFund: Lamports;
  /** Lamports claimed */
  claimed: Lamports;
  /** Lamports withdrawn */
  withdrawn: Lamports;
  /** Token account with prize fund */
  pool: Address;
  /** Merkle Root of the draw */
  merkleRoot: string;
  /** Eligible stake for the draw */
  eligibleStake: bigint;
  /** Hash of the secret used in the draw */
  secretHash: string;
  /** VRF Seed */
  seed: string;
  updatedAt: bigint;
  /** Draw and Reveal must be completed before this slot */
  drawDeadline: bigint | null;
  /** Number of winners */
  winners: number;
  /** Current stage of the draw */
  stage: DrawStage;

  /** Winner ids with their prizes. Correlate them with merkle tree data */
  winnersArray: Array<{ winnerId: bigint; prize: bigint }>;
};

export const SOLANA_MAX_EPOCH = 18446744073709551615n as Epoch;
export const assertIsEpoch = (n: bigint): Epoch => {
  assert(n <= SOLANA_MAX_EPOCH, `Epoch must be less than ${SOLANA_MAX_EPOCH}`);
  return n as Epoch;
};

export type MerkleTreeSnapshot = {
  merkle_root: string;
  max_num_nodes: number;
  tree_nodes: {
    stake_id: number;
    stake: number;
    withdrawer: string;
    proof: string[];
  }[];
};

export type Snapshot = RegularSnapshot | BigSnapshot;

type RegularSnapshotBase = {
  config: {
    vote_account: string;
    excluded: string[];
    lamports_per_share: number;
    lamports_per_point: number;
    are_points_modify_stake: boolean;
  };
  context: {
    created_at: string;
    slot: number;
    epoch: number;
  };
  raw: Record<string, string>;
  stakes: Record<string, number>;
  merkle_tree: MerkleTreeSnapshot;
};

export type RegularSnapshotV1 = RegularSnapshotBase;

export type RegularSnapshotV2 = RegularSnapshotBase & {
  points: {
    decimals: number;
    current_points: Record<string, number>;
    points: Record<string, number>;
  };
  effective_stakes: Record<string, number>;
  shares: Record<string, number>;
};

export type RegularSnapshot = RegularSnapshotV1 | RegularSnapshotV2;

export type BigSnapshot = {
  created_at: string;
  effective_stakes: Record<string, number>;
  epoch: number;
  epoches: Record<
    number,
    {
      effective_stakes: Record<string, number>;
      raw: Record<string, string>;
      stakes: Record<string, number>;
    }
  >;
  merkle_tree: MerkleTreeSnapshot;
  stakes: Record<string, number>;
  vote_account: number[];
};

export function isRegularSnapshot(snapshot: Snapshot): snapshot is RegularSnapshot {
  return 'config' in snapshot && 'merkle_tree' in snapshot && 'context' in snapshot;
}

export function isRegularSnapshotV2(snapshot: RegularSnapshot): snapshot is RegularSnapshotV2 {
  return 'effective_stakes' in snapshot && 'shares' in snapshot && 'points' in snapshot;
}

export function isRegularSnapshotV1(snapshot: RegularSnapshot): snapshot is RegularSnapshotV1 {
  return !isRegularSnapshotV2(snapshot);
}

export function assertIsRegularSnapshot(snapshot: Snapshot): asserts snapshot is RegularSnapshot {
  assert('config' in snapshot);
  assert('context' in snapshot);
  assert('merkle_tree' in snapshot);
}

export function isBigSnapshot(snapshot: Snapshot): snapshot is BigSnapshot {
  return 'epoches' in snapshot;
}

export function assertIsBigSnapshot(snapshot: Snapshot): asserts snapshot is BigSnapshot {
  assert('epoches' in snapshot);
}

export function findWinnerInSnapshot(snapshot: Snapshot, winnerId: bigint) {
  return snapshot.merkle_tree.tree_nodes.find(
    ({ stake_id, stake }) => stake_id <= winnerId && winnerId < stake_id + stake,
  );
}

export type LeaderboardEntry = {
  address: Address;
  totalStaked: number;
  points: number;
};

export type AprSnapshot = {
  updatedAt: Date;
  period: {
    from: Date;
    to: Date;
    days: number;
  };
  totalUsers: number;
  data: Record<Address, number>;
};

export type PastWinner = {
  winnerAddress: Address;
  prize: Lamports;
  timestamp: Date;
  revealSignature: string;
  drawPDA: Address;
  kind: DrawKind;

  // FIXME: make required
  epoch?: Epoch;
  points?: number;
  stake?: Lamports;
};

export type Winner = {
  stakeId: bigint;
  winnerId: bigint;
  stake: bigint;
  withdrawer: Address;
  proof: string[];
  prize: Lamports;
  epochOrSlot: bigint; // Slot for regular draws, epoch for big draws - identifies which draw this prize is from
  claimPda: Address | undefined; // undefined means unclaimed
  kind: DrawKind;
  revealedAt: bigint; // Slot when draw was revealed
  revealedAtDate?: Date;
};

export const StateDiscriminators = {
  Config: 1,
  Participants: 2,
  RegularDraw: 3,
  BigDraw: 4,
  Metrics: 5,
  Claimed: 6,
} as const;

export const DrawProgramInstructions = {
  Initialize: 0,
  UpdateConfig: 1,
  SetStatus: 2,
  MakeSnapshot: 3,
  CreatePool: 4,
  Draw: 5,
  Reveal: 6,
  Claim: 7,
  Withdraw: 8,
} as const;

export const PROGRAM_ID = address(config.SOLANA_PROGRAM_ID);
export const ORAO_VRF_PROGRAM_ID = address('VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y');

export const base58Codec = getBase58Codec();
export const base64Codec = getBase64Codec();

// Custom codec for Option<NonZeroU64>
export const getNonZeroU64OptionCodec = () =>
  transformCodec(
    getU64Codec(),
    (value: bigint | null) => value ?? 0n,
    (value: bigint) => (value === 0n ? null : value),
  );

export const AccountHeaderCodec = getStructCodec([
  ['discriminator', getU8Codec()],
  ['version', getU8Codec()],
  ['bump', getU8Codec()],
  ['_reserved', fixCodecSize(getBytesCodec(), 5)],
]);
export const AccountHeaderSize = AccountHeaderCodec.fixedSize;

export const WinnerCodec = getStructCodec([
  ['winnerId', getU64Codec()],
  ['prize', getU64Codec()],
]);

export const DrawCodec = getStructCodec([
  ['epochOrSlot', getU64Codec()],
  ['prizeFund', getU64Codec()],
  ['claimed', getU64Codec()],
  ['withdrawn', getU64Codec()],
  ['pool', fixCodecSize(getBytesCodec(), 32)], // Pubkey
  ['merkleRoot', fixCodecSize(getBytesCodec(), 32)],
  ['eligibleStake', getU64Codec()],
  ['secretHash', fixCodecSize(getBytesCodec(), 32)],
  ['seed', fixCodecSize(getBytesCodec(), 32)],
  ['updatedAt', getU64Codec()],
  ['drawDeadline', getNonZeroU64OptionCodec()],
  ['winners', getU32Codec()],
  ['stage', getU8Codec()],
  ['_reserved', fixCodecSize(getBytesCodec(), 3)],
]);

export const MetricsCodec = getStructCodec([
  ['totalDrawn', getU64Codec()],
  ['totalClaimed', getU64Codec()],
  ['totalWithdrawn', getU64Codec()],
]);

export const ConfigCodec = getStructCodec([
  ['admin', fixCodecSize(getBytesCodec(), 32)], // Pubkey
  ['operator', fixCodecSize(getBytesCodec(), 32)], // Pubkey
  ['dealer', fixCodecSize(getBytesCodec(), 32)], // Pubkey
  ['drawDeadline', getU32Codec()],
  ['regularDrawInterval', getU32Codec()],
  ['nextBigDrawEpoch', getU64Codec()],
  ['bigDrawDurationEpoch', getU8Codec()],
  ['isEnabled', getU8Codec()],
  ['_reserved', fixCodecSize(getBytesCodec(), 6)],
]);

// pub kind: DrawKind,
// pub winner_id: u64,
// pub stake_id: u64,
// pub stake: u64,
// pub proof: &'a [[u8; 32]],
export const ClaimInstructionDataCodec = transformCodec(
  getStructCodec([
    ['discriminator', getU8Codec()],
    ['kind', getU8Codec()],
    ['winner_id', getU64Codec()],
    ['stake_id', getU64Codec()],
    ['stake', getU64Codec()],
    ['proof', getArrayCodec(fixCodecSize(getBytesCodec(), 32), { size: 'remainder' })],
  ]),
  (val: ClaimInstructionDataArgs) => ({ ...val, discriminator: DrawProgramInstructions.Claim as number }),
);

export type ClaimInstructionDataArgs = {
  kind: number;
  winner_id: bigint;
  stake_id: bigint;
  stake: bigint;
  proof: ReadonlyUint8Array[];
};

export const DrawInstructionDataCodec = getStructCodec([
  ['discriminator', getU8Codec()],
  ['bump', getU8Codec()],
  ['kind', getU8Codec()],
  ['epochOrSlot', getU64Codec()],
  ['winners', getU32Codec()],
  ['_padding', fixCodecSize(getBytesCodec(), 3)],
  ['secretHash', fixCodecSize(getBytesCodec(), 32)],
  ['seed', fixCodecSize(getBytesCodec(), 32)],
]);

export const RevealInstructionDataCodec = getStructCodec([
  ['discriminator', getU8Codec()],
  ['kind', getU8Codec()],
  ['_padding', fixCodecSize(getBytesCodec(), 3)],
  ['secret', fixCodecSize(getBytesCodec(), 32)],
]);

// Seeds for PDA derivation
export const textEncoder = new TextEncoder();
export const CONFIG_SEED = textEncoder.encode('config');
export const METRICS_SEED = textEncoder.encode('metrics');
export const REGULAR_DRAW_SEED = textEncoder.encode('regular_draw');
export const BIG_DRAW_SEED = textEncoder.encode('big_draw');
export const REGULAR_POOL_SEED = textEncoder.encode('regular_pool');
export const BIG_POOL_SEED = textEncoder.encode('big_pool');
export const CLAIMED_SEED = textEncoder.encode('claimed');
// const AUTHORITY_SEED = textEncoder.encode('authority');

export const ORAO_VRF_RANDOMNESS_REQUEST_SEED = 'orao-vrf-randomness-request';

export const LEAF_PREFIX = new Uint8Array([0]);
export const INTERMEDIATE_PREFIX = new Uint8Array([1]);

export const SOLANA_SLOT_MS = 400;

/** Fixed amount of sol is spent on a claim account */
export const DRAW_CLAIM_RENT = lamports(1447680n);
export const MIN_BALANCE_FOR_TX = lamports(10000n); // 0.00001 SOL

// This is pre-calculated values for UI. Real rent will be calculated during TX creation
export const ACCOUNT_CREATION_COST = lamports(2280000n);
export const TX_RENT = lamports(2280000n);
export const STAKE_TX_PRECALCULATED_COST = lamports(MIN_BALANCE_FOR_TX * 5n + ACCOUNT_CREATION_COST + TX_RENT);
/** Max wait time for draw reveal */
export const REGULAR_DRAW_TIMEOUT_MS = 5 * 60 * 1000;

export function getNetUrl() {
  return config.SOLANA_NETWORK === 'devnet' ? devnet(config.SOLANA_RPC_URL) : mainnet(config.SOLANA_RPC_URL);
}

export function getChain() {
  return config.SOLANA_NETWORK === 'devnet' ? SOLANA_DEVNET_CHAIN : SOLANA_MAINNET_CHAIN;
}

export function addressToShortString(address: Address | string): `${string}..${string}` {
  return `${address.slice(0, 4)}..${address.slice(-4)}`;
}

const SOLSCAN_URL = 'https://solscan.io';

export function getExplorerUrl(address: Address | string, type: 'account' | 'tx' = 'account'): string {
  const params = new URLSearchParams();

  if (config.SOLANA_NETWORK === 'devnet') {
    params.set('cluster', 'devnet');
  }

  const queryString = params.toString();
  return `${SOLSCAN_URL}/${type === 'account' ? 'account' : 'tx'}/${address}${queryString ? `?${queryString}` : ''}`;
}

export const lamportsToSol = (lamports: Lamports) => Number(lamports) / 1e9;

export function slotsToMs(slot: bigint) {
  return Number(slot) * SOLANA_SLOT_MS;
}

/** Returns slot for last revealed draw */
export function getPrevDrawSlot(currentSlot: bigint, interval: number): bigint {
  return (currentSlot / BigInt(interval)) * BigInt(interval);
}

/** Returns slot for draw that will be drawn at that slot */
export function getNextDrawSlot(currentSlot: bigint, interval: number): bigint {
  return getPrevDrawSlot(currentSlot, interval) + BigInt(interval);
}

export function getEpochFirstSlot(epochInfo: { epoch: bigint; absoluteSlot: bigint; slotIndex: bigint }): bigint {
  return epochInfo.absoluteSlot - epochInfo.slotIndex;
}

export function getEpochFromSlot(
  slot: bigint,
  epochInfo: { epoch: bigint; absoluteSlot: bigint; slotIndex: bigint; slotsInEpoch: bigint },
): bigint {
  const currentEpochFirstSlot = getEpochFirstSlot(epochInfo);

  // If slot is in current epoch or later
  if (slot >= currentEpochFirstSlot) {
    const epochDiff = (slot - currentEpochFirstSlot) / epochInfo.slotsInEpoch;
    return epochInfo.epoch + epochDiff;
  }

  // Slot is in a previous epoch
  const slotsBehind = currentEpochFirstSlot - slot;
  const epochsBehind = (slotsBehind + epochInfo.slotsInEpoch - 1n) / epochInfo.slotsInEpoch;
  return epochInfo.epoch - epochsBehind;
}

export function getSlotOfEpoch(
  targetEpoch: bigint,
  epochInfo: { epoch: bigint; absoluteSlot: bigint; slotIndex: bigint; slotsInEpoch: bigint },
): bigint {
  const currentEpochFirstSlot = getEpochFirstSlot(epochInfo);

  if (targetEpoch >= epochInfo.epoch) {
    return currentEpochFirstSlot + (targetEpoch - epochInfo.epoch) * epochInfo.slotsInEpoch;
  }

  return currentEpochFirstSlot - (epochInfo.epoch - targetEpoch) * epochInfo.slotsInEpoch;
}

/**
 * Generate regular draw slots going backwards from current slot across multiple epochs
 * Returns slots in descending order (newest first)
 * @param maxSlots Maximum number of slots to generate (for batching)
 */
export function getRegularDrawSlotsBackwards(currentSlot: bigint, interval: number, maxSlots: number = 100): bigint[] {
  const slots: bigint[] = [];
  const intervalBigInt = BigInt(interval);

  // Find the most recent completed draw slot
  let slot = getPrevDrawSlot(currentSlot, interval);
  if (slot >= currentSlot) {
    slot = slot - intervalBigInt;
  }

  // Go backwards, collecting completed draw slots
  for (let i = 0; i < maxSlots && slot > 0n; i++) {
    slots.push(slot);
    slot -= intervalBigInt;
  }

  return slots;
}

export function constructMerkleLeaf(stakeId: bigint, stake: bigint, withdrawer: Uint8Array): Uint8Array {
  const stakeIdBuf = new ArrayBuffer(8);
  new DataView(stakeIdBuf).setBigUint64(0, stakeId, true);

  const stakeBuf = new ArrayBuffer(8);
  new DataView(stakeBuf).setBigUint64(0, stake, true);

  const innerData = new Uint8Array(stakeIdBuf.byteLength + stakeBuf.byteLength + withdrawer.length);
  innerData.set(new Uint8Array(stakeIdBuf), 0);
  innerData.set(new Uint8Array(stakeBuf), 8);
  innerData.set(withdrawer, 16);

  const innerHash = keccak_256(innerData);

  // hash(LEAF_PREFIX | inner_hash)
  const leafData = new Uint8Array(1 + innerHash.length);
  leafData.set(LEAF_PREFIX, 0);
  leafData.set(innerHash, 1);

  return keccak_256(leafData);
}

export function verifyMerkleProof(proof: Uint8Array[], root: Uint8Array, leaf: Uint8Array): boolean {
  let computedHash = leaf;

  for (const proofElement of proof) {
    let hashInput: Uint8Array;
    // Sort hashes to prevent proof malleability
    if (compareBytes(computedHash, proofElement) <= 0) {
      // Hash([1] || current || proof_element)
      hashInput = new Uint8Array(INTERMEDIATE_PREFIX.length + computedHash.length + proofElement.length);
      hashInput.set(INTERMEDIATE_PREFIX, 0);
      hashInput.set(computedHash, INTERMEDIATE_PREFIX.length);
      hashInput.set(proofElement, INTERMEDIATE_PREFIX.length + computedHash.length);
    } else {
      // Hash([1] || proof_element || current)
      hashInput = new Uint8Array(INTERMEDIATE_PREFIX.length + proofElement.length + computedHash.length);
      hashInput.set(INTERMEDIATE_PREFIX, 0);
      hashInput.set(proofElement, INTERMEDIATE_PREFIX.length);
      hashInput.set(computedHash, INTERMEDIATE_PREFIX.length + proofElement.length);
    }
    computedHash = keccak_256(hashInput);
  }
  return compareBytes(computedHash, root) === 0;
}

// 'https://lite-api.jup.ag/tokens/v2/search?query=So11111111111111111111111111111111111111112' | jq .[0].usdPrice
export async function getSolUsdRate(): Promise<number> {
  try {
    if (!config.USDSOL_API_URL) {
      throw new Error('CMC credentials not found, using fallback value');
    }

    const params = new URLSearchParams({ query: 'So11111111111111111111111111111111111111112' });
    const url = `${config.USDSOL_API_URL}/search?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data[0].usdPrice;
  } catch (error: any) {
    console.error('Could not get SOL-USD rate. Using fallback value', error.message);
    return config.USD_SOL_FALLBACK;
  }
}

type SolanaFrameworkRpcClient = Rpc<SolanaRpcApi>;

/** Return type for prepareUnstakeInstructions */
export type UnstakePreparedData = {
  instructions: Instruction[];
  additionalSigners: Awaited<ReturnType<typeof generateKeyPairSigner>>[];
  deactivatedAccounts: Address[];
};

/** Prepares instructions for unstaking SOL without signing/sending */
export async function prepareUnstakeInstructions(
  rpc: SolanaFrameworkRpcClient,
  amount: Lamports,
  wallet: Address,
  stakeAccounts: UserStakeAccount[],
): Promise<UnstakePreparedData> {
  const activeStakeAccounts = stakeAccounts.filter((acc) => acc.state === 'active' && acc.delegatedStake > 0);
  assert(activeStakeAccounts.length > 0, 'No staking accounts found for connected public key');

  const totalStakedLamports = lamports(activeStakeAccounts.reduce((sum, acc) => sum + BigInt(acc.delegatedStake), 0n));
  assert(amount <= totalStakedLamports, `Not enough funds to unstake ${lamportsToSol(amount)} SOL`);

  const rentExemptResponse = await rpc.getMinimumBalanceForRentExemption(200n).send();
  const { value: curBalance } = await rpc.getBalance(wallet).send();
  if (curBalance < rentExemptResponse)
    throw new Error(
      `Insufficient wallet balance for transaction fees. Need at least ${lamportsToSol(rentExemptResponse)}`,
    );

  activeStakeAccounts.sort((a, b) => a.delegatedStake - b.delegatedStake);

  const txSigner = { address: wallet } as TransactionSigner;
  const additionalSigners: UnstakePreparedData['additionalSigners'] = [];
  const deactivatedAccounts: Address[] = [];
  const instructions: Instruction[] = [];
  let remainingLamports = BigInt(amount);

  let i = 0;
  while (remainingLamports > 0n && i < activeStakeAccounts.length) {
    const account = activeStakeAccounts[i] as UserStakeAccount;
    const accountStakeLamports = BigInt(account.delegatedStake);

    if (accountStakeLamports <= remainingLamports) {
      // Deactivate whole account
      instructions.push(
        getDeactivateInstruction({
          stake: address(account.pubkey),
          stakeAuthority: txSigner,
        }),
      );
      deactivatedAccounts.push(account.pubkey);
      remainingLamports -= accountStakeLamports;
    } else if (accountStakeLamports >= remainingLamports + BigInt(rentExemptResponse)) {
      // Can split: account has enough for requested amount + rent
      const splitAmount = BigInt(remainingLamports) + BigInt(rentExemptResponse);
      const splitStakeAccountSigner = await generateKeyPairSigner();
      additionalSigners.push(splitStakeAccountSigner);
      instructions.push(
        getCreateAccountInstruction({
          payer: txSigner,
          newAccount: splitStakeAccountSigner,
          lamports: lamports(BigInt(rentExemptResponse)),
          space: 200n,
          programAddress: STAKE_PROGRAM_ADDRESS,
        }),
      );
      instructions.push(
        getSplitInstruction({
          stake: address(account.pubkey),
          splitStake: splitStakeAccountSigner.address,
          stakeAuthority: txSigner,
          args: splitAmount,
        }),
      );
      instructions.push(
        getDeactivateInstruction({
          stake: splitStakeAccountSigner.address,
          stakeAuthority: txSigner,
        }),
      );
      deactivatedAccounts.push(splitStakeAccountSigner.address);
      remainingLamports = 0n;
    } else {
      // Can't split (not enough for rent), deactivate whole account instead
      instructions.push(
        getDeactivateInstruction({
          stake: address(account.pubkey),
          stakeAuthority: txSigner,
        }),
      );
      deactivatedAccounts.push(account.pubkey);
      remainingLamports -= accountStakeLamports;
    }

    ++i;
  }

  assert(remainingLamports <= 0n, 'Not enough stake accounts for unstaking');

  return { instructions, additionalSigners, deactivatedAccounts };
}

/** Sign and send a transaction with multiple signers (wallet + generated keypairs) */
export async function signAndSendMultiSignerTransaction(
  rpc: SolanaFrameworkRpcClient,
  instructions: Instruction[],
  feePayer: Address,
  walletSignTransaction: (tx: SendableTransaction & Transaction) => Promise<SendableTransaction & Transaction>,
  additionalSigners: UnstakePreparedData['additionalSigners'],
): Promise<Signature> {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  // FIXME: use createWalletTransactionSigner(session);
  const txSigner = { address: feePayer } as TransactionSigner;
  const txMsg = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(txSigner, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  );

  const compiledTx = compileTransaction(txMsg);
  const txCodec = getTransactionCodec();

  // Sign with wallet - type assertion needed because compileTransaction returns
  // Transaction, but signTransaction expects SendableTransaction & Transaction
  const signedByWallet = await walletSignTransaction(compiledTx as unknown as SendableTransaction & Transaction);
  assert(signedByWallet, 'Wallet signing failed');

  let fullySignedTx = txCodec.decode(txCodec.encode(signedByWallet as unknown as Transaction));

  if (additionalSigners.length > 0) {
    fullySignedTx = await partiallySignTransaction(
      additionalSigners.map((s) => s.keyPair),
      { ...fullySignedTx, lifetimeConstraint: compiledTx.lifetimeConstraint },
    );
  }

  return rpc.sendTransaction(getBase64EncodedWireTransaction(fullySignedTx), { encoding: 'base64' }).send();
}

/** Create claim transaction instructions for a winner */
export async function prepareClaimInstruction(winner: Winner, wallet: Address): Promise<Instruction> {
  const isBigDraw = winner.kind === 'big';
  const txSigner = { address: wallet } as TransactionSigner;

  assert(winner.stakeId <= winner.winnerId && winner.winnerId < winner.stakeId + winner.stake, 'Wrong winner params');

  // Derive PDAs
  const [claimedPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [
      CLAIMED_SEED,
      new Uint8Array([isBigDraw ? 1 : 0]),
      bigIntToBufferLE(winner.epochOrSlot),
      bigIntToBufferLE(winner.winnerId),
    ],
  });

  const [configPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [CONFIG_SEED],
  });

  const [metricsPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [METRICS_SEED],
  });

  const drawSeed = isBigDraw ? BIG_DRAW_SEED : REGULAR_DRAW_SEED;
  const [drawPda] = await getProgramDerivedAddress({
    programAddress: PROGRAM_ID,
    seeds: [drawSeed, bigIntToBufferLE(winner.epochOrSlot)],
  });

  // Build claim instruction
  const claimArgs = {
    kind: isBigDraw ? 1 : 0,
    winner_id: winner.winnerId,
    stake_id: winner.stakeId,
    stake: winner.stake,
    proof: winner.proof.map((p) => base58Codec.encode(p)),
  };
  const claimIxData = ClaimInstructionDataCodec.encode(claimArgs);

  // Claim instruction accounts (from instruction.rs:67-74):
  // #[account(0, writable, signer, name = "payer")]
  // #[account(1, writable, name = "withdrawer")]
  // #[account(2, name = "config")]
  // #[account(3, writable, name = "draw")]
  // #[account(4, writable, name = "claimed")]
  // #[account(5, writable, name = "metrics")]
  // #[account(6, name = "system_program")]

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
  };
}

export type InstructionBatch = { instructions: Instruction[]; indices: number[] };

// We use this to pack max instructions in tx message by hand. @solana/kit have `getMessagePackerInstructionPlanFromInstructions`
// but this doesn't work as expected resulting in overpacked/errored message.
// Doing this manually also allows us match value index to batch/tx for optimistic UI.
export function batchInstructions(instructions: Instruction[], signer: TransactionSigner): InstructionBatch[] {
  const batches: InstructionBatch[] = [];
  let currentBatch: InstructionBatch = { instructions: [], indices: [] };

  // This is used to properly calculate instruction size together with message info
  const createBaseMessage = () =>
    pipe(createTransactionMessage({ version: 0 }), (msg) => setTransactionMessageFeePayerSigner(signer, msg));

  let testMessage: TransactionMessage & TransactionMessageWithFeePayer = createBaseMessage();

  for (let i = 0; i < instructions.length; i++) {
    const ix = instructions[i]!;
    const testWithIx: TransactionMessage & TransactionMessageWithFeePayer = appendTransactionMessageInstruction(
      ix,
      testMessage,
    );

    const size = getTransactionMessageSize(testWithIx);

    if (size <= TRANSACTION_SIZE_LIMIT) {
      currentBatch.instructions.push(ix);
      currentBatch.indices.push(i);
      testMessage = testWithIx;
    } else if (currentBatch.instructions.length === 0) {
      console.warn('Instruction too large for single transaction:', ix.data?.byteLength);
    } else {
      batches.push(currentBatch);
      currentBatch = { instructions: [ix], indices: [i] };
      testMessage = appendTransactionMessageInstruction(ix, createBaseMessage());
    }
  }

  if (currentBatch.instructions.length > 0) batches.push(currentBatch);
  return batches;
}

/** Parse draw account bytes into Draw object */
export function parseDrawAccount(dataBytes: ReadonlyUint8Array | Uint8Array): Draw {
  let cur = 0;
  // @ts-ignore: currently unused
  const _drawHeader = AccountHeaderCodec.decode(dataBytes.slice(cur, (cur += AccountHeaderSize)));

  const drawBody = DrawCodec.decode(dataBytes.slice(cur, (cur += DrawCodec.fixedSize)));

  const winnersArrayCodec = getArrayCodec(WinnerCodec, { size: drawBody.winners });
  const winners = winnersArrayCodec.decode(dataBytes.slice(cur, (cur += WinnerCodec.fixedSize * drawBody.winners)));

  const stage = drawBody.stage as DrawStage;

  return {
    epochOrSlot: drawBody.epochOrSlot,
    prizeFund: lamports(drawBody.prizeFund),
    claimed: lamports(drawBody.claimed),
    withdrawn: lamports(drawBody.withdrawn),
    pool: address(base58Codec.decode(drawBody.pool)),
    merkleRoot: base58Codec.decode(drawBody.merkleRoot),
    eligibleStake: drawBody.eligibleStake,
    secretHash: base58Codec.decode(drawBody.secretHash),
    seed: base58Codec.decode(drawBody.seed),
    updatedAt: drawBody.updatedAt,
    drawDeadline: drawBody.drawDeadline,
    winners: drawBody.winners,
    stage,
    winnersArray: winners,
  };
}

export async function getDrawMetrics(rpc: SolanaFrameworkRpcClient) {
  // Get PDA account data
  const [pda] = await getProgramDerivedAddress({ programAddress: PROGRAM_ID, seeds: [METRICS_SEED] });
  const [accountInfo, usdSolRate] = await Promise.all([
    rpc.getAccountInfo(pda, { encoding: 'base64' }).send(),
    getSolUsdRate(),
  ]);

  assert(accountInfo.value, 'Account info should have value');
  const dataBytes = base64Codec.encode(accountInfo.value.data[0]);
  assert(dataBytes[0] === StateDiscriminators.Metrics, 'Wrong metrics account discriminator');

  // Parse metrics body
  const metricsBytes = dataBytes.slice(AccountHeaderSize);
  const metricsData = MetricsCodec.decode(metricsBytes);

  const totalDrawn = lamports(metricsData.totalDrawn);
  const totalClaimed = lamports(metricsData.totalClaimed);
  const totalWithdrawn = lamports(metricsData.totalWithdrawn);

  const metrics = {
    totalDrawn,
    totalClaimed,
    totalWithdrawn,
    totalDrawnUsd: lamportsToSol(totalDrawn) * usdSolRate,
    totalClaimedUsd: lamportsToSol(totalClaimed) * usdSolRate,
    totalWithdrawnUsd: lamportsToSol(totalWithdrawn) * usdSolRate,
  };

  return metrics;
}

/** Build snapshot URL for given draw kind and epoch */
export function getSnapshotUrl(kind: DrawKind, epoch: bigint): string {
  return `${config.SNAPSHOTS_CDN_URL}/${epoch}-${kind}-${config.SOLANA_VALIDATOR_VOTE_KEY}.json`;
}

const snapshotCache = new Map<string, Snapshot>();

/** Fetch snapshot data for given draw kind and epoch */
export async function fetchDrawSnapshot(kind: 'regular', epoch: bigint): Promise<RegularSnapshot>;
export async function fetchDrawSnapshot(kind: 'big', epoch: bigint): Promise<BigSnapshot>;
export async function fetchDrawSnapshot(kind: DrawKind, epoch: bigint): Promise<Snapshot>;
export async function fetchDrawSnapshot(kind: DrawKind, epoch: bigint): Promise<Snapshot> {
  const cacheKey = `${epoch}-${kind}`;
  if (snapshotCache.has(cacheKey)) return snapshotCache.get(cacheKey)!;

  const snapshot = await jsonApiClient<Snapshot>(getSnapshotUrl(kind, epoch));

  assert(
    snapshot?.merkle_tree?.tree_nodes &&
    Array.isArray(snapshot.merkle_tree.tree_nodes) &&
    snapshot.merkle_tree.tree_nodes.length === snapshot.merkle_tree.max_num_nodes,
    'Invalid snapshot JSON file',
  );

  snapshotCache.set(cacheKey, snapshot);

  if (kind === 'regular') assertIsRegularSnapshot(snapshot);
  if (kind === 'big') assertIsBigSnapshot(snapshot);
  return snapshot;
}

export async function fetchAprSnapshot(): Promise<AprSnapshot | null> {
  try {
    let snapshotResponse = await jsonApiClient(`${config.STATS_CDN_URL}/apr.json`);
    assert(
      snapshotResponse instanceof Object &&
      'updated_at' in snapshotResponse &&
      'data' in snapshotResponse &&
      snapshotResponse.data instanceof Object &&
      'total_users' in snapshotResponse &&
      'period' in snapshotResponse &&
      snapshotResponse.period instanceof Object &&
      'from' in snapshotResponse.period &&
      'to' in snapshotResponse.period &&
      'days' in snapshotResponse.period &&
      'Data must be present in APR snapshot',
    );
    const raw = snapshotResponse as {
      updated_at: string;
      period: { from: string; to: string; days: number };
      total_users: number;
      data: Record<string, number>;
    };
    const aprData: Record<Address, number> = {};
    for (const [k, v] of Object.entries(raw.data)) {
      aprData[address(k)] = v;
    }

    return {
      updatedAt: new Date(raw.updated_at),
      period: { from: new Date(raw.period.from), to: new Date(raw.period.to), days: raw.period.days },
      totalUsers: raw.total_users,
      data: aprData,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function extractRevealedDrawFromTransaction(rpc: Rpc<SolanaRpcApi>, sig: Signature, kind: DrawKind) {
  const txCodec = getTransactionCodec();
  const txMsgCodec = getCompiledTransactionMessageCodec();

  const tx = await rpc
    .getTransaction(sig, {
      encoding: 'base64',
      maxSupportedTransactionVersion: 0,
    })
    .send();

  if (!tx || !tx.transaction) return null;
  const txBytes = base64Codec.encode(tx.transaction[0]);
  const decodedTx = txCodec.decode(txBytes);
  const decodedMsg = txMsgCodec.decode(decodedTx.messageBytes);
  const instructions = decodedMsg.instructions;
  const accounts = decodedMsg.staticAccounts;

  for (const ix of instructions) {
    const programAddress = accounts[ix.programAddressIndex];
    if (programAddress === PROGRAM_ID) {
      try {
        const revealData = RevealInstructionDataCodec.decode(ix.data as Uint8Array);
        // Skip big draws, we will process it separately
        const drawKind = kind === 'regular' ? 0 : 1;
        if (revealData.discriminator === DrawProgramInstructions.Reveal && revealData.kind === drawKind) {
          // Extract draw account (index 2, see instruction.rs:62)
          if (ix.accountIndices && ix.accountIndices.length > 2) {
            const accountIndex = ix.accountIndices[2];
            if (accountIndex !== undefined) {
              const drawAccount = accounts[accountIndex];
              assert(drawAccount, 'Draw account key must be present in ix');

              return drawAccount;
            }
          }
        }
      } catch (err) {
        // Skip malformed instruction data
        continue;
      }
    }
  }
  return null;
}

export function getStakeState(
  activationEpoch: Epoch,
  deactivationEpoch: Epoch,
  currentEpoch: Epoch,
): UserStakeAccount['state'] {
  const activation = activationEpoch;
  const deactivation = deactivationEpoch;

  let state: UserStakeAccount['state'] = 'inactive';

  if (deactivation !== SOLANA_MAX_EPOCH) {
    if (deactivation === currentEpoch) state = 'deactivating';
  } else if (activation === currentEpoch) {
    state = 'activating';
  } else {
    state = 'active';
  }
  return state;
}

export async function getDrawInfo(
  rpc: SolanaFrameworkRpcClient,
  kind: DrawKind,
  epochOrSlot: bigint,
): Promise<Draw | null> {
  try {
    const seed = kind === 'big' ? BIG_DRAW_SEED : REGULAR_DRAW_SEED;
    const [pda] = await getProgramDerivedAddress({
      programAddress: PROGRAM_ID,
      seeds: [seed, bigIntToBufferLE(epochOrSlot)],
    });
    const accountInfo = await rpc.getAccountInfo(pda, { encoding: 'base64' }).send();
    if (!accountInfo.value) return null;
    const dataBytes = base64Codec.encode(accountInfo.value.data[0] as string);
    return parseDrawAccount(dataBytes);
  } catch {
    return null;
  }
}

export async function getNextBigDrawEpoch(
  rpc: SolanaFrameworkRpcClient,
  drawConfig: DrawConfig,
  currentEpoch: Epoch,
): Promise<{ epoch: Epoch; draw: Draw | null }> {
  const duration = BigInt(drawConfig.bigDrawDurationEpoch);

  let nextDrawEpoch: Epoch;
  let draw: Draw | null = null;

  if (currentEpoch < drawConfig.nextBigDrawEpoch) {
    nextDrawEpoch = drawConfig.nextBigDrawEpoch;
  } else {
    nextDrawEpoch = assertIsEpoch(currentEpoch - ((currentEpoch - drawConfig.nextBigDrawEpoch) % duration));
    // XXX: fix for faulty formula
    if (currentEpoch > nextDrawEpoch) {
      nextDrawEpoch = assertIsEpoch(nextDrawEpoch + BigInt(drawConfig.bigDrawDurationEpoch));
    }
    if (currentEpoch === nextDrawEpoch) {
      draw = await getDrawInfo(rpc, 'big', nextDrawEpoch);
      if (draw && draw.stage === DrawStage.Reveal) {
        nextDrawEpoch = assertIsEpoch(nextDrawEpoch + duration);
      }
    }
  }

  return { epoch: nextDrawEpoch, draw };
}
