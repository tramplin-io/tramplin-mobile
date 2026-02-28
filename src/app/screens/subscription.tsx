import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { router, Stack } from 'expo-router'
import Toast from 'react-native-toast-message'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { BigCupIcon, ImportantIcon, PointsIcon } from '@/components/icons/icons'
import { Button } from '@/components/ui'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import type { NotificationType } from '@/lib/api/generated/restApi.schemas'
import { useProfileStore } from '@/lib/stores/profile-store'
import { cn } from '@/lib/utils'

function ContactRow({
  label,
  value,
  placeholder,
  onChangeText,
  ...inputProps
}: Readonly<
  {
    label: string
    value: string
    placeholder: string
    onChangeText?: (text: string) => void
  } & Omit<React.ComponentProps<typeof Input>, 'value' | 'placeholder' | 'onChangeText'>
>) {
  return (
    <View className="gap-2">
      <Text variant="small" className="uppercase tracking-wide">
        {label}
      </Text>
      <View className="flex-row items-center rounded-lg bg-fill-tertiary border border-transparent px-3 py-1">
        <Input
          value={value}
          placeholder={placeholder}
          onChangeText={onChangeText}
          className="flex-1 h-14 min-w-0 border-0 bg-transparent px-1 py-2.5 text-content-primary placeholder:text-content-tertiary shadow-none"
          {...inputProps}
        />
        {/* <ForwardIcon size={20} className="text-content-tertiary ml-2" /> */}
      </View>
    </View>
  )
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
      className={cn('px-3 gap-0', isSelected && 'border border-content-primary bg-fill-tertiary')}
    >
      <Icon size={24} className={isSelected ? 'text-content-primary' : 'text-content-tertiary'} />
      <Text variant="body" className={isSelected ? 'text-content-primary' : 'text-content-tertiary'}>
        {label}
      </Text>
    </Button>
  )
}

export default function SubscriptionScreen() {
  const { userProfile, fetchUserProfile, updateUserProfile } = useProfileStore()
  const [email, setEmail] = useState('')
  const [telegramUsername, setTelegramUsername] = useState('')
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>(['product'])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void fetchUserProfile()
  }, [fetchUserProfile])

  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.email ?? '')
      setTelegramUsername(userProfile.telegramUsername ?? '')
      setNotificationTypes(userProfile.notificationTypes?.length ? userProfile.notificationTypes : ['product'])
    }
  }, [userProfile])

  const handleBack = useCallback(() => {
    router.back()
    // router.push('/profile')
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

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const ok = await updateUserProfile({
      notificationTypes,
      email: email.trim() || undefined,
      telegramUsername: telegramUsername.trim() || undefined,
      isEmailNotificationsOn: true,
    })
    setIsSaving(false)
    if (ok) {
      Toast.show({ type: 'success', text1: 'Subscription saved' })
    } else {
      Toast.show({ type: 'error', text1: 'Could not save subscription' })
    }
  }, [notificationTypes, email, telegramUsername, updateUserProfile])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScreenWrapper>
        <View className="flex-row items-center justify-between mb-4 mt-4 px-4">
          <BackButton onPress={handleBack} className="mb-0 z-10" />
          <Text variant="h4" className="text-center w-full -ml-10">
            Subscription
          </Text>
        </View>
        <Stack.Screen options={{ title: 'Subscription' }} />
        <ScrollView contentContainerClassName="px-4 py-8" showsVerticalScrollIndicator={false}>
          <View className="gap-6">
            <View className="gap-4">
              <ContactRow
                label="EMAIL"
                value={email}
                placeholder="johndoe@gmail.com"
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <ContactRow
                label="TELEGRAM"
                value={telegramUsername}
                placeholder="@johndoe"
                onChangeText={setTelegramUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
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
