import { Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Privacy Policy Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - ScrollView with styled legal text
 *    - Sections with headings and body text
 *    - Last updated date at top
 *
 * 2. Data:
 *    - Static content or fetched from API/CMS
 *    - Consider using markdown renderer
 *
 * 3. Optional: WebView loading a hosted privacy page
 */
export default function PrivacyScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-content-secondary">
          [Privacy Policy content placeholder]
        </Text>
      </ScrollView>
    </Container>
  )
}
