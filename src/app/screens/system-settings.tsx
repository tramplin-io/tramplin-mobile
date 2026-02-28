import { useCallback } from 'react'
import { ScrollView, View } from 'react-native'
import { router, Stack } from 'expo-router'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { Card } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

export default function SystemSettingsScreen() {
  const handleBack = useCallback(() => {
    router.push('/profile')
  }, [])

  return (
    <ScreenWrapper>
      <View className="flex-row items-center justify-between mb-4 mt-4 px-4">
        <BackButton onPress={handleBack} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          System settings
        </Text>
      </View>
      <Stack.Screen options={{ title: 'System settings' }} />
      <ScrollView contentContainerClassName="px-4 py-8" showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Text variant="body" className="text-content-secondary mb-1">
            Appearance
          </Text>
          <Card variant="profile" className="p-4">
            <ThemeSwitcher />
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}
