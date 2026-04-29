import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useVideoPlayer, VideoView } from 'expo-video'

import { cn } from '@/lib/utils'

import { Text } from '../ui/text'

const emptyStateCardMobileMp4 = require('@/assets/videos/empty_state.mp4')

// <EmptyStateCard text="No unclaimed rewards." subtext="Your rewards will appear here." />

export function EmptyStateCard({
  className,
  text,
  subtext,
}: Readonly<{ className?: string; text?: string; subtext?: string }>) {
  const player = useVideoPlayer(emptyStateCardMobileMp4, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })
  return (
    <View
      className={cn(
        'mx-4 my-2 h-32 border border-border-quaternary rounded-lg overflow-hidden flex-col items-center justify-center bg-fill-primary z-1',
        className,
      )}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.00)',
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 1)',
          'rgba(255, 255, 255, 0.00)',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="flex-col items-center justify-center">
        {text && (
          <Text variant="body" className="text-content-tertiary">
            {text}
          </Text>
        )}
        {subtext && (
          <Text variant="body" className="text-content-tertiary opacity-40">
            {subtext}
          </Text>
        )}
      </View>
    </View>
  )
}
