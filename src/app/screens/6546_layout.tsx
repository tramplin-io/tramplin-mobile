import { Stack } from 'expo-router'
import { Header } from '@/components/general'

function ScreensHeader() {
  return <Header variant="app" />
}

/**
 * Modal / stack screens layout — with back header.
 * Contains: edit-profile, notification-settings, contact-us, qna, terms, privacy, delete-account.
 */
export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ScreensHeader,
        // headerBackTitle: 'Back',
        animation: 'slide_from_right',
      }}
    />
  )
}
