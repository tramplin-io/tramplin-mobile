// navigation/BottomTabs.tsx
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  FaqFillIcon,
  FaqIcon,
  HomeFillIcon,
  HomeIcon,
  RewardsFillIcon,
  RewardsIcon,
  SettingsFillIcon,
  SettingsIcon,
  StatsFillIcon,
  StatsIcon,
} from '@/components/icons/NavMenu'

type IconCmp = React.ComponentType<{ width?: number; height?: number; color?: string }>

// Ключі = реальні route.name (як у файлах app/tabs/*.tsx)
const ICONS: Record<string, { outline: IconCmp; fill: IconCmp; label: string }> = {
  index: { outline: HomeIcon, fill: HomeFillIcon, label: 'Home' },
  leaderboard: { outline: StatsIcon, fill: StatsFillIcon, label: 'Stats' },
  rewards: { outline: RewardsIcon, fill: RewardsFillIcon, label: 'Rewards' },
  faq: { outline: FaqIcon, fill: FaqFillIcon, label: 'FAQ' },
  settings: { outline: SettingsIcon, fill: SettingsFillIcon, label: 'Settings' },
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View className="absolute left-0 right-0 bottom-0 px-3 " style={{ paddingBottom: insets.bottom + 8 }}>
      <View
        className="h-[62px] flex-row items-center rounded-full bg-fill-secondary border border-border-quaternary px-1.5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index

          // Захист: якщо для route немає іконок — не падати, а просто пропустити
          const icons = ICONS[route.name]
          if (!icons) {
            if (__DEV__) {
              console.warn(`[CustomTabBar] No icon mapping for route "${route.name}"`)
            }
            return null
          }

          const Icon = isFocused ? icons.fill : icons.outline
          const label = (options.tabBarLabel as string) ?? options.title ?? icons.label

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              className="flex-1 h-[54px] items-center justify-center"
            >
              <View
                className={[
                  'w-[80px] h-[54px] items-center justify-center rounded-[27px] gap-1',
                  isFocused ? ' bg-fill-tertiary' : 'bg-transparent',
                ].join(' ')}
                // style={
                //   isFocused
                //     ? {
                //         shadowColor: '#000',
                //         shadowOpacity: 0.08,
                //         shadowRadius: 8,
                //         shadowOffset: { width: 0, height: 2 },
                //         elevation: 6,
                //       }
                //     : undefined
                // }
              >
                <Icon width={24} height={24} color="#111" />
                <Text numberOfLines={1} className={`text-content-primary text-small-nav font-family-regular-medium'}`}>
                  {label}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
