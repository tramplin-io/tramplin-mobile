import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCSSVariable } from 'uniwind'

import { NotificationCard, ScreenWrapper } from '@/components/general'
import { BellIcon, ContractIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { indexMyNotifications, useMarkAsReadMyNotification, useReadAllMyNotifications } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 50

export default function AppNotificationsScreen() {
  const {
    data,
    refetch: refetchMyNotifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['indexMyNotifications', { limit: PAGE_SIZE }],
    queryFn: ({ pageParam, signal }) =>
      indexMyNotifications({ limit: PAGE_SIZE, skip: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  })

  const myNotifications = data?.pages.flat() ?? []

  const { mutate: readAllMyNotificationsMutate } = useReadAllMyNotifications({
    mutation: {
      onSuccess: () => {
        refetchMyNotifications()
      },
      onError: () => {
        Toast.show({ type: 'error', text1: 'Could not mark all as read' })
      },
    },
  })

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
  const insets = useSafeAreaInsets()
  const fillPrimary = useCSSVariable('--color-fill-primary')
  const fillFade = useCSSVariable('--color-fill-fade')
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  const contentPrimary = useCSSVariable('--color-content-primary') as string

  const notificationCount = myNotifications.filter((notification) => !notification.isSean).length

  const handleMarkAllAsRead = () => {
    readAllMyNotificationsMutate()
  }

  const handleMarkAsRead = (notificationId: string) => {
    if (!notificationId) return

    markAsReadMyNotificationMutate({
      data: { isSean: true },
      params: { id: notificationId },
    })
  }

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: 'Notifications',
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      <View className={cn('w-full bg-fill-primary')} style={{ paddingTop: insets.top }}>
        <View className="h-10 flex-row items-center justify-between px-4 py-2 w-full">
          <View className="flex-row items-center gap-1">
            <BellIcon size={24} color={contentPrimary} />
            {notificationCount > 0 && (
              <View className=" absolute top-0.5 left-3 size-2.5 bg-content-primary rounded-full flex items-center justify-center">
                <Text variant="small" className="text-[6px] text-fill-primary font-bold">
                  {notificationCount}
                </Text>
              </View>
            )}
            <Text variant="body">Notifications</Text>
          </View>
          <View className="flex-row items-center gap-0">
            <Pressable onPress={() => router.back()} hitSlop={8} className="p-1">
              <ContractIcon size={24} color={contentTertiary} />
            </Pressable>
          </View>
        </View>
        <LinearGradient
          colors={[fillPrimary as string, fillFade as string]}
          locations={[0, 1]}
          className="w-full h-10 z-10"
          style={{
            position: 'absolute',
            top: 40 + insets.top,
            left: 0,
            right: 0,
            height: 32,
          }}
        />
      </View>

      <FlatList
        data={myNotifications}
        keyExtractor={(item, index) => item.id ?? `notification-${index}`}
        contentContainerClassName="px-4 pb-24 pt-10 gap-2"
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          notificationCount > 0 ? (
            <View className="mb-1 w-full items-end">
              <Pressable hitSlop={8} onPress={handleMarkAllAsRead} className="px-2 py-1 rounded-md bg-fill-secondary">
                <Text variant="small" className="text-content-secondary">
                  Mark all as read
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            isDetails={true}
            isLoading={isMarkingAsRead}
            onMarkAsRead={handleMarkAsRead}
          />
        )}
      />
    </ScreenWrapper>
  )
}
