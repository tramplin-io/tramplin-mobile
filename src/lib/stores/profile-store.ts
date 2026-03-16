import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  createMyDeviceToken,
  deleteMyDeviceToken,
  readMyProfile,
  readProfile,
  updateMyProfile,
} from '@/lib/api/generated/restApi'
import type { Profile, ReadProfileParams, UpdateMyProfileInput } from '@/lib/api/generated/restApi.schemas'

import { useAuthStore } from './auth-store'

// Profile state: API-backed fields (Profile, UpdateMyProfileInput) + app-local state
type ProfileState = {
  // API-backed (Profile)
  utcOffset: number
  isEmailNotificationsOn: boolean
  isPushNotificationsOn: boolean

  // App-local
  initialDeviceToken: string | null
  storeReviewDate: string | null

  // API: full profile
  userProfile: Profile | null
  isLoading: boolean

  // Actions - reset (used on logout)
  resetProfile: () => void

  // Actions - API-backed preferences
  setUtcOffset: (value: number) => void
  setIsEmailNotificationsOn: (value: boolean) => void
  setIsPushNotificationsOn: (value: boolean) => void
  setInitialDeviceToken: (value: string) => void

  // Actions - profile API
  setUserProfile: (userProfile: Profile | null) => void
  fetchUserProfile: () => Promise<Profile | null>
  fetchUserProfileById: (userId: string) => Promise<Profile | null>
  updateUserProfile: (profileData: UpdateMyProfileInput) => Promise<boolean>
  createDeviceToken: (deviceToken: string) => Promise<boolean>
  deleteDeviceToken: (deviceToken: string) => Promise<boolean>

  // Actions - app-local
  setStoreReviewDate: (date: string | null) => void
  resetStoreReviewDate: () => void
}

// Persisted state: API-backed (Profile) + app-local only
const initialState = {
  utcOffset: 0,
  isEmailNotificationsOn: true,
  isPushNotificationsOn: false,
  initialDeviceToken: null,
  storeReviewDate: null,
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,
      userProfile: null,
      isLoading: false,

      resetProfile: () => set(initialState),

      // Actions - API-backed preferences
      setUtcOffset: (utcOffset: number) => set({ utcOffset }),
      setIsEmailNotificationsOn: (isEmailNotificationsOn: boolean) => set({ isEmailNotificationsOn }),
      setIsPushNotificationsOn: (isPushNotificationsOn: boolean) => set({ isPushNotificationsOn }),
      setInitialDeviceToken: (deviceToken: string) => set({ initialDeviceToken: deviceToken }),

      // Actions - Store review
      setStoreReviewDate: (date: string | null) => set({ storeReviewDate: date }),
      resetStoreReviewDate: () => set({ storeReviewDate: null }),

      // User profile

      fetchUserProfile: async () => {
        try {
          set({ isLoading: true })

          const token = useAuthStore.getState().token
          if (!token) {
            return null
          }

          // Fetch user profile
          const userProfile = await readMyProfile()
          set({ userProfile })
          return userProfile
        } catch (error) {
          console.error('Error fetching user profile:', error)
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      fetchUserProfileById: async (userId: string) => {
        try {
          set({ isLoading: true })

          // Check if token exists
          const token = useAuthStore.getState().token
          if (!token) {
            return null
          }

          // Fetch user profile by ID
          const params: ReadProfileParams = { id: userId }
          const userProfile = await readProfile(params)
          return userProfile
        } catch (error) {
          console.error('Error fetching user profile by ID:', error)
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      updateUserProfile: async (profileData: UpdateMyProfileInput) => {
        try {
          set({ isLoading: true })
          const payload: UpdateMyProfileInput = {
            ...profileData,
          }
          const userProfile = await updateMyProfile(payload)
          set({
            userProfile,
            ...(typeof userProfile?.isPushNotificationsOn === 'boolean' && {
              isPushNotificationsOn: userProfile.isPushNotificationsOn,
            }),
            ...(typeof userProfile?.isEmailNotificationsOn === 'boolean' && {
              isEmailNotificationsOn: userProfile.isEmailNotificationsOn,
            }),
          })

          return true
        } catch (error) {
          console.error('Error updating user profile:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      createDeviceToken: async (deviceToken: string): Promise<boolean> => {
        try {
          set({ isLoading: true })

          const tokenExists = get().userProfile?.deviceTokens?.some((token) => token.token === deviceToken)
          if (tokenExists) {
            return true
          }

          const result = await createMyDeviceToken({ deviceToken })
          set({ userProfile: result, initialDeviceToken: deviceToken })
          return true
        } catch (error) {
          console.error('Error creating device token:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      deleteDeviceToken: async (deviceToken: string): Promise<boolean> => {
        try {
          set({ isLoading: true })

          await deleteMyDeviceToken({ token: deviceToken })

          const currentProfile = get().userProfile
          if (currentProfile?.deviceTokens) {
            const updatedDeviceTokens = currentProfile.deviceTokens.filter((token) => token.token !== deviceToken)
            set({
              userProfile: {
                ...currentProfile,
                deviceTokens: updatedDeviceTokens,
              },
            })
          }

          return true
        } catch (error) {
          console.error('Error deleting device token:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      setUserProfile: (userProfile: Profile | null) => {
        set({ userProfile })
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
