import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import { Send } from 'lucide-react-native'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type Option } from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { CONTACT_REASONS } from '@/constants/profile'
import { useContactUs } from '@/lib/api/generated/restApi'
import type { ContactUsInput } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'

function parseSelectValue(v: unknown): string {
  if (typeof v === 'string') return v
  if (v != null && typeof v === 'object' && 'value' in v && typeof (v as { value: string }).value === 'string') {
    return (v as { value: string }).value
  }
  return ''
}

export default function ContactUsScreen() {
  const [reason, setReason] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [messageError, setMessageError] = useState<string | null>(null)

  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  const { mutateAsync: sendContactUs, isPending } = useContactUs()

  const handleBack = useCallback(() => {
    router.push('/profile')
  }, [])

  const resetForm = useCallback(() => {
    setReason('')
    setTitle('')
    setMessage('')
    setTitleError(null)
    setMessageError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmedTitle = title.trim()
    const trimmedMessage = message.trim()

    setTitleError(null)
    setMessageError(null)

    if (!trimmedTitle) {
      setTitleError('Title is required')
      return
    }
    if (!trimmedMessage) {
      setMessageError('Message is required')
      return
    }

    const payload: ContactUsInput = {
      title: trimmedTitle,
      message: trimmedMessage,
      ...(reason ? { reason } : {}),
    }

    try {
      await sendContactUs({ data: payload })
      Toast.show({
        type: 'success',
        text1: 'Your message has been sent successfully.',
      })
      resetForm()
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to send message. Please try again.',
      })
    }
  }, [title, message, reason, sendContactUs, resetForm])

  // TODO: Update design of components to match the new design system
  return (
    <ScreenWrapper>
      <View className="flex-row items-center justify-between mb-2 mt-2 px-4">
        <BackButton onPress={handleBack} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          Contact Us
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
      <Stack.Screen options={{ title: 'Contact Us' }} />

      <ScreenWrapper scrollable keyboardAvoiding={true} contentClassName="px-4 pt-6 pb-8">
        <Text variant="body" className=" mb-6">
          Have a question or feedback? We would love to hear from you.
        </Text>

        <View className="gap-4 mt-2">
          {/* Reason */}
          <View className="gap-2">
            <Text variant="body">REASON</Text>
            <Select
              value={reason ? (CONTACT_REASONS.find((r) => r.value === reason) as Option) : undefined}
              onValueChange={(v) => setReason(parseSelectValue(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent className="bg-fill-tertiary gap-1 py-3">
                {CONTACT_REASONS.map((r) => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    label={r.label}
                    className={cn('w-full py-2 pl-3', reason === r.value && 'bg-accent')}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          {/* Title */}
          <View className="gap-2">
            <Text variant="body">TITLE</Text>
            <Input
              placeholder="Brief description of your inquiry"
              maxLength={100}
              value={title}
              onChangeText={(t) => {
                setTitle(t)
                if (titleError) setTitleError(null)
              }}
              hasError={!!titleError}
            />
            {titleError ? <Text className="text-critical-primary text-sm">{titleError}</Text> : null}
          </View>

          {/* Message */}
          <View className="gap-2">
            <Text variant="body">MESSAGE</Text>
            <Textarea
              placeholder="Tell us more about your inquiry..."
              className={cn(
                'min-h-[120px] text-[16px] leading-[18px] bg-fill-tertiary text-content-primary',
                messageError && 'border border-critical-primary',
              )}
              maxLength={1000}
              value={message}
              onChangeText={(t) => {
                setMessage(t)
                if (messageError) setMessageError(null)
              }}
            />
            {messageError ? <Text className="text-critical-primary text-sm">{messageError}</Text> : null}
            <Text className="text-[12px] leading-[14px] text-content-tertiary text-right">{message.length}/1000</Text>
          </View>

          <View className="flex justify-center mt-4">
            <Button onPress={handleSubmit} variant="default" size="xl" disabled={isPending}>
              <Send size={16} />
              <Text className="text-body text-content-primary">{isPending ? 'Sending…' : 'Send Message'}</Text>
            </Button>
          </View>
        </View>
      </ScreenWrapper>
    </ScreenWrapper>
  )
}
