import '../global.css'

import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { MobileWalletProvider, createSolanaDevnet } from '@wallet-ui/react-native-kit'
import { APP_IDENTITY } from '@/constants/solana'

const cluster = createSolanaDevnet()

/**
 * Root layout component.
 *
 * Provides:
 * - SafeAreaProvider for safe area insets
 * - MobileWalletProvider for Solana wallet connectivity
 * - StatusBar with automatic theme adaptation
 */
export default function Layout() {
  return (
    <SafeAreaProvider>
      <MobileWalletProvider cluster={cluster} identity={APP_IDENTITY}>
        <StatusBar style="auto" />
        <Slot />
      </MobileWalletProvider>
    </SafeAreaProvider>
  )
}
