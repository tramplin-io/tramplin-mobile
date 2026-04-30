import { useState } from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { Text } from '@/components/ui/text'
import type { Promo } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'

import { GradientProgressBar } from '../../general/GradientProgressBar'
import { PromoCardHeader } from './PromoCardHeader'
import { PromoCtaActive } from './PromoCtaActive'
import { PromoHowItWorksModal } from './PromoHowItWorksModal'
import { formatWithCommas, LAMPORTS_PER_SOL } from './utils'

export interface PromoCardActiveProps {
  promo: Promo
  className?: string
  onStakePress?: () => void
}

export function PromoCardActive({ promo, className, onStakePress }: Readonly<PromoCardActiveProps>) {
  const {
    type,
    title,
    prize,
    winnersAmount,
    targetAmount,
    targetType,
    currentAmount = 0,
    participatedStakedAmountSol,
    minStakeAmountInLamports,
    howItWorks,
  } = promo

  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  const brandPrimary = useCSSVariable('--color-brand-primary') as string
  const rewardLargePrimary = useCSSVariable('--color-reward-large-primary') as string

  const stakedLamports = participatedStakedAmountSol ? participatedStakedAmountSol * LAMPORTS_PER_SOL : 0
  const isFullyParticipating = stakedLamports >= minStakeAmountInLamports && stakedLamports > 0
  const isPartiallyParticipating = stakedLamports > 0 && stakedLamports < minStakeAmountInLamports

  const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0
  const remaining = Math.max(0, targetAmount - currentAmount)
  const targetUnit = targetType === 'sol' ? 'SOL' : 'stakers'
  const winnersLabel = winnersAmount === '1' ? '1 winner' : `${winnersAmount} winners`

  return (
    <>
      <View className={cn(className)}>
        <PromoCardHeader type={type} prize={prize} variant="active" onHowItWorksPress={() => setHowItWorksOpen(true)} />

        <View className="bg-fill-secondary px-4 pt-5 pb-4 gap-4 rounded-lg border border-border-quaternary -mt-52">
          <View className="flex-row items-baseline gap-1 flex-wrap">
            <Text variant="h2Digits" className="text-[3.75rem] leading-17 text-brand-primary tracking-[-3px]">
              {formatWithCommas(currentAmount)}
            </Text>
            <Text variant="h4" className="text-content-primary ">
              /{formatWithCommas(targetAmount)} {targetUnit}
            </Text>
          </View>

          <GradientProgressBar progress={progress} brandColor={brandPrimary} goldColor={rewardLargePrimary} />

          <Text variant="smallRegular" className="text-content-tertiary">
            {`${formatWithCommas(remaining)} ${targetUnit} remaining to unlock ${prize} for ${winnersLabel}`}
          </Text>

          <PromoCtaActive
            isFullyParticipating={isFullyParticipating}
            isPartiallyParticipating={isPartiallyParticipating}
            minStakeAmountInLamports={minStakeAmountInLamports}
            stakedLamports={stakedLamports}
            onStakePress={onStakePress}
          />
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
