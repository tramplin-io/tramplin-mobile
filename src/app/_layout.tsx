import '../global.css'

import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import Toast from 'react-native-toast-message'
import { AppProviders } from '@/components/app-providers'
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

  useEffect(() => {
    async function prepare() {
      // Initialize API layer (restore auth token, set base URL)
      await initializeApi()

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
    <View style={styles.container}>
      <AppProviders>
        <StatusBar style="auto" />
        <Slot />
      </AppProviders>
      <View style={styles.toastContainer}>
        <Toast topOffset={60} />
      </View>
    </View>
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
