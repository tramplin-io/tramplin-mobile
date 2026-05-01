import { View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'

import { cn } from '@/lib/utils'

const emptyStateCardMobileMp4 = require('@/assets/videos/empty/tramplin_empty state_white_2x1(mobile).mp4')

// <EmptyStateCard text="No unclaimed rewards." subtext="Your rewards will appear here." />

export function EmptyStateCard({
  className,

  children,
}: Readonly<{ className?: string; children?: React.ReactNode }>) {
  const player = useVideoPlayer(emptyStateCardMobileMp4, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })
  return (
    <View
      className={cn(
        'h-[170px] border border-border-quaternary rounded-lg overflow-hidden flex-col items-center justify-center z-1 bg-fill-secondary',
        className,
      )}
    >
      <VideoView
        player={player}
        style={{ position: 'absolute', top: '-5%', left: 0, right: 0, height: '110%' }}
        contentFit="fill"
        nativeControls={false}
        pointerEvents="none"
      />
      {children}
    </View>
  )
}
