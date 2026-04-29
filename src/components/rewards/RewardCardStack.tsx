import { ImageBackground, Pressable, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { SmallCupIcon, SolanaCircleIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import type { DrawType } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatPrizeSol } from '@/utils/format'

const rewardSilverSmallVideo = require('@/assets/videos/rewards/tramplin_reward_silver_7x1.mp4')
const rewardSilverSmallImage = require('@/assets/images/rewards/tramplin_reward_silver_7x1.png')

const rewardGreenSmallVideo = require('@/assets/videos/rewards/tramplin_reward_green_7x1.mp4')
const rewardGreenSmallImage = require('@/assets/images/rewards/tramplin_reward_green_7x1.png')

type RewardCardStackProps = Readonly<{
  reward?: number
  count: number
  drawType?: DrawType
  shouldPlayVideo?: boolean
  onPress?: () => void
}>

export function RewardCardStack({
  reward = 0,
  count,
  drawType = 'regular',
  shouldPlayVideo = false,
  onPress,
}: RewardCardStackProps) {
  const solColor = useCSSVariable('--color-reward-small-primary') as string
  const smallCupColor = useCSSVariable('--color-reward-small-primary') as string

  const rewardLargeSecondary = (useCSSVariable('--color-reward-small-secondary') as string) ?? '#7E650D'
  const contentPrimary = (useCSSVariable('--color-content-primary') as string) ?? '#000'

  const amountSol = formatPrizeSol(reward)
  // const awardedText = revealedAt ? formatAwardedAgo(revealedAt) : null

  let sourceVideo: number = rewardSilverSmallVideo
  let sourceImage: number = rewardSilverSmallImage

  if (drawType === 'epoch') {
    sourceVideo = rewardGreenSmallVideo
    sourceImage = rewardGreenSmallImage
  }

  return (
    <View className="relative">
      {/* Main card — same layout as RewardCardRegular */}
      <View
        className={cn(
          'rounded-xl overflow-hidden flex-row items-center justify-between p-2.5',
          'border border-reward-small-secondary z-50',
          'h-17',
        )}
      >
        <LinearGradient
          colors={[rewardLargeSecondary, contentPrimary]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        {shouldPlayVideo ? (
          <RewardCardBackgroundVideo sourceVideo={sourceVideo} />
        ) : (
          <RewardCardStaticBackground sourceImage={sourceImage} />
        )}
        <View className="flex-1" pointerEvents="none">
          <View className="flex-row items-center py-1">
            <Text variant="h4Digits" className="text-reward-small-primary">
              +{amountSol}
            </Text>
            <SolanaCircleIcon size={32} color={solColor} />
          </View>
          {/* <Text variant="small" className="text-reward-small-primary">
            {awardedText}
          </Text> */}
        </View>

        <View className="flex-row items-center gap-0.5" pointerEvents="none">
          <Text variant="small" className="text-reward-small-primary ">
            CLAIM
          </Text>
          <Text variant="body" className="text-reward-small-primary ">
            {count}
          </Text>
          <SmallCupIcon size={24} color={smallCupColor} />
          <Text variant="small" className="text-reward-small-primary ">
            REWARDS
          </Text>
        </View>

        {/* Invisible overlay so the whole card is tappable; native VideoView can still capture touches otherwise */}
        {onPress && (
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={onPress}
            className="active:opacity-95"
            accessibilityRole="button"
            accessibilityLabel="Expand rewards stack"
          />
        )}
      </View>
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
