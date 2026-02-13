import { useCallback, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { colors, type ThemeMode } from '@/constants/theme'

/**
 * Hook to access theme colors and current color scheme.
 *
 * Uses the device's color scheme (light/dark) to provide
 * the appropriate set of semantic color tokens.
 *
 * @example
 * const { isDark, themeColors } = useTheme()
 * <View style={{ backgroundColor: themeColors.background }}>
 */
export function useTheme() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const themeColors = useMemo(
    () => ({
      // Surfaces
      background: isDark ? colors.dark.background : colors.light.background,
      surface: isDark ? colors.dark.surface : colors.light.surface,
      surfaceElevated: isDark ? colors.dark.surfaceElevated : colors.light.surfaceElevated,
      surfaceMuted: isDark ? colors.dark.surfaceMuted : colors.light.surfaceMuted,

      // Text
      textPrimary: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
      textSecondary: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
      textTertiary: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
      textInverse: isDark ? colors.dark.textInverse : colors.light.textInverse,

      // Borders
      border: isDark ? colors.dark.border : colors.light.border,
      borderLight: isDark ? colors.dark.borderLight : colors.light.borderLight,
      borderFocus: isDark ? colors.dark.borderFocus : colors.light.borderFocus,

      // Brand (same in both themes)
      primary: colors.primary,
      primaryLight: colors.primaryLight,
      primaryDark: colors.primaryDark,
      secondary: colors.secondary,
      accent: colors.accent,

      // Status (same in both themes)
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info,
    }),
    [isDark],
  )

  const getStatusBarStyle = useCallback(() => {
    return isDark ? 'light' : 'dark'
  }, [isDark])

  return {
    /** Current color scheme from device */
    colorScheme: colorScheme ?? 'light',
    /** Whether the device is in dark mode */
    isDark,
    /** Theme-aware color tokens for use in style props */
    themeColors,
    /** Raw color palette */
    colors,
    /** Get appropriate status bar style */
    getStatusBarStyle,
  } as const
}
