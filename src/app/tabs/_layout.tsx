import { useCallback, useEffect, useState } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { Tabs, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import {
  // BigCupIcon,
  // BundleIcon,
  // FilterIcon,
  HomeFillIcon,
  HomeIcon,
  InsertChartFillIcon,
  InsertChartIcon,
  MessageQuestionFillIcon,
  MessageQuestionIcon,
  PlusIcon,
  // SearchIcon,
  SettingsFillIcon,
  SettingsIcon,
  WheelchairPickupFillIcon,
  WheelchairPickupIcon,
} from '@/components/icons/icons'
// import { LogoSmall } from '@/components/icons/Logo'
import { StakeModal } from '@/components/stake'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

function StakeTabIcon({ color, focused }: { readonly color: string; readonly focused: boolean }) {
  const primaryColor = useCSSVariable('--color-content-primary') as string | undefined
  return focused ? (
    <HomeFillIcon width={24} height={24} color={primaryColor} />
  ) : (
    <HomeIcon width={24} height={24} color={primaryColor} />
  )
}

function LeaderTabIcon({ color, focused }: { readonly color: string; readonly focused: boolean }) {
  const primaryColor = useCSSVariable('--color-content-primary') as string | undefined
  return focused ? (
    <InsertChartFillIcon width={24} height={24} color={primaryColor} />
  ) : (
    <InsertChartIcon width={24} height={24} color={primaryColor} />
  )
}

function RewardsTabIcon({ color, focused }: { readonly color: string; readonly focused: boolean }) {
  const primaryColor = useCSSVariable('--color-content-primary') as string | undefined
  return focused ? (
    <WheelchairPickupFillIcon width={24} height={24} color={primaryColor} />
  ) : (
    <WheelchairPickupIcon width={24} height={24} color={primaryColor} />
  )
}

function FAQTabIcon({ color, focused }: { readonly color: string; readonly focused: boolean }) {
  const primaryColor = useCSSVariable('--color-content-primary') as string | undefined
  return focused ? (
    <MessageQuestionFillIcon width={24} height={24} color={primaryColor} />
  ) : (
    <MessageQuestionIcon width={24} height={24} color={primaryColor} />
  )
}

function SettingsTabIcon({ color, focused }: { readonly color: string; readonly focused: boolean }) {
  const primaryColor = useCSSVariable('--color-content-primary') as string | undefined
  return focused ? (
    <SettingsFillIcon width={24} height={24} color={primaryColor} />
  ) : (
    <SettingsIcon width={24} height={24} color={primaryColor} />
  )
}

type TabBarButtonProps = PressableProps & {
  focused?: boolean
  title?: string
  children: React.ReactNode
}

function TabBarButton({ focused, children, accessibilityLargeContentTitle, style, ...rest }: TabBarButtonProps) {
  return (
    <Pressable
      {...rest}
      className={cn(
        'w-[76px]  h-16 p-1 flex-col justify-center items-center gap-1 py-1.5', //rounded-lg
        // focused ? 'bg-brand-quaternary' : 'bg-fill-secondary',
      )}
    >
      <View
        className={cn(
          'w-14 h-8 p-1 flex-col justify-center items-center ',
          focused && 'bg-brand-quaternary rounded-full', //: 'bg-fill-secondary',
        )}
      >
        {children}
      </View>
      <Text className="text-content-primary text-small-nav font-family-bold-medium">
        {accessibilityLargeContentTitle}
      </Text>
    </Pressable>
  )
}

/** Wrapper for tab bar button that derives focused from accessibilityState (passed by React Navigation). */
function TabBarButtonWrapper({
  children,
  style,
  ...props
}: React.ComponentProps<React.ElementType> & {
  children?: React.ReactNode
  accessibilityState?: { selected?: boolean }
}) {
  const focused = props['aria-selected'] ?? false

  return (
    <View style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
      <TabBarButton focused={focused} {...props}>
        {children}
      </TabBarButton>
    </View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const activeTint = useCSSVariable('--color-brand-primary')
  const inactiveTint = useCSSVariable('--color-content-tertiary')
  const backgroundColor = useCSSVariable('--color-fill-tertiary')
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const handleOpenStake = useCallback(() => setStakeModalOpen(true), [])
  const isStakeHide = pathname === '/tabs/settings' || pathname.startsWith('/tabs/settings/')

  useEffect(() => {
    if (isStakeHide) setStakeModalOpen(false)
  }, [isStakeHide])

  return (
    <View className="flex-1">
      {/* Blur and Gradient Shadow View */}
      {/* <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 59 + insets.bottom,
          height: 64,
          zIndex: 1,
          pointerEvents: 'none',
          // opacity: 0.2,
        }}
      >
        <LinearGradient
          colors={['transparent', backgroundColor as string]}
          locations={[0, 0.7]}
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
        />
      </View> */}

      <Tabs
        screenOptions={{
          headerShown: false,
          lazy: true,
          tabBarStyle: {
            paddingBottom: insets.bottom,
            height: 64 + insets.bottom,
            backgroundColor: backgroundColor as string,
            // borderTopWidth: 1,
            // borderTopColor: borderTopColor,
            marginRight: 0,
            marginLeft: 0,
            paddingRight: 8,
            paddingLeft: 8,
          },
          tabBarLabelStyle: {
            display: 'none', // hide label text
            // fontSize: 12,
            // letterSpacing: 0.5,
            // marginBottom: 2,
            // textTransform: 'uppercase',
          },
          tabBarActiveTintColor: activeTint == null ? undefined : String(activeTint),
          tabBarInactiveTintColor: inactiveTint == null ? undefined : String(inactiveTint),
          tabBarButton: TabBarButtonWrapper,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: StakeTabIcon,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Stats',
            tabBarIcon: LeaderTabIcon,
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Rewards',
            tabBarIcon: RewardsTabIcon,
          }}
        />
        <Tabs.Screen
          name="faq"
          options={{
            title: 'FAQ',
            tabBarIcon: FAQTabIcon,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: SettingsTabIcon,
          }}
        />
      </Tabs>

      {!isStakeHide && (
        <View
          className="items-center justify-center px-4 gap-5 z-50"
          style={{
            position: 'absolute',
            bottom: 90 + insets.bottom,
            left: 0,
            right: 0,
          }}
        >
          <Button variant="default" size="xl" onPress={handleOpenStake} className="w-full border-brand-primary">
            <PlusIcon size={20} className="drop-shadow-md" />
            <Text variant="body">Stake SOL</Text>
          </Button>
        </View>
      )}

      <StakeModal open={stakeModalOpen} onOpenChange={setStakeModalOpen} />
    </View>
  )
}
