import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import { useInfiniteQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { NotificationCard, ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { SettingsIcon } from '@/components/icons/icons'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'
import {
  indexMyNotifications,
  useMarkAsReadMyNotification,
  useReadAllMyNotifications,
} from '@/lib/api/generated/restApi'
import { queryClient } from '@/lib/api/query-client'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 150

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
      indexMyNotifications({ limit: PAGE_SIZE, skip: pageParam, sortBy: 'createdAt', sortOrder: 'DESC' }, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE),
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
  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string
  const colorBrandPrimary = useCSSVariable('--color-brand-primary') as string
  const handleOpenNotificationSettings = useCallback(() => {
    router.push('/screens/notification-settings')
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetchMyNotifications()

    setRefreshing(false)
  }, [refetchMyNotifications])

  const handleMarkAllAsRead = () => {
    readAllMyNotificationsMutate()
    void queryClient.invalidateQueries({ queryKey: ['indexMyNotifications'] })
  }

  const unreadNotificationsCount = myNotifications.filter((notification) => !notification.isSeen).length
  const hasUnreadNotifications = unreadNotificationsCount > 0

  const handleMarkAsRead = (notificationId: string) => {
    if (!notificationId) return

    markAsReadMyNotificationMutate({
      data: { isSeen: true },
      params: { id: notificationId },
    })
  }
  const handleBack = useCallback(() => {
    router.back()
  }, [])

  return (
    <ScreenWrapper style={{ paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      {/* Header */}
      <View className={cn('w-full bg-fill-primary')}>
        <View className="h-10 flex-row items-center justify-between px-4 my-3 w-full">
          <BackButton onPress={handleBack} className="mb-0 z-10" />

          <Text variant="h4" className="text-content-primary flex-1 text-center">
            Your notifications
          </Text>
          <TouchableOpacity
            onPress={handleOpenNotificationSettings}
            className="size-10 border border-border-quaternary rounded-full items-center justify-center bg-fill-secondary"
            hitSlop={8}
          >
            <SettingsIcon size={24} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[fillPrimary, fillFade]}
          locations={[0, 1]}
          className="w-full h-5 z-10"
          style={{
            position: 'absolute',
            top: 30 + insets.top,
            left: 0,
            right: 0,
            height: 20,
          }}
        />
      </View>

      {/* Content */}
      <FlatList
        data={myNotifications}
        keyExtractor={(item, index) => item.id ?? `notification-${index}`}
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="pb-24 pt-4"
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text variant="body" className="text-content-tertiary">
              No notifications yet
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center mb-10">
              <ActivityIndicator />
            </View>
          ) : (
            <View className="h-10" />
          )
        }
        renderItem={({ item }) => (
          <NotificationCard notification={item} isLoading={isMarkingAsRead} onMarkAsRead={handleMarkAsRead} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={40}
            colors={[colorBrandPrimary]}
          />
        }
      />
      <View className="mx-4 absolute left-0 right-0" style={{ bottom: insets.bottom + 16 }}>
        <Button
          size="xl"
          variant="gray"
          onPress={handleMarkAllAsRead}
          disabled={isMarkingAsRead || !hasUnreadNotifications}
        >
          <Text variant="body" className="text-content-primary">
            Mark all as read
          </Text>
        </Button>
      </View>
    </ScreenWrapper>
  )
}
