import { type PropsWithChildren, useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import type { AppStateStatus } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClientProvider, focusManager } from '@tanstack/react-query'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { AppTheme } from '@/components/app-theme'
import { ErrorBoundary } from '@/components/error-boundary'
import { AppConfig } from '@/constants/app-config'
import { queryClient } from '@/lib/api'

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
 *   ErrorBoundary
 *     -> SafeAreaProvider
 *       -> AppTheme (React Navigation theme)
 *         -> QueryClientProvider (TanStack React Query)
 *           -> MobileWalletProvider (Solana Wallet)
 *             -> {children}
 *
 * QueryClient is created in lib/api/api-setup.ts so it can be
 * shared with Orval-generated hooks and used outside React components.
 *
 * @example
 * <AppProviders>
 *   <Slot />
 * </AppProviders>
 */
export function AppProviders({ children }: Readonly<PropsWithChildren>) {
  // Register app state listener for React Query focus management
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [])

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppTheme>
          <QueryClientProvider client={queryClient}>
            <MobileWalletProvider cluster={AppConfig.network.cluster} identity={AppConfig.identity}>
              {children}
            </MobileWalletProvider>
          </QueryClientProvider>
        </AppTheme>
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
