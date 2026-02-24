import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      partialize: (state) => ({
        isRoutePathOverlayEnabled: state.isRoutePathOverlayEnabled,
      }),
    },
  ),
)
