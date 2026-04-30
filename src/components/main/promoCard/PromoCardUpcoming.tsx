import { StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'

import { Countdown } from '@/components/rewards'
import { Text } from '@/components/ui/text'
import type { Promo } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'

import { videoSources } from './utils'

export interface PromoCardUpcomingProps {
  promo: Promo
  className?: string
  onStarted?: () => void
}

function PromoCardVideo() {
  const player = useVideoPlayer(videoSources.upcoming, (p) => {
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

export function PromoCardUpcoming({ promo, className, onStarted }: Readonly<PromoCardUpcomingProps>) {
  const { title, startsAt } = promo
  const startsAtDate = startsAt ? new Date(startsAt) : null

  return (
    <View className={cn('rounded-lg overflow-hidden border border-border-quaternary', className)}>
      <View style={StyleSheet.absoluteFillObject} className="bg-white">
        <PromoCardVideo />
      </View>
      <View className="px-4 py-6 gap-3 items-center justify-center min-h-40">
        <Text variant="h4" className="text-content-primary text-center ">
          {title}
        </Text>
        <Countdown
          date={startsAtDate}
          format="dhms"
          className="text-content-primary"
          digitsClassName="text-h3 font-family-digits tracking-0 min-w-10 text-center"
          unitsClassName="text-h4 font-family-digits"
          onExpire={onStarted}
        />
      </View>
    </View>
  )
}
