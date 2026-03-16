import { useCallback, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { Card } from '@/components/ui'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { useSystemPushPermission } from '@/lib/notifications/hooks'
import { getExpoPushToken } from '@/lib/notifications/utils'
import { useProfileStore } from '@/lib/stores/profile-store'

export default function NotificationSettingsScreen() {
  const { hasSystemPushPermission, registerForPushNotifications } = useSystemPushPermission()

  const {
    userProfile,
    fetchUserProfile,
    updateUserProfile,
    isPushNotificationsOn,
    isEmailNotificationsOn,
    setIsEmailNotificationsOn,
    createDeviceToken,
    // deleteDeviceToken,
    // expoDeviceToken,
    // fcmDeviceToken,
  } = useProfileStore()

  const pushOn = userProfile?.isPushNotificationsOn ?? isPushNotificationsOn
  const isPushNotificationsAllowed = Boolean(hasSystemPushPermission && pushOn)
  const emailOn = userProfile?.isEmailNotificationsOn ?? isEmailNotificationsOn
  const discordOn = userProfile?.isDiscordNotificationsOn ?? false
  const telegramOn = userProfile?.isTelegramNotificationsOn ?? false
  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  useEffect(() => {
    void fetchUserProfile()
  }, [fetchUserProfile])

  const handleBack = useCallback(() => {
    router.push('/profile')
  }, [])

  const handleSystemPermission = async () => {
    const token = await registerForPushNotifications({
      forceOpenSettings: true,
    })

    if (!token) return false

    await createDeviceToken(token)
    return true
  }

  const updateNotificationState = async (newValue: boolean) => {
    const success = await updateUserProfile({
      isPushNotificationsOn: newValue,
    })

    // if (!newValue && success) {
    //   const deviceTokens = await getExpoPushToken()
    //   const expoTokenToDelete = expoDeviceToken ?? deviceTokens?.expoDeviceToken

    //   const fcmTokenToDelete = fcmDeviceToken ?? deviceTokens?.fcmDeviceToken

    //   if (expoTokenToDelete) {
    //     await deleteDeviceToken(expoTokenToDelete)
    //   }
    //   if (fcmTokenToDelete) {
    //     await deleteDeviceToken(fcmTokenToDelete)
    //   }
    // }

    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Notifications updated successfully.',
      })
    } else {
      Toast.show({
        type: 'error',
        text1: 'Could not update push notifications',
      })
    }
  }

  const handlePushToggle = async (checked: boolean) => {
    try {
      if (checked) {
        const permissionGranted = await handleSystemPermission()
        if (!permissionGranted) return
      }

      await updateNotificationState(checked)
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to handle notifications. Please try again.',
      })
      console.error('Failed to handle notifications:', error)
    }
  }

  const handleDiscordToggle = useCallback(
    async (checked: boolean) => {
      setIsEmailNotificationsOn(checked)
      const success = await updateUserProfile({ isDiscordNotificationsOn: checked })

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Discord notifications updated.',
        })
      } else {
        Toast.show({
          type: 'error',
          text1: 'Could not update discord notifications',
        })
      }
    },
    [updateUserProfile, setIsEmailNotificationsOn],
  )

  const handleTelegramToggle = useCallback(
    async (checked: boolean) => {
      setIsEmailNotificationsOn(checked)
      const success = await updateUserProfile({ isTelegramNotificationsOn: checked })

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Telegram notifications updated.',
        })
      } else {
        Toast.show({
          type: 'error',
          text1: 'Could not update telegram notifications',
        })
      }
    },
    [updateUserProfile, setIsEmailNotificationsOn],
  )

  const handleEmailToggle = useCallback(
    async (checked: boolean) => {
      setIsEmailNotificationsOn(checked)
      const ok = await updateUserProfile({ isEmailNotificationsOn: checked })
      if (!ok) {
        setIsEmailNotificationsOn(!checked)
        Toast.show({ type: 'error', text1: 'Could not update email notifications' })
      }
    },
    [updateUserProfile, setIsEmailNotificationsOn],
  )

  return (
    <ScreenWrapper>
      <View className="flex-row items-center justify-between mb-2 mt-2 px-4">
        <BackButton onPress={handleBack} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          Notifications
        </Text>
      </View>
      <LinearGradient
        colors={[fillPrimary, fillFade]}
        locations={[0, 1]}
        className="w-full h-10 z-10"
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          height: 32,
        }}
      />
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScrollView contentContainerClassName="px-4 py-8" showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Card variant="profile" className="flex-row items-center justify-between p-4">
            <Text variant="body" className="text-content-primary">
              Push notifications
            </Text>
            <Switch checked={isPushNotificationsAllowed} onCheckedChange={handlePushToggle} />
          </Card>
          <Card variant="profile" className="flex-row items-center justify-between p-4">
            <Text variant="body" className="text-content-primary">
              Discord notifications
            </Text>
            <Switch checked={discordOn} onCheckedChange={handleDiscordToggle} />
          </Card>
          <Card variant="profile" className="flex-row items-center justify-between p-4">
            <Text variant="body" className="text-content-primary">
              Telegram notifications
            </Text>
            <Switch checked={telegramOn} onCheckedChange={handleTelegramToggle} />
          </Card>

          <Card variant="profile" className="flex-row items-center justify-between p-4">
            <Text variant="body" className="text-content-primary">
              Email
            </Text>
            <Switch checked={emailOn} onCheckedChange={handleEmailToggle} />
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}
