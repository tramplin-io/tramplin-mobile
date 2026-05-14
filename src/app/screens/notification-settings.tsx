import { useCallback, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { Button } from '@/components/ui'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import type { NotificationType } from '@/lib/api/generated/restApi.schemas'
import { useSystemPushPermission } from '@/lib/notifications/hooks'
import { useProfileStore } from '@/lib/stores/profile-store'
import { cn } from '@/lib/utils'

const PUSH_NOTIFICATION_ITEMS: { type: NotificationType; label: string; description: string }[] = [
  // { type: 'product', label: 'Product', description: 'Receive notifications about new products' },
  // { type: 'rewards', label: 'Rewards', description: 'Receive notifications about new rewards' },
  // { type: 'points', label: 'Points', description: 'Receive notifications about new points' },
  { type: 'winAlerts', label: 'Win alerts', description: 'Instant alert when you win any draw' },
  { type: 'drawReminders', label: 'Draw reminders', description: '10 minutes before Big and Epoch Draws' },
  { type: 'referalActivity', label: 'Referral activity', description: 'When someone stakes via your link' },
  { type: 'announcements', label: 'Announcements', description: 'New features, updates, etc.' },
]

export default function NotificationSettingsScreen() {
  const { hasSystemPushPermission, registerForPushNotifications } = useSystemPushPermission()

  const {
    userProfile,
    fetchUserProfile,
    updateUserProfile,
    isEmailNotificationsOn,
    setIsEmailNotificationsOn,
    createDeviceToken,
  } = useProfileStore()
  const insets = useSafeAreaInsets()
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([])

  const emailOn = userProfile?.isEmailNotificationsOn ?? isEmailNotificationsOn
  const discordOn = userProfile?.isDiscordNotificationsOn ?? false
  const telegramOn = userProfile?.isTelegramNotificationsOn ?? false
  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  useEffect(() => {
    void fetchUserProfile()
  }, [fetchUserProfile])

  useEffect(() => {
    if (userProfile?.notificationTypes) {
      setNotificationTypes(userProfile.notificationTypes)
    }
  }, [userProfile])

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  const handleOpenSettings = useCallback(async () => {
    const token = await registerForPushNotifications({ forceOpenSettings: true })
    if (token) {
      await createDeviceToken(token)
    }
  }, [registerForPushNotifications, createDeviceToken])

  const handleNotificationTypeToggle = useCallback(
    async (type: NotificationType, checked: boolean) => {
      const prev = notificationTypes
      const next = checked ? [...prev, type] : prev.filter((t) => t !== type)
      setNotificationTypes(next)

      const success = await updateUserProfile({
        notificationTypes: next,
        isPushNotificationsOn: next.length > 0,
      })

      if (!success) {
        setNotificationTypes(prev)
        Toast.show({ type: 'error', text1: 'Could not update notifications' })
      }
    },
    [notificationTypes, updateUserProfile],
  )

  const handleDiscordToggle = useCallback(
    async (checked: boolean) => {
      setIsEmailNotificationsOn(checked)
      const success = await updateUserProfile({ isDiscordNotificationsOn: checked })

      if (success) {
        Toast.show({ type: 'success', text1: 'Discord notifications updated.' })
      } else {
        Toast.show({ type: 'error', text1: 'Could not update discord notifications' })
      }
    },
    [updateUserProfile, setIsEmailNotificationsOn],
  )

  const handleTelegramToggle = useCallback(
    async (checked: boolean) => {
      setIsEmailNotificationsOn(checked)
      const success = await updateUserProfile({ isTelegramNotificationsOn: checked })

      if (success) {
        Toast.show({ type: 'success', text1: 'Telegram notifications updated.' })
      } else {
        Toast.show({ type: 'error', text1: 'Could not update telegram notifications' })
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

  const OTHER_NOTIFICATION_ITEMS: {
    label: string
    description: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
  }[] = [
    {
      label: 'Discord notifications',
      description: 'Receive notifications in Discord',
      checked: discordOn,
      onCheckedChange: handleDiscordToggle,
    },
    {
      label: 'Telegram notifications',
      description: 'Receive notifications in Telegram',
      checked: telegramOn,
      onCheckedChange: handleTelegramToggle,
    },
    {
      label: 'Email',
      description: 'Receive notifications in email',
      checked: emailOn,
      onCheckedChange: handleEmailToggle,
    },
  ]

  return (
    <ScreenWrapper style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      {/* Header */}
      <View className={cn('w-full bg-fill-primary')}>
        <View className="h-10 flex-row items-center justify-between px-4 my-3 w-full">
          <BackButton onPress={handleBack} className="mb-0 z-10" />
          <Text variant="h4" className="text-content-primary flex-1 text-center">
            Notifications
          </Text>
          <View className="size-10" />
        </View>
        <LinearGradient
          colors={[fillPrimary, fillFade]}
          locations={[0, 1]}
          className="w-full h-5 z-10"
          style={{ position: 'absolute', top: 30 + insets.top, left: 0, right: 0, height: 20 }}
        />
      </View>
      {/* Content */}
      <ScrollView contentContainerClassName="px-0 py-6 pb-16" showsVerticalScrollIndicator={false}>
        {/* Push notifications */}
        <View>
          {hasSystemPushPermission ? (
            <View className="px-0">
              {PUSH_NOTIFICATION_ITEMS.map((item) => (
                <View key={item.type} className={cn('flex-col px-5 py-3', 'border-b border-border-quaternary')}>
                  <View className="flex-row justify-between">
                    <Text variant="body" className="text-content-primary">
                      {item.label}
                    </Text>
                    <Switch
                      checked={notificationTypes.includes(item.type)}
                      onCheckedChange={(checked) => handleNotificationTypeToggle(item.type, checked)}
                    />
                  </View>
                  <Text variant="body" className="text-content-tertiary">
                    {item.description}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-4 px-5 gap-3 mb-2">
              <View className="gap-1">
                <Text variant="body" className="text-content-primary">
                  Push notifications
                </Text>
                <Text variant="body" className="text-content-tertiary">
                  Tramplin push notifications are disabled in your phone settings.
                </Text>
              </View>
              <Button size="lg" variant="purple" onPress={handleOpenSettings}>
                <Text>Open phone settings</Text>
              </Button>
            </View>
          )}
        </View>

        {/* Other notifications */}
        {/* <View>
          {OTHER_NOTIFICATION_ITEMS.map((item) => (
            <View key={item.label} className={cn('flex-col px-5 py-3', 'border-b border-border-quaternary')}>
              <View className="flex-row justify-between">
                <Text variant="body" className="text-content-primary">
                  {item.label}
                </Text>
                <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} />
              </View>
              <Text variant="body" className="text-content-tertiary">
                {item.description}
              </Text>
            </View>
          ))}
        </View> */}
      </ScrollView>
    </ScreenWrapper>
  )
}
