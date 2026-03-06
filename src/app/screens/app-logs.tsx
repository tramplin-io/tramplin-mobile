import { View } from 'react-native'
import { router } from 'expo-router'

import { BackButton } from '@/components/general/BackButton'
import { LogDisplay } from '@/components/profile/LogDisplay'
import { Container } from '@/components/ui/Container'
import { Text } from '@/components/ui/text'

export default function UpdateCursorSettingsScreen() {
  return (
    <Container safe>
      <View className="flex-row items-center justify-between mb-4 mt-4 px-4">
        <BackButton onPress={() => router.back()} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          App Logs
        </Text>
      </View>

      <View className="px-4 mb-10">
        <LogDisplay />
      </View>
    </Container>
  )
}
