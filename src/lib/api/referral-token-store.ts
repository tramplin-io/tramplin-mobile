/**
 * Token store for managing referral API auth tokens.
 *
 * Separate from the main tokenStore because the referrals API
 * has its own auth system (REFERRALS_LOGIN_PAYLOAD vs LOGIN_PAYLOAD).
 * The auth store syncs tokens here on referral login/logout.
 * Use referralTokenStore (getToken/setToken/clearToken) for non-React code (e.g. interceptors).
 */

import { create } from 'zustand'

type ReferralTokenState = {
  token: string | null
  setToken: (token: string | null) => void
  clearToken: () => void
}

export const useReferralTokenStore = create<ReferralTokenState>()((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
}))

const getState = () => useReferralTokenStore.getState()

export const referralTokenStore = {
  getToken(): string | null {
    return getState().token
  },

  setToken(token: string | null): void {
    getState().setToken(token)
  },

  clearToken(): void {
    getState().clearToken()
  },

  hasToken(): boolean {
    return getState().token !== null
  },
} as const
