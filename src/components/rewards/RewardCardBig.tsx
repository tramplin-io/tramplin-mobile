import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'

import { SolanaCircleIcon } from '@/components/icons/icons'
import { useVideoPlayerWithLifecycle } from '@/hooks/useVideoPlayerWithLifecycle'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { cn } from '@/lib/utils'
import { formatAwardedAgo, formatPrizeSol } from '@/utils/format'

import { Button } from '../ui'
import { Text } from '../ui/text'

const rewardGoldVideo = require('@/assets/videos/rewards/tramplin_reward_gold_3x4.mp4')

type RewardCardBigProps = Readonly<{
  reward?: number
  revealedAt?: string
  win: Win
  onClaim?: () => Promise<void>
  disabled: boolean
  hasError?: boolean
  buttonText?: string
}>

export function RewardCardBig({
  reward,
  revealedAt,
  onClaim,
  disabled,
  hasError = false,
  buttonText = 'Claim Now',
}: RewardCardBigProps) {
  const { player, isFocused } = useVideoPlayerWithLifecycle(rewardGoldVideo)

  const amountSol = reward ? formatPrizeSol(reward) : '0'
  const awardedText = revealedAt ? formatAwardedAgo(revealedAt).replace('AWARDED ', '') : null

  const rewardLargePrimary = useCSSVariable('--color-reward-large-primary') as string
  const criticalSecondary = useCSSVariable('--color-critical-secondary') as string
  const contentPrimary = useCSSVariable('--color-content-primary') as string

  const color = hasError ? criticalSecondary : rewardLargePrimary
  const textColor = hasError ? 'text-critical-secondary' : 'text-reward-large-primary'

  //  critical-secondary content-primary
  return (
    <View style={styles.cardWrap} className={cn('rounded-2xl overflow-hidden', disabled && 'opacity-50')}>
      {isFocused && (
        <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
      )}
      {hasError && (
        <LinearGradient
          colors={[criticalSecondary, contentPrimary]}
          locations={[0, 1]}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.8 }]}
        />
      )}
      <View className="flex-1 p-6 justify-between">
        <View className="flex-1 justify-center items-center">
          <View className="flex-row items-center gap-0 ">
            <Text variant="h3Digits" className={textColor}>
              +{amountSol}
            </Text>

            <SolanaCircleIcon size={50} color={color} />
          </View>
          <Text variant="h4" className={cn(textColor, 'mb-3')}>
            You have been rewarded
          </Text>

          <Button
            variant={hasError ? 'error' : 'gold'}
            size="xl"
            onPress={onClaim}
            disabled={disabled}
            className="w-3/4"
          >
            <Text>{disabled ? 'Claiming…' : buttonText}</Text>
          </Button>

          {/* <View className="flex-row items-center gap-2 mt-2">
            <Text variant="body" className={textColor}>
              Share on Socials
            </Text>
            <TwitterIcon size={28} color={color} />
            <TelegramIcon size={28} color={color} />
          </View> */}
          <View className="flex-row gap-3 mt-1" />
        </View>

        <View className="flex-row justify-between items-center mt-4 pt-4 ">
          <Text variant="small" className={textColor}>
            {awardedText}
          </Text>
          {/* <Pressable
            // onPress={() => Linking.openURL('https://www.google.com')} // TODO: Add link to claiming guide
            className="flex-row items-center gap-0"
          >
            <Text variant="small" className={textColor}>
              More on claiming
            </Text>
            <LeaveIcon size={24} color={color} />
          </Pressable> */}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardWrap: {
    aspectRatio: 3 / 4,
  },
})
