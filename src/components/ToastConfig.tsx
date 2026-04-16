import { useEffect, type ReactNode } from 'react'
import { View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { AlertCircle, CircleCheck } from 'lucide-react-native'
import type { BaseToastProps } from 'react-native-toast-message'

import { Text } from '@/components/ui/text'

const TOAST_HAPTICS: Record<'success' | 'warning' | 'error', Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
}

function ToastWithHaptics({
  type,
  children,
}: Readonly<{
  type: 'success' | 'warning' | 'error'
  children: ReactNode
}>) {
  // useEffect(() => {
  //   Haptics.notificationAsync(TOAST_HAPTICS[type])
  // }, [type])
  return <>{children}</>
}

export const toastConfig = {
  success: ({ text1 }: BaseToastProps) => (
    <ToastWithHaptics type="success">
      <View className="w-full ">
        <View className="flex-row items-top rounded-xl bg-success-bg px-4 py-3 mx-4" accessibilityRole="alert">
          <CircleCheck size={20} color="#7cbc71" className="mr-2" />
          <Text variant="body" className="text-success mx-2">
            {text1}
          </Text>
        </View>
      </View>
    </ToastWithHaptics>
  ),

  warning: ({ text1 }: BaseToastProps) => (
    <ToastWithHaptics type="warning">
      <View className="w-full ">
        <View className="flex-row items-top rounded-xl bg-warning-bg px-4 py-3 mx-4" accessibilityRole="alert">
          <AlertCircle size={20} color="#f59c53" className="mr-2" />
          <Text variant="body" className="text-warning mx-2">
            {text1}
          </Text>
        </View>
      </View>
    </ToastWithHaptics>
  ),

  error: ({ text1 }: BaseToastProps) => (
    <ToastWithHaptics type="error">
      <View className="w-full ">
        <View className="flex-row items-top rounded-xl bg-error-bg px-4 py-3 mx-4" accessibilityRole="alert">
          <AlertCircle size={20} color="#e25979" className="mr-2" />
          <Text variant="body" className="text-error mx-2">
            {text1}
          </Text>
        </View>
      </View>
    </ToastWithHaptics>
  ),
}
