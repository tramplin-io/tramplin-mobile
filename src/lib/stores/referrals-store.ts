import AsyncStorage from '@react-native-async-storage/async-storage'
import { isAxiosError } from 'axios'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createSessionByUserWallet, readMyProfile } from '@/lib/api/generated-referrals/restApi'
import type { Profile, WalletCredentials } from '@/lib/api/generated-referrals/restApi.schemas'
import { referralTokenStore } from '@/lib/api/referral-token-store'

type ReferralsState = {
  token: string | null
  profile: Profile | null
  walletAddress: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  signInWithWallet: (walletCredentials: WalletCredentials) => Promise<boolean>
  fetchProfile: () => Promise<Profile | null>
  setToken: (token: string) => void
  logout: () => void
  reset: () => void
}

const initialState = {
  token: null,
  profile: null,
  walletAddress: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
} as const

export const useReferralsStore = create<ReferralsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setToken: (token: string) => {
        const cleanToken = token.trim()
        referralTokenStore.setToken(cleanToken)
        set({
          token: cleanToken,
          isAuthenticated: true,
        })
      },

      signInWithWallet: async (walletCredentials: WalletCredentials) => {
        try {
          set({ isLoading: true, error: null })

          const response = await createSessionByUserWallet(walletCredentials)

          if (response?.token) {
            const cleanToken = response.token.trim()
            referralTokenStore.setToken(cleanToken)
            set({
              token: cleanToken,
              isAuthenticated: true,
              walletAddress: walletCredentials.publicKey ?? get().walletAddress,
            })
            await get().fetchProfile()
            return true
          }

          return false
        } catch (error) {
          console.error('Error signing in to referrals with wallet:', error)

          set({ error: error instanceof Error ? error.message : 'Unknown error' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null })

          const token = get().token
          if (!token) {
            return null
          }

          referralTokenStore.setToken(token.trim())

          const profile = await readMyProfile()
          set({ profile: profile ?? null })

          return profile ?? null
        } catch (error) {
          console.error('Error fetching referral profile:', error)
          set({ error: error instanceof Error ? error.message : 'Unknown error' })

          const status = isAxiosError(error) ? error.response?.status : undefined

          if (status === 404) {
            set({ profile: null })
            get().logout()
            return null
          }

          if (status === 401) {
            get().logout()
            return null
          }

          return null
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        referralTokenStore.clearToken()
        set(initialState)
      },

      reset: () => {
        referralTokenStore.clearToken()
        set(initialState)
      },
    }),
    {
      name: 'referrals-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        walletAddress: state.walletAddress,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          referralTokenStore.setToken(state.token)
          // Profile is not persisted; refetch after rehydration so it's available after reload
          useReferralsStore.getState().fetchProfile()
        }
      },
    },
  ),
)
