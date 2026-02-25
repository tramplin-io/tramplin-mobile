import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProfileStore } from '@/lib/stores/profile-store'
import { useNotificationObserver, useSystemPushPermission } from '@/lib/notifications/hooks'
import { setSentryUser } from '@/lib/sentry'
import { ForceUpdateModal, UpdateAvailableModal } from './general'

// import { ForceUpdateModal } from '@/components/ForceUpdateModal'
// import { UpdateAvailableModal } from '@/components/UpdateAvailableModal'

/**
 * Route protection based on API session (wallet sign-in).
 *
 * - Not authenticated: only auth and greeting routes are allowed; others redirect to greeting.
 * - Authenticated: auth and greeting redirect to tabs.
 *
 * Auth flow: user connects wallet on greeting → signs LOGIN_PAYLOAD → createSessionByUserWallet → isAuthenticated.
 * Must be rendered inside MobileWalletProvider (e.g. under AppProviders).
 */
export function AuthGuard({ children }: Readonly<PropsWithChildren>) {
  const router = useRouter()
  const segments = useSegments()

  const { isAuthenticated, session, isForceUpdateModalVisible, isUpdateAvailableModalVisible, dismissUpdateAvailable } =
    useAuthStore()
  const { createDeviceToken, fetchUserProfile } = useProfileStore()

  const { hasSystemPushPermission, registerForPushNotifications } = useSystemPushPermission()

  // Register device token when user grants permission (Android 13+ prompt or iOS/system settings).
  // Handles cases when user enables notifications in system settings after initially declining.
  useEffect(() => {
    const handlePushNotificationsPermissionsUpdate = async () => {
      const token = await registerForPushNotifications()
      console.log('token', token)
      if (token) {
        await createDeviceToken(token)
      }
    }

    // Only check if system push permission is granted
    // because we don't want to trigger the system prompt if the user hasn't explicitly tried to enable it
    if (hasSystemPushPermission) {
      handlePushNotificationsPermissionsUpdate()
    }
    // TODO: Show modal if user has notifications enabled in profile but logged in from new device
    // Check via deviceId (not token, as token requires permission request)
    // Modal should prompt: "Hey, let's enable notifications on this device"
    // If user clicks "Enable", show system prompt to register for push notifications
    // TODO: Also handle case when user switches accounts on same device - need to update token ownership
  }, [hasSystemPushPermission, registerForPushNotifications, createDeviceToken])

  useNotificationObserver()

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to use session?.userId
  useEffect(() => {
    setSentryUser()
  }, [session?.userId])

  useEffect(() => {
    const firstSegment = segments[0]
    const inAuthGroup = firstSegment === 'auth'
    const inGreetingGroup = firstSegment === 'greeting'

    console.log('isAuthenticated', isAuthenticated)

    console.log('segments', segments)

    if (isAuthenticated) {
      if (inAuthGroup || inGreetingGroup) {
        router.replace('/tabs/')
      }
    } else {
      //if (!inAuthGroup && !inGreetingGroup)
      router.replace('/greeting/')
    }
  }, [isAuthenticated, segments, router])

  return (
    <>
      {children}
      <ForceUpdateModal visible={isForceUpdateModalVisible} />
      <UpdateAvailableModal visible={isUpdateAvailableModalVisible} onClose={dismissUpdateAvailable} />
    </>
  )
}
