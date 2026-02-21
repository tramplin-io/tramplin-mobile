import { View, Image } from 'react-native'
import { Text } from '@/components/ui/text'

const explainerImage = require('@/assets/images/greeting/explainer.png')

// const howItWorksImages = [
//   require('@/assets/images/greeting/how-it-works/Step=1.png'),
//   require('@/assets/images/greeting/how-it-works/Step=2.png'),
//   require('@/assets/images/greeting/how-it-works/Step=3.png'),
//   require('@/assets/images/greeting/how-it-works/Step=4.png'),
//   require('@/assets/images/greeting/how-it-works/Step=5.png'),
//   require('@/assets/images/greeting/how-it-works/Step=6.png'),
//   require('@/assets/images/greeting/how-it-works/Step=7.png'),
//   require('@/assets/images/greeting/how-it-works/Step=8.png'),
//   require('@/assets/images/greeting/how-it-works/Step=9.png'),
// ]

interface Slide2Props {
  width: number
}

/**
 * Slide 2: Explainer. Background: --color-primary.
 */
export function Slide2({ width }: Slide2Props) {
  return (
    <View style={{ width }} className="flex-1 bg-liliac-dark px-5 pt-20 gap-5">
      <Text variant="small" className="text-fill-primary">
        HOW IT WORKS
      </Text>
      <Text variant="body" className="text-fill-primary">
        Tramplin brings the decades-tested{' '}
        <Text variant="body" className="text-content-primary">
          randomized incentive mechanism{' '}
        </Text>
        behind premium bonds onchain, translating a proven savings model into secure, engaging yield opportunities on
        Solana.
      </Text>
      <View className="w-full items-center justify-center">
        <Image source={explainerImage} className="w-full rounded-md" resizeMode="contain" />
      </View>
    </View>
  )
}
