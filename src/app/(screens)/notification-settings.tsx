import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Notification Settings Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Section: Push Notifications
 *      - Master toggle (Switch)
 *      - Sub-toggles: Community updates, Transaction alerts, Announcements
 *    - Section: Email Notifications
 *      - Master toggle (Switch)
 *      - Sub-toggles: Weekly digest, Product updates, Marketing
 *    - System permission status (if push denied, show link to Settings)
 *
 * 2. Components needed:
 *    - Switch (new: @/components/ui/Switch)
 *    - ListItem (new: @/components/ui/ListItem)
 *    - Divider (new: @/components/ui/Divider)
 *
 * 3. Behavior:
 *    - Load preferences from API or local store
 *    - On toggle → API mutation to update preference
 *    - Check system push permission (expo-notifications)
 *    - If denied → show "Enable in Settings" button (Linking.openSettings)
 */
export default function NotificationSettingsScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-content-secondary">
          [Notification settings placeholder]
        </Text>
      </ScrollView>
    </Container>
  )
}
