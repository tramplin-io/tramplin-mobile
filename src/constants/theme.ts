/**
 * Theme constants for programmatic access.
 * These mirror the CSS custom properties defined in global.css.
 *
 * Usage:
 *   import { colors, spacing } from '@/constants/theme'
 *   style={{ backgroundColor: colors.light.background }}
 */

export const colors = {
  // Brand
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  secondary: '#14b8a6',
  secondaryLight: '#2dd4bf',
  secondaryDark: '#0d9488',

  accent: '#f59e0b',
  accentLight: '#fbbf24',
  accentDark: '#d97706',

  // Status
  success: '#22c55e',
  successLight: '#4ade80',
  successDark: '#16a34a',

  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#d97706',

  error: '#ef4444',
  errorLight: '#f87171',
  errorDark: '#dc2626',

  info: '#3b82f6',
  infoLight: '#60a5fa',
  infoDark: '#2563eb',

  // Theme-specific surfaces
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    surfaceMuted: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderFocus: '#6366f1',
  },

  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    surfaceMuted: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    textInverse: '#0f172a',
    border: '#334155',
    borderLight: '#1e293b',
    borderFocus: '#818cf8',
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export type ThemeMode = 'light' | 'dark' | 'system'
