import { View, Text, Pressable } from 'react-native'
import { useUniwind } from 'uniwind'
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
 * Uses Uniwind.setTheme() via the Zustand theme store.
 * Reads active theme from useUniwind() for highlight state.
 */
export function ThemeSwitcher() {
  const { setThemeMode } = useThemeStore()
  const { theme, hasAdaptiveThemes } = useUniwind()
  const activeMode: ThemeMode = hasAdaptiveThemes ? 'system' : (theme as ThemeMode)

  return (
    <View className="flex-row bg-muted rounded-lg p-1">
      {OPTIONS.map(({ mode, label, icon }) => {
        const isActive = activeMode === mode

        return (
          <Pressable
            key={mode}
            onPress={() => setThemeMode(mode)}
            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-md ${
              isActive ? 'bg-fill-tertiary shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-base mr-1.5 ${
                isActive ? 'text-brand-primary' : 'text-content-tertiary'
              }`}
            >
              {icon}
            </Text>
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-content-primary' : 'text-content-tertiary'
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
