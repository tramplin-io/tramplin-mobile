import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type RegistrationMethod = 'wallet' | 'email'

type UserState = {
  registeredWith: RegistrationMethod | null
  onboardingStartDate: Date | null

  // Actions
  setRegisteredWith: (provider: RegistrationMethod) => void
  clearRegisteredWith: () => void
  setOnboardingStartDate: (isNull: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      registeredWith: null,
      onboardingStartDate: null,

      setRegisteredWith: (provider: RegistrationMethod) => {
        set({ registeredWith: provider })
      },

      clearRegisteredWith: () => {
        set({ registeredWith: null })
      },

      setOnboardingStartDate: (isNull: boolean) => {
        set({ onboardingStartDate: isNull ? null : new Date() })
      },

      reset: () => {
        set({ registeredWith: null, onboardingStartDate: null })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        registeredWith: state.registeredWith,
        onboardingStartDate: state.onboardingStartDate,
      }),
    },
  ),
)
