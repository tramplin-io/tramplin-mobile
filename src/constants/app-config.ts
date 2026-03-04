import { createSolanaDevnet, createSolanaMainnet, createSolanaTestnet } from '@wallet-ui/react-native-kit'

/**
 * Get the Solana cluster based on the EXPO_PUBLIC_SOLANA_NETWORK env var.
 */
function getSolanaCluster() {
  const network = process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? 'devnet'
  const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL

  switch (network) {
    case 'mainnet-beta':
      return {
        cluster: createSolanaMainnet(rpcUrl || 'https://api.mainnet-beta.solana.com'),
        label: 'Mainnet',
      }
    case 'testnet':
      return {
        cluster: createSolanaTestnet(rpcUrl || undefined),
        label: 'Testnet',
      }
    case 'devnet':
    default:
      return {
        cluster: createSolanaDevnet(rpcUrl || undefined),
        label: 'Devnet',
      }
  }
}

const solanaNetwork = getSolanaCluster()

/**
 * Centralized app configuration.
 *
 * Reads from environment variables (EXPO_PUBLIC_*) set in .env file.
 * Follows the AppConfig pattern from the fem-fast and SKR example projects.
 */
export const AppConfig = {
  /** App display name */
  name: process.env.EXPO_PUBLIC_APP_NAME ?? 'Tramplin',

  /** App URI for wallet adapter identity */
  uri: process.env.EXPO_PUBLIC_APP_URI ?? 'https://tramplin.io',

  /** App icon path (matches app.config.ts); use EXPO_PUBLIC_APP_ICON for full URL in wallet identity */
  icon: process.env.EXPO_PUBLIC_APP_ICON ?? '/public/tramplin-logo.png',

  /** App scheme for deep linking */
  scheme: 'tramplin',

  /** API base URL */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',

  /** Solana network configuration */
  network: solanaNetwork,

  /** Solana network cluster */
  networkCluster: (process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta',

  /** Wallet adapter identity */
  get identity() {
    // name: 'Tramplin',
    // uri: 'tramplin://',
    // icon: 'https://tramplin.io/icon.png',
    return {
      name: AppConfig.name,
      uri: AppConfig.uri,
      icon: AppConfig.icon,
    }
  },
} as const
