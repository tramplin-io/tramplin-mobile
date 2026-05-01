// import { useCallback } from 'react'
import {
  // Pressable,
  View,
} from 'react-native'

// import { router } from 'expo-router'
// import { useCSSVariable } from 'uniwind'

// import { LinkIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export interface DashboardHeaderProps {
  title?: string
  subscribeLabel?: string
  onSubscribePress?: () => void
  className?: string
}

/**
 * Dashboard top header: title on the left, Subscribe link with icon on the right.
 */
export function DashboardHeader({
  title = 'Welcome to Tramplin!',
  subscribeLabel = 'Subscribe',
  onSubscribePress,
  className,
}: Readonly<DashboardHeaderProps>) {
  // const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  // // onSubscribePress
  // const handleSubscribePress = useCallback(() => {
  //   if (onSubscribePress) {
  //     onSubscribePress()
  //   } else {
  //     router.push('/screens/subscription')
  //   }
  // }, [onSubscribePress])

  return (
    <View className={cn('flex-row items-center justify-between', className)}>
      <Text variant="h4" className="text-content-primary flex-1">
        {title}
      </Text>

      {/* <Pressable onPress={handleSubscribePress} className="flex-row items-center gap-1 active:opacity-80" hitSlop={8}>
        <Text variant="body" className="text-content-tertiary">
          {subscribeLabel}
        </Text>
        <LinkIcon size={16} color={contentTertiary} />
      </Pressable> */}
    </View>
  )
}
