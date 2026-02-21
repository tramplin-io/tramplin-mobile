import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

export default function NotificationsTab() {
  return (
    <Container safe>
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-content-primary mb-6">Q&A</Text>
        <Text className="text-content-secondary">[Q&A list placeholder]</Text>
      </View>
    </Container>
  )
}
