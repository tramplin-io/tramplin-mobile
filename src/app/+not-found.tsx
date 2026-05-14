import { ImageBackground, StyleSheet, View } from 'react-native'
import { router, Stack } from 'expo-router'
import LottieView from 'lottie-react-native'

import { ScreenWrapper } from '@/components/general'
import { Logo } from '@/components/icons'
import { Button } from '@/components/ui'
import { Text } from '@/components/ui/text'

const tramplinHeroMobileImageColored = require('@/assets/images/tramplin_hero_mobile_colored.png')

const notFoundAnimation = require('@/assets/animation/404.json')

export default function NotFoundScreen() {
  const handleGoHome = () => {
    router.replace('/tabs/')
  }

  return (
    <ScreenWrapper className="flex-1 bg-fill-primary">
      <Stack.Screen options={{ headerShown: false }} />
      <NotFoundBackground />
      <View className="flex-1 items-center justify-center px-4 gap-4">
        <View className="items-center gap-5">
          <Logo width={250} height={46} color="#FFFFFF" />
        </View>
        <View className="">
          <LottieView source={notFoundAnimation} autoPlay loop style={{ width: 300, height: 230 }} />
        </View>
        <Text variant="h3" className="text-center text-fill-primary">
          Page Not Found
        </Text>
        <Text variant="h4" className="text-center mb-4 text-fill-primary">
          The page you are looking for does not exist or has been moved.
        </Text>

        <Button variant="default" size="xl" className="w-full" onPress={handleGoHome}>
          <Text>Go to Home</Text>
        </Button>
      </View>
    </ScreenWrapper>
  )
}

function NotFoundBackground() {
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
