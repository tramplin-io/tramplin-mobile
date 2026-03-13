import 'dotenv/config'

import type { ConfigContext, ExpoConfig } from 'expo/config'

import withAndroidBackupConfig from './plugins/withAndroidBackupConfig'
import withAndroidTelegramQueries from './plugins/withAndroidTelegramQueries'
import withCharlesProxy from './plugins/withCharlesProxy'

const enableCharlesProxy =
  process.env.EXPO_PUBLIC_ENABLE_CHARLES_PROXY === 'true' || process.env.ENABLE_CHARLES_PROXY === 'true'
// const disableAndroidBackup = process.env.EAS_BUILD_PROFILE !== 'production'

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
    package: 'io.tramplin.app',
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      // foregroundImage: './src/assets/images/adaptive-icon.png',
      // backgroundImage: './src/assets/images/splash.png',
      // backgroundColor: '#DABC58',
    },
    versionCode: 2,
  },
  ios: {
    bundleIdentifier: 'io.tramplin.app',
    supportsTablet: true,
    // icon: {
    //   foregroundImage: './src/assets/images/icon.png',
    //   backgroundColor: '#8682F7',
    // },
    buildNumber: '2',
  },
  web: {
    output: 'static' as const,
    favicon: './src/assets/images/favicon.png',
  },
  plugins: [
    // [withAndroidBackupConfig, { enabled: disableAndroidBackup }],
    withAndroidBackupConfig,
    withAndroidTelegramQueries,
    ...(enableCharlesProxy ? [[withCharlesProxy, { enabled: true }]] : []),
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
  ] as unknown as ExpoConfig['plugins'],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    referralsApiUrl: process.env.EXPO_PUBLIC_REFERRALS_API_URL,
    solanaNetwork: process.env.EXPO_PUBLIC_SOLANA_NETWORK ?? 'devnet',
    solanaRpcUrl: process.env.EXPO_PUBLIC_SOLANA_RPC_URL,
    eas: {
      projectId: '18858ee1-1db1-4d41-9a74-9d0f62e1716b',
    },
  },
})

export default defineConfig
