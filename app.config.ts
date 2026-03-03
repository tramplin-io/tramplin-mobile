import 'dotenv/config'

import type { ConfigContext, ExpoConfig } from 'expo/config'

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
    image: './src/assets/images/adaptive-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#B8B6FF',
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
      // foregroundImage: './src/assets/images/adaptive-icon.png',
      // backgroundImage: './src/assets/images/splash.png',
      // backgroundColor: '#DABC58',
    },
  },
  ios: {
    bundleIdentifier: 'com.tramplin',
    supportsTablet: true,
    // icon: {
    //   foregroundImage: './src/assets/images/icon.png',
    //   backgroundColor: '#8682F7',
    // },
  },
  web: {
    output: 'static' as const,
    favicon: './src/assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    // [
    //   'expo-splash-screen',
    //   {
    //     backgroundColor: '#8682F7',
    //     image: './src/assets/images/splash.png',
    //     imageWidth: 200, //'100%',
    //     // imageHeight: '100%',
    //     resizeMode: 'contain',
    //     // dark: {
    //     //   backgroundColor: '#9F9CF9',
    //     // },
    //   },
    // ],
    [
      'expo-font',
      {
        fonts: [
          './src/assets/fonts/fh-lecturis/FHLecturisRounded-Regular.otf',
          './src/assets/fonts/GT-Standard-L-Standard-Regular.ttf',
          './src/assets/fonts/GT-Standard-L-Standard-Bold.ttf',
          './src/assets/fonts/GT-Standard-M-Standard-Regular.ttf',
          './src/assets/fonts/GT-Standard-M-Standard-Bold.ttf',
        ],
      },
    ],
    [
      'expo-video',
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      'expo-notifications',
      {
        defaultChannel: 'default',
        // icon: './local/assets/notification_icon.png',
        // color: '#ffffff',
        // sounds: ['./local/assets/notification_sound.wav', './local/assets/notification_sound_other.wav'],
        // enableBackgroundRemoteNotifications: false,
      },
    ],
    // [
    //   'expo-navigation-bar',
    //   {
    //     backgroundColor: '#00000000',
    //     position: 'absolute',
    //   },
    // ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    solanaNetwork: process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? 'devnet',
    solanaRpcUrl: process.env.EXPO_PUBLIC_SOLANA_RPC_URL,
    eas: {
      projectId: '18858ee1-1db1-4d41-9a74-9d0f62e1716b',
    },
  },
})

export default defineConfig
