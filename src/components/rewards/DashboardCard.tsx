import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { InfoIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { DrawType } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'

import { Skeleton } from '../ui/skeleton'
import { Countdown } from './Countdown'

const regularMobileMp4 = require('@/assets/videos/rewards/tramplin_card_regular_dark_5x6(mobile).mp4')
const epochMobileMp4 = require('@/assets/videos/rewards/tramplin_card_epoch_green_5x6(mobile).mp4')
const bigMobileMp4 = require('@/assets/videos/rewards/tramplin_card_big_5x6(mobile).mp4')

type DashboardCardProps = Readonly<{
  type: DrawType
  prize: string | null
  subtitle: string
  countdownDate: Date | null
  countdownFormat: 'ms' | 'dhms'
  tooltip?: ReactNode
  prefixText?: string
  youAreIn?: boolean
  isLoading?: boolean
  onExpire?: () => void
  className?: string
}>

const videoSources: Record<DrawType, number> = {
  regular: regularMobileMp4,
  epoch: epochMobileMp4,
  big: bigMobileMp4,
}

// epoch gradient not supported in RN — video covers this area anyway
const peekBg: Record<DrawType, string> = {
  regular: 'bg-white',
  epoch: 'bg-fill-secondary',
  big: 'bg-reward-large-secondary',
}

const titles: Record<DrawType, string> = {
  regular: 'Regular',
  epoch: 'Epoch',
  big: 'Big',
}

export function DashboardCard({
  type,
  prize,
  subtitle,
  countdownDate,
  tooltip,
  countdownFormat,
  prefixText,
  youAreIn,
  isLoading,
  onExpire,
  className,
}: DashboardCardProps) {
  const router = useRouter()
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  const prizeDisplay = prize ? (prefixText ? `${prefixText} ${prize}` : prize) : '...'

  return (
    <View className={cn('h-[264px] w-full', className)}>
      <View
        style={styles.peekBg}
        className={cn('rounded-[10px] overflow-hidden border border-fill-secondary', peekBg[type])}
      >
        <DashboardCardVideo source={videoSources[type]} />
      </View>

      <View className="absolute top-2.5 left-3 right-3 flex-row items-center gap-1.5">
        <Text className="opacity-60 text-border-quaternary">Next in:</Text>
        {isLoading ? (
          <Skeleton className="w-20 h-5" />
        ) : (
          <Countdown
            date={countdownDate}
            format={countdownFormat}
            showPrefix={false}
            className="text-border-quaternary"
            digitsClassName="text-body font-bold"
            unitsClassName="text-body font-bold"
            onExpire={onExpire}
          />
        )}
      </View>

      <View
        // style={styles.innerPanel}
        className={cn(
          'absolute top-11 inset-x-0 bottom-0',
          'bg-fill-secondary border border-border-quaternary rounded-[10px] justify-between py-2',
        )}
      >
        <View className="flex-col gap-2.5">
          <View className="flex-row items-end gap-2 px-3.5">
            <Text variant="h4" className="text-content-primary">
              {titles[type]}
            </Text>
            {tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Pressable>
                    <InfoIcon size={26} color={contentTertiary} />
                  </Pressable>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="mx-10">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </View>
        </View>

        <View className="px-3.5">
          {isLoading ? (
            <Skeleton className="w-full h-15 rounded-lg" />
          ) : (
            <Text variant="h2Digits" className="text-content-primary text-[3.75rem] leading-17">
              {prizeDisplay}
            </Text>
          )}
        </View>

        {/* <Pressable
          className="flex-row items-center gap-0.5 px-3.5"
          onPress={() => router.push('/tabs/faq')}
          accessibilityRole="link"
          accessibilityLabel={`About ${titles[type]} Distribution`}
        >
          <Text className="text-body text-content-tertiary">About</Text>
          <ForwardIcon size={24} color={contentTertiary} />
        </Pressable> */}
        <View className="flex-row items-center gap-0.5 justify-between">
          <View className="px-3.5">
            {isLoading ? (
              <Skeleton className="w-20 h-5" />
            ) : (
              <Text variant="body" className="text-content-primary opacity-40">
                {subtitle}
              </Text>
            )}
          </View>

          {youAreIn && (
            <View className="px-3.5">
              <Text variant="body" className="text-content-primary opacity-40">
                You’re in!
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

function DashboardCardVideo({ source }: Readonly<{ source: number }>) {
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

const styles = StyleSheet.create({
  // card: {
  //   // width: 220,
  //   height: 263,
  // },
  peekBg: {
    ...StyleSheet.absoluteFillObject,
  },
  // innerPanel: {
  //   position: 'absolute',
  //   top: 44,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  // },
})
