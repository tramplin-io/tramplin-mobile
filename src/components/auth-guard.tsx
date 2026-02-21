import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'

/**
 * Route protection based on wallet connection.
 *
 * - Not connected: only auth and greeting routes are allowed; others redirect to greeting.
 * - Connected: auth and greeting redirect to tabs.
 *
 * Must be rendered inside MobileWalletProvider (e.g. under AppProviders).
 * Later can be extended with API session and greeting completion checks.
 */
export function AuthGuard({ children }: Readonly<PropsWithChildren>) {
  const router = useRouter()
  const segments = useSegments()
  const { account } = useMobileWallet()

  const isAuthenticated = !!account

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth'
    const inGreetingGroup = segments[0] === 'greeting'

    if (isAuthenticated) {
      if (inAuthGroup || inGreetingGroup) {
        router.replace('/tabs/')
      }
    } else if (!inAuthGroup && !inGreetingGroup) {
      router.replace('/greeting/')
    }
  }, [isAuthenticated, segments, router])

  return <>{children}</>
}
