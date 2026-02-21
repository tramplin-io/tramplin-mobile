import { View, Image } from 'react-native'
import { Text } from '@/components/ui/text'
const solStakeImage = require('@/assets/images/greeting/sol_gr.png')

interface Slide3Props {
  width: number
}

/**
 * Slide 3: How it works. Background: bg-fill-primary.
 */
export function Slide3({ width }: Slide3Props) {
  return (
    <View style={{ width }} className="flex-1 bg-silver-light px-5 pt-24 gap-5">
      <Text variant="h4" className="text-olive">
        Stake as little as{' '}
        <Text variant="h4" className="text-olive-dark">
          1 SOL
        </Text>
      </Text>
      <View className="w-full items-center justify-center">
        <Image source={solStakeImage} className="aspect-square w-full rounded-md" resizeMode="contain" />
      </View>
      <View>
        <Text variant="body" className="text-olive">
          It works just like any other validator.
        </Text>
        <Text variant="body" className="text-olive">
          Your principal is never at risk.
        </Text>
      </View>
    </View>
  )
}
