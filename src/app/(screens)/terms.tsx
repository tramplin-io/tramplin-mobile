import { Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Terms of Use Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - ScrollView with styled legal text
 *    - Sections with headings (bold) and body text
 *    - Last updated date at top
 *
 * 2. Data:
 *    - Static content (hardcoded) or fetched from API/CMS
 *    - Consider using markdown renderer for rich content
 *
 * 3. Optional: WebView loading a hosted terms page
 */
export default function TermsScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Terms of Use' }} />
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-text-secondary dark:text-dark-text-secondary">[Terms of Use content placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
