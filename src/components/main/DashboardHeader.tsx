import { useCallback } from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

// import { useCSSVariable } from 'uniwind'

import { BellIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { useIndexMyNotifications } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'

export interface DashboardHeaderProps {
  title?: string
  // subscribeLabel?: string
  // notificationCount?: number
  // onSubscribePress?: () => void
  className?: string
}

/**
 * Dashboard top header: title on the left, Subscribe link with icon on the right.
 */
export function DashboardHeader({
  title = 'Home',
  // subscribeLabel = 'Subscribe',

  // onSubscribePress,
  className,
}: Readonly<DashboardHeaderProps>) {
  // const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  // onSubscribePress
  // const handleSubscribePress = useCallback(() => {
  //   if (onSubscribePress) {
  //     onSubscribePress()
  //   } else {
  //     router.push('/screens/subscription')
  //   }
  // }, [onSubscribePress])
  const insets = useSafeAreaInsets()
  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

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

  const notificationCount = myNotifications.filter((notification) => !notification.isSeen).length

  const handleOpenNotifications = () => {
    router.push('/screens/notifications')
  }

  return (
    <View style={{ paddingTop: insets.top + 12 }}>
      <View className={cn('flex-row items-center justify-between px-4 pb-2', className)}>
        <Text variant="h3" className="text-content-primary flex-1">
          {title}
        </Text>

        <TouchableOpacity
          onPress={handleOpenNotifications}
          className="size-10 border border-border-quaternary rounded-full items-center justify-center bg-fill-secondary"
          hitSlop={8}
        >
          <View className="gap-1 flex-row items-center">
            <BellIcon size={24} />
            {notificationCount > 0 && (
              <View className=" absolute top-0.5 left-3 size-2.5 bg-liliac-dark rounded-full flex items-center justify-center">
                {/* <Text variant="small" className="text-[6px] text-fill-primary font-bold">
                {notificationCount < 100 ? notificationCount : '9+'}
              </Text> */}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <LinearGradient
        colors={[fillPrimary, fillFade]}
        locations={[0, 1]}
        className="w-full h-10 z-10"
        style={{
          position: 'absolute',
          top: insets.top + 12 + 8 + 40,
          left: 0,
          right: 0,
          height: 20,
        }}
      />
    </View>
  )
}
