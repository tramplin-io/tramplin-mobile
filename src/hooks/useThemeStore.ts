import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/utils/storage'
import type { ThemeMode } from '@/constants/theme'

interface ThemeStore {
  /** User-selected theme mode: 'light', 'dark', or 'system' */
  themeMode: ThemeMode
  /** Update the theme mode and apply it immediately */
  setThemeMode: (mode: ThemeMode) => void
}

/**
 * Apply the selected theme mode via the RN Appearance API.
 *
 * - 'light' / 'dark' → force that scheme
 * - 'system' → reset to device default (null)
 */
function applyTheme(mode: ThemeMode) {
  Appearance.setColorScheme(mode === 'system' ? null : mode)
}

/**
 * Zustand store for user theme preference.
 *
 * Persists the choice to AsyncStorage so it survives app restarts.
 * On hydration the saved preference is re-applied via `Appearance.setColorScheme()`.
 *
 * @example
 * const { themeMode, setThemeMode } = useThemeStore()
 * setThemeMode('dark')
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => {
        applyTheme(mode)
        set({ themeMode: mode })
      },
    }),
    {
      name: STORAGE_KEYS.THEME_MODE,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Re-apply the persisted preference once the store is hydrated
        if (state?.themeMode) {
          applyTheme(state.themeMode)
        }
      },
    },
  ),
)
