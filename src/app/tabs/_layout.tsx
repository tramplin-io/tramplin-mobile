import { LinearGradient } from 'expo-linear-gradient'
import { Tabs } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Pressable, type PressableProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCSSVariable } from 'uniwind'

import { BigCupIcon, QuestionIcon } from '@/components/icons/icons'
import { LogoSmall } from '@/components/icons/Logo'
import { cn } from '@/lib/utils'

function LeaderTabIcon({ color }: { readonly color: string }) {
  return <BigCupIcon size={24} color={color} />
}

function StakeTabIcon({ color }: { readonly color: string }) {
  return <LogoSmall width={24} height={24} color={color} />
}

function QuestionsTabIcon({ color }: { readonly color: string }) {
  return <QuestionIcon size={24} color={color} />
}

const TAB_BUTTON_WIDTH = 65
const TAB_BUTTON_HEIGHT = 55
const TAB_BUTTON_PADDING = 4
const TAB_BUTTON_RADIUS = 8
const TAB_BAR_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 30,
  elevation: 4,
}

type TabBarButtonProps = PressableProps & {
  focused?: boolean
  children: React.ReactNode
}

function TabBarButton({ focused, children, style, ...rest }: TabBarButtonProps) {
  // const fillTertiary = useCSSVariable('--color-fill-tertiary')
  // const fillSecondary = useCSSVariable('--color-fill-secondary')

  return (
    <Pressable
      {...rest}
      className={cn(
        'w-14 h-14 p-1 flex-col justify-between items-center rounded-lg bg-fill-tertiary shadow-xl/20',
        focused ? 'bg-fill-tertiary' : 'bg-fill-secondary',
      )}
      // style={[
      //   {
      //     width: TAB_BUTTON_WIDTH,
      //     height: TAB_BUTTON_HEIGHT,
      //     padding: TAB_BUTTON_PADDING,
      //     flexDirection: 'column',
      //     justifyContent: 'space-between',
      //     alignItems: 'center',
      //     borderRadius: TAB_BUTTON_RADIUS,
      //     backgroundColor: (focused ? fillTertiary : fillSecondary) as string,
      //     ...TAB_BAR_SHADOW,
      //   },
      //   style as object,
      // ]}
    >
      {children}
    </Pressable>
  )
}

/** Wrapper for tab bar button that derives focused from accessibilityState (passed by React Navigation). */
function TabBarButtonWrapper(
  props: React.ComponentProps<React.ElementType> & {
    children?: React.ReactNode
    accessibilityState?: { selected?: boolean }
  },
) {
  const focused = props['aria-selected'] ?? false

  return (
    <TabBarButton focused={focused} {...props}>
      {props.children}
    </TabBarButton>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const activeTint = useCSSVariable('--color-brand-primary')
  const inactiveTint = useCSSVariable('--color-content-tertiary')
  const backgroundColor = useCSSVariable('--color-fill-primary')

  return (
    <View className="flex-1">
      {/* Blur and Gradient Shadow View */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 59 + insets.bottom,
          height: 80,
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
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
            backgroundColor: backgroundColor as string,
            // borderTopWidth: 1,
            // borderTopColor: borderTopColor,
            marginRight: 0,
            marginLeft: 0,
            paddingRight: 30,
            paddingLeft: 30,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            letterSpacing: 0,
            marginBottom: 6,
            textTransform: 'uppercase',
          },
          tabBarActiveTintColor: activeTint == null ? undefined : String(activeTint),
          tabBarInactiveTintColor: inactiveTint == null ? undefined : String(inactiveTint),
          tabBarButton: TabBarButtonWrapper,
        }}
      >
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Leader',
            tabBarIcon: LeaderTabIcon,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Stake',
            tabBarIcon: StakeTabIcon,
          }}
        />
        <Tabs.Screen
          name="questions"
          options={{
            title: 'Q&A',
            tabBarIcon: QuestionsTabIcon,
          }}
        />
      </Tabs>
    </View>
  )
}
