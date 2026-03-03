import { Stack } from 'expo-router'

/**
 * Splash flow layout — stack with full screen modal.
 */
export default function SplashLayout() {
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
