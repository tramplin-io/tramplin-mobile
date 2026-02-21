import { Stack } from 'expo-router'
import { Header } from '@/components/general'

function ProfileHeader() {
  return <Header variant="app" />
}

/**
 * Profile flow layout — stack with Header (app variant).
 * Contains: profile page.
 *
 * Users land here after first wallet connection.
 */
export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        header: ProfileHeader,
        animation: 'fade',
      }}
    />
  )
}
