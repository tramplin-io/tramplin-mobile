import { useCallback, useState } from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'
import { View, StyleSheet } from 'react-native'
import { RewardIcon, SolanaCircleIcon } from '@/components/icons/icons'
import { formatAwardedAgo, formatPrizeSol } from '@/utils/format'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { Button } from '../ui'
import { Text } from '../ui/text'
import { useCSSVariable } from 'uniwind'

const rewardSilverSmallVideo = require('@/assets/videos/rewards/tramplin_reward_silver_7x1.mp4')

type RewardCardRegularProps = Readonly<{
  win: Win
  onClaim: (win: Win) => Promise<void>
  claimCount?: number
}>

export function RewardCardRegular({ win, onClaim, claimCount = 1 }: RewardCardRegularProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  const amountSol = formatPrizeSol(win.prizeSol)
  const awardedText = formatAwardedAgo(win.revealedAt ?? win.createdAt)

  const player = useVideoPlayer(rewardSilverSmallVideo, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  const handleClaim = useCallback(async () => {
    if (isClaiming) return
    setClaimError(null)
    setIsClaiming(true)
    try {
      await onClaim(win)
    } catch {
      setClaimError('Error Claiming! Try again in 3s...')
      setTimeout(() => setClaimError(null), 3000)
    } finally {
      setIsClaiming(false)
    }
  }, [win, onClaim, isClaiming])

  const hasError = Boolean(claimError)

  return (
    <View
      className={cn(
        'rounded-xl overflow-hidden flex-row items-center justify-between p-2.5',
        'border border-reward-small-secondary',
        hasError && 'border-critical-secondary bg-critical-primary/20',
      )}
    >
      <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text variant="h4Digits" className="text-reward-small-primary">
            +{amountSol}
          </Text>
          <SolanaCircleIcon size={32} color={useCSSVariable('--color-reward-small-primary') as string} />
        </View>
        <Text variant="small" className="text-reward-small-primary">
          {awardedText}
        </Text>
      </View>

      <Button variant="black" size="lg" onPress={handleClaim} disabled={isClaiming} className="rounded-full px-4">
        {hasError ? (
          <Text numberOfLines={1}>{claimError}</Text>
        ) : (
          <>
            <Text className="text-content-tertiary">{claimCount > 1 ? `CLAIM ${claimCount}` : 'Claim'}</Text>
            {claimCount > 1 && <RewardIcon size={16} className="text-content-tertiary" />}
            <Text className="text-content-tertiary">{claimCount > 1 ? 'REWARDS' : 'Now'}</Text>
          </>
        )}
      </Button>
    </View>
  )
}
