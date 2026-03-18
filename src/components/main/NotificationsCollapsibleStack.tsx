import { memo, useCallback, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import Toast from 'react-native-toast-message'

import { NotificationCard, NotificationCardCover } from '@/components/general'
import { CollapsibleStack } from '@/components/ui/collapsible-stack'
import { Text } from '@/components/ui/text'
import { useIndexMyNotifications, useMarkAsReadMyNotification } from '@/lib/api/generated/restApi'
import type { Notification as ApiNotification } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'

import { BellIcon } from '../icons/icons'

const MAX_VISIBLE_NOTIFICATIONS = 4

export type MainCollapsibleStackProps = Readonly<{
  className?: string
}>

export function NotificationsCollapsibleStack({ className }: MainCollapsibleStackProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: myNotifications = [], refetch: refetchMyNotifications } = useIndexMyNotifications({
    limit: 250,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  })

  useFocusEffect(
    useCallback(() => {
      refetchMyNotifications()
    }, [refetchMyNotifications]),
  )

  const { mutate: markAsReadMyNotificationMutate, isPending: isMarkingAsRead } = useMarkAsReadMyNotification({
    mutation: {
      onSuccess: () => {
        refetchMyNotifications()
      },
      onError: () => {
        Toast.show({ type: 'error', text1: 'Could not mark as read' })
      },
    },
  })

  const notifications = useMemo<ApiNotification[]>(() => {
    if (!myNotifications) return []

    return myNotifications.slice(0, MAX_VISIBLE_NOTIFICATIONS)
  }, [myNotifications])

  if (notifications.length === 0) return null

  const notificationCount = myNotifications.filter((notification) => !notification.isSeen).length

  const handleOpenNotifications = () => {
    setIsOpen(false)
    router.push('/screens/notifications')
  }

  const handleMarkAsRead = (notificationId: string) => {
    if (!notificationId) return

    markAsReadMyNotificationMutate({
      data: { isSeen: true },
      params: { id: notificationId },
    })
  }

  return (
    <View className={cn('gap-3', className)}>
      <CollapsibleStack
        open={isOpen}
        onOpenChange={setIsOpen}
        collapsedCount={3}
        gap={4}
        expandedGap={3}
        itemHeight={54}
        // expandedContentHeight={54 * 6}
        // className="rounded-xl"
        cover={
          <NotificationCardCover
            notification={notifications[0]}
            cardClassName="h-[54px]"
            notificationCount={notificationCount}
          />
        }
      >
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            cardClassName="h-[54px]"
            isLoading={isMarkingAsRead}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
        <Pressable
          onPress={handleOpenNotifications}
          className="bg-fill-secondary border-border-quaternary border rounded-md p-2.5 gap-0 flex-row items-center justify-center h-[54px]"
          accessibilityRole="button"
          accessibilityLabel="Open past notifications"
        >
          <View className="gap-1 flex-row items-center">
            <BellIcon size={24} />
            {notificationCount > 0 && (
              <View className=" absolute top-0.5 left-3 size-2.5 bg-content-primary rounded-full flex items-center justify-center">
                <Text variant="small" className="text-[6px] text-fill-primary font-bold">
                  {notificationCount < 100 ? notificationCount : '9+'}
                </Text>
              </View>
            )}
            <Text variant="body" className="ml-1">
              Past Notifications
            </Text>
          </View>
        </Pressable>
      </CollapsibleStack>
    </View>
  )
}

export const MainCollapsibleStack = memo(NotificationsCollapsibleStack)
