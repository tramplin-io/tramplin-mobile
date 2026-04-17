import * as Application from 'expo-application'

const APP_VERSION: string = Application.nativeApplicationVersion || '1.0.0'
const BUILD_NUMBER: number = Number.parseInt(Application.nativeBuildVersion || '1', 10) || 1

// const PRIVACY_POLICY_URL: string = ''
// const TERMS_OF_USE_URL: string = ''

// const CONTACT_US_EMAIL: string = 'support@tramplin.io'

const ITUNES_ITEM_ID: number = 6 // App ID for iOS
const ANDROID_PACKAGE_NAME: string = 'io.tramplin.app' // Package name for Android

// App Store URLs for force update
const IOS_APP_STORE_URL: string =
  process.env.EXPO_PUBLIC_IOS_APP_STORE_URL || `itms-apps://itunes.apple.com/app/id${ITUNES_ITEM_ID}`
const ANDROID_APP_STORE_URL: string =
  process.env.EXPO_PUBLIC_ANDROID_APP_STORE_URL ||
  `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`

const SOLANA_APP_STORE_URL: string =
  process.env.EXPO_PUBLIC_SOLANA_APP_STORE_URL || `solanadappstore://details?id=${ANDROID_PACKAGE_NAME}`

const API_URLS = {
  PROD: process.env.EXPO_PUBLIC_API_URL || 'https://api.tramplin.io/api',
  DEV: process.env.EXPO_PUBLIC_API_URL || 'https://develop-api.tramplin.io/api',
  PROD_REFERRALS: process.env.EXPO_PUBLIC_REFERRALS_API_URL || 'https://referrals-api.tramplin.io/api',
  DEV_REFERRALS: process.env.EXPO_PUBLIC_REFERRALS_API_URL || 'https://develop-referrals-api.tramplin.io/api',
} as const

const DEV_TOOLS_ENABLED: boolean = process.env.EXPO_PUBLIC_DEV_TOOLS_ENABLED === 'true'

export {
  APP_VERSION,
  BUILD_NUMBER,
  DEV_TOOLS_ENABLED,
  // PRIVACY_POLICY_URL,
  // TERMS_OF_USE_URL,
  // CONTACT_US_EMAIL,
  ITUNES_ITEM_ID,
  ANDROID_PACKAGE_NAME,
  IOS_APP_STORE_URL,
  ANDROID_APP_STORE_URL,
  SOLANA_APP_STORE_URL,
  API_URLS,
}
