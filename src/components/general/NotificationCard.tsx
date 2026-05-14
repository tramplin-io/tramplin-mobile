import { memo, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { router, type Href } from 'expo-router'
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { BellIcon, CrossIcon, DeleteIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { useDeleteMyNotification } from '@/lib/api/generated/restApi'
import type { Notification as ApiNotification, NotificationExtraType } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/format'

import {
  NotificationAnnouncementsIcon,
  NotificationDrawsIcon,
  NotificationGeneralIcon,
  NotificationReferralssIcon,
  NotificationStakingIcon,
  NotificationWinsIcon,
} from '../icons'

type NotificationIconProps = Readonly<{
  type?: NotificationExtraType
}>

//  TODO: Update type NotificationExtraType
const NotificationIcon = memo(function NotificationIcon({ type }: NotificationIconProps) {
  switch (type) {
    case 'draws':
      return <NotificationDrawsIcon size={24} />
    case 'staking':
      return <NotificationStakingIcon size={24} />
    case 'wins':
      return <NotificationWinsIcon size={24} />
    case 'referrals':
      return <NotificationReferralssIcon size={24} />
    case 'announcements':
      return <NotificationAnnouncementsIcon size={24} />
    default:
      return <NotificationGeneralIcon size={24} />
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
    <View className={cn('flex-row items-center gap-2 bg-fill-secondary rounded-md p-2.5', cardClassName)}>
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
          <View className="absolute top-0.5 left-3 size-2.5 bg-content-primary rounded-full flex items-center justify-center">
            <Text variant="small" className="text-[6px] text-fill-primary font-bold">
              {notificationCount < 100 ? notificationCount : '9+'}
            </Text>
          </View>
        )}
        <Text variant="small" className="uppercase" numberOfLines={1}>
          More
        </Text>
      </View>
    </View>
  )
})

export const NotificationCard = memo(function NotificationCard({
  notification,
  cardClassName,
  isLoading = false,
  onMarkAsRead,
}: NotificationCardBaseProps) {
  const isSeen = Boolean(notification.isSeen)
  const swipeableRef = useRef<SwipeableMethods>(null)
  const queryClient = useQueryClient()
  const [isSwiped, setIsSwiped] = useState(false)
  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const unreadNotification = useCSSVariable('--color-unread-notification') as string
  const { mutate: deleteNotificationMutate, isPending: isDeleting } = useDeleteMyNotification({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['indexMyNotifications'] })
      },
      onError: () => {
        Toast.show({ type: 'error', text1: 'Could not delete notification' })
      },
    },
  })

  const navigateFromMetadata = (metadata: string) => {
    try {
      const { contentType, modalType, screen, id, stakeAmount } = JSON.parse(metadata) as {
        contentType?: string
        modalType?: string
        screen?: string
        id?: string
        stakeAmount?: string
      }

      if (contentType === 'modal' && modalType) {
        router.push(`${screen}?modalType=${modalType}${stakeAmount ? `&stakeAmount=${stakeAmount}` : ''}` as Href)
        return
      }

      if (contentType === 'screen' && screen) {
        const resolvedScreen = id ? screen.replace('<id>', id) : screen
        router.push(resolvedScreen as Href)
        return
      }
    } catch {
      // ignore malformed metadata
    }
  }

  const markAsRead = () => {
    if (!isSeen && notification.id) {
      onMarkAsRead?.(notification.id)
    }
  }

  const handlePress = () => {
    if (isLoading || isDeleting) return

    if (notification.category !== 'announcements') {
      if (notification.metadata) {
        navigateFromMetadata(notification.metadata)
      }
      if (notification.url) {
        router.push(notification.url)
      }
      markAsRead()
      return
    }

    markAsRead()

    if (notification.id) {
      router.push(`/screens/notifications/${notification.id}`)
    }
  }

  const handleDelete = () => {
    if (!notification.id || isDeleting) return
    swipeableRef.current?.close()
    deleteNotificationMutate({ params: { id: notification.id } })
  }

  const renderRightActions = () => (
    <Pressable
      onPress={handleDelete}
      disabled={isDeleting}
      className="bg-error items-center justify-center w-22.5 gap-2.5"
    >
      <DeleteIcon size={24} color="#ffffff" strokeWidth={0.2} />
      <Text variant="bodySmall" className="text-fill-tertiary ">
        Delete
      </Text>
    </Pressable>
  )

  return (
    <>
      <View className={'bg-error'}>
        <ReanimatedSwipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          friction={2}
          rightThreshold={40}
          leftThreshold={40}
          overshootRight={false}
          onSwipeableOpenStartDrag={() => setIsSwiped(true)}
          onSwipeableWillClose={() => setIsSwiped(false)}
        >
          <Pressable
            onPress={handlePress}
            disabled={isLoading || isDeleting}
            style={isSeen ? { backgroundColor: fillPrimary } : { backgroundColor: unreadNotification }}
            className={cn('flex-row items-start gap-3 px-5 py-4', isSwiped && 'rounded-r-lg', cardClassName)}
          >
            <View className="size-12 rounded-lg bg-fill-secondary items-center justify-center shrink-0 ">
              <NotificationIcon type={notification.type} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="body" numberOfLines={1} className="text-content-primary">
                {notification.title}
              </Text>
              {!!notification.body && (
                <Text variant="small" numberOfLines={2} className="text-content-secondary">
                  {notification.body}
                </Text>
              )}
              <Text variant="small" className="text-content-tertiary mt-0.5">
                {formatRelativeTime(notification.createdAt)}
              </Text>
            </View>
          </Pressable>
        </ReanimatedSwipeable>
      </View>
      <View className="border-b border-border-quaternary" />
    </>
  )
})
