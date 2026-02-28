import { useVideoPlayer, VideoView } from 'expo-video'
import { View, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SmallCupIcon, SolanaCircleIcon } from '@/components/icons/icons'
import { formatAwardedAgo, formatPrizeSol } from '@/utils/format'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { useCSSVariable } from 'uniwind'

const rewardSilverSmallVideo = require('@/assets/videos/rewards/tramplin_reward_silver_7x1.mp4')

type RewardCardStackProps = Readonly<{
  reward?: number
  count: number
  revealedAt?: string
  onPress: () => void
}>

export function RewardCardStack({ reward = 0, count, revealedAt, onPress }: RewardCardStackProps) {
  const player = useVideoPlayer(rewardSilverSmallVideo, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })
  const solColor = useCSSVariable('--color-reward-small-primary') as string
  const smallCupColor = useCSSVariable('--color-reward-small-primary') as string

  const rewardLargeSecondary = (useCSSVariable('--color-reward-small-secondary') as string) ?? '#7E650D'
  const contentPrimary = (useCSSVariable('--color-content-primary') as string) ?? '#000'

  const amountSol = formatPrizeSol(reward)
  const awardedText = revealedAt ? formatAwardedAgo(revealedAt) : null

  return (
    <Pressable onPress={onPress} className="active:opacity-95">
      <View className="relative">
        {/* Stacked layers effect */}
        <View
          pointerEvents="none"
          className={cn(
            'absolute rounded-xl overflow-hidden border border-reward-small-secondary',
            'right-2 -bottom-3 w-[95%] h-14 ',
          )}
        >
          <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
        </View>
        <View
          pointerEvents="none"
          className={cn(
            'absolute rounded-xl overflow-hidden border border-reward-small-secondary',
            'right-1 -bottom-1.5 w-[98%] h-14',
          )}
        >
          <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
        </View>
        {/* Main card — same layout as RewardCardRegular */}
        <View
          className={cn(
            'rounded-xl overflow-hidden flex-row items-center justify-between p-2.5',
            'border border-reward-small-secondary z-50',
          )}
        >
          <LinearGradient
            colors={[rewardLargeSecondary, contentPrimary]}
            locations={[0, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text variant="h4Digits" className="text-reward-small-primary">
                +{amountSol}
              </Text>
              <SolanaCircleIcon size={32} color={solColor} />
            </View>
            <Text variant="small" className="text-reward-small-primary">
              {awardedText}
            </Text>
          </View>

          <View className="flex-row items-center gap-0.5">
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
        </View>
      </View>
    </Pressable>
  )
}
