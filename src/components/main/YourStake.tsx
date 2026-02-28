import { ActivityIndicator, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useCSSVariable } from 'uniwind'

import { QuestionIcon, SolanaIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { useReadMyStats } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'

import { LogoSmall } from '../icons'

export interface YourStakeProps {
  /** Shown when no stats data (loading failed or empty) */
  message?: string
  /** Participating status text when user has stake */
  participatingLabel?: string
  onUnstakePress?: () => void
  onEarnedInfoPress?: () => void
  className?: string
}

const PARTICIPATING_LABEL = '✓ PARTICIPATING IN THE NEXT REWARD DISTRIBUTIONS'

type MyStatsData = { totalStakeAmount: number; totalPoints: number }

function getStatsDisplay(
  data: MyStatsData | undefined,
): { data: MyStatsData; showStaked: boolean; showEarned: boolean } | null {
  if (data == null) return null
  const showStaked = typeof data.totalStakeAmount === 'number'
  const showEarned = typeof data.totalPoints === 'number'
  if (!showStaked && !showEarned) return null
  return {
    data: {
      totalStakeAmount: data.totalStakeAmount ?? 0,
      totalPoints: data.totalPoints ?? 0,
    },
    showStaked,
    showEarned,
  }
}

function SolanaCircleIcon() {
  const contentPrimaryColor = useCSSVariable('--color-brand-quaternary') as string | undefined
  const iconColor = contentPrimaryColor

  return (
    <View
      className={cn('bg-content-primary rounded-[16px] inline-flex justify-start items-center gap-2.5 mx-1', 'size-4')}
    >
      <SolanaIcon
        size={16}
        className={contentPrimaryColor}
        {...(iconColor && { style: { color: iconColor } as React.ComponentProps<typeof SolanaIcon>['style'] })}
      />
    </View>
  )
}

function TramplinCircleIcon() {
  const contentPrimaryColor = useCSSVariable('--color-reward-small-primary') as string | undefined

  return (
    <View
      className={cn('bg-content-primary rounded-[16px] flex justify-center items-center gap-2.5 mx-1 pb-0.5', 'size-4')}
    >
      <LogoSmall width={10} height={10} color={contentPrimaryColor} />
    </View>
  )
}

/**
 * Staked card: light purple gradient, title "Staked", UNSTAKE, value + token unit.
 */
function StakedCard({
  value,
  onUnstakePress,
}: Readonly<{
  value: number
  onUnstakePress?: () => void
}>) {
  const displayValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0

  const primaryTint = useCSSVariable('--color-fill-primary')
  const secondaryTint = useCSSVariable('--color-brand-tertiary')

  return (
    <LinearGradient
      colors={[primaryTint, secondaryTint] as [string, string]}
      locations={[0, 1]}
      className="flex-1 rounded-lg border border-border-quaternary p-2.5 justify-between overflow-hidden"
    >
      <View className="flex-row items-center justify-between">
        <Text variant="h4" className="text-brand-primary">
          Staked
        </Text>
        {onUnstakePress ? (
          <Pressable onPress={onUnstakePress} hitSlop={8} className="active:opacity-80">
            <Text variant="small" className="text-brand-primary uppercase">
              UNSTAKE
            </Text>
          </Pressable>
        ) : (
          <Text variant="small" className="text-brand-primary uppercase">
            UNSTAKE
          </Text>
        )}
      </View>
      <View className="flex-row items-end gap-0.5">
        <Text variant="h3Digits" className="text-content-primary">
          {displayValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </Text>
        <View className="flex-row items-center gap-0.5 pb-1">
          <SolanaCircleIcon />
        </View>
      </View>
    </LinearGradient>
  )
}

/**
 * Earned card: light gold gradient, title "Earned", info icon, value + points.
 */
function EarnedCard({
  value,
  onInfoPress,
}: Readonly<{
  value: number
  onInfoPress?: () => void
}>) {
  const displayValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0
  const primaryTint = useCSSVariable('--color-reward-large-primary')
  const secondaryTint = useCSSVariable('--color-reward-small-primary')

  return (
    <LinearGradient
      colors={[primaryTint, secondaryTint] as [string, string]}
      locations={[0, 1]}
      className="flex-1 rounded-lg border border-border-quaternary p-2.5 justify-between overflow-hidden"
    >
      <View className="flex-row items-center justify-between">
        <Text variant="h4" className="text-reward-large-secondary">
          Earned
        </Text>
        {onInfoPress && (
          <Pressable onPress={onInfoPress} hitSlop={8} className="active:opacity-80">
            <QuestionIcon size={24} className="text-reward-large-secondary" />
          </Pressable>
        )}
      </View>
      <View className="flex-row items-end gap-0.5">
        <Text variant="h3Digits" className="text-content-primary">
          {displayValue.toLocaleString()}
        </Text>
        {/* <PointsIcon size={20} className="text-content-primary mb-1" /> */}

        <View className="flex-row items-center gap-0.5 pb-1">
          <TramplinCircleIcon />
          <Text variant="body" className="text-content-primary">
            points
          </Text>
        </View>
      </View>
    </LinearGradient>
  )
}

/**
 * Fetches readMyStats: shows placeholder when no data, otherwise Staked + Earned cards and participating status.
 */
export function YourStake({
  message = 'Your stake will appear here',
  participatingLabel = PARTICIPATING_LABEL,
  onUnstakePress,
  onEarnedInfoPress,
  className,
}: Readonly<YourStakeProps>) {
  const { data: apiData, isLoading, isError } = useReadMyStats()
  // console.log('apiData', apiData)
  // const mockData = {
  //   totalStakeAmount: 100,
  //   totalPoints: 100,
  // } as MyStats
  // console.log('apiData', apiData)
  const stats = getStatsDisplay(apiData)

  if (isLoading) {
    return (
      <View
        className={cn(
          'min-h-[170px] rounded-lg border border-border-quaternary bg-fill-secondary items-center justify-center',
          className,
        )}
      >
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!stats || isError) {
    return (
      <View
        className={cn(
          'min-h-[170px] rounded-lg border border-border-quaternary bg-fill-secondary items-center justify-center',
          className,
        )}
      >
        <Text variant="body" className="text-content-tertiary text-center">
          {message}
        </Text>
      </View>
    )
  }

  const { data, showStaked, showEarned } = stats
  const placeholderCard = (
    <View
      className={cn(
        'min-h-[170px] flex-1 rounded-lg border border-border-quaternary bg-fill-secondary items-center justify-center',
        className,
      )}
    >
      <Text variant="body" className="text-content-tertiary text-center">
        {message}
      </Text>
    </View>
  )

  return (
    <View className={cn('gap-4', className)}>
      <View className="flex flex-row gap-3 h-[170px]">
        <View className="flex-1 min-w-0">
          {showStaked ? <StakedCard value={data.totalStakeAmount} onUnstakePress={onUnstakePress} /> : placeholderCard}
        </View>
        <View className="flex-1 min-w-0">
          {showEarned ? <EarnedCard value={data.totalPoints} onInfoPress={onEarnedInfoPress} /> : placeholderCard}
        </View>
      </View>
      {/* <Text variant="small" className="text-content-tertiary">
        {participatingLabel}
      </Text> */}
    </View>
  )
}
