import { StyleSheet, View } from 'react-native'
import { VideoView } from 'expo-video'

import { TramplinCircleBgIcon } from '@/components/icons'
import { Text } from '@/components/ui/text'
import { useVideoPlayerWithLifecycle } from '@/hooks/useVideoPlayerWithLifecycle'

const tramplinIcon02 = require('@/assets/videos/tramplin_icon_02.mp4')

interface Slide4Props {
  readonly width: number
}

/**
 * Slide 4: Collect Tramplin points. Background: bg-fill-primary.
 */
export function Slide4({ width }: Slide4Props) {
  const { player, isFocused } = useVideoPlayerWithLifecycle(tramplinIcon02)

  return (
    <View style={{ width }} className="flex-1 bg-silver-light px-5 pt-18 gap-5">
      <Text variant="h2" className="text-center">
        How it works?
      </Text>

      <View className="flex-row items-center gap-2">
        <View className="size-6 border border-content-primary rounded-full flex items-center justify-center">
          <Text variant="body">2</Text>
        </View>
        <View className="flex-row items-center gap-0.5">
          <Text variant="h4">Collect</Text>
          <TramplinCircleBgIcon />
          <Text variant="h4">Tramplin points</Text>
        </View>
      </View>

      <View className="w-full items-center justify-center aspect-square rounded-md overflow-hidden">
        {isFocused && (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
            nativeControls={false}
          />
        )}
      </View>

      <View>
        <Text variant="body">Points will increase your pool share</Text>
      </View>
      {/* 
      <Pressable className="flex-row items-center gap-1" onPress={() => Linking.openURL(EARNING_POINTS_URL)}>
        <Text variant="small" className="text-olive-light uppercase underline">
          More on earning points
        </Text>
        <LinkIcon size={22}  />
      </Pressable> */}
    </View>
  )
}
