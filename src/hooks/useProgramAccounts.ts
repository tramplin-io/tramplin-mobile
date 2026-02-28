import type { Address, Rpc, SolanaRpcApi } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'

import { rpc } from '@/utils/solana'

type GetProgramAccountsOptions = Parameters<Rpc<SolanaRpcApi>['getProgramAccounts']>[1]
type ProgramAccountsData = Awaited<ReturnType<ReturnType<Rpc<SolanaRpcApi>['getProgramAccounts']>['send']>>

/** Stale after 10 seconds to avoid RPC rate limits. */
const PROGRAM_ACCOUNTS_STALE_MS = 10_000

/** Serialize options for query key; BigInt is not JSON-serializable by default. */
function getOptionsQueryKey(options: GetProgramAccountsOptions): string {
  return JSON.stringify(options, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
}

export interface UseProgramAccountsParams {
  programId: Address
  options: GetProgramAccountsOptions
  /** When false, the query does not run. Default true. */
  enabled?: boolean
}

export function useProgramAccounts({ programId, options, enabled = true }: UseProgramAccountsParams) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['program-accounts', programId, getOptionsQueryKey(options)],
    queryFn: async (): Promise<ProgramAccountsData> => {
      return await rpc.getProgramAccounts(programId, options).send()
    },
    enabled,
    staleTime: PROGRAM_ACCOUNTS_STALE_MS,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })

  return {
    data: data ?? null,
    error: error ?? null,
    isLoading,
    refetch,
  }
}
