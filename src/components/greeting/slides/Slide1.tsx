import { View, StyleSheet } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Text } from '@/components/ui/text'
import { Logo } from '@/components/icons'

const tramplinHeroMobileColored = require('@/assets/videos/tramplin_hero_mobile_colored.mp4')

interface Slide1Props {
  readonly width: number
  readonly isActive?: boolean
}

/**
 * Slide 1: Greeting hero. Video background (full-bleed), logo and copy from design.
 */
export function Slide1({ width, isActive = true }: Slide1Props) {
  const player = useVideoPlayer(tramplinHeroMobileColored, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  const stakedByCommunity = 19457889
  const distributionPool = 150000

  return (
    <View style={[styles.slide, { width }]}>
      <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />

      <View className="flex-1 px-5 pt-0 justify-center-safe pb-8">
        <View className="items-center gap-5">
          <Logo width={250} height={46} color="#FFFFFF" />

          <View className="flex-col justify-center items-center gap-1 pt-20">
            <Text variant="h3" className="text-critical-primary">
              Premium
            </Text>

            <Text variant="h3" className="text-fill-primary">
              staking on Solana
            </Text>
          </View>
          <Text variant="body" className="text-fill-primary text-center mt-4">
            Boost your savings with randomized yield.
          </Text>
        </View>

        <View className="gap-2 mt-16">
          <View className="flex-row justify-between items-baseline">
            <Text variant="small" className="text-fill-primary">
              Staked
            </Text>
            <Text variant="h4Digits" className="text-fill-primary">
              ${stakedByCommunity.toLocaleString()}
            </Text>
          </View>
          <View className="h-px bg-white/40" />
          <View className="flex-row justify-between items-baseline">
            <Text variant="small" className="text-fill-primary">
              Distributed
            </Text>
            <Text variant="h4Digits" className="text-fill-primary">
              ${distributionPool.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
})
