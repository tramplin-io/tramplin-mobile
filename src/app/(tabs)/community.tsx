import { View, Text, ScrollView } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Community Stats Tab.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Header with "Community" title
 *    - Stats overview section (total members, active wallets, etc.)
 *      - Use StatCard grid (2 columns)
 *    - Leaderboard / top contributors list
 *      - Use ListItem components with rank, avatar, name, score
 *    - Community growth chart (optional, future)
 *
 * 2. Components needed:
 *    - Header (new: @/components/ui/Header)
 *    - StatCard (new: @/components/ui/StatCard)
 *    - ListItem (new: @/components/ui/ListItem)
 *    - Avatar (new: @/components/ui/Avatar)
 *    - Skeleton (new: @/components/ui/Skeleton) — for loading state
 *
 * 3. Data:
 *    - Community stats from API (useQuery with Orval-generated hook)
 *    - Pull-to-refresh support
 *
 * 4. Empty state:
 *    - Use EmptyState component when no data available
 */
export default function CommunityTab() {
  return (
    <Container safe>
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-6">Community Stats</Text>
        <Text className="text-text-secondary dark:text-dark-text-secondary">[Community stats placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
