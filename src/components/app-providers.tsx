import { useEffect, type PropsWithChildren } from 'react'
import { AppState, Platform, type AppStateStatus } from 'react-native'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { FormoAnalyticsProvider } from '@formo/analytics-react-native'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeProvider } from '@react-navigation/native'
import { focusManager, QueryClientProvider } from '@tanstack/react-query'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { usePathname } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AppTheme, useAppTheme } from '@/components/app-theme'
import { ErrorBoundary } from '@/components/error-boundary'
import { AppConfig } from '@/constants/app-config'
import { FORMO_WRITE_KEY } from '@/constants/appConstants'
import { useAnalytics } from '@/lib/analytics'
import { queryClient } from '@/lib/api'
import { initSentry } from '@/lib/sentry'
import { useAuthStore } from '@/lib/stores/auth-store'

function IdentitySync() {
  const analytics = useAnalytics()
  const userId = useAuthStore((s) => s.session?.userId)
  useEffect(() => {
    if (userId) {
      // SDK validates `address` as EIP-55 only — pass empty string to skip that gate.
      // Wallet address is injected into properties by useAnalytics.identify().
      analytics.identify({ address: '', userId, providerName: 'solana' })
    } else {
      analytics.reset()
    }
  }, [userId, analytics])
  return null
}

function ScreenTracker() {
  const analytics = useAnalytics()
  const pathname = usePathname()
  useEffect(() => {
    if (pathname) {
      // analytics.track(AnalyticsEvent.APP_PAGE_VIEW, { path: pathname })
      analytics.screen(pathname)
    }
  }, [analytics, pathname])
  return null
}

// import { NotificationModalProvider } from './NotificationModalProvider'

initSentry()

function NavigationThemeProvider({ children }: Readonly<PropsWithChildren>) {
  const { theme } = useAppTheme()
  return <ThemeProvider value={theme}>{children}</ThemeProvider>
}

/**
 * Notify React Query when the app comes back to foreground.
 * This triggers automatic refetching of stale queries.
 */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

/**
 * Root provider component that wraps the entire app.
 *
 * Provider hierarchy (outermost -> innermost):
 *   GestureHandlerRootView
 *     -> ActionSheetProvider
 *       -> ErrorBoundary
 *         -> QueryClientProvider (TanStack React Query)
 *           -> SafeAreaProvider
 *             -> AppTheme (theme hydration)
 *               -> ThemeProvider (React Navigation)
 *                 -> MobileWalletProvider (Solana Wallet)
 *                   -> BottomSheetModalProvider (so modal content has wallet context)
 *                     -> {children}
 *
 * QueryClient is created in lib/api so it can be shared with Orval-generated
 * hooks and used outside React components.
 */
export function AppProviders({ children }: Readonly<PropsWithChildren>) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FormoAnalyticsProvider writeKey={FORMO_WRITE_KEY} asyncStorage={AsyncStorage}>
        <ActionSheetProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <SafeAreaProvider>
                <AppTheme>
                  <NavigationThemeProvider>
                    <MobileWalletProvider cluster={AppConfig.network.cluster} identity={AppConfig.identity}>
                      <BottomSheetModalProvider>
                        {/* <NotificationModalProvider> */}
                        <IdentitySync />
                        <ScreenTracker />
                        {children}
                        {/* </NotificationModalProvider> */}
                      </BottomSheetModalProvider>
                    </MobileWalletProvider>
                  </NavigationThemeProvider>
                </AppTheme>
              </SafeAreaProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </ActionSheetProvider>
      </FormoAnalyticsProvider>
    </GestureHandlerRootView>
  )
}
