/**
 * Solana-related constants
 */

/** Number of lamports in 1 SOL */
export const LAMPORTS_PER_SOL = 1_000_000_000n

/** Default commitment level for RPC calls */
export const DEFAULT_COMMITMENT = 'confirmed' as const

/** Default number of decimals for SOL display */
export const SOL_DECIMALS = 9

/** Explorer providers */
export const EXPLORER_PROVIDERS = ['solscan', 'solana', 'orb'] as const

// /** App identity for wallet adapter */
// export const APP_IDENTITY = {
//   name: 'Tramplin',
//   uri: 'https://github.com/beeman/tramplin-mobile',
// } as const

/** Minimum stake amount in SOL (enforced by Solana stake program) */
export const MIN_STAKE_SOL = __DEV__ ? 0.1 : 1
export const MIN_SUBSEQUENT_STAKE_SOL = 0.1

/**
 * Validator vote key for staking testnet.
 */
export const SOLANA_VALIDATOR_VOTE_KEY = process.env.EXPO_PUBLIC_SOLANA_VALIDATOR_VOTE_KEY ?? ''

export const SOLANA_PROGRAM_ID = process.env.EXPO_PUBLIC_SOLANA_PROGRAM_ID ?? ''
