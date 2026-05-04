import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Platform, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Notifications from 'expo-notifications'

import { getExpoPushToken, registerForPushNotificationsAsync } from './utils'

/** Debug hook for Expo push token (used as expoDeviceToken in CreateMyDeviceTokenInput). */
export function useDebugPushNotification() {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([])
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined)
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined)
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined)

  const registerForPushNotifications = useCallback(async () => {
    const deviceTokens = await registerForPushNotificationsAsync()
    if (deviceTokens?.expoDeviceToken) setExpoPushToken(deviceTokens.expoDeviceToken)
  }, [])

  const getExpoPushTokenHandler = useCallback(async () => {
    const deviceTokens = await getExpoPushToken()
    setExpoPushToken(deviceTokens?.expoDeviceToken ?? '')
  }, [])

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) => setChannels(value ?? []))
    }
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return { expoPushToken, channels, notification, registerForPushNotifications, getExpoPushTokenHandler }
}

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  }

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
}

// Use https://expo.dev/notifications to send a test notification
export function NotificationsDebug() {
  const { expoPushToken, channels, notification, registerForPushNotifications, getExpoPushTokenHandler } =
    useDebugPushNotification()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(expoPushToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View className="flex-1 items-center justify-around px-4">
      <View className="flex-col items-center gap-1">
        <Text>Your Expo push token: {expoPushToken}</Text>
        <View className="ml-2">
          <Button title={copied ? 'Copied!' : 'Copy'} onPress={copyToClipboard} />
        </View>
        <Button title="Register for Push Notifications" onPress={registerForPushNotifications} />
        <Button title="Get Expo Push Token" onPress={getExpoPushTokenHandler} />
      </View>
      <View className="items-center justify-center">
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken)
        }}
      />
    </View>
  )
}
