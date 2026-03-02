import type { Address, SignatureBytes, Transaction } from '@solana/kit'

/**
 * Wallet connection state
 */
export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting'

/**
 * Result of a wallet action (sign, send, etc.)
 */
export interface WalletActionResult<T = unknown> {
  data: T | null
  error: string | null
  loading: boolean
}

/**
 * Parameters for signing a message
 */
export interface SignMessageParams {
  /** The message string to sign (will be encoded to Uint8Array) */
  message: string
}

/**
 * Result of signing a message
 */
export interface SignMessageResult {
  /** The original message */
  message: string
  /** The signature bytes */
  signature: Uint8Array
  /** Base58 public key that signed the message, if known */
  publicKey?: string
}

/**
 * Parameters for signing a transaction
 */
export interface SignTransactionParams {
  /** The transaction(s) to sign */
  transaction: Transaction | Transaction[]
}

/**
 * Result of signing and sending a transaction
 */
export interface SendTransactionResult {
  /** Transaction signature(s) */
  signatures: SignatureBytes[]
}

/**
 * SOL balance info
 */
export interface BalanceInfo {
  /** Balance in lamports */
  lamports: bigint
  /** Balance in SOL (formatted string) */
  sol: string
}

/**
 * Wallet account info
 */
export interface WalletAccount {
  address: Address
  label?: string
}
