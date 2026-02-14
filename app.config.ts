import 'dotenv/config'
import type { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * Expo app configuration (TypeScript).
 *
 * Uses dotenv to load environment variables from .env file.
 * Access env vars at runtime via `expo-constants`:
 *   Constants.expoConfig?.extra?.apiUrl
 *
 * @see https://docs.expo.dev/workflow/configuration/
 */
const defineConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME ?? 'Tramplin',
  slug: 'tramplin-mobile',
  scheme: 'tramplin',
  version: '1.0.0',
  orientation: 'default',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    package: 'com.tramplin',
  },
  ios: {
    bundleIdentifier: 'com.tramplin',
  },
  web: {
    output: 'static' as const,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        dark: {
          backgroundColor: '#0f172a',
        },
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    solanaNetwork: process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? 'devnet',
    solanaRpcUrl: process.env.EXPO_PUBLIC_SOLANA_RPC_URL,
    eas: {
      projectId: '',
    },
  },
})

export default defineConfig
