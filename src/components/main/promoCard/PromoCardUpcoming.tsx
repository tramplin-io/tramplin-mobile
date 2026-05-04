import { useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import { Countdown } from '@/components/rewards'
import { Text } from '@/components/ui/text'
import type { Promo } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatPrizeSol } from '@/utils/format'

// import { GradientProgressBar } from '../../general/GradientProgressBar'
import { PromoCardHeader } from './PromoCardHeader'
import { PromoHowItWorksModal } from './PromoHowItWorksModal'
import { LAMPORTS_PER_SOL } from './utils'

export interface PromoCardUpcomingProps {
  promo: Promo
  className?: string
  onStakePress?: () => void
  onStarted?: () => void
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function PromoCardUpcoming({ promo, className, onStakePress, onStarted }: Readonly<PromoCardUpcomingProps>) {
  const { type, title, cardHeaderTitle, startsAt, minStakeAmountInLamports, howItWorks } = promo

  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  const startsAtDate = useMemo(() => (startsAt ? new Date(startsAt) : null), [startsAt])
  const minStakeSol = minStakeAmountInLamports / LAMPORTS_PER_SOL

  const [countdownFormat, setCountdownFormat] = useState<'dhm' | 'hms'>(() => {
    const ms = startsAtDate ? startsAtDate.getTime() - Date.now() : 0
    return ms >= ONE_DAY_MS ? 'dhm' : 'hms'
  })

  // Switch from 'dhm' to 'hms' exactly when < 24h remain
  useEffect(() => {
    if (!startsAtDate || countdownFormat === 'hms') return
    const msUntilSwitch = startsAtDate.getTime() - Date.now() - ONE_DAY_MS
    if (msUntilSwitch <= 0) {
      setCountdownFormat('hms')
      return
    }
    const timer = setTimeout(() => setCountdownFormat('hms'), msUntilSwitch)
    return () => clearTimeout(timer)
  }, [startsAtDate, countdownFormat])

  return (
    <>
      <View className={cn(className)}>
        <PromoCardHeader
          type={type}
          cardHeaderTitle={cardHeaderTitle}
          // variant="active"
          variant="completed"
          onHowItWorksPress={() => setHowItWorksOpen(true)}
        />

        <View className="bg-fill-secondary px-4 pt-5 pb-4 gap-4 rounded-lg border border-border-quaternary -mt-52">
          <View className="flex-row items-end gap-0 my-4.5">
            <Text variant="h4" className="text-content-primary mb-2">
              in
            </Text>
            <Countdown
              date={startsAtDate}
              format={countdownFormat}
              showPrefix={false}
              digitsClassName="text-h2 font-family-digits min-w-15 text-center text-reward-large-secondary"
              unitsClassName="text-h2 font-family-digits text-reward-large-secondary"
              onExpire={onStarted}
            />
          </View>

          {/* <GradientProgressBar progress={progress} brandColor={brandPrimary} goldColor={rewardLargePrimary} /> */}

          <Text variant="smallRegular" className="text-content-tertiary">
            {`${title} is starting soon!`}
          </Text>

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
