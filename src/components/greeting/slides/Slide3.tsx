import { View, StyleSheet } from 'react-native'
// import LottieView from 'lottie-react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Text } from '@/components/ui/text'

const tramplinIcon01 = require('@/assets/videos/tramplin_icon_01.mp4')

interface Slide3Props {
  readonly width: number
}

/**
 * Slide 3: How it works. Background: bg-fill-primary.
 */
export function Slide3({ width }: Slide3Props) {
  const player = useVideoPlayer(tramplinIcon01, (p) => {
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
          <Text variant="body">1</Text>
        </View>
        <Text variant="h4">Stake your SOL</Text>
      </View>

      <View className="w-full items-center justify-center aspect-square rounded-md overflow-hidden">
        <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="contain" nativeControls={false} />
      </View>

      <View>
        <Text variant="body">Your principal is never at risk.</Text>
      </View>
    </View>
  )
}
