import { useCallback, useEffect, useState } from 'react'
import { address, getBase64Codec } from '@solana/kit'
import type { Rpc, SolanaRpcApi } from '@solana/kit'
import type { Base58EncodedBytes } from '@solana/rpc-types'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { getStakeStateV2Decoder, STAKE_PROGRAM_ADDRESS } from '@solana-program/stake'

import { useAuthStore } from '@/lib/stores/auth-store'
import type { StakeAccountState, UserStakeAccount } from '@/lib/solana/unstake'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fixed byte size */
const SPACE = 200n

/** Max u64 — Solana's sentinel for "not yet deactivating" */
const MAX_EPOCH = 18446744073709551615n

/**
 * Byte offset of meta.authorized.staker inside a serialised StakeStateV2::Stake account.
 * Layout: 4 (variant u32) + 8 (rentExemptReserve u64) = 12
 */
const STAKER_AUTHORITY_OFFSET = 12n

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseUserStakeAccountsOptions {
  rpc?: Rpc<SolanaRpcApi> | null
}

interface UseUserStakeAccountsReturn {
  data: UserStakeAccount[] | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/** Inferred shape of the Stake variant decoded by getStakeStateV2Decoder */
interface DecodedStakeMeta {
  rentExemptReserve: bigint
}

interface DecodedStakeData {
  delegation: {
    stake: bigint
    activationEpoch: bigint
    deactivationEpoch: bigint
  }
}

interface DecodedStakeVariant {
  __kind: 'Stake'
  fields: [DecodedStakeMeta, DecodedStakeData]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveStakeState(
  activationEpoch: bigint,
  deactivationEpoch: bigint,
  currentEpoch: bigint,
): StakeAccountState {
  if (deactivationEpoch !== MAX_EPOCH) {
    return deactivationEpoch === currentEpoch ? 'deactivating' : 'inactive'
  }
  return activationEpoch === currentEpoch ? 'activating' : 'active'
}

function isStakeVariant(decoded: { __kind: string }): decoded is DecodedStakeVariant {
  return decoded.__kind === 'Stake'
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches all stake accounts where the connected wallet is the stake authority.
 * Returns them as `UserStakeAccount[]` — the shape expected by `useUnstake`.
 *
 * @example
 * const { data: stakeAccounts, loading } = useUserStakeAccounts({ rpc })
 * const { unstake } = useUnstake({ rpc })
 *
 * await unstake({ amountLamports: 1_000_000_000n, stakeAccounts: stakeAccounts ?? [] })
 */
export function useUserStakeAccounts({ rpc }: UseUserStakeAccountsOptions): UseUserStakeAccountsReturn {
  const { account } = useMobileWallet()
  const session = useAuthStore((s) => s.session)

  const [data, setData] = useState<UserStakeAccount[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchStakeAccounts = useCallback(async (): Promise<void> => {
    if (!rpc || !account || !session) return

    setLoading(true)
    setError(null)

    try {
      const [epochInfo, programAccounts] = await Promise.all([
        rpc.getEpochInfo().send(),
        rpc
          .getProgramAccounts(STAKE_PROGRAM_ADDRESS, {
            encoding: 'base64',
            withContext: false,
            filters: [
              { dataSize: SPACE },
              {
                memcmp: {
                  offset: STAKER_AUTHORITY_OFFSET,
                  bytes: account.address as unknown as Base58EncodedBytes,
                  encoding: 'base58',
                },
              },
            ],
          })
          .send(),
      ])
      console.log('useUserStakeAccounts - fetchStakeAccounts - epochInfo:', epochInfo)
      console.log('useUserStakeAccounts - fetchStakeAccounts - programAccounts:', programAccounts)

      const currentEpoch = BigInt(epochInfo.epoch)
      console.log('useUserStakeAccounts - fetchStakeAccounts - currentEpoch:', currentEpoch)
      const decoder = getStakeStateV2Decoder()
      const base64Codec = getBase64Codec()

      const accounts: UserStakeAccount[] = programAccounts
        .map((acc) => {
          try {
            const [base64Data] = acc.account.data as [string, 'base64']
            // getBase64Codec().encode converts a base64 string → Uint8Array
            const bytes = base64Codec.encode(base64Data)
            const decoded = decoder.decode(bytes) as { __kind: string }

            if (!isStakeVariant(decoded)) return null

            const [meta, stake] = decoded.fields

            return {
              pubkey: address(acc.pubkey),
              lamports: acc.account.lamports,
              state: resolveStakeState(
                BigInt(stake.delegation.activationEpoch),
                BigInt(stake.delegation.deactivationEpoch),
                currentEpoch,
              ),
              delegatedStake: Number(stake.delegation.stake),
              rentExemptReserve: Number(meta.rentExemptReserve),
            } satisfies UserStakeAccount
          } catch {
            return null
          }
        })
        .filter((a): a is UserStakeAccount => a !== null)

      setData(accounts)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stake accounts'))
    } finally {
      setLoading(false)
    }
  }, [rpc, account, session])

  useEffect(() => {
    void fetchStakeAccounts()
  }, [fetchStakeAccounts])

  return { data, loading, error, refresh: fetchStakeAccounts }
}
