import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { resetBaseURL, setBaseURL } from '../api/mutator/custom-instance'

type ApiConfigState = {
  apiUrl: string | undefined
  setApiUrl: (url: string) => void
  resetToDefaultUrl: () => void
}

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      apiUrl: process.env.EXPO_PUBLIC_API_URL,

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
      partialize: state => ({
        apiUrl: state.apiUrl,
      }),
      onRehydrateStorage: () => state => {
        if (state?.apiUrl) {
          setBaseURL(state.apiUrl)
        }
      },
    },
  ),
)
