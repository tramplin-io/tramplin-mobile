import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Delete Account & Revoke Consent Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Warning icon / illustration at top
 *    - Explanation text: what happens when you delete
 *      - "Your account and all associated data will be permanently deleted"
 *      - "This action cannot be undone"
 *    - Checklist of what gets deleted (ListItem with check icons)
 *    - Confirmation input: type "DELETE" to confirm
 *    - "Delete My Account" danger button (disabled until confirmation typed)
 *
 * 2. Components needed:
 *    - Input (new: @/components/ui/Input)
 *    - Button (existing, variant="danger")
 *    - Modal (new: @/components/ui/Modal) — final confirmation dialog
 *    - ListItem (new: @/components/ui/ListItem)
 *
 * 3. Behavior:
 *    - Require typing "DELETE" to enable the button
 *    - On press → show Modal: "Are you absolutely sure?"
 *    - On confirm → API mutation to delete account
 *    - Clear all local storage (storage.clear())
 *    - Disconnect wallet
 *    - Navigate to (auth)/sign-in
 *    - Toast: "Account deleted"
 */
export default function DeleteAccountScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Delete My Account' }} />
      <ScrollView contentContainerClassName="px-6 py-8">
        <View className="items-center mb-6">
          <Text className="text-3xl mb-2">⚠️</Text>
          <Text className="text-xl font-bold text-error mb-2">Delete Account</Text>
          <Text className="text-content-secondary text-center">
            [Delete account flow placeholder]
          </Text>
        </View>
      </ScrollView>
    </Container>
  )
}
