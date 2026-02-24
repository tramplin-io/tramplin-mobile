import type { Session, WalletCredentials } from '@/lib/api/generated/restApi.schemas'
import { createSessionByUserWallet, deleteMySession, readMySession } from '@/lib/api/generated/restApi'

import { tokenStore } from '@/lib/api/token-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { useProfileStore } from './profile-store'

import { getExpoPushToken } from '../notifications/utils'

type AuthState = {
  token: string | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  email: string | null
  isForceUpdateModalVisible: boolean
  isUpdateAvailableModalVisible: boolean
  installAppDate: string | null

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
          set({ isLoading: true })

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
          console.error('Error logging in with wallet:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      fetchSession: async () => {
        try {
          set({ isLoading: true })

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
        } catch (error) {
          console.error('Error fetching session:', error)

          if (error?.toString().includes('401')) {
            get().logout()
          }

          return null
        } finally {
          set({ isLoading: false })
        }
      },

      verifySession: async (token: string): Promise<{ success: boolean; session: Session | null }> => {
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
            console.error('Error fetching session after token set:', sessionError)
            return { success: true, session: null }
          }
        }

        return { success: false, session: null }
      },

      logout: async (opts) => {
        const setUserProfile = useProfileStore.getState().setUserProfile
        const resetProfile = useProfileStore.getState().resetProfile
        const deleteDeviceToken = useProfileStore.getState().deleteDeviceToken
        const currentToken = await getExpoPushToken()
        try {
          try {
            await deleteMySession()
          } catch (apiError) {
            console.log('deleteMySession failed, continuing with logout', apiError)
          }

          try {
            if (currentToken) await deleteDeviceToken(currentToken)
          } catch (deleteError) {
            console.log('Device token removal failed, continuing with logout', deleteError)
          }

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

          if (opts?.disconnect != null && opts?.router != null) {
            void opts.disconnect().then(() => opts.router?.replace('/'))
          }
        } catch (error) {
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
          })
          setUserProfile(null)
          resetProfile()
        } catch (error) {
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
