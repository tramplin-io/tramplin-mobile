import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView, Button as RNButton, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Container } from '@/components/ui/Container'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { AccountInfo } from '@/components/wallet/AccountInfo'
import { SignMessageForm } from '@/components/wallet/SignMessageForm'
import { Switch } from '@/components/ui/switch'
import { Toast } from 'react-native-toast-message/lib/src/Toast'
import { Button } from '@/components/ui'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useProfileStore } from '@/lib/stores/profile-store'
import { useSystemPushPermission } from '@/lib/notifications/hooks'
import { getExpoPushToken } from '@/lib/notifications/utils'
import { BackButton } from '@/components/general/BackButton'
import { Text } from '@/components/ui/text'

/**
 * Profile Tab — user info + settings menu.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - User section at top:
 *      - Avatar (large)
 *      - Wallet address (ellipsified, copyable)
 *      - Username / label (if set)
 *    - Settings menu (ListItem rows, grouped):
 *      Group 1 — Account:
 *        - Edit Profile       → /screens/edit-profile
 *        - Notifications      → /screens/notification-settings
 *      Group 2 — Support:
 *        - Contact Us          → /screens/contact-us
 *        - Questions & Answers → /screens/qna
 *      Group 3 — Legal:
 *        - Terms of Use        → /screens/terms
 *        - Privacy Policy      → /screens/privacy
 *      Group 4 — Danger zone:
 *        - Delete My Account   → /screens/delete-account
 *        - Sign Out            → disconnect wallet + clear storage + redirect to auth
 *    - App version at bottom (expo-constants)
 *
 * 2. Components needed:
 *    - Avatar (new: @/components/ui/Avatar)
 *    - ListItem (new: @/components/ui/ListItem) — with icon, title, chevron
 *    - Divider (new: @/components/ui/Divider)
 *    - Button (existing) — for Sign Out
 *
 * 3. Data:
 *    - Wallet address from useMobileWallet()
 *    - Profile data from useProfileStore
 *    - App version from expo-constants
 *
 * 4. Sign Out flow:
 *    - Show confirmation modal
 *    - Call disconnect() from useMobileWallet
 *    - Clear auth token, user data from storage
 *    - Reset all Zustand stores
 *    - router.replace('/auth/sign-in')
 */
