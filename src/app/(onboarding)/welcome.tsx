import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Welcome / Welcome Back Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - User avatar (from wallet or placeholder)
 *    - "Welcome to Tramplin, [name]!" (first time)
 *      OR "Welcome back, [name]!" (returning user)
 *    - Brief motivational text or community stats teaser
 *    - "Continue" button → mark onboarding complete, navigate to (tabs)/
 *
 * 2. Components needed:
 *    - Avatar (new: @/components/ui/Avatar)
 *    - Button (existing)
 *
 * 3. Behavior:
 *    - Determine if first-time or returning user (from useOnboardingStore)
 *    - On "Continue" press:
 *      - Call useOnboardingStore.markComplete()
 *      - router.replace('/(tabs)/')
 *
 * 4. Data:
 *    - User wallet address (from useMobileWallet)
 *    - User profile (from useProfileStore, if available)
 */
export default function WelcomeScreen() {
  return (
    <Container safe centered>
      <View className="items-center px-8">
        <Text className="text-3xl font-bold text-content-primary mb-4">
          Welcome to Tramplin!
        </Text>
        <Text className="text-base text-content-secondary text-center">
          [Welcome screen placeholder]
        </Text>
      </View>
    </Container>
  )
}
