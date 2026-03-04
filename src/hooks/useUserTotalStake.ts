import { useMemo } from 'react'

import { useUserStakeAccounts } from './useUserStakeAccounts'

type UseUserTotalStakeReturn = {
  data: number | null
  fetching: boolean
  error: Error | null
}

export function useUserTotalStake(): UseUserTotalStakeReturn {
  const { data: accounts, loading, error } = useUserStakeAccounts()

  const totalStake = useMemo(() => {
    if (!accounts) return null

    return accounts
      .filter(({ state }) => state === 'active' || state === 'activating' || state === 'deactivating')
      .reduce((total, account) => total + account.delegatedStake / 1e9, 0)
  }, [accounts])

  return {
    data: totalStake,
    fetching: loading,
    error,
  }
}
