import { useCallback, useEffect, useState } from 'react'
import { Pressable, View, type PressableProps } from 'react-native'
import { router, Tabs, useLocalSearchParams, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import { PlusIcon } from '@/components/icons/icons'
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
// import { CustomTabBar } from '@/components/navigation/BottomTabs'
// import { LogoSmall } from '@/components/icons/Logo'
import { StakeModal } from '@/components/stake'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { WelcomeModal } from '@/components/welcome'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'

function StakeTabIcon({ focused }: { readonly focused: boolean }) {
  return focused ? <HomeFillIcon width={24} height={24} /> : <HomeIcon width={24} height={24} />
}

function LeaderTabIcon({ focused }: { readonly focused: boolean }) {
  return focused ? <StatsFillIcon width={24} height={24} /> : <StatsIcon width={24} height={24} />
}

function RewardsTabIcon({ focused }: { readonly focused: boolean }) {
  return focused ? <RewardsFillIcon width={24} height={24} /> : <RewardsIcon width={24} height={24} />
}

function FAQTabIcon({ focused }: { readonly focused: boolean }) {
  return focused ? <FaqFillIcon width={24} height={24} /> : <FaqIcon width={24} height={24} />
}

function SettingsTabIcon({ focused }: { readonly focused: boolean }) {
  return focused ? <SettingsFillIcon width={24} height={24} /> : <SettingsIcon width={24} height={24} />
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

let stakeParamHandled = false

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  // const params = useLocalSearchParams()
  const activeTint = useCSSVariable('--color-content-primary') as string
  const inactiveTint = useCSSVariable('--color-content-primary') as string
  const backgroundColor = useCSSVariable('--color-fill-secondary') as string
  // const borderColor = useCSSVariable('--color-fill-tertiary') as string
  const [stakeModalOpen, setStakeModalOpen] = useState(false)
  const handleOpenStake = useCallback(() => setStakeModalOpen(true), [])
  const isStakeHide = pathname === '/tabs/settings' || pathname.startsWith('/tabs/settings/')

  const welcomeShownAt = useAuthStore((s) => s.welcomeShownAt)
  const setWelcomeShownAt = useAuthStore((s) => s.setWelcomeShownAt)
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false)
  const handleWelcomeModalChange = useCallback((open: boolean) => {
    setWelcomeModalOpen(open)
  }, [])
  const handleWelcomeStakePress = useCallback(() => {
    setStakeModalOpen(true)
  }, [])

  const { modalType, stakeAmount: stakeAmountParam = '' } = useLocalSearchParams<{
    modalType?: string
    stakeAmount?: string
  }>()
  const [capturedStakeAmount, setCapturedStakeAmount] = useState('')

  const handleStakeModalChange = useCallback((open: boolean) => {
    setStakeModalOpen(open)
    if (!open) {
      router.setParams({ modalType: undefined, stakeAmount: undefined })
      setCapturedStakeAmount('')
      stakeParamHandled = false
    }
  }, [])

  useEffect(() => {
    if (modalType === 'staking' && !stakeParamHandled) {
      stakeParamHandled = true
      setCapturedStakeAmount(stakeAmountParam)
      setStakeModalOpen(true)
      router.setParams({ modalType: undefined, stakeAmount: undefined })
    }
  }, [modalType, stakeAmountParam])

  useEffect(() => {
    if (isStakeHide) setStakeModalOpen(false)
  }, [isStakeHide])

  useEffect(() => {
    if (!welcomeShownAt) {
      setWelcomeShownAt()
      setWelcomeModalOpen(true)
    }
  }, [welcomeShownAt, setWelcomeShownAt])

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
        // tabBar={(props) => <CustomTabBar {...props} />}
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
            bottom: 76 + insets.bottom,
            left: 0,
            right: 0,
          }}
        >
          {/* <Button
            variant="default"
            size="xl"
            onPress={() => setWelcomeModalOpen(true)}
            className="w-full border-brand-primary"
          >
            <Text variant="body">Open</Text>
          </Button> */}
          <Button variant="default" size="xl" onPress={handleOpenStake} className="w-full border-brand-primary">
            <PlusIcon size={20} className="drop-shadow-md" />
            <Text variant="body">Stake SOL</Text>
          </Button>
        </View>
      )}

      <StakeModal open={stakeModalOpen} onOpenChange={handleStakeModalChange} stakeAmount={capturedStakeAmount} />

      <WelcomeModal
        open={welcomeModalOpen}
        onOpenChange={handleWelcomeModalChange}
        onStakePress={handleWelcomeStakePress}
      />
    </View>
  )
}
