import { View, Image, Pressable, Linking } from 'react-native'
import { Text } from '@/components/ui/text'
import { LinkIcon } from '@/components/icons/icons'
import { EARNING_POINTS_URL } from '@/constants/greeting'

const tramplinPointsImage = require('@/assets/images/greeting/tramplin_points.png')

interface Slide4Props {
  width: number
}

/**
 * Slide 4: Collect Tramplin points. Background: bg-fill-primary.
 */
export function Slide4({ width }: Slide4Props) {
  return (
    <View style={{ width }} className="flex-1 bg-silver-light px-5 pt-24 gap-5">
      <Text variant="h4" className="text-olive">
        Collect{' '}
        <Text variant="h4" className="text-olive-dark">
          Tramplin
        </Text>{' '}
        points
      </Text>
      <View className="w-full items-center justify-center">
        <Image source={tramplinPointsImage} className="aspect-square w-full rounded-md" resizeMode="contain" />
      </View>
      <View>
        <Text variant="body" className="text-olive">
          The longer you stake, the more points you earn.
        </Text>
        <Text variant="body" className="text-olive">
          The more points you accumulate, the higher your chances for rewards.
        </Text>
      </View>

      <Pressable className="flex-row items-center gap-1" onPress={() => Linking.openURL(EARNING_POINTS_URL)}>
        <Text variant="small" className="text-olive uppercase underline">
          More on earning points
        </Text>
        <LinkIcon size={22} className="text-olive" />
      </Pressable>
    </View>
  )
}
