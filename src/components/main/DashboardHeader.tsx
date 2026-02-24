import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { LinkIcon } from '@/components/icons/icons'
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
  title = 'Welcome to Tramplin',
  subscribeLabel = 'Subscribe',
  onSubscribePress,
  className,
}: Readonly<DashboardHeaderProps>) {
  return (
    <View className={cn('flex-row items-center justify-between', className)}>
      <Text variant="h4" className="text-content-primary flex-1">
        {title}
      </Text>
      {onSubscribePress ? (
        <Pressable onPress={onSubscribePress} className="flex-row items-center gap-1 active:opacity-80" hitSlop={8}>
          <Text variant="body" className="text-content-tertiary">
            {subscribeLabel}
          </Text>
          <LinkIcon size={16} className="text-content-tertiary" />
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-1">
          <Text variant="body" className="text-content-tertiary">
            {subscribeLabel}
          </Text>
          <LinkIcon size={16} className="text-content-tertiary" />
        </View>
      )}
    </View>
  )
}
