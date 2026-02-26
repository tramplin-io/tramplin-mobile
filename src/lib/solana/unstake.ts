import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  generateKeyPairSigner,
  lamports,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit'
import { getCreateAccountInstruction } from '@solana-program/system'
import { getDeactivateInstruction, getSplitInstruction, getWithdrawInstruction, STAKE_PROGRAM_ADDRESS } from '@solana-program/stake'
import type { Address, Instruction, Lamports, Rpc, SolanaRpcApi, Transaction, TransactionSigner } from '@solana/kit'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAKE_ACCOUNT_SPACE = 200n
const STAKE_HISTORY_SYSVAR = address('SysvarStakeHistory1111111111111111111111111')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LatestBlockhash = Parameters<typeof setTransactionMessageLifetimeUsingBlockhash>[0]

export type StakeAccountState = 'active' | 'inactive' | 'activating' | 'deactivating'

export interface UserStakeAccount {
  pubkey: Address
  lamports: Lamports
  state: StakeAccountState
  delegatedStake: number
  rentExemptReserve: number
}

export interface PrepareUnstakeInstructionsParams {
  rpc: Rpc<SolanaRpcApi>
  payerSigner: TransactionSigner
  latestBlockhash: LatestBlockhash
  stakeAccounts: UserStakeAccount[]
  amountLamports: bigint
}

export interface PrepareUnstakeResult {
  transaction: Transaction
  deactivatedAccounts: Address[]
}

