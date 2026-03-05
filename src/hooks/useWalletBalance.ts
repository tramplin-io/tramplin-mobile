import { useCallback, useEffect, useState } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

import type { BalanceInfo } from '@/types/wallet'
import { lamportsToSol } from '@/utils/format'

/**
 * Hook to fetch and track the connected wallet's SOL balance.
 *
 * Automatically fetches balance when a wallet is connected
 * and provides a refresh function for manual updates.
 *
 * @example
 * const { balance, loading, error, refresh } = useWalletBalance()
 * if (balance) {
 *   console.log(`Balance: ${balance.sol} SOL`)
 * }
 */
export function useWalletBalance() {
  const { account, client } = useMobileWallet()
  const [balance, setBalance] = useState<BalanceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!account?.address) {
      setBalance(null)
      return
    }

    const rpc = client?.rpc
    if (!rpc) {
      setBalance(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // console.log('fetchBalance - account.address', account.address)
      // console.log('fetchBalance - rpc', rpc)
      const result = await rpc.getBalance(account.address, { commitment: 'confirmed' }).send()

      // console.log('fetchBalance - result', result)

      const lamports = result.value
      setBalance({
        lamports,
        sol: lamportsToSol(lamports),
      })
    } catch (err) {
      console.error('fetchBalance - err', err)
      const message = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(message)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [account, client?.rpc])

  // Auto-fetch balance when account changes
  useEffect(() => {
    void fetchBalance()
  }, [fetchBalance])

  return {
    /** Current balance info (null if not connected or error) */
    balance,
    /** Whether a balance fetch is in progress */
    loading,
    /** Error message if balance fetch failed */
    error,
    /** Manually refresh the balance */
    refresh: fetchBalance,
  } as const
}
