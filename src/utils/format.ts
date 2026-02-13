import { LAMPORTS_PER_SOL, SOL_DECIMALS } from '@/constants/solana'

/**
 * Truncate an address or string with ellipsis in the middle.
 *
 * @example ellipsify('7nYB...', 4) => '7nYB...xxxx'
 */
export function ellipsify(str: string, maxLength = 4): string {
  if (str.length <= maxLength * 2 + 3) return str
  return `${str.slice(0, maxLength)}...${str.slice(-maxLength)}`
}

/**
 * Convert lamports (bigint) to SOL string with specified decimals.
 *
 * @example lamportsToSol(1_500_000_000n) => '1.5'
 */
export function lamportsToSol(lamports: bigint, decimals = SOL_DECIMALS): string {
  const wholePart = lamports / LAMPORTS_PER_SOL
  const fractionalPart = lamports % LAMPORTS_PER_SOL

  if (fractionalPart === 0n) {
    return wholePart.toString()
  }

  const fractionalStr = fractionalPart.toString().padStart(SOL_DECIMALS, '0').slice(0, decimals)
  // Remove trailing zeros
  const trimmed = fractionalStr.replace(/0+$/, '')

  return trimmed.length > 0 ? `${wholePart}.${trimmed}` : wholePart.toString()
}

/**
 * Convert SOL amount (number) to lamports (bigint).
 *
 * @example solToLamports(1.5) => 1_500_000_000n
 */
export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * Number(LAMPORTS_PER_SOL)))
}

/**
 * Format a SOL balance for display with the SOL symbol.
 *
 * @example formatSolBalance(1_500_000_000n) => '1.5 SOL'
 */
export function formatSolBalance(lamports: bigint): string {
  return `${lamportsToSol(lamports)} SOL`
}

/**
 * Encode a string message to Uint8Array (UTF-8).
 */
export function encodeMessage(message: string): Uint8Array {
  return new TextEncoder().encode(message)
}

/**
 * Decode a Uint8Array to string (UTF-8).
 */
export function decodeMessage(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

/**
 * Convert a Uint8Array to hex string.
 */
export function toHexString(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Format a timestamp to a locale string.
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}
