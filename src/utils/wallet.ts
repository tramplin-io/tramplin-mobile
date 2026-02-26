import type { Address } from '@solana/kit'
import { encodeMessage } from './format'

/**
 * Prepare a message for signing by encoding it to Uint8Array.
 * The message is prefixed with a standard header for identification.
 */
export function prepareSignableMessage(message: string): Uint8Array {
  return encodeMessage(message)
}

/**
 * Validate a Solana address string.
 * Basic validation - checks length and base58 character set.
 */
export function isValidSolanaAddress(address: string): boolean {
  if (address.length < 32 || address.length > 44) return false
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  return base58Regex.test(address)
}

/**
 * Get a Solana explorer URL for a given address, transaction, or block.
 */
export function getExplorerUrl(
  type: 'address' | 'tx' | 'block',
  value: string,
  cluster: 'devnet' | 'testnet' | 'mainnet-beta' = 'devnet',
): string {
  const base = 'https://explorer.solana.com'
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`
  return `${base}/${type}/${value}${clusterParam}`
}

/**
 * Get Solscan transaction URL for a given signature.
 */
export function getSolscanTxUrl(signature: string, cluster: 'devnet' | 'testnet' | 'mainnet-beta' = 'devnet'): string {
  const base = 'https://solscan.io'
  const path = cluster === 'mainnet-beta' ? `tx/${signature}` : `tx/${signature}?cluster=${cluster}`
  return `${base}/${path}`
}

/**
 * Type guard to check if an error is an instance of Error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

/**
 * Detect wallet/signing cancellation (e.g. user dismissed the signing UI).
 * Native Android can throw java.util.concurrent.CancellationException, bridged to JS.
 */
export function isCancellationError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return /cancelation|cancellation|cancelled|canceled/i.test(msg)
}

/**
 * Check if an address is a valid Address type.
 */
export function addressToString(address: Address): string {
  return address.toString()
}

export function formatWalletAddress(walletAddress: string): string {
  return `${walletAddress?.slice(0, 4)}…${walletAddress?.slice(-4)}`
}
