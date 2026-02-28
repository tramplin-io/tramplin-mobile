import { useCallback, useState } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

import { prepareUnstakeInstructions, type UserStakeAccount } from '@/lib/solana/unstake'
import { useAuthStore } from '@/lib/stores/auth-store'
import { signatureToBase58 } from '@/utils/format'
import { rpc } from '@/utils/solana'
import { isCancellationError } from '@/utils/wallet'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnstakeParams {
  /** Amount to deactivate, in lamports */
  amountLamports: bigint
  /** All stake accounts owned by the connected wallet */
  stakeAccounts: UserStakeAccount[]
}

interface UnstakeResult {
  /** Transaction signature (base58) */
  signature: string
  /** Addresses of the stake accounts that were deactivated */
  deactivatedAccounts: string[]
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUnstake() {
  const { account, getTransactionSigner, signAndSendTransaction } = useMobileWallet()
  const session = useAuthStore((s) => s.session)
  const [isLoading, setIsLoading] = useState(false)

  const unstake = useCallback(
    async ({ amountLamports, stakeAccounts }: UnstakeParams): Promise<UnstakeResult> => {
      if (!account) {
        throw new Error('Wallet not connected')
      }
      if (account.address !== session?.userId) {
        throw new Error('Connected wallet does not match signed-in account')
      }

      setIsLoading(true)

      console.log('unstake - stakeAccounts:', stakeAccounts)
      console.log('unstake - amountLamports:', amountLamports)

      try {
        const latest = await rpc.getLatestBlockhash().send()
        console.log('unstake - latestBlockhash:', latest.value)
        const minContextSlot = BigInt(latest.context.slot)
        console.log('unstake - minContextSlot:', minContextSlot)
        const payerSigner = getTransactionSigner(account.address, minContextSlot)

        console.log('unstake - payerSigner:', payerSigner)

        const { transaction, deactivatedAccounts } = await prepareUnstakeInstructions({
          payerSigner,
          latestBlockhash: latest.value,
          stakeAccounts,
          amountLamports,
        })
        console.log('unstake - transaction:', transaction)
        console.log('unstake - deactivatedAccounts:', deactivatedAccounts)

        const signatures = await signAndSendTransaction(transaction, minContextSlot)
        console.log('unstake - signatures:', signatures)
        if (!signatures?.length) {
          throw new Error('Transaction was not sent (rejected or failed)')
        }

        const sigBytes = signatures[0]
        const signature =
          sigBytes instanceof Uint8Array ? signatureToBase58(sigBytes) : signatureToBase58(new Uint8Array(sigBytes))

        return {
          signature,
          deactivatedAccounts: deactivatedAccounts.map((a) => a.toString()),
        }
      } catch (err) {
        console.log('unstake - err:', err)
        if (isCancellationError(err)) {
          throw new Error('Transaction cancelled')
        }
        throw err instanceof Error ? err : new Error('Unstake failed')
      } finally {
        setIsLoading(false)
      }
    },
    [account, session, getTransactionSigner, signAndSendTransaction],
  )

  return {
    unstake,
    isLoading,
  }
}
