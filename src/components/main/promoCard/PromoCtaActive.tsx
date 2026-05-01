import { Pressable, View } from 'react-native'

import { Text } from '@/components/ui/text'
import { formatPrizeSol } from '@/utils/format'

import { ReferralStatsInline } from '../../referrals'
import { LAMPORTS_PER_SOL } from './utils'

export interface PromoCtaActiveProps {
  isFullyParticipating: boolean
  isPartiallyParticipating: boolean
  minStakeAmountInLamports: number
  stakedLamports: number
  onStakePress?: () => void
}

export function PromoCtaActive({
  isFullyParticipating,
  isPartiallyParticipating,
  minStakeAmountInLamports,
  stakedLamports,
  onStakePress,
}: Readonly<PromoCtaActiveProps>) {
  const minStakeSol = minStakeAmountInLamports / LAMPORTS_PER_SOL
  const neededSol = (minStakeAmountInLamports - stakedLamports) / LAMPORTS_PER_SOL

  if (isFullyParticipating) {
    return (
      <View className="bg-fill-primary rounded-lg px-3 py-2.5 flex-row items-center gap-1 flex-wrap">
        <Text variant="smallRegular" className="text-content-tertiary">
          {"You're in!"}
        </Text>
        <ReferralStatsInline text="Invite friends to fill it faster →" />
      </View>
    )
  }

  if (isPartiallyParticipating) {
    return (
      <View className="bg-fill-primary rounded-lg px-3 py-2.5 flex-row items-center gap-1 flex-wrap">
        <Pressable onPress={onStakePress} hitSlop={8} className="active:opacity-70">
          <Text variant="smallRegular" className="text-content-tertiary">
            {`Min stake is ${formatPrizeSol(minStakeSol)} SOL. `}
            <Text variant="smallRegular" className="text-reward-large-secondary">
              {`Add ${formatPrizeSol(neededSol)} SOL to participate →`}
            </Text>
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="bg-fill-primary rounded-lg px-3 py-2.5 flex-row items-center gap-1 flex-wrap">
      <Pressable onPress={onStakePress} hitSlop={8} className="active:opacity-70">
        <Text variant="smallRegular" className="text-content-tertiary">
          {`Min stake is ${formatPrizeSol(minStakeSol)} SOL. `}
          <Text variant="smallRegular" className="text-reward-large-secondary">
            Stake SOL to enter →
          </Text>
        </Text>
      </Pressable>
    </View>
  )
}
