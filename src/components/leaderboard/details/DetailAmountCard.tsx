import { StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { ClockIcon, SolanaBigIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatPrizeSol, formatPrizeUSD } from '@/utils/format'

const rewardGoldVideo = require('@/assets/videos/rewards/tramplin_reward_gold_2x1.mp4') // big
const rewardGreenVideo = require('@/assets/videos/rewards/tramplin_reward_green_2x1.mp4') // epoch
const rewardSilverVideo = require('@/assets/videos/rewards/tramplin_reward_silver_2x1.mp4') // regular

function formatRevealedDate(dateStr?: string): { date: string; timeMain: string; timeSeconds: string } {
  if (!dateStr) return { date: '—', timeMain: '—', timeSeconds: '' }
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const timeMain = `${pad(h)}:${pad(m)}`
  const timeSeconds = pad(s)
  return { date, timeMain, timeSeconds }
}

type DetailAmountCardProps = Readonly<{ win: Win }>

export function DetailAmountCard({ win }: DetailAmountCardProps) {
  // const isGold = win.drawType === 'big'
  // const isRegular = win.drawType === 'regular'
  // const isEpoch = win.drawType === 'epoch'

  const { date, timeMain, timeSeconds } = formatRevealedDate(win.revealedAt)
  const amountSol = formatPrizeSol(win.prizeSol)
  const amountUsd = win.prizeUSDInCents == null ? null : `$${formatPrizeUSD(win.prizeUSDInCents)}`

  const rewardLargePrimary = useCSSVariable('--color-reward-large-primary') as string
  const rewardSmallPrimary = useCSSVariable('--color-reward-small-primary') as string

  let source = rewardSilverVideo
  let primaryColor: string
  let labelColor: string
  let iconColor: string
  let borderColor: string
  let separatorColor: string

  switch (win.drawType) {
    case 'big':
      source = rewardGoldVideo
      primaryColor = 'text-reward-large-primary'
      labelColor = 'text-reward-large-primary'
      iconColor = rewardLargePrimary
      borderColor = 'border-reward-large-primary'
      separatorColor = 'bg-reward-large-primary'
      break
    case 'epoch':
      source = rewardGreenVideo
      primaryColor = 'text-reward-small-primary'
      labelColor = 'text-reward-small-primary'
      iconColor = rewardSmallPrimary
      borderColor = 'border-reward-small-primary'
      separatorColor = 'bg-border-tertiary'
      break
    default: // regular
      source = rewardSilverVideo
      primaryColor = 'text-reward-small-primary'
      labelColor = 'text-reward-small-primary'
      iconColor = rewardSmallPrimary
      borderColor = 'border-reward-small-primary'
      separatorColor = 'bg-border-tertiary'
      break
  }

  const player = useVideoPlayer(source, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  return (
    <View
      // style={[styles.cardWrap]}
      className={cn('rounded-md overflow-hidden mb-6 w-full border', borderColor)}
    >
      <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
      <View className="flex-1 p-5 justify-between">
        {/* Top: AMOUNT label, amount + Solana icon + USD, separator */}
        <View className="flex-row items-end justify-between">
          <View className="flex-col items-baseline justify-between h-16">
            <Text variant="small" className={cn('uppercase tracking-wide mb-1', labelColor)}>
              Amount
            </Text>
            <View className="flex-row items-start">
              <Text variant="h3Digits" className={primaryColor}>
                {amountSol}
              </Text>
              <SolanaBigIcon size={32} color={iconColor} />
            </View>
          </View>

          {amountUsd && (
            <Text variant="body" className={cn('font-medium pr-4', primaryColor)}>
              {amountUsd}
            </Text>
          )}
        </View>

        <View className={cn('my-5 h-px w-full', separatorColor)} />

        {/* Bottom: DATE left, TIME right with clock + time (seconds smaller) */}
        <View className="flex-row justify-between">
          <View className="gap-1">
            <Text variant="small" className={cn('uppercase tracking-wide', labelColor)}>
              Date
            </Text>
            <Text variant="h4" className={cn('font-medium', primaryColor)}>
              {date}
            </Text>
          </View>
          <View className="items-start gap-1">
            <Text variant="small" className={cn('uppercase tracking-wide', labelColor)}>
              Time
            </Text>
            <View className="flex-row items-end ">
              <ClockIcon size={26} color={iconColor} />
              <Text variant="h4" className={cn('font-medium', primaryColor)}>
                {timeMain}
              </Text>
              {timeSeconds ? (
                <Text variant="small" className={cn('font-medium', primaryColor)}>
                  :{timeSeconds}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardWrap: {
    aspectRatio: 2 / 1,
  },
})
