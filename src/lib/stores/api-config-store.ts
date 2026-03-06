import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { resetBaseURL, setBaseURL } from '../api/mutator/custom-instance'
import { resetReferralsBaseURL, setReferralsBaseURL } from '../api/mutator/referrals-instance'

type ApiConfigState = {
  apiUrl: string | undefined
  referralsApiUrl: string | undefined
  setApiUrl: (url: string) => void
  resetToDefaultUrl: () => void
}

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      referralsApiUrl: process.env.EXPO_PUBLIC_REFERRALS_API_URL,

      setReferralsApiUrl: (url: string) => {
        set({ referralsApiUrl: url })
        setReferralsBaseURL(url)
      },

      resetToDefaultReferralsUrl: () => {
        set({ referralsApiUrl: process.env.EXPO_PUBLIC_REFERRALS_API_URL })
        resetReferralsBaseURL()
      },

      setApiUrl: (url: string) => {
        set({ apiUrl: url })
        setBaseURL(url)
      },

      resetToDefaultUrl: () => {
        set({ apiUrl: process.env.EXPO_PUBLIC_API_URL })
        resetBaseURL()
      },
    }),
    {
      name: 'api-config-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        referralsApiUrl: state.referralsApiUrl,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.apiUrl) {
          setBaseURL(state.apiUrl)
        }
        if (state?.referralsApiUrl) {
          setReferralsBaseURL(state.referralsApiUrl)
        }
      },
    },
  ),
)
