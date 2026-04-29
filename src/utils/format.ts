import bs58 from 'bs58'

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
 * Format a number to a truncated string with specified fraction digits.
 *
 * @example formatTruncated(1.2345, 2) => '1.23'
 * @example formatTruncated(1.2345, 3) => '1.234'
 * @example formatTruncated(1.2345, 4) => '1.2345'
 */
export function formatTruncated(value: number | undefined, fractionDigits = 2): string {
  const safe = typeof value === 'number' && !Number.isNaN(value) ? value : 0
  const factor = 10 ** fractionDigits
  const truncated = Math.floor(safe * factor) / factor
  return truncated.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
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

/**
 * Format numbers with K/M abbreviations without rounding.
 *
 * Rules:
 * - 0–999.99 → plain number (up to 2 decimal places, no grouping)
 * - 1_000–9_999.99 → integer part only (no decimals)
 * - 10_000–999_999 → K suffix
 * - ≥ 1_000_000 → M suffix
 * - Always dot as decimal separator, max 2 fraction digits, no trailing zeros.
 *
 * @example 850.23 => "850.23"
 * @example 1234.56 => "1234"
 * @example 9999.99 => "9999"
 * @example 10000.00 => "10K"
 * @example 15678.99 => "15.67K"
 * @example 999999.99 => "999.99K"
 * @example 1234567.89 => "1.23M"
 * @example 1600000.00 => "1.6M"
 */
export function formatAbbreviatedNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '0'

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)

  const formatWithSuffix = (num: number, divisor: number, suffix: string) => {
    const factor = 100
    const truncated = Math.trunc((num / divisor) * factor) / factor
    let str = truncated.toFixed(2)
    str = str.replace(/\.?0+$/, '')
    return `${sign}${str}${suffix}`
  }

  if (abs < 1_000) {
    const factor = 100
    const truncated = Math.trunc(abs * factor) / factor
    let str = truncated.toFixed(2)
    str = str.replace(/\.?0+$/, '')
    return `${sign}${str}`
  }

  if (abs < 10_000) {
    const truncatedInt = Math.trunc(abs)
    return `${sign}${truncatedInt}`
  }

  if (abs < 1_000_000) {
    return formatWithSuffix(abs, 1_000, 'K')
  }

  return formatWithSuffix(abs, 1_000_000, 'M')
}

export function diffDate(toDate: Date, fromDate = new Date()) {
  return Math.max(0, toDate.getTime() - fromDate.getTime())
}

export function formatStopwatchTime(toDate: Date): [string, string, string, string] {
  const diff = diffDate(toDate)

  const days = Math.floor(diff / (3600000 * 24))
  const hours = Math.floor((diff % (3600000 * 24)) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return [
    days.toString().padStart(2, '0'),
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ]
}
