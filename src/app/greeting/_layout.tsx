import { Stack } from 'expo-router'

/**
 * Greeting flow layout — stack with Header (greeting variant).
 * Contains: splash, greeting stepper, manifesto.
 *
 * Users land here after first wallet connection.
 * On completion, greeting state is saved and user is routed to tabs.
 */
export default function GreetingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'fullScreenModal',
        animation: 'fade',
      }}
    />
  )
}
