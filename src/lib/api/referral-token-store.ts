/**
 * Token store for managing referral API auth tokens.
 *
 * Separate from the main tokenStore because the referrals API
 * has its own auth system (REFERRALS_LOGIN_PAYLOAD vs LOGIN_PAYLOAD).
 * The auth store syncs tokens here on referral login/logout.
 */

let _token: string | null = null

export const referralTokenStore = {
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
