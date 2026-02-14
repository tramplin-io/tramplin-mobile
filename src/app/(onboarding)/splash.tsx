import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Animated Splash Screen — brand intro after native splash.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Full-screen centered Tramplin logo with animation
 *    - Brand gradient background (or solid dark-background)
 *    - Auto-transitions to greeting after 2-3 seconds
 *
 * 2. Behavior:
 *    - Play a Lottie animation or simple fade-in/scale animation
 *    - After animation completes → router.replace('/(onboarding)/greeting')
 *    - Use react-native-reanimated for smooth transitions
 *
 * 3. Dependencies (install when implementing):
 *    - lottie-react-native (for Lottie animations, optional)
 *    - react-native-reanimated (for custom animations)
 *
 * 4. Assets needed:
 *    - Brand logo in src/assets/images/ or src/assets/svg/
 *    - Optional: Lottie animation JSON in src/assets/
 */
export default function SplashAnimationScreen() {
  return (
    <Container safe centered>
      <View className="items-center">
        <Text className="text-5xl font-extrabold text-primary">Tramplin</Text>
        <Text className="text-base text-content-tertiary mt-2">Loading...</Text>
      </View>
    </Container>
  )
}
