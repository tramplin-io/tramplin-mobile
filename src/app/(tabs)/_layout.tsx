import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import { useCSSVariable } from 'uniwind'

/**
 * Main app tab navigator.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Tab bar configuration:
 *    - 4 tabs: Home, Community, Notifications, Profile
 *    - Custom icons for each tab (use @expo/vector-icons or custom SVG)
 *    - Active/inactive colors from theme (primary / text-tertiary)
 *    - Hide tab bar on certain nested screens if needed
 *
 * 2. Tab bar styling:
 *    - Theme-aware background (bg-fill-secondary)
 *    - Border top line (border-border-tertiary)
 *    - Consider custom TabBar component for full control
 *
 * 3. Dependencies (install when implementing):
 *    - @expo/vector-icons (for tab icons)
 *    - OR custom SVG icons from src/components/icons/
 *
 * 4. Badge on Notifications tab:
 *    - Show unread count badge (from notification store)
 */
export default function TabsLayout() {
  const activeTint = useCSSVariable('--color-brand-primary')
  const inactiveTint = useCSSVariable('--color-content-tertiary')

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint == null ? undefined : String(activeTint),
        tabBarInactiveTintColor: inactiveTint == null ? undefined : String(inactiveTint),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔔</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  )
}
