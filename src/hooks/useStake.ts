import { useCallback, useState } from 'react'
import { getDelegateStakeInstruction, getInitializeInstruction, STAKE_PROGRAM_ADDRESS } from '@solana-program/stake'
import { getCreateAccountInstruction } from '@solana-program/system'
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
  type Rpc,
  type SolanaRpcApi,
  type Transaction,
} from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

import { SOLANA_VALIDATOR_VOTE_KEY } from '@/constants'
import { useAuthStore } from '@/lib/stores/auth-store'
import { signatureToBase58 } from '@/utils/format'
import { isCancellationError } from '@/utils/wallet'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fixed byte size of a stake account */
const STAKE_ACCOUNT_SPACE = 200n

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseStakeOptions {
  rpc?: Rpc<SolanaRpcApi> | null
}

interface StakeParams {
  /** Amount to stake, in lamports (NOT including rent — that is added automatically) */
  amountInLamports: bigint
  /** Override the default validator vote key */
  validatorVoteKey?: string
}

interface StakeResult {
  /** The newly created stake account address */
  stakeAccountAddress: string
  /** Transaction signature (base58) */
  signature: string
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStake({ rpc }: UseStakeOptions) {
  // account.address is the connected wallet's Address (base58 string branded type)
  const { account, getTransactionSigner, signAndSendTransaction } = useMobileWallet()
  const session = useAuthStore((s) => s.session)
  const [isLoading, setIsLoading] = useState(false)

  const stake = useCallback(
    async ({ amountInLamports, validatorVoteKey }: StakeParams): Promise<StakeResult> => {
      if (!rpc) {
        throw new Error('RPC not ready')
      }
      if (!account) {
        throw new Error('Wallet not connected')
      }
      if (account.address !== session?.userId) {
        throw new Error('Connected wallet does not match signed-in account')
      }

      setIsLoading(true)

      try {
        const rawVoteKey = (validatorVoteKey ?? SOLANA_VALIDATOR_VOTE_KEY).trim()
        if (!rawVoteKey) {
          throw new Error('Validator vote account not configured (set EXPO_PUBLIC_SOLANA_VALIDATOR_VOTE_KEY)')
        }
        const voteAddress = address(rawVoteKey)

        // 1. Generate a fresh ephemeral keypair for the new stake account
        const stakeAccountSigner = await generateKeyPairSigner()
        const stakeAccountAddress = stakeAccountSigner.address
        // console.log('stake - stakeAccountAddress:', stakeAccountAddress)
        // 2. Fetch latest blockhash for transaction lifetime
        //    NOTE: minContextSlot should be a *slot*, not block height.
        const latest = await rpc.getLatestBlockhash().send()
        const latestBlockhash = latest.value
        const minContextSlot = BigInt(latest.context.slot)
        const payerSigner = getTransactionSigner(account.address, minContextSlot)
        // console.log('stake - payerSigner:', payerSigner)
        // Rent-exempt minimum depends on cluster parameters; fetch it instead of hardcoding.
        const rentResult = await rpc.getMinimumBalanceForRentExemption(STAKE_ACCOUNT_SPACE).send()
        const rentNum =
          typeof rentResult === 'object' && rentResult !== null && 'value' in rentResult
            ? Number((rentResult as { value: number }).value)
            : Number(rentResult)
        const rentExemptLamports = BigInt(Number.isFinite(rentNum) ? rentNum : 0)
        // console.log('stake - rentNum:', rentNum)
        // 3. Build the three instructions
        //
        //    ix1: system::create_account
        //         – allocates the stake account with enough lamports for rent + stake
        //
        const createAccountIx = getCreateAccountInstruction({
          payer: payerSigner,
          newAccount: stakeAccountSigner,
          lamports: lamports(amountInLamports + rentExemptLamports),
          space: STAKE_ACCOUNT_SPACE,
          programAddress: STAKE_PROGRAM_ADDRESS,
        })
        // console.log('stake - createAccountIx:', createAccountIx)
        //    ix2: stake::initialize
        //         – sets staker + withdrawer authority (both = connected wallet)
        //
        const initializeIx = getInitializeInstruction({
          stake: stakeAccountAddress,
          arg0: { staker: payerSigner.address, withdrawer: payerSigner.address },
          arg1: {
            unixTimestamp: 0n,
            epoch: 0n,
            custodian: address('11111111111111111111111111111111'),
          },
        })
        // console.log('stake - initializeIx:', initializeIx)
        //    ix3: stake::delegate_stake
        //         – delegates to the target validator vote account
        //
        const STAKE_HISTORY_SYSVAR = address('SysvarStakeHistory1111111111111111111111111')
        const STAKE_CONFIG_ADDRESS = address('StakeConfig11111111111111111111111111111111')
        const delegateIx = getDelegateStakeInstruction({
          stake: stakeAccountAddress,
          vote: voteAddress,
          stakeHistory: STAKE_HISTORY_SYSVAR,
          unused: STAKE_CONFIG_ADDRESS,
          stakeAuthority: payerSigner,
        })
        // console.log('stake - delegateIx:', delegateIx)
        // 4. Compose and compile the versioned transaction message.
        //    The stake account signer co-signs (it's a new account being created).
        //    The wallet (payer) signs and sends via signAndSendTransaction below.
        const txMessage = pipe(
          createTransactionMessage({ version: 0 }),
          (tx) => setTransactionMessageFeePayer(payerSigner.address, tx),
          (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
          (tx) => appendTransactionMessageInstructions([createAccountIx, initializeIx, delegateIx], tx),
        )
        // console.log('stake - txMessage:', txMessage)
        // 5. Pre-sign with the stake account ephemeral keypair (partial sign),
        //    then have the wallet co-sign (payer) and send via signAndSendTransaction.
        const compiledTx = compileTransaction(txMessage)
        // console.log('stake - compiledTx:', compiledTx)
        // Stake account signer signs the compiled transaction bytes directly.
        // signTransactions expects __transactionSize brand; compileTransaction doesn't add it — safe to assert.
        const txToSign = compiledTx as unknown as Transaction
        // console.log('stake - txToSign:', txToSign)
        // signTransactions returns Record<Address, SignatureBytes>[]; we need the bytes for this signer.
        // @ts-expect-error - brand TransactionWithinSizeLimit not present on compileTransaction output; runtime valid
        const [stakeAccountSignatureMap] = await stakeAccountSigner.signTransactions([txToSign])
        const stakeAccountSignatureBytes =
          stakeAccountSignatureMap[stakeAccountAddress] ?? Object.values(stakeAccountSignatureMap)[0]
        if (!stakeAccountSignatureBytes) {
          throw new Error('Stake account signer did not return a signature')
        }
        const partiallySignedTxRaw = {
          ...compiledTx,
          signatures: {
            ...compiledTx.signatures,
            [stakeAccountAddress]: stakeAccountSignatureBytes,
          },
        }
        // console.log('stake - partiallySignedTxRaw:', partiallySignedTxRaw)
        const partiallySignedTx = partiallySignedTxRaw as Transaction
        // console.log('stake - partiallySignedTx:', partiallySignedTx)
        const signatures = await signAndSendTransaction(partiallySignedTx, minContextSlot)
        // console.log('stake - signatures:', signatures)
        if (!signatures?.length) {
          throw new Error('Transaction was not sent (rejected or failed)')
        }

        const sigBytes = signatures[0]
        const signature =
          sigBytes instanceof Uint8Array ? signatureToBase58(sigBytes) : signatureToBase58(new Uint8Array(sigBytes))
        // console.log('stake - signature:', signature)
        return {
          stakeAccountAddress,
          signature,
        }
      } catch (err) {
        if (isCancellationError(err)) {
          console.error('stake - isCancellationError:', err)
          throw new Error('Transaction cancelled')
        }
        throw err instanceof Error ? err : new Error('Staking failed')
      } finally {
        setIsLoading(false)
      }
    },
    [account, rpc, session, getTransactionSigner, signAndSendTransaction],
  )

  return {
    stake,
    isLoading,
  }
}
