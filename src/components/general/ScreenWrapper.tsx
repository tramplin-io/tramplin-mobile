import type * as React from 'react'
import {
  KeyboardAvoidingView,
  // SafeAreaView,
  ScrollView,
  View,
  type ViewProps,
} from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

import { cn } from '@/lib/utils'

export interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  scrollable?: boolean
  keyboardAvoiding?: boolean
  padded?: boolean
  hasSafeArea?: boolean
  edges?: Edge[]
}

export const ScreenWrapper = ({
  children,
  className,
  contentClassName,
  scrollable = false,
  keyboardAvoiding = false,
  padded = true,
  hasSafeArea = false,
  edges,
  ...props
}: ScreenWrapperProps) => {
  const content = <View className={cn('flex-1', contentClassName)}>{children}</View>

  const wrappedContent = scrollable ? (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName={!keyboardAvoiding ? 'flex-grow' : undefined}
    >
      {content}
    </ScrollView>
  ) : (
    content
  )

  const Container = hasSafeArea ? SafeAreaView : View

  return (
    <Container className={cn('flex-1 bg-fill-primary', className)} {...props} edges={edges}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView className="flex-1" behavior="padding">
          {wrappedContent}
        </KeyboardAvoidingView>
      ) : (
        wrappedContent
      )}
    </Container>
  )
}

// export default ScreenWrapper
