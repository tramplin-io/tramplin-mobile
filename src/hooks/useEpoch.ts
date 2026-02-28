import type { Epoch } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'

import { rpc } from '@/utils/solana'

/** Stale after 2 min — epoch changes roughly every ~2 days on mainnet. */
const EPOCH_STALE_MS = 2 * 60 * 1000

export function useEpoch() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['current-epoch'],
    queryFn: async (): Promise<Epoch> => {
      const { epoch } = await rpc.getEpochInfo().send()
      return epoch
    },
    staleTime: EPOCH_STALE_MS,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })

  return { epoch: data, error: error ?? null, isLoading }
}
