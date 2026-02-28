import { useMemo } from 'react'
import { getStakeStateV2Decoder, STAKE_PROGRAM_ADDRESS } from '@solana-program/stake'
import { address, getBase64Codec } from '@solana/kit'
import type { Base58EncodedBytes } from '@solana/rpc-types'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

import type { StakeAccountState, UserStakeAccount } from '@/lib/solana/unstake'
import { useAuthStore } from '@/lib/stores/auth-store'

import { useEpoch } from './useEpoch'
import { useProgramAccounts } from './useProgramAccounts'

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

const stakeDecoder = getStakeStateV2Decoder()
const base64Codec = getBase64Codec()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
 * Uses useProgramAccounts (shared rpc from @/utils/solana) and useEpoch.
 *
 * @example
 * const { data: stakeAccounts, loading } = useUserStakeAccounts()
 * const { unstake } = useUnstake()
 * await unstake({ amountLamports: 1_000_000_000n, stakeAccounts: stakeAccounts ?? [] })
 */
export function useUserStakeAccounts(): UseUserStakeAccountsReturn {
  const { account } = useMobileWallet()
  const { epoch } = useEpoch()
  const session = useAuthStore((s) => s.session)

  const programAccountsOptions = useMemo(
    () => ({
      encoding: 'base64' as const,
      withContext: false,
      filters: [
        { dataSize: SPACE },
        {
          memcmp: {
            offset: STAKER_AUTHORITY_OFFSET,
            bytes: account?.address as unknown as Base58EncodedBytes,
            encoding: 'base58' as const,
          },
        },
      ],
    }),
    [account?.address],
  )

  const {
    data: programAccounts,
    error: programError,
    isLoading: loading,
    refetch,
  } = useProgramAccounts({
    programId: STAKE_PROGRAM_ADDRESS,
    options: programAccountsOptions,
    enabled: !!account && !!session,
  })

  const data = useMemo((): UserStakeAccount[] | null => {
    if (programAccounts == null || epoch == null) return null
    const currentEpoch = BigInt(epoch)
    return programAccounts
      .map((acc) => {
        try {
          const [base64Data] = acc.account.data as unknown as [string, 'base64']
          const bytes = base64Codec.encode(base64Data)
          const decoded = stakeDecoder.decode(bytes) as { __kind: string }
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
  }, [programAccounts, epoch])

  let error: Error | null = null
  if (programError instanceof Error) {
    error = programError
  } else if (programError != null) {
    error = new Error(String(programError))
  }

  const refresh = async (): Promise<void> => {
    await refetch()
  }

  return {
    data: data ?? null,
    loading,
    error,
    refresh,
  }
}