export interface PrepareWithdrawInstructionParams {
  rpc: Rpc<SolanaRpcApi>
  payerSigner: TransactionSigner
  latestBlockhash: LatestBlockhash
  stakeAccountAddress: string
  withdrawAmountLamports?: bigint
  withdrawToAddress?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeRpcBalance = (result: unknown): bigint => {
  const raw =
    typeof result === 'object' && result !== null && 'value' in result
      ? Number((result as { value: number }).value)
      : Number(result)
  return BigInt(Number.isFinite(raw) ? raw : 0)
}

async function fetchRentExempt(rpc: Rpc<SolanaRpcApi>): Promise<bigint> {
  const result = await rpc.getMinimumBalanceForRentExemption(STAKE_ACCOUNT_SPACE).send()
  return normalizeRpcBalance(result)
}

// ---------------------------------------------------------------------------
// prepareUnstakeInstructions
// ---------------------------------------------------------------------------

/**
 * Prepares a deactivation transaction covering the requested `amountLamports`
 * across one or more active stake accounts.
 *
 * Strategy (accounts are sorted smallest-first):
 *  • whole-account deactivation when account stake ≤ remaining amount
 *  • split + deactivate when account stake ≥ remaining + rent-exempt reserve
 *  • whole-account deactivation as fallback when split is not viable
 *
 * The returned transaction is already partially signed by any ephemeral split-
 * account keypairs. The caller only needs to pass it to `signAndSendTransaction`
 * (wallet signature + broadcast).
 */
export async function prepareUnstakeInstructions({
  rpc,
  payerSigner,
  latestBlockhash,
  stakeAccounts,
  amountLamports,
}: PrepareUnstakeInstructionsParams): Promise<PrepareUnstakeResult> {
  const activeAccounts = stakeAccounts.filter((a) => a.state === 'active' && a.delegatedStake > 0)

  if (activeAccounts.length === 0) {
    throw new Error('No active stake accounts found')
  }

  const totalStaked = activeAccounts.reduce((sum, a) => sum + BigInt(a.delegatedStake), 0n)
  if (amountLamports > totalStaked) {
    throw new Error(`Insufficient staked balance. Requested: ${amountLamports}, available: ${totalStaked}`)
  }

  const rentExempt = await fetchRentExempt(rpc)

  const walletBalance = normalizeRpcBalance(await rpc.getBalance(payerSigner.address).send())
  if (walletBalance < rentExempt) {
    throw new Error('Insufficient wallet balance to cover transaction fees')
  }

  // Exhaust smaller accounts first
  activeAccounts.sort((a, b) => a.delegatedStake - b.delegatedStake)

  const instructions: Instruction[] = []
  const additionalSigners: Awaited<ReturnType<typeof generateKeyPairSigner>>[] = []
  const deactivatedAccounts: Address[] = []

  const deactivateWhole = (acc: UserStakeAccount): void => {
    instructions.push(getDeactivateInstruction({ stake: acc.pubkey, stakeAuthority: payerSigner }))
    deactivatedAccounts.push(acc.pubkey)
  }

  let remaining = amountLamports

  for (const acc of activeAccounts) {
    if (remaining <= 0n) break

    const accStake = BigInt(acc.delegatedStake)

    if (accStake >= remaining + rentExempt) {
      // Account has enough room to split: create a new stake account, split into it, then deactivate
      const splitSigner = await generateKeyPairSigner()
      additionalSigners.push(splitSigner)

      const splitAmount = remaining + rentExempt

      instructions.push(
        getCreateAccountInstruction({
          payer: payerSigner,
          newAccount: splitSigner,
          lamports: lamports(rentExempt),
          space: STAKE_ACCOUNT_SPACE,
          programAddress: STAKE_PROGRAM_ADDRESS,
        }),
        getSplitInstruction({
          stake: acc.pubkey,
          splitStake: splitSigner.address,
          stakeAuthority: payerSigner,
          args: splitAmount,
        }),
        getDeactivateInstruction({
          stake: splitSigner.address,
          stakeAuthority: payerSigner,
        }),
      )

      deactivatedAccounts.push(splitSigner.address)
      remaining = 0n
    } else {
      // Deactivate the whole account (covers exact fit and cases where split is not viable)
      deactivateWhole(acc)
      remaining -= accStake
    }
  }

  if (remaining > 0n) {
    throw new Error('Not enough active stake accounts to cover the requested amount')
  }

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(payerSigner.address, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  )

  // Pre-sign with all ephemeral split-account keypairs so the wallet only
  // needs to provide its own signature when calling signAndSendTransaction.
  let partiallySignedTx = compileTransaction(txMessage) as unknown as Transaction

  for (const signer of additionalSigners) {
    // @ts-expect-error — brand TransactionWithinSizeLimit not present on compileTransaction output; runtime valid
    const [sigMap] = await signer.signTransactions([partiallySignedTx])
    const sigBytes = sigMap[signer.address] ?? Object.values(sigMap)[0]
    if (!sigBytes) {
      throw new Error(`Split account signer ${signer.address} did not produce a signature`)
    }
    partiallySignedTx = {
      ...partiallySignedTx,
      signatures: { ...partiallySignedTx.signatures, [signer.address]: sigBytes },
    } as Transaction
  }

  return { transaction: partiallySignedTx, deactivatedAccounts }
}

// ---------------------------------------------------------------------------
// prepareWithdrawInstruction
// ---------------------------------------------------------------------------

/**
 * Prepares a withdraw transaction for a single fully-deactivated stake account.
 * Call this after the deactivation epoch has elapsed.
 */
export async function prepareWithdrawInstruction({
  rpc,
  payerSigner,
  latestBlockhash,
  stakeAccountAddress,
  withdrawAmountLamports,
  withdrawToAddress,
}: PrepareWithdrawInstructionParams): Promise<Transaction> {
  const stakeAddr = address(stakeAccountAddress.trim())
  const recipientAddr = address((withdrawToAddress ?? payerSigner.address).toString())

  const lamportsToWithdraw =
    withdrawAmountLamports ?? normalizeRpcBalance(await rpc.getBalance(stakeAddr).send())

  if (lamportsToWithdraw <= 0n) {
    throw new Error('Stake account balance is zero — nothing to withdraw')
  }

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(payerSigner.address, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) =>
      appendTransactionMessageInstructions(
        [
          getWithdrawInstruction({
            stake: stakeAddr,
            recipient: recipientAddr,
            withdrawAuthority: payerSigner,
            stakeHistory: STAKE_HISTORY_SYSVAR,
            args: lamportsToWithdraw,
          }),
        ],
        tx,
      ),
  )

  return compileTransaction(txMessage) as Transaction
}
