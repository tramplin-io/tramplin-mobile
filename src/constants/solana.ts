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

/** App identity for wallet adapter */
export const APP_IDENTITY = {
  name: 'Tramplin',
  uri: 'https://github.com/beeman/tramplin-mobile',
} as const
