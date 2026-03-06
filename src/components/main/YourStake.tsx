import { ActivityIndicator, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useCSSVariable } from 'uniwind'

import { BigCupIcon, QuestionIcon, SmallCupIcon, SolanaIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { useUserActiveStake } from '@/hooks/useUserActiveStake'
import { useReadMyStats } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'

import { LogoSmall } from '../icons'

export interface YourStakeProps {
  /** Shown when no stats data (loading failed or empty) */
  message?: string
  onUnstakePress?: () => void
  onEarnedInfoPress?: () => void
  className?: string
}

type MyStatsData = {
  totalStakeAmount: number
  totalPoints: number
  effectiveStake?: number
  apr?: number
  totalWinSol?: number
  multiplier?: number
  isAttendingRegularDraw?: boolean
  isAttendingBigDraw?: boolean
}

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
      effectiveStake: data.effectiveStake,
      apr: data.apr,
      totalWinSol: data.totalWinSol,
      multiplier: data.multiplier,
      isAttendingRegularDraw: data.isAttendingRegularDraw,
      isAttendingBigDraw: data.isAttendingBigDraw,
    },
    showStaked,
    showEarned,
  }
}

function formatTruncated(value: number | undefined, fractionDigits = 2): string {
  const safe = typeof value === 'number' && !Number.isNaN(value) ? value : 0
  const factor = 10 ** fractionDigits
  const truncated = Math.floor(safe * factor) / factor
  return truncated.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

function SolanaCircleIcon({ color }: { color?: string }) {
  const contentPrimaryColor = useCSSVariable('--color-brand-quaternary') as string | undefined
  const iconColor = color ?? contentPrimaryColor

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

function TramplinCircleIcon({
  size = 10,
  color,
  className,
}: Readonly<{ size?: number; color?: string; className?: string }>) {
  const contentPrimaryColor = useCSSVariable('--color-reward-small-primary') as string | undefined

  const iconColor = color ?? contentPrimaryColor

  return (
    <View className={cn('bg-content-primary rounded-full flex justify-center items-center size-4', className)}>
      <LogoSmall width={size} height={size} color={iconColor} />
    </View>
  )
}

/**
 * Staked card: light purple gradient, title "Staked", UNSTAKE, value + token unit.
 */
function StakedCard({
  value,
  multiplier,
  effectiveStake,
  hasActiveStake,
  onUnstakePress,
}: Readonly<{
  value: number
  multiplier?: number
  effectiveStake?: number
  hasActiveStake?: boolean | null
  onUnstakePress?: () => void
}>) {
  const formatted = formatTruncated(value)
  const multiplierFormatted = formatTruncated(multiplier)

  const primaryTint = useCSSVariable('--color-fill-primary') as string
  const secondaryTint = useCSSVariable('--color-brand-tertiary') as string
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  return (
    <View className="flex-1 gap-2">
      <LinearGradient
        colors={[primaryTint, secondaryTint]}
        locations={[0, 1]}
        className="rounded-lg border border-border-quaternary p-2.5 justify-between overflow-hidden h-[170px]"
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
        <View className="gap-2">
          {Number(multiplierFormatted) > 0 && hasActiveStake && (
            <Text variant="small" className="text-brand-primary">
              {multiplierFormatted}x
            </Text>
          )}
          <View className="flex-row items-end gap-0.5">
            <Text variant="h3Digits" className="text-content-primary">
              {formatted}
            </Text>
            <View className="flex-row items-center gap-0.5 pb-1">
              <SolanaCircleIcon />
            </View>
          </View>
        </View>
      </LinearGradient>
      {effectiveStake != null && hasActiveStake && (
        <View className="flex-row items-center gap-0.5 px-0.5">
          <Text variant="small" className="text-content-tertiary">
            {formatTruncated(effectiveStake)}
          </Text>
          <View className="size-5 rounded-full bg-fill-secondary items-center justify-center">
            <SolanaIcon size={16} color={contentTertiary} />
          </View>
          <Text variant="small" className="text-content-tertiary uppercase">
            EFFECTIVE
          </Text>
        </View>
      )}
    </View>
  )
}

/**
 * Earned card — two visual states:
 * 1. Points mode (default): shows totalPoints with Tramplin icon + "points"
 * 2. SOL earnings mode: shows SOL amount, APR label, and points badge in top-right
 */
function EarnedCard({
  totalPoints,
  totalWinSol,
  apr,
  isAttendingBigDraw,
  isAttendingRegularDraw,
  hasActiveStake,
  onInfoPress,
}: Readonly<{
  totalPoints: number
  totalWinSol?: number
  apr?: number
  isAttendingBigDraw?: boolean
  isAttendingRegularDraw?: boolean
  hasActiveStake?: boolean | null
  onInfoPress?: () => void
}>) {
  const primaryTint = useCSSVariable('--color-reward-large-primary') as string
  const secondaryTint = useCSSVariable('--color-reward-small-primary') as string
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  const hasSolEarnings = totalWinSol != null && totalWinSol > 0
  const hasParticipation = isAttendingBigDraw || isAttendingRegularDraw

  const participatingFooter = hasParticipation ? (
    <View className="flex-row items-center gap-1 px-0.5">
      <Text variant="small" className="text-content-tertiary uppercase">
        PARTICIPATING IN
      </Text>
      {isAttendingRegularDraw && (
        <View className="size-5 rounded-full bg-fill-secondary items-center justify-center">
          <SmallCupIcon size={16} color={contentTertiary} />
        </View>
      )}
      {isAttendingBigDraw && (
        <View className="size-5 rounded-full bg-fill-secondary items-center justify-center">
          <BigCupIcon size={16} color={contentTertiary} />
        </View>
      )}
    </View>
  ) : null

  if (hasSolEarnings) {
    // const formatted = formatTruncated(totalWinSol, 2)

    return (
      <View className="flex-1 gap-2">
        <LinearGradient
          colors={[primaryTint, secondaryTint]}
          locations={[0, 1]}
          className="rounded-lg border border-border-quaternary p-2.5 justify-between overflow-hidden h-[170px]"
        >
          <View className="flex-row items-center justify-between">
            <Text variant="h4" className="text-reward-large-secondary">
              Earned
            </Text>
            <View className="flex-row items-end gap-0.5">
              <Text variant="body" className="text-reward-large-secondary">
                {totalPoints.toLocaleString()}
              </Text>
              <TramplinCircleIcon size={8} color={primaryTint} className="bg-reward-large-secondary" />
            </View>
          </View>
          <View className="gap-2">
            {apr != null && hasActiveStake && (
              <Text variant="small" className="text-reward-large-secondary">
                APR {apr}%
              </Text>
            )}
            <View className="flex-row items-end gap-0.5">
              <Text variant="h3Digits" className="text-content-primary">
                {totalWinSol}
              </Text>
              <View className="flex-row items-center gap-0.5 pb-1">
                <SolanaCircleIcon color={secondaryTint} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {hasActiveStake && participatingFooter}
      </View>
    )
  }

  return (
    <View className="flex-1 gap-2">
      <LinearGradient
        colors={[primaryTint, secondaryTint] as [string, string]}
        locations={[0, 1]}
        className="rounded-lg border border-border-quaternary p-2.5 justify-between overflow-hidden h-[170px]"
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
            {formatTruncated(totalPoints, 0)}
          </Text>
          <View className="flex-row items-center gap-0.5 pb-1">
            <TramplinCircleIcon />
            <Text variant="body" className="text-content-primary">
              points
            </Text>
          </View>
        </View>
      </LinearGradient>
      {participatingFooter}
    </View>
  )
}

type PlaceholderCardProps = {
  staked: boolean
  className?: string
}

function PlaceholderCard({ staked, className }: Readonly<PlaceholderCardProps>) {
  const messageStaked = 'Your stake will appear here'
  const messageEarned = 'Your points will appear here'

  const message = staked ? messageStaked : messageEarned

  return (
    <View
      className={cn(
        'h-[170px] flex-1 rounded-lg border border-border-quaternary bg-fill-secondary items-center justify-center',
        className,
      )}
    >
      <Text variant="body" className="text-content-tertiary text-center">
        {message}
      </Text>
    </View>
  )
}

/**
 * Fetches readMyStats: shows placeholder when no data, otherwise Staked + Earned cards and participating status.
 */
export function YourStake({
  message = 'Your stake will appear here',
  onUnstakePress,
  onEarnedInfoPress,
  className,
}: Readonly<YourStakeProps>) {
  const { data: apiData, isLoading, isError } = useReadMyStats()
  const { data: activeStake } = useUserActiveStake()

  const stats = getStatsDisplay(apiData)

  const hasActiveStake = activeStake && activeStake?.active >= 1

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
  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row gap-3">
        {showStaked ? (
          <StakedCard
            value={data.totalStakeAmount}
            multiplier={data.multiplier}
            effectiveStake={data.effectiveStake}
            hasActiveStake={hasActiveStake}
            onUnstakePress={onUnstakePress}
          />
        ) : (
          <PlaceholderCard staked={true} className={className} />
        )}
        {showEarned ? (
          <EarnedCard
            totalPoints={data.totalPoints}
            totalWinSol={data.totalWinSol}
            apr={data.apr}
            isAttendingBigDraw={data.isAttendingBigDraw}
            isAttendingRegularDraw={data.isAttendingRegularDraw}
            hasActiveStake={hasActiveStake}
            onInfoPress={onEarnedInfoPress}
          />
        ) : (
          <PlaceholderCard staked={false} className={className} />
        )}
      </View>
      {!hasActiveStake && (
        <Text variant="small" className="text-content-tertiary uppercase mt-1">
          + stake to participate in distribution
        </Text>
      )}
    </View>
  )
}
