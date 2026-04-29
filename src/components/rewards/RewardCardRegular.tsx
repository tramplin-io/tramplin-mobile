import { ActivityIndicator, ImageBackground, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { SolanaCircleIcon } from '@/components/icons/icons'
import type { DrawType } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatAwardedAgo, formatPrizeSol } from '@/utils/format'

import { Button, GradientText } from '../ui'
import { Text } from '../ui/text'

const rewardSilverSmallVideo = require('@/assets/videos/rewards/tramplin_reward_silver_7x1.mp4')
const rewardSilverSmallImage = require('@/assets/images/rewards/tramplin_reward_silver_7x1.png')

const rewardGreenSmallVideo = require('@/assets/videos/rewards/tramplin_reward_green_7x1.mp4')
const rewardGreenSmallImage = require('@/assets/images/rewards/tramplin_reward_green_7x1.png')

type RewardCardRegularProps = Readonly<{
  reward?: number
  variant?: 'claim' | 'summary' | 'loading' | 'empty'
  onClaim?: () => Promise<void>
  claimCount?: number
  revealedAt?: string
  disabled?: boolean
  hasError?: boolean
  buttonText?: string | null
  shouldPlayVideo?: boolean
  drawType?: DrawType
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
  shouldPlayVideo = false,
  drawType = 'regular',
}: RewardCardRegularProps) {
  const amountSol = reward ? formatPrizeSol(reward) : '0'
  const awardedText = revealedAt ? formatAwardedAgo(revealedAt) : null

  const solColor = useCSSVariable('--color-reward-small-primary') as string
  const criticalSecondary = useCSSVariable('--color-critical-secondary') as string
  const contentPrimary = useCSSVariable('--color-content-primary') as string

  let sourceVideo: number = rewardSilverSmallVideo
  let sourceImage: number = rewardSilverSmallImage

  if (drawType === 'epoch') {
    sourceVideo = rewardGreenSmallVideo
    sourceImage = rewardGreenSmallImage
  }

  return (
    <View
      className={cn(
        'rounded-xl overflow-hidden flex-row items-center justify-between p-2.5',
        'border border-reward-small-secondary',
        'h-17',
        hasError && 'border-critical-secondary bg-critical-primary/20',
        disabled && 'opacity-95',
      )}
    >
      {shouldPlayVideo ? (
        <RewardCardBackgroundVideo sourceVideo={sourceVideo} />
      ) : (
        <RewardCardStaticBackground sourceImage={sourceImage} />
      )}

      {hasError && (
        <LinearGradient
          colors={[criticalSecondary, contentPrimary]}
          locations={[0, 1]}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.75 }]}
        />
      )}
      {variant === 'empty' && (
        <View className="flex-col justify-center items-center gap-2 mx-auto py-1">
          <Text variant="body" className="text-reward-small-primary ">
            No rewards to claim yet
          </Text>
          {/* <Text variant="body" className="text-reward-small-primary ">
            Your rewards will appear here.
          </Text> */}
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
                <Text
                  variant="h4Digits"
                  className={cn(hasError ? 'text-critical-secondary' : 'text-reward-small-primary')}
                >
                  +{amountSol}
                </Text>
                <SolanaCircleIcon size={32} color={hasError ? criticalSecondary : solColor} />
              </View>
              {awardedText && !hasError && (
                <Text
                  variant="small"
                  className={cn(hasError ? 'text-critical-secondary' : 'text-reward-small-primary')}
                >
                  {awardedText}
                </Text>
              )}
              {hasError && (
                <Text variant="small" className="text-critical-secondary uppercase">
                  ERROR CLAIMING
                </Text>
              )}
            </View>
          )}
          {variant === 'claim' && (
            <Button
              variant={hasError ? 'errorSmall' : 'black'}
              size="lg"
              onPress={onClaim}
              disabled={disabled}
              className="rounded-full px-4 "
            >
              {buttonText ? (
                <GradientText hasError={hasError}>{buttonText}</GradientText>
              ) : (
                <GradientText hasError={hasError}>Claim Now</GradientText>
              )}
            </Button>
          )}

          {variant === 'summary' && (
            <Button
              variant={hasError ? 'errorSmall' : 'black'}
              size="lg"
              onPress={onClaim}
              disabled={disabled}
              className="rounded-full px-4 my-0.5 "
            >
              {buttonText ? (
                <GradientText hasError={hasError}>{buttonText}</GradientText>
              ) : (
                <GradientText hasError={hasError}>{`Claim ${claimCount} rewards`}</GradientText>
              )}
            </Button>
          )}
        </>
      )}
    </View>
  )
}

function RewardCardBackgroundVideo({ sourceVideo }: Readonly<{ sourceVideo: number }>) {
  const player = useVideoPlayer(sourceVideo, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  return <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
}

function RewardCardStaticBackground({ sourceImage }: Readonly<{ sourceImage: number }>) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <ImageBackground source={sourceImage} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
    </View>
  )
}
