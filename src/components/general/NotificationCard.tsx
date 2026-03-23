import { memo } from 'react'
import { Linking, Pressable, View } from 'react-native'

import {
  BellIcon,
  DiscordIcon,
  LeaveIcon,
  RewardIcon,
  SolanaCircleIcon,
  TelegramIcon,
  TramplinCircleIcon,
} from '@/components/icons/icons'
import { Card } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useMarkAsReadMyNotification } from '@/lib/api/generated/restApi'
import type { Notification as ApiNotification, NotificationExtraType } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/format'

type NotificationIconProps = Readonly<{
  type?: NotificationExtraType
}>

const NotificationIcon = memo(function NotificationIcon({ type }: NotificationIconProps) {
  if (!type) return null

  switch (type) {
    case 'telegram':
      return <TelegramIcon size={24} />
    case 'tramplin':
      return <TramplinCircleIcon size={20} />
    case 'success':
      return <RewardIcon size={24} />
    case 'solana':
      return <SolanaCircleIcon size={24} strokeWidth={0.75} />
    case 'discord':
      return <DiscordIcon size={24} />
    default:
      return null
  }
})

export type NotificationCardBaseProps = Readonly<{
  notification: ApiNotification
  cardClassName?: string
  isDetails?: boolean
  notificationCount?: number
  onMarkAsRead?: (notificationId: string) => void
  isLoading?: boolean
}>

export const NotificationCardCover = memo(function NotificationCardCover({
  notification,
  cardClassName,
  notificationCount = 0,
}: NotificationCardBaseProps) {
  return (
    <Card variant="notification" className={cn('flex-row items-center', cardClassName)}>
      <View className="flex-1 gap-1">
        <Text variant="body" numberOfLines={1}>
          {notification.title}
        </Text>
        <Text variant="small" className="text-content-tertiary">
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>
      <View className="gap-1 flex-row items-center">
        <BellIcon size={24} />
        {notificationCount > 0 && (
          <View className=" absolute top-0.5 left-3 size-2.5 bg-content-primary rounded-full flex items-center justify-center">
            <Text variant="small" className="text-[6px] text-fill-primary font-bold">
              {notificationCount < 100 ? notificationCount : '9+'}
            </Text>
          </View>
        )}
        <Text variant="small" className="uppercase" numberOfLines={1}>
          More
        </Text>
      </View>
    </Card>
  )
})

export const NotificationCard = memo(function NotificationCard({
  notification,
  cardClassName,
  isDetails = false,
  onMarkAsRead,
  isLoading = false,
}: NotificationCardBaseProps) {
  const showExternalIcon = notification.url !== undefined
  const isSeen = Boolean(notification.isSeen)
  const { mutate: markAsReadMyNotificationMutate } = useMarkAsReadMyNotification()

  return (
    <Pressable
      disabled={isLoading}
      onPress={() => {
        if (!notification.id || notification.isSeen) return
        onMarkAsRead?.(notification.id)
      }}
      // accessibilityRole="button"
      // accessibilityLabel={notification.title}
      // className="active:opacity-80"
    >
      <Card variant="notification" className={cn('flex-row items-center', isSeen && 'opacity-60', cardClassName)}>
        <View className="flex-1 gap-1">
          <Pressable
            className="flex-row items-center gap-1"
            disabled={!notification.url}
            onPress={() => {
              if (!isSeen && notification.id) {
                markAsReadMyNotificationMutate({
                  data: { isSeen: true },
                  params: { id: notification.id },
                })
              }

              if (notification.url) {
                void Linking.openURL(notification.url)
              }
            }}
          >
            <Text variant="body" className="flex-1 -mr-1.5" numberOfLines={isDetails ? undefined : 1}>
              {notification.title}
            </Text>
            {showExternalIcon && <LeaveIcon size={20} />}
          </Pressable>
          {!!isDetails && !!notification.body && (
            <Text variant="small" className="flex-1">
              {notification.body}
            </Text>
          )}
          <Text variant="small" className="text-content-tertiary">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        <NotificationIcon type={notification.type} />
      </Card>
    </Pressable>
  )
})
