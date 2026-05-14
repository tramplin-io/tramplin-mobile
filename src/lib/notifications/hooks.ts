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

    /*
    Endpoint - https://exp.host/--/api/v2/push/send
    Method - POST

    to - expo push token - На новий странице DEV Test Screen

    PRE-01, PRE-02, STAKE-02, POST-02
    {
      "to": "ExponentPushToken[PU3qk1HgavfkFvD8mieO3B]",
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
      "to": "ExponentPushToken[PU3qk1HgavfkFvD8mieO3B]",
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
      "to": "ExponentPushToken[PU3qk1HgavfkFvD8mieO3B]",
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
      "to": "ExponentPushToken[PU3qk1HgavfkFvD8mieO3B]",
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
      "to": "ExponentPushToken[PU3qk1HgavfkFvD8mieO3B]",
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

    function handleNotificationAction(notification: Notifications.Notification) {
      // console.log('notification', notification)
      const { contentType, modalType, screen, id, stakeAmount } = notification.request.content.data as {
        contentType?: string
        modalType?: string
        screen?: string
        id?: string
        stakeAmount?: string
      }

      if (contentType === 'modal' && modalType) {
        router.push(`${screen}?modalType=${modalType}${stakeAmount ? `&stakeAmount=${stakeAmount}` : ''}` as Href)
        return
      }

      if (contentType === 'screen' && screen) {
        const resolvedScreen = id ? screen.replace('<id>', id) : screen
        router.push(resolvedScreen as Href)
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
