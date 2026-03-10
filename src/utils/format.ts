import { LAMPORTS_PER_SOL, SOL_DECIMALS } from '@/constants/solana'
import bs58 from 'bs58'

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
 * Encode signature bytes to base58 (e.g. for WalletCredentials).
 */
export function signatureToBase58(bytes: Uint8Array): string {
  return bs58.encode(bytes)
}

/**
 * Format a JS Date or ISO string into relative time like "2 DAYS AGO".
 * - < 1 minute → "NOW"
 * - < 1 hour → "N MIN AGO"
 * - < 24 hours → "N HOURS AGO"
 * - otherwise → "N DAY(S) AGO"
 */
export function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—'

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (Number.isNaN(date.getTime())) return '—'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 60) {
    return 'NOW'
  }

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    if (diffMinutes === 1) return '1 MIN AGO'
    return `${diffMinutes} MINS AGO`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    if (diffHours === 1) return '1 HOUR AGO'
    return `${diffHours} HOURS AGO`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return '1 DAY AGO'
  return `${diffDays} DAYS AGO`
}

/**
 * Format a timestamp to a locale string.
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

/**
 * Format prize SOL (number from API) for display.
 *
 * @example formatPrizeSol(0.0059) => '0.0059'
 */
export function formatPrizeSol(sol: number | undefined, maxDecimals = 5): string {
  if (sol == null || Number.isNaN(sol)) return '0'
  const s = sol.toFixed(maxDecimals)
  const trimmed = s.replace(/\.?0+$/, '')
  return trimmed || '0'
}

/**
 * Format prize USD (cents from API) for display with thousand separators.
 *
 * @example formatPrizeUSD(123) => '1.23'
 * @example formatPrizeUSD(100000) => '1,000.00'
 */
export function formatPrizeUSD(cents: number | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '0'
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format a date string to "X DAYS AGO" or "AWARDED X DAYS AGO".
 */
export function formatAwardedAgo(dateStr: string | undefined, prefix = 'AWARDED '): string {
  if (!dateStr) return `${prefix}—`
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 0) return `${prefix}TODAY`
  if (days === 1) return `${prefix}1 DAY AGO`
  return `${prefix}${days} DAYS AGO`
}
