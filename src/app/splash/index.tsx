import { useEffect } from 'react'
import { View, Text, ImageBackground } from 'react-native'
import { useRouter } from 'expo-router'
import { useCSSVariable } from 'uniwind'
import { Logo } from '@/components/icons'

const splashImage = require('@/assets/images/splash.png')

/**
 * Splash screen — brand intro with background image and logo.
 * Shows tagline and auto-transitions to greeting after a short delay.
 */
export default function SplashAnimationScreen() {
  const router = useRouter()
  const logoColor = useCSSVariable('--color-content-overlay') as string | undefined

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/greeting/')
    }, 2500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <ImageBackground source={splashImage} className="flex-1" resizeMode="cover">
      <View className="flex-1 items-center justify-center px-6">
        <Logo width={200} height={38} color={logoColor} />
        <View className="items-center mt-8">
          <Text className="text-2xl font-normal text-white">Premium</Text>
          <Text className="text-[28px] font-bold text-brand-primary my-0.5">staking</Text>
          <Text className="text-2xl font-normal text-white">on Solana</Text>
        </View>
        <Text className="mt-4 text-base font-normal text-white text-center">
          Boost your savings with randomized yield. Safe.
        </Text>
      </View>
    </ImageBackground>
  )
}
