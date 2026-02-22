import { View, Text, ScrollView } from 'react-native'
import { Container } from '@/components/ui/Container'

export default function CommunityTab() {
  return (
    <Container safe>
      <ScrollView contentContainerClassName="px-6 py-8" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-content-primary mb-6">Leaderboard</Text>
        <Text className="text-content-secondary">[Leaderboard placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
