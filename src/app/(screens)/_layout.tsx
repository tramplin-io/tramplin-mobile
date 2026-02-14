import { Stack } from 'expo-router'

/**
 * Modal / stack screens layout — with back header.
 * Contains: edit-profile, notification-settings, contact-us, qna, terms, privacy, delete-account.
 */
export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
      }}
    />
  )
}
