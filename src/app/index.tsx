// import { useRouter } from 'expo-router'
// import { useEffect } from 'react'
// import SplashScreen from '@/app/onboarding/splash'

// const Home = () => {
//   const router = useRouter()

//   useEffect(() => {
//     // Navigate to greeting after 2 seconds
//     const timer = setTimeout(() => {
//       router.replace('/greeting')
//     }, 2000)

//     return () => clearTimeout(timer)
//   }, [router])

//   return <SplashScreen />
// }

// export default Home
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
 *    - NOT authenticated       → <Redirect href="/auth/sign-in" />
 *    - Authenticated + no onb  → <Redirect href="/greeting/" />
 *    - Authenticated + onb ok  → <Redirect href="/tabs/" />
 *
 * 3. Handle edge cases:
 *    - No internet → <Redirect href="/no-internet" />
 *    - Loading state → return null (splash screen still visible)
 *
 * For now, redirect to tabs while auth is not implemented.
 */
export default function EntryRedirect() {
  return <Redirect href="/tabs/" />
}
