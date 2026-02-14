import { View, Text, ScrollView } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Manifesto Screen — brand mission statement.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Header with "Our Manifesto" title
 *    - ScrollView with styled manifesto text
 *    - Brand imagery / illustrations between paragraphs
 *    - "I'm In" or "Continue" button at bottom
 *
 * 2. Content:
 *    - Tramplin's mission, vision, values
 *    - Use styled typography (large quotes, bold headings, body text)
 *    - Consider parallax or subtle scroll animations
 *
 * 3. Components needed:
 *    - Header (new: @/components/ui/Header) — with back button
 *    - Button (existing)
 *    - Styled text blocks (use Tailwind typography classes)
 *
 * 4. Behavior:
 *    - Optional: can be accessed later from Profile/About
 *    - "Continue" → navigate to welcome or (tabs)/
 */
export default function ManifestoScreen() {
  return (
    <Container safe>
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-6">Our Manifesto</Text>
        <Text className="text-base text-text-secondary dark:text-dark-text-secondary leading-relaxed">
          [Manifesto content placeholder]
        </Text>
      </ScrollView>
    </Container>
  )
}
