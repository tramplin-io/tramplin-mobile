import { useCallback, useEffect, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { Pressable, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useUniwind } from 'uniwind'

import { Text } from '@/components/ui/text'
import type { ThemeMode } from '@/constants/theme'
import { useThemeStore } from '@/hooks/useThemeStore'

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: 'System', icon: '⚙' },
  { mode: 'light', label: 'Light', icon: '☀' },
  { mode: 'dark', label: 'Dark', icon: '☾' },
]

const SPRING_CONFIG = { damping: 20, stiffness: 300 }

/**
 * Segmented theme switcher — System / Light / Dark.
 *
 * Uses Uniwind.setTheme() via the Zustand theme store.
 * Reads active theme from useUniwind() for highlight state.
 * Animated sliding pill on switch.
 */
export function ThemeSwitcher() {
  const { setThemeMode } = useThemeStore()
  const { theme, hasAdaptiveThemes } = useUniwind()
  const activeMode: ThemeMode = hasAdaptiveThemes ? 'system' : (theme as ThemeMode)

  const [containerWidth, setContainerWidth] = useState(0)
  const activeIndex = useSharedValue(OPTIONS.findIndex((o) => o.mode === activeMode))

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }, [])

  useEffect(() => {
    const index = OPTIONS.findIndex((o) => o.mode === activeMode)
    if (index >= 0) {
      activeIndex.value = withSpring(index, SPRING_CONFIG)
    }
  }, [activeMode, activeIndex])

  const padding = 4
  const innerWidth = Math.max(0, containerWidth - padding * 2)
  const segmentWidth = innerWidth > 0 ? innerWidth / OPTIONS.length : 0

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: padding + activeIndex.value * segmentWidth }],
  }))

  return (
    <View className="flex-row bg-muted rounded-lg p-1" onLayout={handleLayout}>
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            pillStyle,
            {
              position: 'absolute',
              left: 0,
              top: padding,
              bottom: padding,
              width: segmentWidth - padding,
              marginLeft: 0,
            },
          ]}
          className="bg-fill-tertiary rounded-md shadow-sm"
        />
      )}
      {OPTIONS.map(({ mode, label, icon }) => {
        const isActive = activeMode === mode

        return (
          <Pressable
            key={mode}
            onPress={() => setThemeMode(mode)}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-md z-1"
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
