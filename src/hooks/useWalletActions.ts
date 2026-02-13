import { useCallback, useState } from 'react'
import type { SignatureBytes, Transaction } from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import type { SignMessageResult, WalletActionResult } from '@/types/wallet'
import { encodeMessage, toHexString } from '@/utils/format'
import { getErrorMessage } from '@/utils/wallet'

/**
 * Hook providing wallet signing and transaction actions with
 * built-in loading/error state management.
 *
 * Wraps the raw useMobileWallet functions with:
 * - Loading state tracking
 * - Error handling and user-friendly messages
 * - Message string encoding
 * - Result formatting
 *
 * @example
 * const { signMessage, signAndSendTransaction, loading, error } = useWalletActions()
 *
 * // Sign a text message
 * const result = await signMessage('Hello Solana!')
 * if (result) console.log('Signature:', result.signature)
 *
 * // Sign and send a transaction
 * const txResult = await signAndSendTransaction(transaction, minContextSlot)
 */
export function useWalletActions() {
  const wallet = useMobileWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<WalletActionResult | null>(null)

  /**
   * Clear any existing error state.
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Sign a text message with the connected wallet.
   *
   * @param message - Plain text message to sign
   * @returns The signed message result, or null if signing failed
   */
  const signMessage = useCallback(
    async (message: string): Promise<SignMessageResult | null> => {
      if (!wallet.account) {
        setError('No wallet connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const encodedMessage = encodeMessage(message)
        const signature = await wallet.signMessage(encodedMessage)

        const result: SignMessageResult = { message, signature }
        setLastResult({ data: result, error: null, loading: false })
        return result
      } catch (err) {
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        setLastResult({ data: null, error: errorMsg, loading: false })
        return null
      } finally {
        setLoading(false)
      }
    },
    [wallet],
  )

  /**
   * Sign a transaction without sending it.
   *
   * @param transaction - Transaction or array of transactions to sign
   * @returns The signed transaction(s), or null if signing failed
   */
  const signTransaction = useCallback(
    async <T extends Transaction | Transaction[]>(transaction: T): Promise<T | null> => {
      if (!wallet.account) {
        setError('No wallet connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const signed = await wallet.signTransaction(transaction)
        setLastResult({ data: signed, error: null, loading: false })
        return signed
      } catch (err) {
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        setLastResult({ data: null, error: errorMsg, loading: false })
        return null
      } finally {
        setLoading(false)
      }
    },
    [wallet],
  )

  /**
   * Sign and send a transaction to the network.
   *
   * @param transaction - Transaction or array of transactions
   * @param minContextSlot - Minimum context slot for the transaction
   * @returns Array of signature bytes, or null if failed
   */
  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | Transaction[],
      minContextSlot: bigint,
    ): Promise<SignatureBytes[] | null> => {
      if (!wallet.account) {
        setError('No wallet connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const signatures = await wallet.signAndSendTransaction(transaction, minContextSlot)
        setLastResult({ data: { signatures }, error: null, loading: false })
        return signatures
      } catch (err) {
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        setLastResult({ data: null, error: errorMsg, loading: false })
        return null
      } finally {
        setLoading(false)
      }
    },
    [wallet],
  )

  /**
   * Send a transaction using pre-built instructions.
   * This is a convenience wrapper around wallet.sendTransaction.
   *
   * @param instructions - Array of Solana instructions
   * @returns Transaction signature string, or null if failed
   */
  const sendTransaction = useCallback(
    async (instructions: Parameters<typeof wallet.sendTransaction>[0]): Promise<string | null> => {
      if (!wallet.account) {
        setError('No wallet connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const signature = await wallet.sendTransaction(instructions)
        setLastResult({ data: { signature }, error: null, loading: false })
        return signature
      } catch (err) {
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        setLastResult({ data: null, error: errorMsg, loading: false })
        return null
      } finally {
        setLoading(false)
      }
    },
    [wallet],
  )

  /**
   * Get a TransactionSendingSigner for the connected wallet.
   * Useful for building transactions with @solana/kit.
   */
  const getTransactionSigner = useCallback(
    (minContextSlot: bigint) => {
      if (!wallet.account) {
        throw new Error('No wallet connected')
      }
      return wallet.getTransactionSigner(wallet.account.address, minContextSlot)
    },
    [wallet],
  )

  return {
    /** Sign a text message */
    signMessage,
    /** Sign a transaction without sending */
    signTransaction,
    /** Sign and send a transaction */
    signAndSendTransaction,
    /** Send a transaction from instructions */
    sendTransaction,
    /** Get a TransactionSendingSigner */
    getTransactionSigner,
    /** Whether any wallet action is in progress */
    loading,
    /** Last error message, if any */
    error,
    /** Clear the current error */
    clearError,
    /** Last action result */
    lastResult,
    /** Hex string formatter for signatures */
    toHexString,
  } as const
}
