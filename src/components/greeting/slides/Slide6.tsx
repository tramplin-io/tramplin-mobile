import { View, StyleSheet } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { Text } from '@/components/ui/text'

const tramplinIcon04 = require('@/assets/videos/tramplin_icon_04.mp4')

interface Slide6Props {
  readonly width: number
}

/**
 * Slide 6: Unstake anytime. Background: bg-fill-primary.
 */
export function Slide6({ width }: Slide6Props) {
  const player = useVideoPlayer(tramplinIcon04, (p) => {
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
          <Text variant="body">4</Text>
        </View>
        <Text variant="h4">Unstake anytime</Text>
      </View>

      <View className="w-full items-center justify-center aspect-square rounded-md overflow-hidden">
        <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="contain" nativeControls={false} />
      </View>
      <Text variant="body">Your SOL is yours only. Enjoy the safety of Solana native staking</Text>
    </View>
  )
}
