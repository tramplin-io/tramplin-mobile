import '../global.css'

import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { PortalHost } from '@rn-primitives/portal'
import * as Sentry from '@sentry/react-native'
import { Stack, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import { AppProviders } from '@/components/app-providers'
import { AuthGuard } from '@/components/auth-guard'
import { Header, RoutePathOverlay } from '@/components/general'
import { toastConfig } from '@/components/ToastConfig'
import { initializeApi } from '@/lib/api'
import { useNetworkStatus } from '@/lib/network'
import { setNotificationHandler } from '@/lib/notifications/utils'
import { initSentry } from '@/lib/sentry'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDeveloperStore } from '@/lib/stores/developer-store'
import { useLogStore } from '@/lib/stores/log-store'

import NoInternetScreen from './no-internet'

// import * as NavigationBar from 'expo-navigation-bar'

function AppHeader() {
  return <Header variant="app" />
}

function ToastWithInsets() {
  const insets = useSafeAreaInsets()
  return <Toast topOffset={40 + insets.top} config={toastConfig} />
}

// Keep the splash screen visible while we load resources
// SplashScreen.preventAutoHideAsync()

// Configure how notifications are presented (required for foreground display on Android/iOS)
setNotificationHandler()
// Initialize Sentry
initSentry()

/**
 * Root layout component.
 *
 * Initialization sequence:
 * 1. Initialize API (restore auth token, set base URL)
 * 2. Hide splash screen
 * 3. Render app with providers
 *
 * Provider hierarchy is managed by AppProviders component.
 *
 * TODO (Phase 5 — Navigation Guards & Flow):
 * ────────────────────────────────────────────
 * 1. In prepare(), after initializeApi():
 *    - Restore auth session: const hasToken = await initializeApi()
 *    - Hydrate greeting state when applicable
 *    - Hydrate theme: await useThemeStore.persist.rehydrate()
 *    - Load custom fonts (expo-font)
 *    - Check network status (useNetworkStatus)
 *
 * 2. AuthGuard (src/components/auth-guard.tsx): wallet-based route protection.
 *    - Extend later with useAuthStore when API is added.
 *
 * 3. Network monitoring:
 *    - Subscribe to network status changes in this layout
 *    - On disconnect → router.push('/no-internet')
 *    - On reconnect → router.back()
 */
function RootLayout() {
  const [appReady, setAppReady] = useState(false)
  const { isRoutePathOverlayEnabled } = useDeveloperStore()

  const { isConnected } = useNetworkStatus()

  // const visibility = NavigationBar.useVisibility()
  // const color = NavigationBar.getBackgroundColorAsync()

  // console.log('visibility', visibility)
  // console.log('color', color)

  // For testing. DELETE THIS.
  const originalLog = console.log
  const safeStringify = (arg: unknown): string => {
    if (arg === null) return 'null'
    if (arg === undefined) return 'undefined'
    const t = typeof arg
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint') return String(arg)
    try {
      return JSON.stringify(arg)
    } catch {
      return Object.prototype.toString.call(arg)
    }
  }
  console.log = (...args) => {
    const combinedMessage = args.map(safeStringify).join(' ')
    if (combinedMessage.startsWith('Sentry') || combinedMessage.startsWith('[Purchases]')) {
      originalLog(...args)
      return
    }

    useLogStore.getState().addLog({
      type: 'log',
      message: combinedMessage,
      timestamp: new Date().toISOString(),
    })
    originalLog(...args)
  }

  const hideHeader = usePathname() === '/greeting'

  useEffect(() => {
    async function prepare() {
      // Minimum time to show native splash so it's visible (dev builds hide it very fast)
      // const minSplashTime = Promise.resolve().then(() => new Promise((r) => setTimeout(r, 1500)))

      // Initialize API layer (restore auth token, set base URL)
      await initializeApi()
      // await Promise.all([initializeApi(), minSplashTime]) // Wait for both to complete

      // Add other async initialization here:
      // - Fetch initial config from server
      // - Restore user preferences from storage

      setAppReady(true)
    }

    void prepare()
  }, [])

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync()
    }
  }, [appReady])

  if (!appReady) {
    return null
  }

  if (!isConnected) {
    return <NoInternetScreen />
  }

  return (
    <AppProviders>
      <View style={styles.container} className="bg-fill-primary">
        {[
          <StatusBar key="statusbar" style="auto" />,
          <AuthGuard key="auth">
            <Stack
              screenOptions={{
                headerShown: !hideHeader,
                header: AppHeader,
                animation: 'slide_from_right',
                gestureEnabled: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="greeting" />
              <Stack.Screen name="tabs" />
              <Stack.Screen name="profile/index" />
              <Stack.Screen name="screens/qna" />
              <Stack.Screen name="screens/contact-us" />
              <Stack.Screen name="screens/edit-profile" />
              <Stack.Screen name="screens/notification-settings" />
              <Stack.Screen
                name="screens/leaderboard-detail"
                options={{ presentation: 'fullScreenModal', headerShown: false }}
              />
              <Stack.Screen name="no-internet/index" />
              <Stack.Screen name="splash/index" options={{ headerShown: false, animation: 'fade' }} />
              <Stack.Screen name="terms/terms" />
              <Stack.Screen name="terms/privacy" />
            </Stack>
          </AuthGuard>,
          <PortalHost key="portal" />,
          <ToastWithInsets key="toast" />,
          <RoutePathOverlay key="route-overlay" visible={isRoutePathOverlayEnabled} />,
        ]}
      </View>
    </AppProviders>
  )
}

// Wrap the RootLayout component with Sentry.wrap to capture errors
export default Sentry.wrap(RootLayout)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
