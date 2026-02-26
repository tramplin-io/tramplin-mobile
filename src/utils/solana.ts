import { lamports } from '@solana/kit'
export const SOLANA_SLOT_MS = 400

/** Fixed amount of sol is spent on a claim account */
export const DRAW_CLAIM_RENT = lamports(1447680n)
export const MIN_BALANCE_FOR_TX = lamports(10000n) // 0.00001 SOL

// This is pre-calculated values for UI. Real rent will be calculated during TX creation
export const ACCOUNT_CREATION_COST = lamports(2280000n)
export const TX_RENT = lamports(2280000n)
export const STAKE_TX_PRECALCULATED_COST = lamports(MIN_BALANCE_FOR_TX * 5n + ACCOUNT_CREATION_COST + TX_RENT)
/** Max wait time for draw reveal */
export const REGULAR_DRAW_TIMEOUT_MS = 5 * 60 * 1000
