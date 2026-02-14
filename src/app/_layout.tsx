import '../global.css'

import { ThemeProvider } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import Toast from 'react-native-toast-message'
import { AppProviders } from '@/components/app-providers'
import { useAppTheme } from '@/components/app-theme'
import { initializeApi } from '@/lib/api'

// Keep the splash screen visible while we load resources
SplashScreen.preventAutoHideAsync()

/**
 * Root layout component.
 *
 * Initialization sequence:
 * 1. Initialize API (restore auth token, set base URL)
 * 2. Hide splash screen
 * 3. Render app with providers
 *
 * Provider hierarchy is managed by AppProviders component.
 * Toast is placed outside AppProviders so it renders above everything.
 *
 * TODO (Phase 5 — Navigation Guards & Flow):
 * ────────────────────────────────────────────
 * 1. In prepare(), after initializeApi():
 *    - Restore auth session: const hasToken = await initializeApi()
 *    - Hydrate onboarding state: await useOnboardingStore.persist.rehydrate()
 *    - Hydrate theme: await useThemeStore.persist.rehydrate()
 *    - Load custom fonts (expo-font)
 *    - Check network status (useNetworkStatus)
 *
 * 2. Create AuthGuard component (src/components/auth-guard.tsx):
 *    - Wrap <Slot /> with auth redirect logic
 *    - Read from useAuthStore + useOnboardingStore
 *    - Handle redirects (see src/app/index.tsx TODO for logic)
 *    - Pattern: see fem-fast AuthGuard component
 *
 * 3. Replace <Slot /> with:
 *    <AuthGuard>
 *      <Slot />
 *    </AuthGuard>
 *
 * 4. Network monitoring:
 *    - Subscribe to network status changes in this layout
 *    - On disconnect → router.push('/no-internet')
 *    - On reconnect → router.back()
 */
export default function RootLayout() {
  const [appReady, setAppReady] = useState(false)
  const { theme } = useAppTheme()

  useEffect(() => {
    async function prepare() {
      // Minimum time to show native splash so it's visible (dev builds hide it very fast)
      // const minSplashTime = Promise.resolve().then(() => new Promise((r) => setTimeout(r, 1500)))

      // Initialize API layer (restore auth token, set base URL)
      await initializeApi()
      // await Promise.all([initializeApi(), minSplashTime]) // Wait for both to complete

      // Add other async initialization here:
      // - Load custom fonts
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

  return (
    <ThemeProvider value={theme}>
      <View style={styles.container}>
        <AppProviders>
          <StatusBar style="auto" />
          <Slot />
        </AppProviders>
        <View style={styles.toastContainer}>
          <Toast topOffset={60} />
        </View>
      </View>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
})
