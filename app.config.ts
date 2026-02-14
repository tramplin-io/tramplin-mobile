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
  version: '0.0.1',
  orientation: 'portrait', //'default',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  icon: './src/assets/images/icon.png',
  splash: {
    image: './src/assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  // updates: {
  //   url: 'https://u.expo.dev/example',
  // },
  // runtimeVersion: {
  //   policy: 'appVersion',
  // },

  android: {
    package: 'com.tramplin',
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  ios: {
    bundleIdentifier: 'com.tramplin',
    supportsTablet: true,
    // icon: {
    //   foregroundImage: './src/assets/images/icon.png',
    //   backgroundColor: '#ffffff',
    // },
  },
  web: {
    output: 'static' as const,
    favicon: './src/assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        image: './src/assets/images/splash.png',
        // imageWidth: 200,
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
