import { View, Text, ScrollView } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Container } from '@/components/ui/Container'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { AccountInfo } from '@/components/wallet/AccountInfo'
import { SignMessageForm } from '@/components/wallet/SignMessageForm'

/**
 * Profile Tab — user info + settings menu.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - User section at top:
 *      - Avatar (large)
 *      - Wallet address (ellipsified, copyable)
 *      - Username / label (if set)
 *    - Settings menu (ListItem rows, grouped):
 *      Group 1 — Account:
 *        - Edit Profile       → /(screens)/edit-profile
 *        - Notifications      → /(screens)/notification-settings
 *      Group 2 — Support:
 *        - Contact Us          → /(screens)/contact-us
 *        - Questions & Answers → /(screens)/qna
 *      Group 3 — Legal:
 *        - Terms of Use        → /(screens)/terms
 *        - Privacy Policy      → /(screens)/privacy
 *      Group 4 — Danger zone:
 *        - Delete My Account   → /(screens)/delete-account
 *        - Sign Out            → disconnect wallet + clear storage + redirect to (auth)/
 *    - App version at bottom (expo-constants)
 *
 * 2. Components needed:
 *    - Avatar (new: @/components/ui/Avatar)
 *    - ListItem (new: @/components/ui/ListItem) — with icon, title, chevron
 *    - Divider (new: @/components/ui/Divider)
 *    - Button (existing) — for Sign Out
 *
 * 3. Data:
 *    - Wallet address from useMobileWallet()
 *    - Profile data from useProfileStore
 *    - App version from expo-constants
 *
 * 4. Sign Out flow:
 *    - Show confirmation modal
 *    - Call disconnect() from useMobileWallet
 *    - Clear auth token, user data from storage
 *    - Reset all Zustand stores
 *    - router.replace('/(auth)/sign-in')
 */
export default function ProfileTab() {
  const { account } = useMobileWallet()
  const isConnected = account !== undefined && account !== null
  return (
    <Container safe>
      <ScrollView contentContainerClassName="px-6 py-8">
        <Text className="text-2xl font-bold text-content-primary mb-6">Profile</Text>
        <Text className="text-content-tertiary">[Profile & settings placeholder]</Text>
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-extrabold text-brand-secondary mb-2 tracking-tight">Tramplin</Text>
          <Text className="text-base text-content-tertiary text-center">
            Solana Mobile Wallet powered by{' '}
            <Text className="text-brand-primary font-semibold">Expo + Uniwind + @solana/kit</Text>
          </Text>
        </View>

        {/* Theme Switcher */}
        <View className="mb-6">
          <ThemeSwitcher />
        </View>

        {/* Wallet Connection */}
        <View className="mb-6">
          <ConnectButton />
        </View>

        {/* Account Info (shown when connected) */}
        {isConnected && (
          <View className="gap-4">
            <AccountInfo />
            <SignMessageForm />
          </View>
        )}

        {/* Getting started hint (shown when disconnected) */}
        {!isConnected && (
          <View className="items-center mt-8">
            <Text className="text-sm text-content-tertiary text-center max-w-xs">
              Connect your Solana wallet to view balance, sign messages, and interact with the blockchain.
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  )
}
