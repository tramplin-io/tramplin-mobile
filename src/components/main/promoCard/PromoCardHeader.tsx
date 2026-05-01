import { Pressable, StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { InfoGoldIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { peekBg, videoSources } from './utils'

export interface PromoCardHeaderProps {
  type?: string
  cardHeaderTitle?: string
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

export function PromoCardHeader({ type, variant, cardHeaderTitle, onHowItWorksPress }: Readonly<PromoCardHeaderProps>) {
  const fillTertiary = useCSSVariable('--color-fill-tertiary') as string
  return (
    <View
      className={cn(
        'px-3 py-3 flex-row items-center gap-1 pb-55 relative',
        'rounded-lg overflow-hidden border border-border-quaternary',
      )}
    >
      <View style={StyleSheet.absoluteFillObject} className={cn('rounded-lg ', peekBg[variant])}>
        <PromoCardVideo source={videoSources[variant]} />
      </View>

      {type && (
        <View
          className={cn(
            'rounded-full px-2.5 py-1',
            variant === 'completed' ? 'bg-fill-tertiary' : 'bg-brand-quaternary',
          )}
        >
          <Text variant="smallRegular" className="text-reward-large-secondary">
            {type}
          </Text>
        </View>
      )}
      <Text variant="h4" className="absolute left-0 right-0 text-fill-tertiary text-center top-3.5">
        {cardHeaderTitle}
      </Text>

      <View className="flex-1 items-end">
        <Pressable onPress={onHowItWorksPress} hitSlop={8} className="active:opacity-70">
          <InfoGoldIcon size={26} color={fillTertiary} />
        </Pressable>
      </View>

      {/* <View className="flex-row items-center gap-1 w-full justify-center">
        <Text variant="h4" className="text-fill-tertiary">
          {type}
        </Text>
        <Pressable onPress={onHowItWorksPress} hitSlop={8} className="active:opacity-70">
          <InfoGoldIcon size={26} color={fillTertiary} />
        </Pressable>
      </View> */}
    </View>
  )
}
