import { QueryClient } from '@tanstack/react-query'
import { setSentryApiSource } from '../sentry'
// import { useApiConfigStore } from '../stores/api-config-store'
import { useAuthStore } from '../stores/auth-store'
import { useProfileStore } from '../stores/profile-store'
import { setBaseURL } from './mutator/custom-instance'
import { tokenStore } from './token-store'
// import { storage, STORAGE_KEYS } from '@/utils/storage'

/**
 * React Query client with mobile-optimized defaults.
 *
 * - retry: 2 attempts before failing
 * - staleTime: 5 minutes (data considered fresh)
 * - gcTime: 10 minutes (garbage collection)
 *
 * Pattern from fem-fast-mobile.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

/**
 * Initialize the API layer on app startup.
 *
 * - Sets the base URL for Axios
 * - Restores auth token from storage
 *
 * Call this in the root layout before rendering the app.
 *
 * @returns Whether the user has a stored auth token
 */
export async function initializeApi() {
  // Set base URL from environment
  const apiUrl = process.env.EXPO_PUBLIC_API_URL
  if (apiUrl) {
    setBaseURL(apiUrl)
    setSentryApiSource(apiUrl)
  }

  // console.log('initializeApi - apiUrl', apiUrl)

  const { token, isAuthenticated, fetchSession } = useAuthStore.getState()

  const { fetchUserProfile } = useProfileStore.getState()

  // Restore auth token from persistent storage
  // const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN)
  // if (token) {
  //   tokenStore.setToken(token)
  //   return true
  // }

  // return false
  // If we have a token, set it and fetch the session
  if (token) {
    try {
      // Ensure token is properly formatted and set in tokenStore
      const cleanToken = token.trim()
      tokenStore.setToken(cleanToken)

      // Small delay to ensure token is properly set in interceptors
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Fetch session
      const session = await fetchSession()

      // If session has a userId, fetch the user profile
      if (session?.userId) {
        await fetchUserProfile()
      }
    } catch (error) {
      console.error('Failed to initialize session:', error)

      // If the token is invalid, clear the auth state
      useAuthStore.getState().logout()
    }
  }
}
