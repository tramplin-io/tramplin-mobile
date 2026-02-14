import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Greeting / Onboarding Stepper Screen.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout (3-step horizontal swipe stepper):
 *    Step 1 - "Welcome to Tramplin"
 *      - Hero illustration
 *      - Title + description text
 *    Step 2 - "How it works"
 *      - Feature highlight illustration
 *      - Explain core functionality (wallet, community, etc.)
 *    Step 3 - "Ready to start"
 *      - CTA illustration
 *      - "Get Started" button → navigate to welcome screen
 *
 * 2. Components needed:
 *    - Stepper / ProgressBar (new: @/components/ui/Stepper)
 *      - Dot indicators showing current step (1/3, 2/3, 3/3)
 *    - "Next" / "Skip" / "Get Started" buttons
 *    - ScrollView with horizontal paging or FlatList with snapToInterval
 *
 * 3. Behavior:
 *    - Swipe left/right to navigate between steps
 *    - "Skip" button on steps 1-2 → jump to step 3
 *    - "Get Started" on step 3 → router.replace('/(onboarding)/welcome')
 *    - Track step progress for analytics
 *
 * 4. Assets needed:
 *    - 3 onboarding illustrations (src/assets/images/ or src/assets/svg/)
 *
 * 5. Animations:
 *    - Smooth page transitions (react-native-reanimated or ScrollView paging)
 *    - Dot indicator animation on step change
 */
export default function GreetingScreen() {
  return (
    <Container safe centered>
      <View className="items-center px-8">
        <Text className="text-3xl font-bold text-content-primary mb-4">
          Welcome to Tramplin
        </Text>
        <Text className="text-base text-content-secondary text-center">
          [Onboarding stepper placeholder - 3 steps]
        </Text>
      </View>
    </Container>
  )
}
