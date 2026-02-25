import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type DeveloperState = {
  isRoutePathOverlayEnabled: boolean
  setIsRoutePathOverlayEnabled: (enabled: boolean) => void
}

export const useDeveloperStore = create<DeveloperState>()(
  persist(
    (set) => ({
      isRoutePathOverlayEnabled: false,
      setIsRoutePathOverlayEnabled: (enabled: boolean) => set({ isRoutePathOverlayEnabled: enabled }),
    }),
    {
      name: 'developer-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isRoutePathOverlayEnabled: state.isRoutePathOverlayEnabled,
      }),
    },
  ),
)
