/**
 * Token store for managing auth tokens.
 *
 * Zustand store that breaks the circular dependency between the Axios instance
 * and Zustand auth store. The auth store syncs tokens here on login/logout.
 * Use tokenStore (getToken/setToken/clearToken) for non-React code (e.g. interceptors).
 */

import { create } from 'zustand'

type TokenState = {
  token: string | null
  setToken: (token: string | null) => void
  clearToken: () => void
}

export const useTokenStore = create<TokenState>()((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
}))

const getState = () => useTokenStore.getState()

export const tokenStore = {
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
