import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { BellIcon } from '@/components/icons/icons'
import { cn } from '@/lib/utils'

export interface StakePromptCardProps {
  message?: string
  timestampLabel?: string
  moreLabel?: string
  onMorePress?: () => void
  className?: string
}

/**
 * Instructional card: "Start by staking your first coin below!" with NOW and MORE (bell + label).
 */
export function StakePromptCard({
  message = 'Start by staking your first coin below!',
  timestampLabel = 'NOW',
  moreLabel = 'MORE',
  onMorePress,
  className,
}: Readonly<StakePromptCardProps>) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-lg border border-border-tertiary bg-fill-tertiary p-4 shadow-sm',
        className,
      )}
    >
      <View className="flex-1 gap-1">
        <Text variant="body" className="text-content-primary">
          {message}
        </Text>
        <Text variant="small" className="text-content-secondary">
          {timestampLabel}
        </Text>
      </View>
      {onMorePress ? (
        <Pressable onPress={onMorePress} className="flex-row items-center gap-1.5 active:opacity-80" hitSlop={8}>
          <BellIcon size={20} className="text-content-secondary" />
          <Text variant="small" className="text-content-secondary">
            {moreLabel}
          </Text>
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-1.5">
          <BellIcon size={20} className="text-content-secondary" />
          <Text variant="small" className="text-content-secondary">
            {moreLabel}
          </Text>
        </View>
      )}
    </View>
  )
}
