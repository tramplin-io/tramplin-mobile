import type { PropsWithChildren } from 'react'
import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { useUniwind } from 'uniwind'
import { useThemeStore } from '@/hooks/useThemeStore'

/**
 * Hook to access the current app theme based on Uniwind's active theme.
 *
 * ThemeProvider is mounted in app/_layout.tsx; theme state comes from
 * Uniwind.setTheme() via useThemeStore.
 *
 * @example
 * const { isDark, theme } = useAppTheme()
 */
export function useAppTheme() {
  const { theme } = useUniwind()
  const isDark = theme === 'dark'
  const navTheme = isDark ? DarkTheme : DefaultTheme

  return {
    colorScheme: theme as 'light' | 'dark',
    isDark,
    theme: navTheme,
  }
}

/**
 * Ensures theme store is subscribed so its hydration (Uniwind.setTheme)
 * runs early. ThemeProvider is in app/_layout.tsx.
 */
export function AppTheme({ children }: Readonly<PropsWithChildren>) {
  useThemeStore()
  return <>{children}</>
}
