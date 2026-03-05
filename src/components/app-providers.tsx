import { useEffect, type PropsWithChildren } from 'react'
import { AppState, Platform, type AppStateStatus } from 'react-native'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { ThemeProvider } from '@react-navigation/native'
import { focusManager, QueryClientProvider } from '@tanstack/react-query'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AppTheme, useAppTheme } from '@/components/app-theme'
import { ErrorBoundary } from '@/components/error-boundary'
import { AppConfig } from '@/constants/app-config'
import { queryClient } from '@/lib/api'
import { initSentry } from '@/lib/sentry'

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
      <ActionSheetProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <AppTheme>
                <NavigationThemeProvider>
                  <MobileWalletProvider cluster={AppConfig.network.cluster} identity={AppConfig.identity}>
                    <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
                  </MobileWalletProvider>
                </NavigationThemeProvider>
              </AppTheme>
            </SafeAreaProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  )
}
