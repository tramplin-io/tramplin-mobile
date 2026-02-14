export { useTheme } from './useTheme'
export { useThemeStore } from './useThemeStore'
export { useWalletBalance } from './useWalletBalance'
export { useWalletActions } from './useWalletActions'
export { useCopyToClipboard } from './useCopyToClipboard'

/**
 * TODO (Phase 4 — State & Data): Create these new hooks/stores:
 *
 * useAuthStore.ts — Zustand + AsyncStorage persist
 *   - State: isAuthenticated, walletAddress, token
 *   - Actions: login(address, token), logout(), restoreSession()
 *   - Sync token with tokenStore (src/lib/api/token-store.ts)
 *   - On login: storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
 *   - On logout: storage.remove(AUTH_TOKEN), storage.remove(USER_DATA), tokenStore.clearToken()
 *
 * useProfileStore.ts — Zustand + AsyncStorage persist
 *   - State: displayName, avatarUrl, bio, walletAddress
 *   - Actions: setProfile(data), clearProfile()
 *   - Loaded from API after auth, cached locally
 *
 * useOnboardingStore.ts — Zustand + AsyncStorage persist
 *   - State: isComplete (boolean), completedAt (timestamp)
 *   - Actions: markComplete(), reset()
 *   - Checked in app entry to determine redirect
 *
 * useNetworkStatus.ts — hook (not a store)
 *   - Returns: { isConnected, isInternetReachable }
 *   - Uses: expo-network (install: npx expo install expo-network)
 *   - Triggers redirect to /no-internet when offline
 *
 * useNotifications.ts — hook
 *   - Returns: { hasPermission, requestPermission, expoPushToken }
 *   - Uses: expo-notifications (install: npx expo install expo-notifications)
 *   - Register push token with backend API
 *
 * After creating each, add to this barrel export.
 */
