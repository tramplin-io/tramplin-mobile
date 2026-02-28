import { useCallback } from 'react'
import { address, lamports } from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useQueryClient } from '@tanstack/react-query'
import { getIndexMyWinsQueryKey, useIndexMyWins } from '@/lib/api/generated/restApi'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import type { Winner } from '@/utils/solana'

type UseDrawWinsReturn = {
  regularWins: Winner[] | null
  bigWins: Winner[] | null
  isLoading: boolean
  error: Error | null
  removeWins: (winners: Winner[]) => void
}

function winToWinner(win: Win): Winner {
  return {
    stakeId: BigInt(win.stakeId),
    winnerId: BigInt(win.winnerId),
    stake: BigInt(win.stake),
    withdrawer: address(win.walletAddress),
    proof: win.merkleProofs,
    prize: lamports(BigInt(win.prizeLamports)),
    epochOrSlot: BigInt(win.epochOrSlot),
    claimPda: win.claimPda ? address(win.claimPda) : undefined,
    kind: win.drawType,
    revealedAt: BigInt(win.revealedAtSlot ?? '0'),
    revealedAtDate: win.revealedAt ? new Date(win.revealedAt) : undefined,
  }
}

const WINS_PARAMS = { isClaimed: 'false' } as const

export function useDrawWins(options?: { enabled?: boolean }): UseDrawWinsReturn {
  const enabled = options?.enabled ?? true
  const { account } = useMobileWallet()
  const queryClient = useQueryClient()

  const {
    data: wins,
    error,
    isLoading,
  } = useIndexMyWins(WINS_PARAMS, {
    query: { enabled: enabled && !!account },
  })

  const regularWins = account ? (wins?.filter((w) => w.drawType === 'regular').map(winToWinner) ?? null) : null
  const bigWins = account ? (wins?.filter((w) => w.drawType === 'big').map(winToWinner) ?? null) : null

  const removeWins = useCallback(
    (toRemove: Winner[]) => {
      const ids = new Set(toRemove.map((w) => `${w.epochOrSlot}-${w.winnerId}`))
      const queryKey = getIndexMyWinsQueryKey(WINS_PARAMS)
      queryClient.setQueryData(queryKey, (old: Win[] | undefined) =>
        old?.filter((w) => !ids.has(`${w.epochOrSlot}-${w.winnerId}`)) ?? [],
      )
    },
    [queryClient],
  )

  let normalizedError: Error | null = null
  if (error instanceof Error) {
    normalizedError = error
  } else if (error) {
    normalizedError = new Error('Draw wins fetch failed')
  }

  return {
    regularWins,
    bigWins,
    isLoading,
    error: normalizedError,
    removeWins,
  }
}
