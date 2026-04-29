import { useMemo } from 'react'
import { View } from 'react-native'

import { Text } from '@/components/ui/text'
import type { MyStats } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatCompact } from '@/utils/format'

import { DashboardCard } from './DashboardCard'

const formatUsd = (usd: number): string => `$${formatCompact(usd, 1_000)}`

export function DashboardCards({
  myStats,
  isLoading,
  className,
  refetchMyStats,
}: Readonly<{ myStats?: MyStats | null; isLoading: boolean; className?: string; refetchMyStats: () => void }>) {
  const bigDrawAverageUSDInCents = myStats?.bigDrawAverageUSDInCents ? myStats.bigDrawAverageUSDInCents / 100 : 0
  const regularDrawAverageUSDInCents = myStats?.regularDrawAverageUSDInCents
    ? myStats.regularDrawAverageUSDInCents / 100
    : 0
  const epochDrawAverageUSDInCents = myStats?.epochDrawAverageUSDInCents ? myStats.epochDrawAverageUSDInCents / 100 : 0

  const regularPrize = useMemo(
    () => (regularDrawAverageUSDInCents ? formatUsd(regularDrawAverageUSDInCents) : null),
    [regularDrawAverageUSDInCents],
  )
  const epochPrize = useMemo(
    () => (epochDrawAverageUSDInCents ? formatUsd(epochDrawAverageUSDInCents) : null),
    [epochDrawAverageUSDInCents],
  )
  const bigPrize = useMemo(
    () => (bigDrawAverageUSDInCents ? formatUsd(bigDrawAverageUSDInCents) : null),
    [bigDrawAverageUSDInCents],
  )

  if (!myStats) {
    return null
  }

  const nextRegularDrawAt = myStats?.nextRegularDrawAt ? new Date(myStats.nextRegularDrawAt) : null
  const nextEpochDrawAt = myStats?.nextEpochDrawAt ? new Date(myStats.nextEpochDrawAt) : null
  const nextBigDrawAt = myStats?.nextBigDrawAt ? new Date(myStats.nextBigDrawAt) : null

  return (
    // <ScrollView horizontal showsHorizontalScrollIndicator={false} className={cn('w-full', className)}>
    <View className={cn('flex-col gap-4 px-4 py-1 mt-6', className)}>
      <Text variant="body" className="text-content-primary">
        Upcoming distributions
      </Text>
      <View className={cn('w-full')}>
        <DashboardCard
          type="regular"
          prize={regularPrize}
          subtitle={`${myStats?.regularDrawWinnersAmount} winner${myStats?.regularDrawWinnersAmount !== 1 ? 's' : ''}`}
          tooltip={
            <Text>
              Regular draws are a prize pool drawn every 20 minutes – every staker gets equal odds, regardless of stake
              size.
            </Text>
          }
          countdownDate={nextRegularDrawAt}
          countdownFormat="ms"
          youAreIn={myStats?.isAttendingRegularDraw}
          isLoading={isLoading}
          onExpire={() => {
            refetchMyStats()
          }}
        />
      </View>
      <View className={cn('w-full')}>
        <DashboardCard
          type="epoch"
          prize={epochPrize}
          prefixText="up to"
          subtitle={`${myStats?.epochDrawWinnersAmount} winner${myStats?.epochDrawWinnersAmount !== 1 ? 's' : ''}`}
          tooltip={
            <Text>
              Epoch draws are 7 prizes from $25 to $1,000 split across 7 unique winners every epoch (~2 days) - the
              largest slice of the reward pool.
            </Text>
          }
          countdownDate={nextEpochDrawAt}
          countdownFormat="dhms"
          youAreIn={myStats?.isAttendingEpochDraw}
          isLoading={isLoading}
          onExpire={() => {
            refetchMyStats()
          }}
        />
      </View>
      <View className={cn('w-full')}>
        <DashboardCard
          type="big"
          prize={bigPrize}
          subtitle={`${myStats?.bigDrawWinnersAmount} winner${myStats?.bigDrawWinnersAmount !== 1 ? 's' : ''}`}
          tooltip={
            <Text>
              {
                'Big rewards are the largest Tramplin rewards. They get redistributed every 15 Solana epochs (~ 30 days).\n\nYou need to have your stake active throughout the whole period to participate.'
              }
            </Text>
          }
          countdownDate={nextBigDrawAt}
          countdownFormat="dhms"
          youAreIn={myStats?.isAttendingBigDraw}
          isLoading={isLoading}
          onExpire={() => {
            refetchMyStats()
          }}
        />
      </View>
    </View>
    // </ScrollView>
  )
}