export default function ProfileTab() {
  const { account } = useMobileWallet()
  const isConnected = account !== undefined && account !== null
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const {
    userProfile,
    fetchUserProfile,
    createDeviceToken,
    deleteDeviceToken,
    updateUserProfile,
    initialDeviceToken,
    isLoading: isProfileLoading,
  } = useProfileStore()
  const { registerForPushNotifications } = useSystemPushPermission()
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile()
    }
  }, [isAuthenticated, fetchUserProfile])

  const isNotificationsOn = userProfile?.isPushNotificationsOn ?? false

  const handleNotificationsToggle = useCallback(
    async (checked: boolean) => {
      if (isTogglingNotifications) return
      setIsTogglingNotifications(true)
      try {
        if (checked) {
          const token = await registerForPushNotifications()
          if (!token) {
            Toast.show({
              type: 'error',
              text1: 'Permission needed',
              text2: 'Enable notifications in system settings to receive push notifications.',
            })
            return
          }
          const created = await createDeviceToken(token)
          if (!created) {
            Toast.show({ type: 'error', text1: 'Could not enable notifications' })
            return
          }
          await updateUserProfile({ isPushNotificationsOn: true })
          Toast.show({ type: 'success', text1: 'Notifications enabled' })
        } else {
          const tokenToDelete = initialDeviceToken ?? (await getExpoPushToken())
          if (tokenToDelete) {
            await deleteDeviceToken(tokenToDelete)
          }
          await updateUserProfile({ isPushNotificationsOn: false })
          Toast.show({ type: 'success', text1: 'Notifications disabled' })
        }
      } catch (e) {
        console.error('Notifications toggle error:', e)
        Toast.show({ type: 'error', text1: 'Something went wrong' })
      } finally {
        setIsTogglingNotifications(false)
      }
    },
    [
      isTogglingNotifications,
      registerForPushNotifications,
      createDeviceToken,
      deleteDeviceToken,
      updateUserProfile,
      initialDeviceToken,
    ],
  )

  return (
    <Container safe={false}>
      <View className="flex-row items-center justify-between mb-4 mt-4 px-4">
        <BackButton onPress={() => router.back()} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          DEV PAGE
        </Text>
      </View>
      <ScrollView contentContainerClassName="px-6 pt-2 pb-20" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl font-extrabold text-brand-secondary mb-2 tracking-tight">Tramplin</Text>
          <Text className="text-base text-content-tertiary text-center">
            Solana Mobile Wallet powered by{' '}
            <Text className="text-brand-primary font-semibold">Expo + Uniwind + @solana/kit</Text>
          </Text>
        </View>

        {/* Theme Switcher */}
        <View className="mb-6">
          <ThemeSwitcher />
        </View>

        {/* Notifications toggle (when authenticated) */}
        {isAuthenticated && (
          <View className="mb-6 flex-row items-center justify-between rounded-lg bg-fill-secondary p-4">
            <Text className="text-content-primary text-base">Notifications</Text>
            <Switch
              checked={isNotificationsOn}
              onCheckedChange={handleNotificationsToggle}
              disabled={isProfileLoading || isTogglingNotifications}
            />
          </View>
        )}

        {/* Wallet Connection */}
        <View className="mb-6">
          <ConnectButton />
        </View>

        {/* Account Info (shown when connected) */}
        {isConnected && (
          <View className="gap-4">
            <AccountInfo />
            <SignMessageForm />
          </View>
        )}

        {/* Getting started hint (shown when disconnected) */}
        {!isConnected && (
          <View className="items-center mt-8">
            <Text className="text-sm text-content-tertiary text-center max-w-xs">
              Connect your Solana wallet to view balance, sign messages, and interact with the blockchain.
            </Text>
          </View>
        )}

        {/* Toast Test */}
        <View className="mt-8 gap-2">
          <Button
            variant="default"
            size="sm"
            onPress={() => {
              Toast.show({
                type: 'success',
                text1: 'Success!',
              })
            }}
            className="w-1/2"
          >
            <Text>Show Success Toast</Text>
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={() => {
              Toast.show({
                type: 'warning',
                text1: 'Warning!',
              })
            }}
            className="w-1/2"
          >
            <Text>Show Warning Toast</Text>
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={() => {
              Toast.show({
                type: 'error',
                text1: 'Error!',
              })
            }}
            className="w-1/2"
          >
            <Text>Show Error Toast</Text>
          </Button>
        </View>
        {/* Toast Test */}
        <View style={styles.container}>
          <Text>Haptics.selectionAsync</Text>
          <View style={styles.buttonContainer}>
            <RNButton title="Selection" onPress={() => Haptics.selectionAsync()} />
          </View>
          <Text>Haptics.notificationAsync</Text>

          <View className="mt-8 gap-2">
            <RNButton
              title="Success"
              onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            />
            <RNButton title="Error" onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)} />
            <RNButton
              title="Warning"
              onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)}
            />
          </View>

          <Text>Haptics.impactAsync</Text>
          <View className="mt-8 gap-2">
            <RNButton title="Light" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
            <RNButton title="Medium" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} />
            <RNButton title="Heavy" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)} />
            <RNButton title="Rigid" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)} />
            <RNButton title="Soft" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)} />
          </View>

          <Text>Haptics.AndroidHaptics</Text>
          <View className="mt-8 gap-2">
            <RNButton
              title="Clock_Tick"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick)}
            />
            <RNButton
              title="Confirm"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)}
            />
            <RNButton
              title="Context_Click"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click)}
            />
            <RNButton
              title="Drag_Start"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Drag_Start)}
            />
            <RNButton
              title="Gesture_End"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_End)}
            />
            <RNButton
              title="Gesture_Start"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_Start)}
            />
            <RNButton
              title="Keyboard_Press"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Keyboard_Press)}
            />
            <RNButton
              title="Virtual_Key"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)}
            />
            <RNButton
              title="Reject"
              onPress={() => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject)}
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 10,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
})
