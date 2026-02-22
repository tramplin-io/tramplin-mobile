import { View, Text, ScrollView } from 'react-native'
import { router, Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'
import { BackButton } from '@/components/general/BackButton'

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
  const handleBack = () => {
    router.push('/profile')
  }
  return (
    <Container safe={false} className="bg-fill-primary">
      <View className="flex-row items-center justify-between mb-4 mt-4 px-4">
        <BackButton onPress={handleBack} className={'mb-0 z-10'} />
        <Text className="text-h4 text-center text-content-primary w-full -ml-10">Notifications</Text>
      </View>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScrollView contentContainerClassName="px-6 py-8" showsVerticalScrollIndicator={false}>
        <Text className="text-content-secondary">[Notification settings placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
