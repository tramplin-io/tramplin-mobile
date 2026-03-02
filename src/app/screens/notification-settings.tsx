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
import { useProfileStore } from '@/lib/stores/profile-store'

export default function NotificationSettingsScreen() {
  const {
    userProfile,
    fetchUserProfile,
    updateUserProfile,
    isPushNotificationsOn,
    isEmailNotificationsOn,
    setIsPushNotificationsOn,
    setIsEmailNotificationsOn,
  } = useProfileStore()

  const pushOn = userProfile?.isPushNotificationsOn ?? isPushNotificationsOn
  const emailOn = userProfile?.isEmailNotificationsOn ?? isEmailNotificationsOn

  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  useEffect(() => {
    void fetchUserProfile()
  }, [fetchUserProfile])

  const handleBack = useCallback(() => {
    router.push('/profile')
  }, [])

  const handlePushToggle = useCallback(
    // TODO: add check for system push permission

    async (checked: boolean) => {
      setIsPushNotificationsOn(checked)
      const ok = await updateUserProfile({ isPushNotificationsOn: checked })
      if (!ok) {
        setIsPushNotificationsOn(!checked)
        Toast.show({ type: 'error', text1: 'Could not update push notifications' })
      }
    },
    [updateUserProfile, setIsPushNotificationsOn],
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
            <Switch checked={pushOn} onCheckedChange={handlePushToggle} />
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
