import { useCallback, useEffect } from 'react'
import { View, ScrollView } from 'react-native'
import { router, Stack } from 'expo-router'
import Toast from 'react-native-toast-message'
import { Container } from '@/components/ui/Container'
import { BackButton } from '@/components/general/BackButton'
import { Card } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { Switch } from '@/components/ui/switch'
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

  useEffect(() => {
    void fetchUserProfile()
  }, [fetchUserProfile])

  const handleBack = useCallback(() => {
    router.push('/profile')
  }, [])

  const handlePushToggle = useCallback(
    async (checked: boolean) => {
      setIsPushNotificationsOn(checked)
      const ok = await updateUserProfile({ isPushNotificationsOn: checked })
      if (!ok) {
        setIsPushNotificationsOn(!checked)
        Toast.show({ type: 'error', text1: 'Could not update push notifications' })
      }
    },
    [updateUserProfile, setIsPushNotificationsOn]
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
    [updateUserProfile, setIsEmailNotificationsOn]
  )

  return (
    <Container safe={false} className="bg-fill-primary">
      <View className="flex-row items-center justify-between mb-4 mt-4 px-4">
        <BackButton onPress={handleBack} className="mb-0 z-10" />
        <Text className="text-h4 text-center text-content-primary w-full -ml-10">Notifications</Text>
      </View>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScrollView contentContainerClassName="px-6 py-8" showsVerticalScrollIndicator={false}>
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
    </Container>
  )
}
