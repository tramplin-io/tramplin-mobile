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

    function handleNotificationAction(notification: Notifications.Notification) {
      const { contentType, modalType, screen = '/tabs' } = notification.request.content.data

      if (contentType === 'modal' && modalType) {
        router.push(`${screen}?modalType=${modalType}` as Href)
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
  // invalid and sending notifications to it will fail. A push token listener will
  // let you handle this situation gracefully by registering the new token with your
  // backend right away.
  // biome-ignore lint/correctness/useExhaustiveDependencies: need to use onTokenUpdate
  useEffect(() => {
    if (onTokenUpdate) {
      const subscription = Notifications.addPushTokenListener((devicePushToken) => {
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
