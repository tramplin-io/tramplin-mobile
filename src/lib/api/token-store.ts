/**
 * Token store for managing auth tokens.
 *
 * This is a simple in-memory store that breaks the circular dependency
 * between the Axios instance and Zustand auth store.
 * The auth store syncs tokens here on login/logout.
 *
 */

let _token: string | null = null

export const tokenStore = {
  getToken(): string | null {
    return _token
  },

  setToken(token: string | null): void {
    _token = token
  },

  clearToken(): void {
    _token = null
  },

  hasToken(): boolean {
    return _token !== null
  },
} as const
