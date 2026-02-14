import { View, Text, Pressable } from 'react-native'
import { useThemeStore } from '@/hooks/useThemeStore'
import type { ThemeMode } from '@/constants/theme'

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: 'System', icon: '⚙' },
  { mode: 'light', label: 'Light', icon: '☀' },
  { mode: 'dark', label: 'Dark', icon: '☾' },
]

/**
 * Segmented theme switcher — System / Light / Dark.
 *
 * Reads and writes to the Zustand theme store which
 * persists the preference and applies it via `Appearance.setColorScheme()`.
 *
 * @example
 * <ThemeSwitcher />
 */
export function ThemeSwitcher() {
  const { themeMode, setThemeMode } = useThemeStore()

  return (
    <View className="flex-row bg-surface-muted dark:bg-dark-surface-muted rounded-lg p-1">
      {OPTIONS.map(({ mode, label, icon }) => {
        const isActive = themeMode === mode

        return (
          <Pressable
            key={mode}
            onPress={() => setThemeMode(mode)}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-md ${
              isActive ? 'bg-surface-elevated dark:bg-dark-surface-elevated shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-base mr-1.5 ${
                isActive ? 'text-primary' : 'text-text-tertiary dark:text-dark-text-tertiary'
              }`}
            >
              {icon}
            </Text>
            <Text
              className={`text-sm font-medium ${
                isActive
                  ? 'text-text-primary dark:text-dark-text-primary'
                  : 'text-text-tertiary dark:text-dark-text-tertiary'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
