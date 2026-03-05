import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

import { REFERRALS_LOGIN_PAYLOAD } from '@/constants/auth'
import { useWalletActions } from '@/hooks/useWalletActions'
import { useCreateSessionByUserWallet } from '@/lib/api/generated-referrals/restApi'
import { referralTokenStore } from '@/lib/api/referral-token-store'
import { signatureToBase58 } from '@/utils/format'

const REFERRAL_TOKEN_KEY_PREFIX = 'referral_api_token_'
const REFERRAL_SESSION_KEY_PREFIX = 'referral_has_session_'
const getTokenKey = (address: string) => `${REFERRAL_TOKEN_KEY_PREFIX}${address}`
const getSessionKey = (address: string) => `${REFERRAL_SESSION_KEY_PREFIX}${address}`

type JwtPayload = {
  exp: number
  iat: number
  userId: string
  [key: string]: unknown
}

function decodeJwtPayload(token: string): JwtPayload {
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Invalid JWT')
  return JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/')))
}

export type ReferralAuthState = {
  signIn: () => Promise<void>
  signOut: () => void
  token: string | null
  isAuthenticated: boolean
  hasPreviousSession: boolean
  status: 'idle' | 'pending' | 'authenticated' | 'error'
  error: Error | null
}

const ReferralContext = createContext<ReferralAuthState | null>(null)

export function ReferralContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const wallet = useMobileWallet()
  const { signMessage } = useWalletActions()
  const walletAddress = wallet.account?.address ?? null

  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'authenticated' | 'error'>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [hasPreviousSession, setHasPreviousSession] = useState(false)

  const createSession = useCreateSessionByUserWallet()

  const signIn = useCallback(async () => {
    if (!walletAddress) throw new Error('Wallet not connected')

    setStatus('pending')
    setError(null)

    try {
      const digest = JSON.stringify({
        expiresAt: Date.now() + 60_000,
        payload: REFERRALS_LOGIN_PAYLOAD,
      })

      const result = await signMessage(digest)
      if (!result) throw new Error('Message signing failed')

      const signatureBase58 = signatureToBase58(result.signature)

      const response = await createSession.mutateAsync({
        data: {
          digest,
          signature: signatureBase58,
          publicKey: walletAddress,
        },
      })

      if (response?.token) {
        referralTokenStore.setToken(response.token)
        await AsyncStorage.setItem(getTokenKey(walletAddress), response.token)
        await AsyncStorage.setItem(getSessionKey(walletAddress), 'true')
        setToken(response.token)
        setHasPreviousSession(true)
        setStatus('authenticated')
      }
    } catch (err) {
      setStatus('error')
      const parsed = err instanceof Error ? err : new Error(String(err))
      setError(parsed)
      throw parsed
    }
  }, [walletAddress, signMessage, createSession])

  const signOut = useCallback(() => {
    if (!walletAddress) return
    AsyncStorage.removeItem(getTokenKey(walletAddress)).catch(() => {})
    referralTokenStore.clearToken()
    setToken(null)
    setStatus('idle')
    setError(null)
  }, [walletAddress])

  const checkAuthToken = useCallback(async () => {
    if (!walletAddress) {
      setToken(null)
      setHasPreviousSession(false)
      setStatus('idle')
      referralTokenStore.clearToken()
      return
    }

    const hasSession = await AsyncStorage.getItem(getSessionKey(walletAddress))
    setHasPreviousSession(hasSession === 'true')

    const stored = await AsyncStorage.getItem(getTokenKey(walletAddress))
    if (stored) {
      try {
        const payload = decodeJwtPayload(stored)
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          referralTokenStore.setToken(stored)
          setToken(stored)
          setStatus('authenticated')
          return
        }
      } catch (err) {
        console.error('Failed to parse stored referral token', err)
      }
    }

    referralTokenStore.clearToken()
    setToken(null)
    setStatus('idle')
  }, [walletAddress])

  useEffect(() => {
    void checkAuthToken()
  }, [checkAuthToken])

  const value = useMemo<ReferralAuthState>(
    () => ({
      signIn,
      signOut,
      token,
      isAuthenticated: token !== null,
      hasPreviousSession,
      status,
      error,
    }),
    [signIn, signOut, token, hasPreviousSession, status, error],
  )

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>
}

export function useReferralSignIn(): ReferralAuthState {
  const ctx = useContext(ReferralContext)
  if (!ctx) throw new Error('useReferralSignIn must be used within ReferralContextProvider')
  return ctx
}
