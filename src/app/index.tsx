import { Redirect } from 'expo-router'

/**
 * App entry point — redirects to the appropriate flow.
 *
 * TODO (Phase 5 — Navigation Guards):
 * ─────────────────────────────────────
 * Replace this simple redirect with auth guard logic:
 *
 * 1. Read auth state from useAuthStore:
 *    - const { isAuthenticated } = useAuthStore()
 *    - const { isComplete } = useOnboardingStore()
 *
 * 2. Redirect based on state:
 *    - NOT authenticated       → <Redirect href="/(auth)/sign-in" />
 *    - Authenticated + no onb  → <Redirect href="/(onboarding)/greeting" />
 *    - Authenticated + onb ok  → <Redirect href="/(tabs)/" />
 *
 * 3. Handle edge cases:
 *    - No internet → <Redirect href="/no-internet" />
 *    - Loading state → return null (splash screen still visible)
 *
 * For now, redirect to tabs while auth is not implemented.
 */
export default function EntryRedirect() {
  return <Redirect href="/(tabs)/" />
}
