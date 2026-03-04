import { useMemo } from 'react'

import { LAMPORTS_PER_SOL } from '@/constants'

import { useUserStakeAccounts } from './useUserStakeAccounts'

type UseUserActiveStakeReturn = {
  data: { active: number; activating: number } | null
  fetching: boolean
  error: Error | null
}

export function useUserActiveStake(): UseUserActiveStakeReturn {
  const { data: accounts, loading, error } = useUserStakeAccounts()

  const stakeData = useMemo(() => {
    if (!accounts) return null

    const active = accounts
      .filter(({ state }) => state === 'active')
      .reduce((total, { delegatedStake }) => total + Number(delegatedStake) / Number(LAMPORTS_PER_SOL), 0)

    const activating = accounts
      .filter(({ state, delegatedStake }) => state === 'activating' && delegatedStake > 0)
      .reduce((total, { delegatedStake }) => total + Number(delegatedStake) / Number(LAMPORTS_PER_SOL), 0)

    return { active, activating }
  }, [accounts])

  return {
    data: stakeData,
    fetching: loading,
    error,
  }
}
