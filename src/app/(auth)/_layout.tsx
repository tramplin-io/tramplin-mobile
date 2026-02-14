import { Stack } from 'expo-router'

/**
 * Auth flow layout — headerless stack.
 * Contains: sign-in (wallet-only auth).
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
}
