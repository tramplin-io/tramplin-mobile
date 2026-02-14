import { View, Text, ScrollView } from 'react-native'
import { Stack } from 'expo-router'
import { Container } from '@/components/ui/Container'

/**
 * Edit Profile Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Avatar with "Change photo" tap area
 *    - Form fields:
 *      - Display name (Input)
 *      - Bio / about (TextArea)
 *      - Wallet address (read-only, copyable)
 *    - "Save Changes" button (bottom, sticky)
 *
 * 2. Components needed:
 *    - Avatar (new: @/components/ui/Avatar)
 *    - Input (new: @/components/ui/Input)
 *    - Button (existing)
 *
 * 3. Behavior:
 *    - Load current profile from useProfileStore
 *    - On save → API mutation (Orval) + update local store
 *    - Show toast on success/error
 *    - Disable save button if no changes
 */
export default function EditProfileScreen() {
  return (
    <Container safe={false}>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-text-secondary dark:text-dark-text-secondary">[Edit profile form placeholder]</Text>
      </ScrollView>
    </Container>
  )
}
