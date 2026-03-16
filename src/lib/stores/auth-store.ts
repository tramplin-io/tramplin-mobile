import AsyncStorage from '@react-native-async-storage/async-storage'
import { isAxiosError } from 'axios'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createSessionByUserWallet, deleteMySession, readMySession } from '@/lib/api/generated/restApi'
import type { Session, WalletCredentials } from '@/lib/api/generated/restApi.schemas'
import { queryClient } from '@/lib/api/query-client'
import { tokenStore } from '@/lib/api/token-store'

import { getExpoPushToken } from '../notifications/utils'
import { useApiConfigStore } from './api-config-store'
import { useDeveloperStore } from './developer-store'
import { useLogStore } from './log-store'
import { useProfileStore } from './profile-store'
import { useReferralsStore } from './referrals-store'
import { useUserStore } from './user-store'

type AuthState = {
  token: string | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  email: string | null
  isForceUpdateModalVisible: boolean
  isUpdateAvailableModalVisible: boolean
  installAppDate: string | null
  error: string | null

  // Actions
  loginWithWallet: (walletCredentials: WalletCredentials) => Promise<boolean>
  fetchSession: () => Promise<Session | null>
  verifySession: (token: string) => Promise<{ success: boolean; session: Session | null }>
  logout: (opts?: { disconnect?: () => Promise<void>; router?: { replace: (path: string) => void } }) => Promise<void>
  deleteUser: () => void
  setEmail: (email: string) => void
  checkUpdateAvailable: () => void
  dismissUpdateAvailable: () => void
  setInstallAppDate: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      email: null,
      isForceUpdateModalVisible: false,
      isUpdateAvailableModalVisible: false,
      installAppDate: null,
      error: null,

      setEmail: (email: string) => {
        set({ email })
      },

      setInstallAppDate: () => {
        set({ installAppDate: new Date().toISOString() })
      },

      checkUpdateAvailable: () => {
        const session = get().session
        if (session?.isUpdateRequired && !session?.isForceUpdateRequired) {
          set({ isUpdateAvailableModalVisible: true })
        } else if (session?.isForceUpdateRequired) {
          set({ isForceUpdateModalVisible: true })
        }
      },

      dismissUpdateAvailable: () => {
        set({ isUpdateAvailableModalVisible: false })
      },

      loginWithWallet: async (walletCredentials: WalletCredentials) => {
        const fetchUserProfile = useProfileStore.getState().fetchUserProfile
        try {
          set({ isLoading: true, error: null })

          const response = await createSessionByUserWallet(walletCredentials)

          if (response?.token) {
            const { success } = await get().verifySession(response.token)

            if (success) {
              await fetchUserProfile()
            }

            return success
          }

          return false
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' })
          console.error('Error logging in with wallet:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      fetchSession: async () => {
        try {
          set({ isLoading: true, error: null })

          const token = get().token
          if (!token) {
            return null
          }

          const cleanToken = token.trim()
          tokenStore.setToken(cleanToken)

          const session = await readMySession()
          set({ session })

          get().checkUpdateAvailable()

          return session
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' })

          const status = isAxiosError(error) ? error.response?.status : undefined

          if (status === 404) {
            // No session on server (e.g. deleted or expired) — clear auth state
            set({ session: null })
            get().logout()
            return null
          }

          if (status === 401) {
            get().logout()
            return null
          }

          console.error('Error fetching session:', error)
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      verifySession: async (token: string): Promise<{ success: boolean; session: Session | null }> => {
        set({ error: null })
        if (token) {
          const cleanToken = token.trim()

          tokenStore.clearToken()

          tokenStore.setToken(cleanToken)
          set({
            token: cleanToken,
            isAuthenticated: true,
          })

          await new Promise((resolve) => setTimeout(resolve, 100))

          try {
            const session = await get().fetchSession()
            return { success: true, session }
          } catch (sessionError) {
            set({ error: sessionError instanceof Error ? sessionError.message : 'Unknown error' })
            console.error('Error fetching session after token set:', sessionError)
            return { success: true, session: null }
          }
        }

        return { success: false, session: null }
      },

      logout: async (opts) => {
        set({ error: null })
        const setUserProfile = useProfileStore.getState().setUserProfile
        const resetProfile = useProfileStore.getState().resetProfile
        const deleteDeviceToken = useProfileStore.getState().deleteDeviceToken

        const deviceTokens = await getExpoPushToken()
        try {
          try {
            await deleteMySession()
          } catch (apiError) {
            console.error('deleteMySession failed, continuing with logout', apiError)
          }

          try {
            if (deviceTokens?.expoDeviceToken) await deleteDeviceToken(deviceTokens.expoDeviceToken)
            if (deviceTokens?.fcmDeviceToken) await deleteDeviceToken(deviceTokens.fcmDeviceToken)
          } catch (deleteError) {
            console.error('Device token removal failed, continuing with logout', deleteError)
          }

          useUserStore.getState().reset()
          useApiConfigStore.getState().resetToDefaultUrl()
          useDeveloperStore.getState().reset()
          useLogStore.getState().clearLogs()
          queryClient.clear()
          useReferralsStore.getState().logout()

          setUserProfile(null)
          resetProfile()

          set({
            token: null,
            session: null,
            isAuthenticated: false,
            email: null,
            isForceUpdateModalVisible: false,
            isUpdateAvailableModalVisible: false,
            error: null,
          })

          tokenStore.clearToken()

          if (opts?.disconnect != null && opts?.router != null) {
            void opts.disconnect().then(() => opts.router?.replace('/'))
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' })
          console.error('Error logging out:', error)
          tokenStore.clearToken()
          set({
            token: null,
            session: null,
            isAuthenticated: false,
            email: null,
            isForceUpdateModalVisible: false,
            isUpdateAvailableModalVisible: false,
          })
          setUserProfile(null)
          resetProfile()
          useUserStore.getState().reset()
          useApiConfigStore.getState().resetToDefaultUrl()
          useDeveloperStore.getState().reset()
          useLogStore.getState().clearLogs()
          queryClient.clear()
          if (opts?.disconnect != null && opts?.router != null) {
            void opts.disconnect().then(() => opts.router?.replace('/'))
          }
        }
      },

      deleteUser: async () => {
        const setUserProfile = useProfileStore.getState().setUserProfile
        const resetProfile = useProfileStore.getState().resetProfile
        try {
          tokenStore.clearToken()
          set({
            token: null,
            session: null,
            isAuthenticated: false,
            email: null,
            isForceUpdateModalVisible: false,
            isUpdateAvailableModalVisible: false,
            error: null,
          })
          setUserProfile(null)
          resetProfile()
          useUserStore.getState().reset()
          useReferralsStore.getState().reset()
          useApiConfigStore.getState().resetToDefaultUrl()
          useDeveloperStore.getState().reset()
          useLogStore.getState().clearLogs()
          queryClient.clear()
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' })
          console.error('Error logging out:', error)
          tokenStore.clearToken()
          set({
            token: null,
            session: null,
            isAuthenticated: false,
            email: null,
            isForceUpdateModalVisible: false,
            isUpdateAvailableModalVisible: false,
          })
          setUserProfile(null)
          resetProfile()
          useUserStore.getState().reset()
          useReferralsStore.getState().reset()
          useApiConfigStore.getState().resetToDefaultUrl()
          useDeveloperStore.getState().reset()
          useLogStore.getState().clearLogs()
          queryClient.clear()
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        email: state.email,
        installAppDate: state.installAppDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          tokenStore.setToken(state.token)
        }
      },
    },
  ),
)
