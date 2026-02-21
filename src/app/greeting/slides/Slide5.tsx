import { View, Image, Pressable, Linking } from 'react-native'
import { Text } from '@/components/ui/text'
import { LinkIcon } from '@/components/icons/icons'
import { MODE_OF_DISTRIBUTION_URL } from '@/constants/greeting'

const redistributionImage = require('@/assets/images/greeting/participate_in_redistribution.png')

interface Slide5Props {
  width: number
}

/**
 * Slide 5: Participate in redistribution. Background: bg-fill-primary.
 */
export function Slide5({ width }: Slide5Props) {
  return (
    <View style={{ width }} className="flex-1 bg-silver-light px-5 pt-24 gap-5">
      <Text variant="h4" className="text-olive">
        Participate in{' '}
        <Text variant="h4" className="text-olive-dark">
          redistribution
        </Text>
      </Text>
      <View className="w-full items-center justify-center">
        <Image source={redistributionImage} className="aspect-square w-full rounded-md" resizeMode="contain" />
      </View>
      <Text variant="body" className="text-olive">
        Every 10 minutes, randomly selected user receives a share of rewards. Once a month, one staker grabs 20% of the
        entire reward pool.
      </Text>
      <Pressable className="flex-row items-center gap-1" onPress={() => Linking.openURL(MODE_OF_DISTRIBUTION_URL)}>
        <Text variant="small" className="text-olive uppercase underline">
          More on distribution
        </Text>
        <LinkIcon size={22} className="text-olive" />
      </Pressable>
    </View>
  )
}
