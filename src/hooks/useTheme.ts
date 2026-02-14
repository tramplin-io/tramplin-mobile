// import { useCallback, useMemo } from 'react'
// import { useColorScheme } from 'react-native'
// import { themeColorsLight, themeColorsDark } from '@/constants/theme'

// /**
//  * Hook for theme-aware colors and color scheme.
//  * Color setup: tailwind.config.js; values: global.css (:root / .dark).
//  *
//  * Prefer Tailwind classes (text-foreground, bg-fill-primary). Use themeColors for style props when needed.
//  *
//  * @example
//  * const { isDark, themeColors } = useTheme()
//  * <View style={{ backgroundColor: themeColors.background }} />
//  */
// export function useTheme() {
//   const colorScheme = useColorScheme()
//   const isDark = colorScheme === 'dark'

//   const themeColors = useMemo(() => {
//     const t = isDark ? themeColorsDark : themeColorsLight
//     const flat = {
//       textPrimary: t.content.primary,
//       textSecondary: t.content.secondary,
//       textTertiary: t.content.tertiary,
//       textInverse: t.fill.tertiary,
//       surface: t.fill.secondary,
//       surfaceElevated: t.fill.tertiary,
//       surfaceMuted: t.fill.primary,
//       border: t.border.tertiary,
//       borderLight: t.border.quaternary,
//       borderFocus: t.brand.primary,
//     }
//     return { ...t, ...flat }
//   }, [isDark])

//   const getStatusBarStyle = useCallback(() => {
//     return isDark ? 'light' : 'dark'
//   }, [isDark])

//   return {
//     colorScheme: colorScheme ?? 'light',
//     isDark,
//     themeColors,
//     getStatusBarStyle,
//   } as const
// }
