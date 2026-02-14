// /**
//  * Theme constants. Color setup lives in tailwind.config.js (theme.extend.colors);
//  * values in global.css (:root / .dark). Use Tailwind classes when possible (text-foreground, bg-fill-primary).
//  *
//  * For style props, use useTheme().themeColors (from this file's themeColorsLight/themeColorsDark).
//  */

// /** Text styles from design system (fontSize / lineHeight in px). Use font-mono for Digits. */
// export const typography = {
//   small: { fontSize: 12, lineHeight: 14 },
//   smallBold: { fontSize: 14, lineHeight: 18 },
//   body: { fontSize: 16, lineHeight: 18 },
//   h4: { fontSize: 22, lineHeight: 24 },
//   h3: { fontSize: 32, lineHeight: 32 },
//   h2: { fontSize: 48, lineHeight: 48 },
//   h1: { fontSize: 80, lineHeight: 60 },
// } as const

// /** Theme color tokens for style props. Matches tailwind.config.js + global.css :root / .dark (oklch). */
// export interface ThemeColors {
//   fill: { primary: string; secondary: string; tertiary: string; fade: string; overlay: string }
//   content: { primary: string; secondary: string; tertiary: string; fade: string; overlay: string }
//   brand: { primary: string; secondary: string; tertiary: string; quaternary: string }
//   border: { primary: string; secondary: string; tertiary: string; quaternary: string }
//   reward: {
//     largePrimary: string
//     largePrimaryFade: string
//     largeSecondary: string
//     smallPrimary: string
//     smallPrimaryFade: string
//     smallSecondary: string
//   }
//   critical: { primary: string; secondary: string }
//   /* Legacy aliases */
//   background: string
//   foreground: string
//   primary: string
//   muted: string
//   mutedForeground: string
//   card: string
//   destructive: string
// }

// /** Light theme values (oklch). Kept in sync with global.css :root. */
// export const themeColorsLight: ThemeColors = {
//   fill: {
//     primary: 'oklch(0.925 0 0)',
//     secondary: 'oklch(0.95 0 0)',
//     tertiary: 'oklch(1 0 0)',
//     fade: 'oklch(0.925 0 0 / 0)',
//     overlay: 'oklch(0.18 0 0 / 0.5)',
//   },
//   content: {
//     primary: 'oklch(0 0 0)',
//     secondary: 'oklch(0.19 0 0)',
//     tertiary: 'oklch(0.58 0 0)',
//     fade: 'oklch(0 0 0 / 0)',
//     overlay: 'oklch(0.925 0 0 / 0.9)',
//   },
//   brand: {
//     primary: 'oklch(0.67 0.19 275)',
//     secondary: 'oklch(0.74 0.15 275)',
//     tertiary: 'oklch(0.81 0.12 275)',
//     quaternary: 'oklch(0.87 0.07 275)',
//   },
//   border: {
//     primary: 'oklch(0 0 0)',
//     secondary: 'oklch(0.36 0 0)',
//     tertiary: 'oklch(0.62 0 0)',
//     quaternary: 'oklch(1 0 0)',
//   },
//   reward: {
//     largePrimary: 'oklch(0.82 0.09 85)',
//     largePrimaryFade: 'oklch(0.82 0.09 85 / 0)',
//     largeSecondary: 'oklch(0.44 0.11 75)',
//     smallPrimary: 'oklch(0.83 0.006 240)',
//     smallPrimaryFade: 'oklch(0.83 0.006 240 / 0)',
//     smallSecondary: 'oklch(0.58 0.008 250)',
//   },
//   critical: {
//     primary: 'oklch(0.84 0.09 15)',
//     secondary: 'oklch(0.77 0.13 15)',
//   },
//   background: 'oklch(1 0 0)',
//   foreground: 'oklch(0 0 0)',
//   primary: 'oklch(0.67 0.19 275)',
//   muted: 'oklch(0.925 0 0)',
//   mutedForeground: 'oklch(0.58 0 0)',
//   card: 'oklch(0.95 0 0)',
//   destructive: 'oklch(0.84 0.09 15)',
// }

// /** Dark theme values (oklch). Kept in sync with global.css .dark. */
// export const themeColorsDark: ThemeColors = {
//   fill: {
//     primary: 'oklch(0.18 0 0)',
//     secondary: 'oklch(0.16 0 0)',
//     tertiary: 'oklch(0 0 0)',
//     fade: 'oklch(0.18 0 0 / 0)',
//     overlay: 'oklch(0.925 0 0 / 0.5)',
//   },
//   content: {
//     primary: 'oklch(1 0 0)',
//     secondary: 'oklch(0.94 0 0)',
//     tertiary: 'oklch(0.48 0 0)',
//     fade: 'oklch(1 0 0 / 0)',
//     overlay: 'oklch(0.18 0 0 / 0.9)',
//   },
//   brand: {
//     primary: 'oklch(0.74 0.15 275)',
//     secondary: 'oklch(0.67 0.19 275)',
//     tertiary: 'oklch(0.57 0.22 275)',
//     quaternary: 'oklch(0.44 0.26 265)',
//   },
//   border: {
//     primary: 'oklch(1 0 0)',
//     secondary: 'oklch(0.93 0 0)',
//     tertiary: 'oklch(0.45 0 0)',
//     quaternary: 'oklch(0 0 0)',
//   },
//   reward: {
//     largePrimary: 'oklch(0.44 0.11 75)',
//     largePrimaryFade: 'oklch(0.44 0.11 75 / 0)',
//     largeSecondary: 'oklch(0.82 0.09 85)',
//     smallPrimary: 'oklch(0.42 0.008 250)',
//     smallPrimaryFade: 'oklch(0.42 0.008 250 / 0)',
//     smallSecondary: 'oklch(0.20 0.008 250)',
//   },
//   critical: {
//     primary: 'oklch(0.77 0.13 15)',
//     secondary: 'oklch(0.84 0.09 15)',
//   },
//   background: 'oklch(0 0 0)',
//   foreground: 'oklch(1 0 0)',
//   primary: 'oklch(0.74 0.15 275)',
//   muted: 'oklch(0.18 0 0)',
//   mutedForeground: 'oklch(0.48 0 0)',
//   card: 'oklch(0.16 0 0)',
//   destructive: 'oklch(0.77 0.13 15)',
// }

// /** Color token names matching tailwind.config.js (for className: bg-*, text-*, etc.). */
// export const themeColorKeys = [
//   'fill-primary',
//   'fill-secondary',
//   'fill-tertiary',
//   'content-primary',
//   'content-secondary',
//   'content-tertiary',
//   'brand-primary',
//   'brand-secondary',
//   'border-primary',
//   'border-tertiary',
//   'reward-large-primary',
//   'reward-small-primary',
//   'critical-primary',
//   'background',
//   'foreground',
//   'primary',
//   'muted',
//   'muted-foreground',
//   'card',
//   'destructive',
// ] as const

// export const radius = {
//   xs: 'var(--radius-xs)',
//   sm: 'var(--radius-sm)',
//   md: 'var(--radius-md)',
//   lg: 'var(--radius-lg)',
//   xl: 'var(--radius-xl)',
//   '2xl': 'var(--radius-2xl)',
//   '3xl': 'var(--radius-3xl)',
//   '4xl': 'var(--radius-4xl)',
// } as const

// export const spacing = {
//   xs: 4,
//   sm: 8,
//   md: 16,
//   lg: 24,
//   xl: 32,
//   '2xl': 48,
// } as const

// export const borderRadius = {
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 24,
//   full: 9999,
// } as const

export type ThemeMode = 'light' | 'dark' | 'system'
