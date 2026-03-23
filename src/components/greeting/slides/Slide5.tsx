import { StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'

import { Text } from '@/components/ui/text'

const tramplinIcon03 = require('@/assets/videos/tramplin_icon_03.mp4')

interface Slide5Props {
  readonly width: number
}

/**
 * Slide 5: Participate in redistribution. Background: bg-fill-primary.
 */
export function Slide5({ width }: Slide5Props) {
  const player = useVideoPlayer(tramplinIcon03, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  return (
    <View style={{ width }} className="flex-1 bg-silver-light px-5 pt-18 gap-5">
      <Text variant="h2" className="text-center">
        How it works?
      </Text>

      <View className="flex-row items-center gap-2">
        <View className="size-6 border border-content-primary rounded-full flex items-center justify-center">
          <Text variant="body">3</Text>
        </View>
        <Text variant="h4">Get into the reward loop</Text>
      </View>

      <View className="w-full items-center justify-center aspect-square rounded-md overflow-hidden">
        <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="contain" nativeControls={false} />
      </View>

      <Text variant="body">
        <Text variant="body">Every 10 Min:</Text> Randomly selected participants get a share of small rewards.
      </Text>

      <Text variant="body">
        <Text variant="body">Every Month:</Text> One lucky staker grabs big pool
      </Text>
      {/* <Pressable className="flex-row items-center gap-1" onPress={() => Linking.openURL(MODE_OF_DISTRIBUTION_URL)}>
        <Text variant="small" className="text-olive-light uppercase underline">
          More on distribution
        </Text>
        <LinkIcon size={22} className="text-olive-light" />
      </Pressable> */}
    </View>
  )
}
