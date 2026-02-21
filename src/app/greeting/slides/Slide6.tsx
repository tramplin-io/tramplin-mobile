import { View, Image } from 'react-native'
import { Text } from '@/components/ui/text'

const unstakeImage = require('@/assets/images/greeting/unstake_anytime.png')

interface Slide6Props {
  width: number
}

/**
 * Slide 6: Unstake anytime. Background: bg-fill-primary.
 */
export function Slide6({ width }: Slide6Props) {
  return (
    <View style={{ width }} className="flex-1 bg-silver-light px-5 pt-24 gap-5">
      <Text variant="h4" className="text-olive">
        Unstake{' '}
        <Text variant="h4" className="text-olive-dark">
          anytime
        </Text>
      </Text>
      <View className="w-full items-center justify-center">
        <Image source={unstakeImage} className="aspect-square w-full rounded-md" resizeMode="contain" />
      </View>
      <Text variant="body" className="text-olive">
        You benefit from safety of the Solana native staking while getting access to fair, outsized reward
        opportunities.
      </Text>
    </View>
  )
}
