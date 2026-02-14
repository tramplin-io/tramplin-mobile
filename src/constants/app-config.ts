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
  uri: process.env.EXPO_PUBLIC_APP_URI ?? 'https://github.com/beeman/tramplin-mobile',

  /** App scheme for deep linking */
  scheme: 'tramplin',

  /** API base URL */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',

  /** Solana network configuration */
  network: solanaNetwork,

  /** Wallet adapter identity */
  get identity() {
    return {
      name: AppConfig.name,
      uri: AppConfig.uri,
    }
  },
} as const
