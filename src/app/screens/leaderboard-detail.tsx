import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'

import { Header, ScreenWrapper } from '@/components/general'
import { BigCupIcon, ContractIcon, WalletIcon } from '@/components/icons/icons'
import {
  DetailAmountCard,
  DetailCommitTransaction,
  DetailDistribution,
  DetailLinks,
  DetailMerkleProofs,
  DetailRevealTransaction,
  DetailSnapshot,
  DetailVerification,
  DetailWalletHeader,
} from '@/components/leaderboard/details'
import { Text } from '@/components/ui/text'
import { useListPublicWinLeaders } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'
import { ellipsify } from '@/utils/format'

function AppHeader() {
  return <Header variant="app" />
}

type Params = {
  walletAddress: string
  epochOrSlot?: string
  drawType?: string
  isWinner?: string
}

export default function LeaderboardDetailScreen() {
  const { walletAddress, epochOrSlot, drawType, isWinner } = useLocalSearchParams<Params>()
  const isWinnerEntry = isWinner === 'true'

  const { data: leaders = [], isLoading } = useListPublicWinLeaders({
    query: { enabled: isWinnerEntry },
  })

  const win = leaders.find((w) => w.walletAddress === walletAddress && (!epochOrSlot || w.epochOrSlot === epochOrSlot))
  const isGold = drawType === 'big' || win?.drawType === 'big'
  const insets = useSafeAreaInsets()
  const fillPrimary = useCSSVariable('--color-fill-primary')
  const fillFade = useCSSVariable('--color-fill-fade')
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  const contentPrimary = useCSSVariable('--color-content-primary') as string
  const titleColor = isGold ? 'text-reward-large-secondary' : 'text-content-primary'

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'fade',
          // header: AppHeader,
        }}
      />
      {/* Header */}
      <View className={cn('w-full bg-fill-primary')} style={{ paddingTop: insets.top }}>
        <View className="h-10 flex-row items-center justify-between px-4 py-2 w-full">
          <View className="flex-row items-center gap-1">
            <BigCupIcon size={24} color={contentPrimary} />
            <Text variant="body">{isWinnerEntry ? 'Rewarded wallet' : 'Wallet'}</Text>
          </View>
          <View className="flex-row items-center gap-0">
            <WalletIcon size={16} color={contentTertiary} />
            <Text variant="small" numberOfLines={1}>
              {walletAddress ? ellipsify(walletAddress) : '—'}
            </Text>
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

      {/* Content */}
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <ScrollView contentContainerClassName="px-6 pb-10 pt-10 gap-10" showsVerticalScrollIndicator={false}>
          <View>
            <DetailWalletHeader walletAddress={walletAddress} />

            {isWinnerEntry && isLoading && (
              <View
                style={styles.cardPlaceholder}
                className="rounded-2xl flex-row gap-2 bg-fill-tertiary mb-6 items-center justify-center w-full"
              >
                <ActivityIndicator size="small" color={contentTertiary} />{' '}
                <Text className="text-content-tertiary">Loading…</Text>
              </View>
            )}
            {isWinnerEntry && !isLoading && win && <DetailAmountCard win={win} />}
          </View>

          {isWinnerEntry && win && <DetailDistribution win={win} />}

          {isWinnerEntry && win && <DetailSnapshot win={win} isGold={isGold} />}

          {isWinnerEntry && win && <DetailMerkleProofs win={win} />}

          {isWinnerEntry && win && <DetailCommitTransaction win={win} />}

          {isWinnerEntry && win && <DetailRevealTransaction win={win} />}

          {isWinnerEntry && <DetailVerification />}

          <DetailLinks walletAddress={walletAddress} epochOrSlot={epochOrSlot} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  cardPlaceholder: {
    aspectRatio: 2,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 32,
  },
})
