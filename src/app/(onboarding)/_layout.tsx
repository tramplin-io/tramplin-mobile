import { Stack } from 'expo-router'

/**
 * Onboarding flow layout — headerless stack.
 * Contains: splash, greeting stepper, welcome, manifesto.
 *
 * Users land here after first wallet connection.
 * On completion, onboarding state is saved and user is routed to (tabs)/.
 */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
}
