import '../global.css'

import { ActionSheetProvider } from '@expo/react-native-action-sheet'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { ThemeProvider } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Slot, Stack, usePathname } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import Toast from 'react-native-toast-message'
import { AppProviders } from '@/components/app-providers'
import { AuthGuard } from '@/components/auth-guard'
import { useAppTheme } from '@/components/app-theme'
import { initializeApi, queryClient } from '@/lib/api'
import { QueryClientProvider } from '@tanstack/react-query'
import { Header } from '@/components/general'

function AppHeader() {
  return <Header variant="app" />
}

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
export default function RootLayout() {
  const [appReady, setAppReady] = useState(false)
  const { theme } = useAppTheme()

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActionSheetProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={theme}>
              <View style={styles.container}>
                <AppProviders>
                  {/* <StatusBar
                  style="auto"
                  // networkActivityIndicatorVisible={false}
                  // hidden
                  // animated
                  // backgroundColor="transparent"
                  // translucent
                /> */}
                  <AuthGuard>
                    {/* <Slot /> */}
                    <Stack
                      screenOptions={{
                        headerShown: !hideHeader,
                        header: AppHeader,
                        animation: 'slide_from_right',
                        gestureEnabled: false, // Disable swipe back gesture
                      }}
                    >
                      <Stack.Screen name="index" />
                      <Stack.Screen name="greeting" />
                      <Stack.Screen name="auth/sign-in" />
                      <Stack.Screen name="tabs" />
                      <Stack.Screen name="profile/index" />
                      <Stack.Screen name="screens" />
                      <Stack.Screen name="no-internet" />
                      <Stack.Screen name="splash/index" />

                      <Stack.Screen name="terms/terms" />
                      <Stack.Screen name="terms/privacy" />
                    </Stack>
                  </AuthGuard>
                </AppProviders>
                <View style={styles.toastContainer}>
                  <Toast topOffset={60} />
                </View>
              </View>
            </ThemeProvider>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
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
