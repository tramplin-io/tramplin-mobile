import { StyleSheet, View } from 'react-native'
import { VideoView } from 'expo-video'

import { Logo } from '@/components/icons'
import { CommunityStats } from '@/components/main'
import { Text } from '@/components/ui/text'
import { useVideoPlayerWithLifecycle } from '@/hooks/useVideoPlayerWithLifecycle'

const tramplinHeroMobileColored = require('@/assets/videos/tramplin_hero_mobile_colored.mp4')

interface Slide1Props {
  readonly width: number
  readonly isActive?: boolean
}

/**
 * Slide 1: Greeting hero. Video background (full-bleed), logo and copy from design.
 */
export function Slide1({ width, isActive: _isActive = true }: Slide1Props) {
  const { player, isFocused } = useVideoPlayerWithLifecycle(tramplinHeroMobileColored)

  return (
    <View style={[styles.slide, { width }]}>
      {isFocused && (
        <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
      )}

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

        <CommunityStats
          className="mt-16"
          stakedLabel="Staked"
          distributionLabel="Distributed"
          textClassName="text-fill-primary"
          dividerClassName="bg-white/40"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
})
