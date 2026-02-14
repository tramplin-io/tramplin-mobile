import type { PropsWithChildren } from 'react'
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useColorScheme } from 'react-native'
import { useThemeStore } from '@/hooks/useThemeStore'

/**
 * Hook to access the current app theme based on device color scheme.
 *
 * Returns the appropriate React Navigation theme and metadata.
 * The color scheme respects the user's theme preference stored
 * in useThemeStore (applied via Appearance.setColorScheme).
 *
 * @example
 * const { isDark, theme } = useAppTheme()
 */
export function useAppTheme() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = isDark ? NavigationDarkTheme : NavigationLightTheme

  return {
    colorScheme,
    isDark,
    theme,
  }
}

/**
 * Theme provider component that wraps children with React Navigation's
 * ThemeProvider, automatically switching between light/dark based on
 * device color scheme.
 *
 * Also ensures the Zustand theme store is referenced so its hydration
 * side-effect (Appearance.setColorScheme) runs early.
 *
 * @example
 * <AppTheme>
 *   <Stack />
 * </AppTheme>
 */
export function AppTheme({ children }: Readonly<PropsWithChildren>) {
  const { theme } = useAppTheme()

  // Subscribe so Zustand hydrates and applies the persisted color scheme
  useThemeStore()

  return <ThemeProvider value={theme}>{children}</ThemeProvider>
}
