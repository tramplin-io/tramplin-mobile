import { useState } from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { Text } from '@/components/ui/text'
import type { Promo } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { ellipsify } from '@/utils/format'

import { GradientProgressBar } from '../../general'
import { PromoCardHeader } from './PromoCardHeader'
import { PromoCtaCompleted } from './PromoCtaCompleted'
import { PromoHowItWorksModal } from './PromoHowItWorksModal'
import { formatWithCommas, LAMPORTS_PER_SOL } from './utils'

export interface PromoCardCompletedProps {
  promo: Promo
  className?: string
}

export function PromoCardCompleted({ promo, className }: Readonly<PromoCardCompletedProps>) {
  const {
    type,
    title,
    cardHeaderTitle,
    prize,
    targetAmount,
    targetType,
    currentAmount = 0,
    winnerWalletAddresses,
    endsAt,
    howItWorks,
    participatedStakedAmountSol,
    minStakeAmountInLamports,
  } = promo

  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  const brandPrimary = useCSSVariable('--color-brand-primary') as string
  const rewardLargePrimary = useCSSVariable('--color-reward-large-primary') as string

  const targetUnit = targetType === 'sol' ? 'SOL' : 'stakers'
  const winners = winnerWalletAddresses ?? []
  const stakedLamports = participatedStakedAmountSol ? participatedStakedAmountSol * LAMPORTS_PER_SOL : 0
  const isFullyParticipating = stakedLamports >= minStakeAmountInLamports && stakedLamports > 0

  const statusText =
    winners.length === 1
      ? `🎉 Pool unlocked! ${ellipsify(winners[0], 4)} just received a ${prize} reward.`
      : winners.length > 1
        ? `🎉 Pool unlocked! ${winners.length} winners just received the ${prize} reward.`
        : `🎉 Pool unlocked! Someone is about to receive a ${prize} reward.`

  return (
    <>
      <View className={cn(className)}>
        <PromoCardHeader
          type={type}
          variant="completed"
          cardHeaderTitle={cardHeaderTitle}
          onHowItWorksPress={() => setHowItWorksOpen(true)}
        />

        <View className="bg-fill-secondary px-4 pt-5 pb-4 gap-4 rounded-lg border border-border-quaternary -mt-52">
          <View className="flex-row items-baseline gap-1 flex-wrap">
            <Text variant="h2Digits" className="text-[3.75rem] leading-17 text-reward-large-secondary tracking-[-3px]">
              {formatWithCommas(currentAmount)}
            </Text>
            <Text variant="h4" className="text-content-primary tracking-[-1px]">
              /{formatWithCommas(targetAmount)} {targetUnit}
            </Text>
          </View>

          <GradientProgressBar progress={100} brandColor={brandPrimary} goldColor={rewardLargePrimary} />

          <Text variant="smallRegular" className="text-content-tertiary">
            {statusText}
          </Text>

          <PromoCtaCompleted isFullyParticipating={isFullyParticipating} winners={winners} endsAt={endsAt} />
        </View>
      </View>

      <PromoHowItWorksModal
        open={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        title={title}
        content={howItWorks}
      />
    </>
  )
}
