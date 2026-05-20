import { useCallback, useEffect, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { ExpoPushToken } from 'expo-notifications'
import { router, type Href } from 'expo-router'

import { useAuthStore } from '@/lib/stores/auth-store'

import { checkNotificationPermissions, registerForPushNotificationsAsync } from './utils'

// Stores the navigation target from a cold-start notification tap.
// On cold start the app isn't fully initialized yet, so we defer navigation
// and let AuthGuard pick it up once routing has settled.
let pendingColdStartRoute: Href | null = null

export function takePendingColdStartRoute(): Href | null {
  const route = pendingColdStartRoute
  pendingColdStartRoute = null
  return route
}

type NotificationData = {
  contentType?: string
  modalType?: string
  screen?: string
  id?: string
  stakeAmount?: string
}

function extractData(notification: Notifications.Notification): NotificationData {
  return notification.request.content.data as NotificationData
}

export function useNotificationObserver({
  onTokenUpdate,
}: {
  onTokenUpdate?: (token: ExpoPushToken) => void
} = {}) {
  useEffect(() => {
    let isMounted = true

    // TODO: Clear notification badge count when app becomes active
    // Notifications.setBadgeCountAsync(0)

    // {
    //   "title": "Day 1 in app",
    //   "body": "{{userName}} Congrats on day 1 in the app! Keep going.",
    //   "data": {
    //     "contentType": "modal", // modal, screen, none
    //     "modalType": "rewardClaim",
    //     "modalData": "{}",
    //     "screen": "/tabs/rewards"
    //   }
    // }

    /*
    Endpoint - https://exp.host/--/api/v2/push/send
    Method - POST

    to - expo push token - На новий странице DEV Test Screen

    PRE-01, PRE-02, STAKE-02, POST-02
    {
      "to": "ExponentPushToken[xVC4rGKt-fDFiGzUw3W7lj]",
      "sound": "default",
      "title": "Original Title - Stake screen",
      "body": "Missed Draws, Draws-Per-Epoch, Low-Barrier Anchor",
      "data": { 
          "contentType": "modal",
          "modalType": "staking",
          "screen": "/tabs"
        }
    }

    PRE-03
    {
      "to": "ExponentPushToken[xVC4rGKt-fDFiGzUw3W7lj]",
      "sound": "default",
      "title": "Original Title - Stake screen",
      "body": "Missed Draws, Draws-Per-Epoch, Low-Barrier Anchor",
      "data": { 
          "contentType": "modal",
          "modalType": "staking",
          "stakeAmount": "1.25",
          "screen": "/tabs"
        }
    }

    STAKE-01, SKR-02
    {
      "to": "ExponentPushToken[xVC4rGKt-fDFiGzUw3W7lj]",
      "sound": "default",
      "title": "Original Title - Rewards screen",
      "body": "You Won",
      "data": { 
          "contentType": "screen",
          "screen": "/tabs/rewards"
        }
    }

    Notifications
    {
      "to": "ExponentPushToken[xVC4rGKt-fDFiGzUw3W7lj]",
      "sound": "default",
      "title": "Original Title - notifications",
      "body": "Notifications",
      "data": { 
         "contentType": "screen",
         "screen": "/screens/notifications"
        }
    }

    Announcement - id - взять из админки для своего пользователя.
    https://develop-admin.tramplin.io/#/notifications/6a046192dcd7b21e796734eb/show
    {
      "to": "ExponentPushToken[xVC4rGKt-fDFiGzUw3W7lj]",
      "sound": "default",
      "title": "Original Title - Announcement",
      "body": "Notifications Announcement",
      "data": { 
        "contentType": "screen",
        "screen": "/screens/notifications/<id>",
        "id": "6a046192dcd7b21e796734eb"
        }
    }
    */

    // Backgrounded: app was running, user tapped notification.
    // Navigate immediately — the nav stack is fully ready.
    function handleNotificationAction(notification: Notifications.Notification) {
      const { contentType, modalType, screen, id, stakeAmount } = extractData(notification)

      if (contentType === 'modal' && modalType) {
        // Write to store; tabs layout consumes it reactively.
        // URL params don't reach the layout in a tab group — use Zustand instead.
        useAuthStore.getState().setPendingNotificationModal({ modalType, stakeAmount })
        router.navigate((screen ?? '/tabs') as Href)
        return
      }

      if (contentType === 'screen' && screen) {
        router.push((id ? screen.replace('<id>', id) : screen) as Href)
        return
      }

      router.push('/tabs' as Href)
    }

    // Cold-start: app was fully closed, user tapped notification.
    // Don't navigate yet — the splash/auth flow hasn't settled.
    // Modal actions go to Zustand (tabs layout reads it on mount).
    // Screen actions go to pendingColdStartRoute (AuthGuard navigates after settling).
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) return
      const { contentType, modalType, screen, id, stakeAmount } = extractData(response.notification)

      if (contentType === 'modal' && modalType) {
        useAuthStore.getState().setPendingNotificationModal({ modalType, stakeAmount })
        // Splash already navigates to /tabs; the Zustand subscriber opens the modal there.
        return
      }

      if (contentType === 'screen' && screen) {
        pendingColdStartRoute = (id ? screen.replace('<id>', id) : screen) as Href
        return
      }

      pendingColdStartRoute = '/tabs' as Href
    })

    const subscriptionResponseReceived = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationAction(response.notification)
    })

    // It was triggering navigation on every incoming notification regardless of user intent
    // const subscriptionReceived = Notifications.addNotificationReceivedListener((notification) => {
    //   handleNotificationAction(notification)
    // })

    return () => {
      isMounted = false
      subscriptionResponseReceived.remove()
      // subscriptionReceived.remove()
    }
  }, [])

  // In rare situations, a push token may be changed by the push notification
  // service while the app is running. When a token is rolled, the old one becomes
  // invalid. Register the new Expo token with the backend (CreateMyDeviceTokenInput.expoDeviceToken).
  // biome-ignore lint/correctness/useExhaustiveDependencies: need to use onTokenUpdate
  useEffect(() => {
    if (onTokenUpdate) {
      const subscription = Notifications.addPushTokenListener(() => {
        return Notifications.getExpoPushTokenAsync().then(onTokenUpdate)
      })
      return () => subscription.remove()
    }
    return () => {}
  }, [])
}

export function useSystemPushPermission() {
  const [hasSystemPushPermission, setHasSystemPushPermission] = useState(false)

  const checkPermissions = useCallback(async () => {
    const isGranted = await checkNotificationPermissions()
    setHasSystemPushPermission(isGranted)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to use checkPermissions
  const registerForPushNotifications = useCallback(async (options?: { forceOpenSettings?: boolean }) => {
    try {
      const token = await registerForPushNotificationsAsync(options)

      await checkPermissions() // update permissions after registering

      return token
    } catch (error) {
      console.error('Error registering for push notifications:', error)
      return null
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to use checkPermissions
  useEffect(() => {
    // Check permissions on component mount
    checkPermissions()

    // Listen for app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // When app returns to active state (from background)
      if (nextAppState === 'active') {
        checkPermissions()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [])

  return {
    hasSystemPushPermission,
    registerForPushNotifications,
  }
}
