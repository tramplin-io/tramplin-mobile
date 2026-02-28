import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { RewardIcon, SolanaCircleIcon } from '@/components/icons/icons'
import { cn } from '@/lib/utils'
import { formatAwardedAgo, formatPrizeSol } from '@/utils/format'

import { Button, GradientText } from '../ui'
import { Text } from '../ui/text'

const rewardSilverSmallVideo = require('@/assets/videos/rewards/tramplin_reward_silver_7x1.mp4')

type RewardCardRegularProps = Readonly<{
  reward?: number
  variant?: 'claim' | 'summary' | 'loading' | 'empty'
  onClaim?: () => Promise<void>
  claimCount?: number
  revealedAt?: string
  disabled?: boolean
  hasError?: boolean
  buttonText?: string | null
}>

export function RewardCardRegular({
  reward,
  variant = 'claim',
  onClaim,
  claimCount = 1,
  revealedAt,
  disabled = false,
  hasError = false,
  buttonText,
}: RewardCardRegularProps) {
  const amountSol = reward ? formatPrizeSol(reward) : '0'
  const awardedText = revealedAt ? formatAwardedAgo(revealedAt) : null

  const player = useVideoPlayer(rewardSilverSmallVideo, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  const solColor = useCSSVariable('--color-reward-small-primary') as string

  return (
    <View
      className={cn(
        'rounded-xl overflow-hidden flex-row items-center justify-between p-2.5',
        'border border-reward-small-secondary',
        'h-17',
        hasError && 'border-critical-secondary bg-critical-primary/20',
        disabled && 'opacity-50',
      )}
    >
      <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />

      {variant === 'empty' && (
        <View className="flex-col justify-center items-center gap-2 mx-auto py-1">
          <Text variant="body" className="text-reward-small-primary ">
            No unclaimed rewards.
          </Text>
          <Text variant="body" className="text-reward-small-primary ">
            Your rewards will appear here.
          </Text>
        </View>
      )}
      {variant === 'loading' ? (
        <View className="flex-row justify-center items-center gap-2 mx-auto">
          <ActivityIndicator size={20} color={solColor} />
          <Text variant="body" className="text-reward-small-primary py-4">
            Loading rewards…
          </Text>
        </View>
      ) : (
        <>
          {['claim', 'summary'].includes(variant) && (
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text variant="h4Digits" className="text-reward-small-primary">
                  +{amountSol}
                </Text>
                <SolanaCircleIcon size={32} color={solColor} />
              </View>
              {awardedText && (
                <Text variant="small" className="text-reward-small-primary">
                  {awardedText}
                </Text>
              )}
            </View>
          )}
          {variant === 'claim' && (
            <Button
              variant={hasError ? 'error' : 'black'}
              size="lg"
              onPress={onClaim}
              disabled={disabled}
              className="rounded-full px-4 "
            >
              {buttonText ? <GradientText>{buttonText}</GradientText> : <GradientText>Claim Now</GradientText>}
            </Button>
          )}

          {variant === 'summary' && (
            <Button
              variant={hasError ? 'error' : 'black'}
              size="lg"
              onPress={onClaim}
              disabled={disabled}
              className="rounded-full px-4 my-0.5 "
            >
              {buttonText ? (
                <GradientText>{buttonText}</GradientText>
              ) : (
                <GradientText>{`Claim ${claimCount} rewards`}</GradientText>
              )}
            </Button>
          )}
        </>
      )}
    </View>
  )
}
