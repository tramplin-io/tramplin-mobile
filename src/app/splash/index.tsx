import { useEffect } from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Logo } from '@/components/icons'
import { Text } from '@/components/ui/text'

const tramplinHeroMobileImageColored = require('@/assets/images/tramplin_hero_mobile_colored.png')

/**
 * Splash screen — full-screen brand intro with video and logo.
 * Shows tagline and auto-transitions to greeting after a short delay.
 *
 * We unmount VideoView before navigating to avoid "Cannot use shared object
 * that was already released" when useVideoPlayer releases the player during
 * screen unmount while the native view still references it.
 */
export default function SplashAnimationScreen() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/greeting/')
    }, 2000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <View style={styles.slide}>
      <RewardCardStaticBackground />

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
      </View>
    </View>
  )
}

function RewardCardStaticBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <ImageBackground
        source={tramplinHeroMobileImageColored}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
