import { useCallback, useEffect, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { ExpoPushToken } from 'expo-notifications'
import { router, type Href } from 'expo-router'

import { checkNotificationPermissions, registerForPushNotificationsAsync } from './utils'

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

    function handleNotificationAction(notification: Notifications.Notification) {
      // console.log('notification', notification)
      const { contentType, modalType, screen } = notification.request.content.data

      if (contentType === 'modal' && modalType) {
        router.push(`${screen}?modalType=${modalType}` as Href)
        return
      }

      if (contentType === 'screen' && screen) {
        router.push(`${screen}` as Href)
        return
      }

      router.replace('/tabs')
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return
      }
      handleNotificationAction(response?.notification)
    })

    const subscriptionResponseReceived = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationAction(response.notification)
    })

    const subscriptionReceived = Notifications.addNotificationReceivedListener((notification) => {
      handleNotificationAction(notification)
    })

    return () => {
      isMounted = false
      subscriptionResponseReceived.remove()
      subscriptionReceived.remove()
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
