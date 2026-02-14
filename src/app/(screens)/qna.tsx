import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Questions & Answers Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Search bar at top (filter FAQ items)
 *    - Accordion list of Q&A items:
 *      - Question (title, tappable to expand)
 *      - Answer (body, shown when expanded)
 *    - Grouped by category (optional: General, Wallet, Community, etc.)
 *
 * 2. Components needed:
 *    - Accordion (new: @/components/ui/Accordion)
 *    - Input (new: @/components/ui/Input) — for search
 *    - EmptyState (new: @/components/ui/EmptyState) — "No results"
 *
 * 3. Data:
 *    - FAQ items from API (useQuery) or static content
 *    - Client-side search filtering
 *
 * 4. Behavior:
 *    - Expand/collapse on tap (only one open at a time, or multiple)
 *    - Smooth animated expand/collapse (react-native-reanimated)
 */
export default function QnaScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Questions & Answers' }} />
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-text-secondary dark:text-dark-text-secondary">[FAQ accordion placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
