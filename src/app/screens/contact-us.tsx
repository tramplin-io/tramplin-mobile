import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Contact Us Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Subject dropdown or input
 *    - Message text area
 *    - Email input (pre-filled if available)
 *    - "Send" button
 *    - Optional: link to Discord/Telegram community
 *
 * 2. Components needed:
 *    - Input (new: @/components/ui/Input)
 *    - Button (existing)
 *
 * 3. Behavior:
 *    - On submit → API mutation or mailto: link
 *    - Form validation (required fields)
 *    - Toast on success: "Message sent!"
 */
export default function ContactUsScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Contact Us' }} />
      <ScrollView contentContainerClassName="px-6 py-8" showsVerticalScrollIndicator={false}>
        <Text className="text-content-secondary">[Contact form placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
