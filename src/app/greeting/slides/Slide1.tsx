import { View, ImageBackground } from 'react-native'
import { Text } from '@/components/ui/text'
import { Logo } from '@/components/icons'

const splashImage = require('@/assets/images/splash.png')

interface Slide1Props {
  readonly width: number
}

/**
 * Slide 1: Greeting hero. Splash image as background, logo and copy from design.
 */
export function Slide1({ width }: Slide1Props) {
  const stakedByCommunity = 19457889
  const distributionPool = 150000

  return (
    <ImageBackground source={splashImage} style={{ width }} className="flex-1" resizeMode="cover">
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
    </ImageBackground>
  )
}
