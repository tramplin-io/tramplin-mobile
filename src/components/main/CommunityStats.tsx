import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { useReadProtocolSummary } from '@/lib/api/generated/restApi'
import { cn } from '@/lib/utils'

export interface CommunityStatsProps {
  /** Optional class for container */
  className?: string
  /** Divider class; default works on light background */
  dividerClassName?: string
  /** Text color class for labels and values (e.g. text-fill-primary on dark) */
  textClassName?: string
  /** Label for first row (staked total) */
  stakedLabel?: string
  /** Label for second row (distribution pool) */
  distributionLabel?: string
}

const DEFAULT_STAKED_LABEL = 'Staked '
const DEFAULT_DISTRIBUTION_LABEL = 'Distributed'

/**
 * Displays staked total and distribution pool with values from protocol summary.
 * Layout matches Slide1 stats block (flex-row justify-between, divider).
 */
export function CommunityStats({
  className,
  dividerClassName = 'bg-border-tertiary',
  textClassName = 'text-content-primary',
  stakedLabel = DEFAULT_STAKED_LABEL,
  distributionLabel = DEFAULT_DISTRIBUTION_LABEL,
}: Readonly<CommunityStatsProps>) {
  const { data } = useReadProtocolSummary()
  const totalStakeUSDCents = data?.totalStakeUSDCents ?? 0
  const distributionPoolUSDCents = data?.distributionPoolUSDCents ?? 0

  return (
    <View className={cn('gap-2', className)}>
      <View className="flex-row justify-between items-baseline">
        <Text variant="body" className={textClassName}>
          {stakedLabel}
        </Text>
        <Text variant="h4Digits" className={textClassName}>
          ${(totalStakeUSDCents / 100).toLocaleString()}
        </Text>
      </View>
      <View className={cn('h-px', dividerClassName)} />
      <View className="flex-row justify-between items-baseline">
        <Text variant="body" className={textClassName}>
          {distributionLabel}
        </Text>
        <Text variant="h4Digits" className={textClassName}>
          ${(distributionPoolUSDCents / 100).toLocaleString()}
        </Text>
      </View>
    </View>
  )
}
