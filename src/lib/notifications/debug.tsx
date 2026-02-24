import * as Clipboard from 'expo-clipboard'
import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Platform, Text, View } from 'react-native'

import { registerForPushNotificationsAsync } from './utils'

export function useDebugPushNotification() {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  )
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined)
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined)

  const registerForPushNotifications = useCallback(async () => {
    registerForPushNotificationsAsync().then(
      token => token && setExpoPushToken(token),
    )
  }, [])

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value =>
        setChannels(value ?? []),
      )
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification)
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response)
      })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return { expoPushToken, channels, notification, registerForPushNotifications }
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
  const {
    expoPushToken,
    channels,
    notification,
    registerForPushNotifications,
  } = useDebugPushNotification()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(expoPushToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Your Expo push token: {expoPushToken}</Text>
        <View style={{ marginLeft: 8 }}>
          <Button
            title={copied ? 'Copied!' : 'Copy'}
            onPress={copyToClipboard}
          />
        </View>
        <Button
          title="Register for Push Notifications"
          onPress={registerForPushNotifications}
        />
      </View>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          Title: {notification && notification.request.content.title}{' '}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{' '}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
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
