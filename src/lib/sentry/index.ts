import * as Sentry from '@sentry/react-native'

import { API_URLS } from '@/constants/appConstants'

import { useAuthStore } from '../stores/auth-store'

export type ApiSource = 'production' | 'development' | 'custom'

// Helper function to determine API source based on URL
const getApiSourceFromUrl = (url: string | undefined): ApiSource => {
  if (!url || url === API_URLS.PROD) return 'production'
  if (url === API_URLS.DEV) return 'development'
  return 'custom'
}

export const initSentry = (): void => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, // Use env variable for DSN
    enableNative: true, // Enables native crash reporting (iOS + Android)
    enableAutoSessionTracking: true, // Tracks sessions (helps with crash-free metrics)
    enableNativeCrashHandling: true, // Handles native crashes (iOS + Android)
    enableNativeNagger: true, // Shows native nagger (iOS + Android)
    enableAutoPerformanceTracing: true, // Enables auto performance tracing
    sendDefaultPii: true, // Sends default personally identifiable information (PII), user info, IP address, etc
    tracesSampleRate: 1.0, // Sample rate for traces (1.0 = 100% of traces)
    profilesSampleRate: 1.0, // Sample rate for profiles (1.0 = 100% of profiles)
    debug: __DEV__, // Log debug info in dev
    // environment: __DEV__ ? 'development' : 'production', // Set environment (development or production)
    integrations: [Sentry.reactNativeTracingIntegration()],
  })
  console.log('Sentry initialized')
  setSentryUser()
}

export const setSentryUser = (): void => {
  const { session } = useAuthStore.getState()

  const userId = session?.userId

  if (!userId) {
    console.warn('Sentry: user ID is not set')
    return
  }

  const user = {
    id: userId,
  }

  Sentry.setUser(user)
  console.log('Sentry user set:', user)
}

export const clearSentryUser = (): void => {
  Sentry.setUser(null)
}

// Send error to Sentry
export const captureSentryException = (error: unknown, context?: Record<string, unknown>): void => {
  Sentry.captureException(error, { extra: context })
}

// Send info to Sentry
export const captureSentryMessage = (message: string, context?: Record<string, unknown>): void => {
  Sentry.captureMessage(message, { extra: context })
}

// Set the API source to Sentry
export function setSentryApiSource(apiUrl: string | undefined): void {
  Sentry.setTag('apiSourceUrl', apiUrl)
  Sentry.setTag('apiSource', getApiSourceFromUrl(apiUrl))
}
