// import { useEffect } from 'react'
// import { useRouter } from 'expo-router'

// import SplashAnimationScreen from './splash'

// const Home = () => {
//   const router = useRouter()

//   useEffect(() => {
//     // Navigate to greeting after 2 seconds
//     const timer = setTimeout(() => {
//       router.replace('/greeting')
//     }, 2000)

//     return () => clearTimeout(timer)
//   }, [router])

//   return <SplashAnimationScreen />
// }

// export default Home
import { Redirect } from 'expo-router'

/**
 * App entry point — redirects to splash, then AuthGuard + splash handle flow.
 *
 * Flow: index → /splash/ (brand video) → splash replaces to /greeting/ after 2.5s
 *       → AuthGuard: unauthenticated stay on greeting, authenticated → /tabs/
 */
export default function EntryRedirect() {
  return <Redirect href="/splash/" />
}
