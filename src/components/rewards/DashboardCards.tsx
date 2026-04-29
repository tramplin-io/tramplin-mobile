import { useMemo } from 'react'
import { ScrollView, View } from 'react-native'

import { Text } from '@/components/ui/text'
import { useReadMyStats } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'
import { formatAbbreviatedNumber } from '@/utils/format'

import { DashboardCard } from './DashboardCard'

const formatUsd = (usd: number): string => `$${formatAbbreviatedNumber(usd)}`

export function DashboardCards({ className }: Readonly<{ className?: string }>) {
  const { data: myStats } = useReadMyStats()

  console.log('myStats', myStats)

  const bigDrawAverageUSDInCents = myStats?.bigDrawAverageUSDInCents ?? 0
  const regularDrawAverageUSDInCents = myStats?.regularDrawAverageUSDInCents ?? 0
  const epochDrawAverageUSDInCents = myStats?.epochDrawAverageUSDInCents ?? 0

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

  const nextRegularDrawAt = myStats?.nextRegularDrawAt ? new Date(myStats.nextRegularDrawAt) : null
  const nextEpochDrawAt = myStats?.nextEpochDrawAt ? new Date(myStats.nextEpochDrawAt) : null
  const nextBigDrawAt = myStats?.nextBigDrawAt ? new Date(myStats.nextBigDrawAt) : null

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className={cn('w-full', className)}>
      <View className="flex-row gap-2.5 px-4 py-1">
        <View style={{ width: 220 }}>
          <DashboardCard
            type="regular"
            prize={regularPrize}
            subtitle={`${myStats?.regularDrawWinnersAmount} winner${myStats?.regularDrawWinnersAmount !== 1 ? 's' : ''}`}
            tooltip={
              <Text>
                Regular draws are a prize pool drawn every 20 minutes – every staker gets equal odds, regardless of
                stake size.
              </Text>
            }
            countdownDate={nextRegularDrawAt}
            countdownFormat="ms"
          />
        </View>
        <View style={{ width: 220 }}>
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
          />
        </View>
        <View style={{ width: 220 }}>
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
          />
        </View>
      </View>
    </ScrollView>
  )
}
