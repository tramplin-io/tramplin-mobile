import { View } from 'react-native'
import { useNetworkStatus } from '@/lib/network'
import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { ScreenWrapper } from '@/components/general'
import { Text } from '@/components/ui/text'

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
  const { isLoading, recheck } = useNetworkStatus()

  useEffect(() => {
    recheck()
  }, [recheck])

  return (
    <ScreenWrapper className="flex-1 px-4">
      <View className="flex-1 items-center ">
        <View className="mb-10 mt-36">📡</View>
        <Text variant="h2" className="text-center mb-4" accessibilityRole="header">
          No Internet Connection
        </Text>
        <Text variant="body" className="text-center text-textSecondary mb-8">
          Please check your network settings and try again.
        </Text>
        <Button
          className="py-4 w-full"
          onPress={recheck}
          disabled={isLoading}
          accessibilityLabel="Try Again"
          accessibilityRole="button"
        >
          <Text>{isLoading ? 'Checking...' : 'Try Again'}</Text>
        </Button>
      </View>
    </ScreenWrapper>
    // <Container safe centered>
    //   <View className="items-center px-8">
    //     <Text className="text-5xl mb-4">📡</Text>
    //     <Text className="text-2xl font-bold text-content-primary mb-2">No Internet Connection</Text>
    //     <Text className="text-base text-content-secondary text-center mb-8">Please check your network settings and try again.</Text>
    //     {/* TODO: Add "Try Again" button with network check */}
    //     <Button
    //       className="py-4 w-full"
    //       onPress={recheck}
    //       disabled={isLoading}
    //       accessibilityLabel="Try Again"
    //       accessibilityRole="button"
    //     >
    //       <Text>{isLoading ? 'Checking...' : 'Try Again'}</Text>
    //     </Button>
    //   </View>
    // </Container>
  )
}
