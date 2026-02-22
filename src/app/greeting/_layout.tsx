import { Stack } from 'expo-router'
// import { HeaderGrating } from '@/components/general'

// function OnboardingHeader() {
//   return <HeaderGrating />
// }

/**
 * Greeting flow layout — stack with Header (greeting variant).
 * Contains: splash, greeting stepper, manifesto.
 *
 * Users land here after first wallet connection.
 * On completion, greeting state is saved and user is routed to tabs.
 */
export default function GreetingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // header: OnboardingHeader,
        animation: 'slide_from_right',
        // headerStyle: {
        //   backgroundColor: '#f4511e',
        // },
        // headerTintColor: '#fff',
        // headerTitleStyle: {
        //   fontWeight: 'bold',
        // },
      }}
    />
  )
}
