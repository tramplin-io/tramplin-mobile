import { Pressable, StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { peekBg, videoSources } from './utils'

export interface PromoCardHeaderProps {
  type: string
  prize: string
  variant: 'active' | 'completed'
  onHowItWorksPress: () => void
}

function PromoCardVideo({ source }: Readonly<{ source: number }>) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      contentFit="fill"
      nativeControls={false}
      pointerEvents="none"
    />
  )
}

export function PromoCardHeader({ type, prize, variant, onHowItWorksPress }: Readonly<PromoCardHeaderProps>) {
  return (
    <View
      className={cn(
        'px-3 py-3 flex-row items-center gap-1 pb-55',
        'rounded-lg overflow-hidden border border-border-quaternary',
      )}
    >
      <View style={StyleSheet.absoluteFillObject} className={cn('rounded-lg ', peekBg[variant])}>
        <PromoCardVideo source={videoSources[variant]} />
      </View>
      <View
        className={cn('rounded-full px-3 py-1', variant === 'completed' ? 'bg-fill-tertiary' : 'bg-brand-quaternary')}
      >
        <Text variant="smallRegular" className="text-content-primary">
          {type}
        </Text>
      </View>
      <View className="bg-reward-large-primary rounded-full px-3 py-1">
        <Text variant="smallRegular" className="text-content-primary">
          Win {prize}
        </Text>
      </View>
      <View className="flex-1 items-end">
        <Pressable onPress={onHowItWorksPress} hitSlop={8} className="active:opacity-70">
          <Text variant="smallRegular" className="text-border-quaternary">
            How does it work?
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
