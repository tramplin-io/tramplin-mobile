import AsyncStorage from '@react-native-async-storage/async-storage'
import { Uniwind } from 'uniwind'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ThemeMode } from '@/constants/theme'

interface ThemeStore {
  /** User-selected theme mode: 'light', 'dark', or 'system' */
  themeMode: ThemeMode
  /** Update the theme mode and apply it immediately */
  setThemeMode: (mode: ThemeMode) => void
}

/**
 * Zustand store for user theme preference.
 *
 * Persists the choice to AsyncStorage so it survives app restarts.
 * On hydration the saved preference is re-applied via `Uniwind.setTheme()`.
 *
 * @example
 * const { themeMode, setThemeMode } = useThemeStore()
 * setThemeMode('dark')
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: 'light',
      setThemeMode: (mode) => {
        Uniwind.setTheme(mode)
        set({ themeMode: mode })
      },
    }),
    {
      name: '@tramplin_theme_mode',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.themeMode) {
          Uniwind.setTheme(state.themeMode)
        }
      },
    },
  ),
)
