import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { BigCupIcon, ImportantIcon, PointsIcon } from '@/components/icons/icons'
import { Button } from '@/components/ui'
import { InputRow } from '@/components/ui/InputRow'
import { Text } from '@/components/ui/text'
import { TELEGRAM_BOT_NAME } from '@/constants/profile'
import type { NotificationType } from '@/lib/api/generated/restApi.schemas'
import { useProfileStore } from '@/lib/stores/profile-store'
import { cn } from '@/lib/utils'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DISCORD_ID_REGEX = /^[^\s]{2,32}$/

function validateEmail(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return EMAIL_REGEX.test(trimmed) ? null : 'Enter a valid email address'
}

function validateDiscordId(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return DISCORD_ID_REGEX.test(trimmed) ? null : '2–32 characters, no spaces'
}

function SegmentButton({
  label,
  icon: Icon,
  isSelected,
  onPress,
}: Readonly<{
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  isSelected: boolean
  onPress: () => void
}>) {
  return (
    <Button
      variant="tertiary"
      size="xl"
      onPress={onPress}
      className={cn(
        'px-3 gap-0 flex-1 shadow-[0_0_3px_0_var(--border-quaternary,#FFF)]',
        isSelected && 'ring-1 ring-content-primary bg-fill-tertiary shadow-none',
      )}
    >
      <Icon size={24} />
      <Text variant="body" className={isSelected ? 'text-content-primary' : 'text-content-tertiary'}>
        {label}
      </Text>
    </Button>
  )
}

export default function SubscriptionScreen() {
  const { userProfile, fetchUserProfile, updateUserProfile } = useProfileStore()
  const [email, setEmail] = useState('')
  const [discordId, setDiscordId] = useState('')
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>(['product'])
  const [isSaving, setIsSaving] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [discordError, setDiscordError] = useState<string | null>(null)

  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  useEffect(() => {
    void fetchUserProfile()
  }, [fetchUserProfile])

  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.email ?? '')
      setDiscordId(userProfile.discordId ?? '')
      setNotificationTypes(userProfile.notificationTypes?.length ? userProfile.notificationTypes : ['product'])
    }
  }, [userProfile])

  const handleBack = useCallback(() => {
    router.back()
  }, [])

  const handleCategoryPress = useCallback((category: NotificationType) => {
    setNotificationTypes((prev) => {
      const isSelected = prev.includes(category)
      if (isSelected) {
        const next = prev.filter((c) => c !== category)
        return next.length > 0 ? next : prev
      }
      return [...prev, category]
    })
  }, [])

  const handleTelegramPress = useCallback(() => {
    if (!TELEGRAM_BOT_NAME || !userProfile?.tgAuthCode) {
      Toast.show({ type: 'error', text1: 'Telegram connection is unavailable' })
      return
    }

    const startParam = encodeURIComponent(userProfile.tgAuthCode)
    const appUrl = `tg://resolve?domain=${TELEGRAM_BOT_NAME}&start=${startParam}`
    const webUrl = `https://t.me/${TELEGRAM_BOT_NAME}?start=${startParam}`

    Linking.canOpenURL(appUrl)
      .then((supported) => {
        const target = supported ? appUrl : webUrl
        return Linking.openURL(target)
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Could not open Telegram' })
      })

    setTimeout(() => {
      void fetchUserProfile()
    }, 5000)
  }, [userProfile, fetchUserProfile])

  const handleSave = useCallback(async () => {
    const trimmedEmail = email.trim()
    const trimmedDiscord = discordId.trim()

    const eErr = validateEmail(email)
    const dErr = validateDiscordId(discordId)
    setEmailError(eErr)
    setDiscordError(dErr)

    if (!trimmedEmail && !trimmedDiscord) {
      const message = 'Enter email or Discord'
      setEmailError(message)
      setDiscordError(message)

      return
    }

    if (eErr ?? dErr) return

    setIsSaving(true)
    const ok = await updateUserProfile({
      notificationTypes,
      email: trimmedEmail || undefined,
      discordId: trimmedDiscord || undefined,
      isEmailNotificationsOn: true,
    })
    setIsSaving(false)
    if (ok) {
      Toast.show({ type: 'success', text1: 'Subscription saved' })
    } else {
      Toast.show({ type: 'error', text1: 'Could not save subscription' })
    }
  }, [notificationTypes, email, discordId, updateUserProfile])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScreenWrapper>
        <View className="flex-row items-center justify-between mb-2 mt-2 px-4">
          <BackButton onPress={handleBack} className="mb-0 z-10" />
          <Text variant="h4" className="text-center w-full -ml-10">
            Subscription
          </Text>
        </View>
        <LinearGradient
          colors={[fillPrimary, fillFade]}
          locations={[0, 1]}
          className="w-full h-10 z-10"
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            height: 32,
          }}
        />
        <Stack.Screen options={{ title: 'Subscription' }} />
        <ScrollView contentContainerClassName="px-4 py-8" showsVerticalScrollIndicator={false}>
          <View className="gap-6">
            <View className="gap-4">
              <InputRow
                label="EMAIL"
                value={email}
                placeholder="johndoe@gmail.com"
                error={emailError}
                onChangeText={(text) => {
                  setEmail(text)
                  if (emailError) setEmailError(validateEmail(text))
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <InputRow
                label="DISCORD"
                value={discordId}
                placeholder="user_name"
                error={discordError}
                onChangeText={(text) => {
                  setDiscordId(text)
                  if (discordError) setDiscordError(validateDiscordId(text))
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={handleTelegramPress}>
                <InputRow
                  label="TELEGRAM"
                  value={userProfile?.telegramUsername ?? ''}
                  placeholder="Press to connect"
                  editable={false}
                  onChangeText={undefined}
                />
              </Pressable>
            </View>

            <View className="flex-row gap-1">
              <SegmentButton
                label="Product"
                icon={ImportantIcon}
                isSelected={notificationTypes.includes('product')}
                onPress={() => handleCategoryPress('product')}
              />
              <SegmentButton
                label="Rewards"
                icon={BigCupIcon}
                isSelected={notificationTypes.includes('rewards')}
                onPress={() => handleCategoryPress('rewards')}
              />
              <SegmentButton
                label="Points"
                icon={PointsIcon}
                isSelected={notificationTypes.includes('points')}
                onPress={() => handleCategoryPress('points')}
              />
            </View>

            <Button size="xl" onPress={handleSave} disabled={isSaving}>
              <Text>{isSaving ? 'Saving…' : 'Save'}</Text>
            </Button>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  )
}
