import { useCallback, useState } from 'react'
import { AppState } from 'react-native'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-kit'
import type { SignatureBytes, Transaction } from '@solana/kit'
import { useAuthorization, useMobileWallet } from '@wallet-ui/react-native-kit'

import { LOGIN_PAYLOAD } from '@/constants/auth'
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
  const { authorizeSession } = useAuthorization({
    chain: wallet.chain,
    identity: wallet.identity,
    store: wallet.store,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<WalletActionResult | null>(null)

  const isAuthRequestFailed = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    return msg.includes('authorization request failed')
  }, [])

  const ensureForeground = useCallback(() => {
    // MWA requests can fail if the app is backgrounded during the intent round-trip
    if (AppState.currentState !== 'active') {
      throw new Error('App must be in the foreground to sign')
    }
  }, [])

  const withReauthorizeRetry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      try {
        ensureForeground()
        return await fn()
      } catch (err) {
        console.error('withReauthorizeRetry - err:', err)
        if (!isAuthRequestFailed(err)) throw err

        // Solflare/Android can return a protocol-level auth failure if the cached session is stale.
        // Reset session and try once more. We cannot call deauthorizeSession here (it requires
        // a DeauthorizeAPI wallet reference we don't have in this path); disconnect + connect
        // clears our side and establishes a fresh session.
        await wallet.disconnect?.().catch(() => undefined)
        await wallet.connect()

        ensureForeground()
        return await fn()
      }
    },
    [wallet, ensureForeground, isAuthRequestFailed],
  )

  /**
   * Clear any existing error state.
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Sign the login payload (expiresAt + payload) for auth.
   * Used by greeting screen to create a session.
   *
   * @param payload - Payload to sign (default: LOGIN_PAYLOAD)
   * @returns The signed message result with digest as the signed JSON string, or null if signing failed
   */
  const signLoginMessage = useCallback(
    async (payload: string = LOGIN_PAYLOAD): Promise<SignMessageResult | null> => {
      setLoading(true)
      setError(null)

      try {
        const expiresAt = Date.now() + 1 * 60 * 1000
        const dataSignObject = { expiresAt, payload }
        const dataSign = JSON.stringify(dataSignObject)

        const messageBytes = new TextEncoder().encode(dataSign)

        const result: SignMessageResult = await withReauthorizeRetry(async () => {
          return await transact(async (mobileWallet) => {
            const account = await authorizeSession(mobileWallet)

            if (!mobileWallet?.signMessages) {
              throw new Error('Wallet does not support message signing')
            }

            const signedMessages = await mobileWallet.signMessages({
              addresses: [account.addressBase64],
              payloads: [messageBytes],
            })

            const signature = signedMessages?.[0]
            if (!signature) {
              throw new Error('Wallet did not return a signature')
            }

            const publicKey = String(account.address)

            return { message: dataSign, signature, publicKey }
          })
        })

        setLastResult({ data: result, error: null, loading: false })
        return result
      } catch (err) {
        console.error('signLoginMessage - err', err)
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        setLastResult({ data: null, error: errorMsg, loading: false })
        return null
      } finally {
        setLoading(false)
      }
    },
    [authorizeSession, withReauthorizeRetry],
  )

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
        if (!wallet?.signMessage) {
          throw new Error('Wallet does not support message signing')
        }
        // console.log('signMessage - encodedMessage', encodedMessage)
        const signature = await withReauthorizeRetry(() => wallet.signMessage(encodedMessage))
        // console.log('signMessage - signature', signature)

        const result: SignMessageResult = { message, signature }
        setLastResult({ data: result, error: null, loading: false })
        return result
      } catch (err) {
        console.error('signMessage - err', err)
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        setLastResult({ data: null, error: errorMsg, loading: false })
        return null
      } finally {
        setLoading(false)
      }
    },
    [wallet, withReauthorizeRetry],
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
        const signed = await withReauthorizeRetry(() => wallet.signTransaction(transaction))
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
    [wallet, withReauthorizeRetry],
  )

  /**
   * Sign and send a transaction to the network.
   *
   * @param transaction - Transaction or array of transactions
   * @param minContextSlot - Minimum context slot for the transaction
   * @returns Array of signature bytes, or null if failed
   */
  const signAndSendTransaction = useCallback(
    async (transaction: Transaction | Transaction[], minContextSlot: bigint): Promise<SignatureBytes[] | null> => {
      if (!wallet.account) {
        setError('No wallet connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const signatures = await withReauthorizeRetry(() => wallet.signAndSendTransaction(transaction, minContextSlot))
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
    [wallet, withReauthorizeRetry],
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
        const signature = await withReauthorizeRetry(() => wallet.sendTransaction(instructions))
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
    [wallet, withReauthorizeRetry],
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
    /** Sign the login payload for auth (expiresAt + LOGIN_PAYLOAD) */
    signLoginMessage,
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
