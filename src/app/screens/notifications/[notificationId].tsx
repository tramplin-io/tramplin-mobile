import { useCallback, useEffect } from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import { RichInputMarkdown, ScreenWrapper } from '@/components/general'
import { BackButton } from '@/components/general/BackButton'
import { PlusIcon } from '@/components/icons/icons'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useMarkAsReadMyNotification, useReadMyNotification } from '@/lib/api/generated/restApi'
import type { Notification, NotificationCategory } from '@/lib/api/generated/restApi.schemas'

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  product: 'Product',
  rewards: 'Rewards',
  points: 'Points',
  winAlerts: 'Win alerts',
  drawReminders: 'Draw reminders',
  referalActivity: 'Referral activity',
  announcements: 'Announcements',
}

export default function NotificationDetailScreen() {
  const { notificationId } = useLocalSearchParams<{ notificationId: string }>()
  const insets = useSafeAreaInsets()
  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string
  const { data: notification, isLoading: isLoadingNotification } = useReadMyNotification(
    { id: notificationId },
    { query: { enabled: !!notificationId } },
  )

  // console.log('notification', notification)

  // const notification = {
  //   profileId: '699c6e78312de7353554cb1b',
  //   type: 'announcements',
  //   title: "Solana staking in 2026: where we're at",
  //   body: 'If you staked SOL two years ago and just checked back, the staking landscape has',
  //   content:
  //     "# Solana staking in 2026: where we're at\n\n![image](https://storage.ghost.io/c/d0/c0/d0c04330-697b-4271-bec1-f39c8012cb7c/content/images/size/w2000/2026/04/HFUWQuDW0AA-cgk.jpeg)\n\nIf you staked SOL two years ago and just checked back, the staking landscape has changed a lot.\n\n> _The infrastructure has changed. The numbers are different and the direction things are heading is clearer than it's ever been._\n\n## The staking numbers\n\n- Staked SOL crossed $34B in Q1 2026, an all-time high.\n- Liquid staking TVL grew 217% year-over-year.\n- Jito alone manages over $800 million in locked value.\n\nAnd yet over 2 million wallets holding between 1 and 100 SOL have never staked a single token. That's the gap we are yet to fill.\n\n## The validators landscape\n\nSignificant changes have happened to Solana's validator set over the last two years. The active count dropped from **over 2,500 in 2023 to around 800 today**, not because the network got weaker, but because the Solana Foundation implemented a cleanup.\n\n> _For every new validator admitted, underperformers were removed. The average stake per validator has risen from 470,000 SOL to around 620,000 SOL._\n\n**This resulted in** fewer validators, better performance, higher average stake. That's a different network than the one that existed in 2023.A small number of validators - the superminority - control an outsized share of the stake. Foundation delegation, which once made up around 25% of all staked SOL, is now down to 13-16%, pushing validators toward independent economics.\n\n> _The Solana Foundation's \"Stake with Purpose\" program is actively incentivizing smaller validators with grants and 35% of new validators this year are joining from emerging markets, Southeast Asia, Latin America, and Eastern Europe._\n\nOverall, the direction is toward a more distributed, more independent validator set.\n\n## Tramplin's role\n\nWhen you stake with Tramplin, your SOL is delegated to our validator, meaning it goes to a real node that contributes to block production, transaction processing and network consensus. Every SOL staked with us adds to the total stake securing Solana.\n\n> **\\*We see 2 million idle wallets as a product opportunity.** More idle and retail participants staking means more distributed stake, a stronger superminority and a more resistant network overall.\\*\n\nOur reward model was designed to close that gap, not by making staking more complicated, but by making it feel worthwhile to participate in, even at 1 SOL 🟣\n\n## Where are things going?\n\nMajor investment firms began offering Solana-based funds in 2025. For average users, staking is becoming more and more normal, and a way to hold their SOL long-term.\n\n> _The 2 million idle wallets are the last big unlock._\n\nThat's what staking on Solana looks like in 2026.\n\n- Tramplin team.\n  [Tramplin](https://tramplin.io/)",
  //   metadata: '{"contentType":"screen","screen":"/screens/notifications/<id>","id":"6a05f5797566f5ed0efb82e5"}',
  //   isSeen: true,
  //   isProcessed: true,
  //   isPriority: false,
  //   processedAt: '2026-05-14T16:17:00.457Z',
  //   category: 'announcements',
  //   status: 'delivered',
  //   url: 'https://blog.tramplin.io/solana-staking-in-2026-where-were-at/',
  //   id: '6a05f5797566f5ed0efb82e5',
  //   createdAt: '2026-05-14T16:16:57.922Z',
  //   updatedAt: '2026-05-14T16:17:30.626Z',
  // } as Notification

  const { mutate: markAsRead } = useMarkAsReadMyNotification()

  useEffect(() => {
    if (notification?.id && !notification.isSeen) {
      markAsRead({ data: { isSeen: true }, params: { id: notification.id } })
    }
  }, [notification?.id, notification?.isSeen, markAsRead])

  const handleBack = useCallback(() => {
    router.back()
    // router.push('/screens/notifications') // TODO: think about this. if opened from push
  }, [])

  const categoryLabel = notification?.category
    ? (CATEGORY_LABEL[notification.category] ?? 'Notification')
    : 'Notification'
  const paragraphs = notification?.body ? notification.body.split('\n').filter(Boolean) : []

  const getButtonText = (url: string | undefined) => {
    if (!url) return 'Open link'
    if (url.startsWith('https://solscan.io/tx')) return 'Open transaction'
    if (url.startsWith('https')) return 'Open external link'
    return 'Open link'
  }

  const isStakingUrl = notification?.url?.startsWith('/tabs?modalType=staking') ?? false
  const buttonText = getButtonText(notification?.url)

  const buttonPress = () => {
    // /tabs?modalType=staking

    if (notification?.url && notification.url.startsWith('https')) {
      void Linking.openURL(notification.url)
      return
    }

    if (notification?.url) {
      router.push(notification?.url)
    }
  }

  return (
    <ScreenWrapper style={{ paddingTop: insets.top }} className="relative">
      <Stack.Screen
        options={{
          title: 'Notifications Detail',
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      {/* Header */}
      <View className="w-full bg-fill-primary">
        <View className="h-10 flex-row items-center justify-between px-4 my-3 w-full">
          <BackButton onPress={handleBack} className="mb-0 z-10" />

          <Text variant="h4" className="text-content-primary flex-1 text-center">
            {isLoadingNotification ? 'Loading...' : categoryLabel}
          </Text>
          <View className="size-10" />
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
      {isLoadingNotification ? (
        <View className="flex-1 items-center justify-center mb-24">
          <Text variant="body" className="text-content-tertiary">
            Loading notification...
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerClassName="px-4 pb-24 gap-5 pt-2"
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 + (notification?.url ? 80 : 10) }}
            showsVerticalScrollIndicator={false}
          >
            {notification?.content ? (
              <View
                className="gap-0 flex-1 justify-between "
                // style={{ paddingBottom: insets.bottom }}
              >
                <RichInputMarkdown markdown={notification.content} />
              </View>
            ) : (
              <View className="gap-3">
                <Text variant="h4" className="text-content-primary">
                  {notification?.title}
                </Text>
                {paragraphs.map((paragraph) => (
                  <Text key={paragraph} variant="body" className="text-content-tertiary">
                    {paragraph}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          {!!notification?.url && (
            <View className="mx-4 absolute left-0 right-0" style={{ bottom: insets.bottom + 16 }}>
              <Button size="xl" onPress={buttonPress}>
                {isStakingUrl ? (
                  <>
                    <PlusIcon size={20} className="drop-shadow-md" />
                    <Text variant="body">Stake SOL</Text>
                  </>
                ) : (
                  <Text>{buttonText}</Text>
                )}
              </Button>
            </View>
          )}
        </>
      )}
    </ScreenWrapper>
  )
}
