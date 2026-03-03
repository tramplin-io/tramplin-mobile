import { useEffect } from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import LottieView from 'lottie-react-native'

import { ScreenWrapper } from '@/components/general'
import { Logo } from '@/components/icons'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useNetworkStatus } from '@/lib/network'

const tramplinHeroMobileImageColored = require('@/assets/images/tramplin_hero_mobile_colored.png')
const noInternetAnimation = require('@/assets/animation/no-internet.json')

/**
 * No Internet Connection Screen.
 *
 */
export default function NoInternetScreen() {
  const { isLoading, recheck } = useNetworkStatus()

  useEffect(() => {
    recheck()
  }, [recheck])

  return (
    <ScreenWrapper className="flex-1 bg-fill-primary">
      <RewardCardStaticBackground />
      <View className="flex-1 items-center px-4 gap-4">
        <View className="mt-28">
          <LottieView source={noInternetAnimation} autoPlay loop style={{ width: 200, height: 200 }} />
        </View>

        <View className="items-center gap-5">
          <Logo width={250} height={46} color="#FFFFFF" />
        </View>

        <Text variant="h2" className="text-center mb-2 text-fill-primary" accessibilityRole="header">
          No Internet Connection
        </Text>
        <Text variant="h4" className="text-center mb-4 text-fill-primary">
          Please check your network settings and try again.
        </Text>
        <Button variant="default" size="xl" className=" w-full" onPress={recheck} disabled={isLoading}>
          <Text>{isLoading ? 'Checking...' : 'Try Again'}</Text>
        </Button>
      </View>
    </ScreenWrapper>
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
