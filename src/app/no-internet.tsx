import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * No Internet Connection Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Centered content:
 *      - Offline icon / illustration (wifi-off)
 *      - "No Internet Connection" title
 *      - "Check your connection and try again" subtitle
 *      - "Try Again" button
 *
 * 2. Components needed:
 *    - EmptyState (new: @/components/ui/EmptyState)
 *    - Button (existing)
 *
 * 3. Behavior:
 *    - "Try Again" → check network status (useNetworkStatus hook)
 *    - If online → router.back() or router.replace previous route
 *    - Auto-detect reconnection → navigate away automatically
 *
 * 4. Navigation:
 *    - Shown when useNetworkStatus detects offline
 *    - Standalone screen (not inside tabs or screens group)
 *    - AuthGuard should redirect here when offline during critical operations
 */
export default function NoInternetScreen() {
  return (
    <Container safe centered>
      <View className="items-center px-8">
        <Text className="text-5xl mb-4">📡</Text>
        <Text className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
          No Internet Connection
        </Text>
        <Text className="text-base text-text-secondary dark:text-dark-text-secondary text-center mb-8">
          Check your connection and try again
        </Text>
        {/* TODO: Add "Try Again" button with network check */}
      </View>
    </Container>
  )
}
