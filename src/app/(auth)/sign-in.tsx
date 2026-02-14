import { View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Sign-In Screen — Wallet-only authentication.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Tramplin logo/brand at top (use asset from src/assets/images/)
 *    - "Connect your wallet to get started" subtitle
 *    - ConnectButton component (centered, large)
 *    - "By connecting, you agree to our Terms" link at bottom
 *
 * 2. Behavior:
 *    - On successful wallet connect → check if onboarding complete
 *      - If NOT complete → router.replace('/(onboarding)/greeting')
 *      - If complete → router.replace('/(tabs)/')
 *    - Use useAuthStore to persist auth state
 *    - Use useMobileWallet() for wallet connection
 *
 * 3. Components needed:
 *    - ConnectButton (existing: @/components/wallet/ConnectButton)
 *    - Logo/brand image component
 *    - Link to terms screen
 *
 * 4. Guards:
 *    - If already authenticated → redirect to (tabs)/ immediately
 *    - Use <Redirect href="/(tabs)/" /> from expo-router
 */
export default function SignInScreen() {
  return (
    <Container safe centered>
      <View className="items-center px-8">
        <Text className="text-4xl font-extrabold text-text-primary dark:text-dark-text-primary mb-4">Tramplin</Text>
        <Text className="text-base text-text-secondary dark:text-dark-text-secondary text-center mb-12">
          Connect your Solana wallet to get started
        </Text>

        {/* TODO: Add ConnectButton with auth flow redirect */}
        <Text className="text-text-tertiary dark:text-dark-text-tertiary text-sm">
          [ConnectButton goes here]
        </Text>
      </View>
    </Container>
  )
}
