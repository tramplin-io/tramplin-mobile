import { View, Text, ScrollView } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Container } from '@/components/ui/Container'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { AccountInfo } from '@/components/wallet/AccountInfo'
import { SignMessageForm } from '@/components/wallet/SignMessageForm'

/**
 * Home screen - wallet connection and actions.
 */
export default function HomeScreen() {
  const { account } = useMobileWallet()
  const isConnected = account !== undefined && account !== null

  return (
    <Container safe>
      <ScrollView contentContainerClassName="px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-extrabold text-text-primary dark:text-dark-text-primary mb-2 tracking-tight">
            Tramplin
          </Text>
          <Text className="text-base text-text-secondary dark:text-dark-text-secondary text-center">
            Solana Mobile Wallet powered by{' '}
            <Text className="text-primary font-semibold">Expo + Uniwind + @solana/kit</Text>
          </Text>
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
            <Text className="text-sm text-text-tertiary dark:text-dark-text-tertiary text-center max-w-xs">
              Connect your Solana wallet to view balance, sign messages, and interact with the blockchain.
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  )
}
