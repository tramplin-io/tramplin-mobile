import { Alert, Linking, Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

import type { CreateMyDeviceTokenInput } from '../api/generated/restApi.schemas'

// Call this function early in the app to set the notification handler
export function setNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

export async function checkNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  // console.log('existingStatus', existingStatus)
  return existingStatus === 'granted'
}

export async function openNotificationSettings() {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:')
  } else {
    await Linking.openSettings()
  }
}

// Learn more about projectId:
// https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
// EAS projectId is used here.
function getProjectId(): string | null {
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId

  if (!projectId) {
    console.error('Project ID not found')
    return null
  }

  return projectId
}

const FCM_SETUP_URL = 'https://docs.expo.dev/push-notifications/fcm-credentials/'

function isFirebaseNotInitializedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('FirebaseApp') || message.includes('not initialized') || message.includes('Firebase')
}

export async function getExpoPushToken(): Promise<CreateMyDeviceTokenInput | null> {
  try {
    const projectId = getProjectId()
    if (!projectId) {
      throw new Error('Project ID not found')
    }

    const expoDeviceToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    const fcmDeviceToken = await Notifications.getDevicePushTokenAsync()

    const deviceTokens = {
      expoDeviceToken: expoDeviceToken.data,
      fcmDeviceToken: fcmDeviceToken.data,
    }

    return deviceTokens
  } catch (e) {
    if (Platform.OS === 'android' && isFirebaseNotInitializedError(e)) {
      console.warn(
        `Push notifications on Android require Firebase. Complete the guide at ${FCM_SETUP_URL} to enable them.`,
      )
    } else {
      console.error('Failed to get Expo push token:', e)
    }
    return null
  }
}

export async function registerForPushNotificationsAsync({ forceOpenSettings = false } = {}) {
  if (!Device.isDevice) {
    Alert.alert('Must use physical device for Push Notifications')
    return null
  }

  // Android 13+: system permission prompt only appears after at least one channel exists.
  // Must run before getExpoPushTokenAsync / getPermissionsAsync.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tramplinNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9f9cf9',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (existingStatus === 'denied' && forceOpenSettings) {
      await openNotificationSettings()
      return null
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!')
      return null
    }
    return getExpoPushToken()
  }

  return null
}
