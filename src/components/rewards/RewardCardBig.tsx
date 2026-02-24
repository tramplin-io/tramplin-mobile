import { useCallback, useState } from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCSSVariable } from 'uniwind'
import { LeaveIcon, SolanaCircleIcon, TelegramIcon, TwitterIcon } from '@/components/icons/icons'
import { formatAwardedAgo, formatPrizeSol } from '@/utils/format'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { Text } from '../ui/text'
import { Button } from '../ui'

const rewardGoldVideo = require('@/assets/videos/rewards/tramplin_reward_gold_3x4.mp4')

type RewardCardBigProps = Readonly<{
  win: Win
  onClaim: (win: Win) => Promise<void>
}>

export function RewardCardBig({ win, onClaim }: RewardCardBigProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  const player = useVideoPlayer(rewardGoldVideo, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  const amountSol = formatPrizeSol(win.prizeSol)
  const awardedText = formatAwardedAgo(win.revealedAt).replace('AWARDED ', '')
  const handleClaim = useCallback(async () => {
    if (isClaiming) return
    setClaimError(null)
    setIsClaiming(true)
    try {
      await onClaim(win)
    } catch {
      setClaimError('Error Claiming! Try again in 3s...')
      const t = setTimeout(() => setClaimError(null), 3000)
      return () => clearTimeout(t)
    } finally {
      setIsClaiming(false)
    }
  }, [win, onClaim, isClaiming])

  const hasError = Boolean(claimError)

  return (
    <View style={styles.cardWrap} className="rounded-2xl overflow-hidden">
      <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
      <View className="flex-1 p-6 justify-between">
        <View className="flex-1 justify-center items-center">
          <View className="flex-row items-center gap-0 ">
            <Text variant="h3Digits" className="text-reward-large-primary">
              +{amountSol}
            </Text>

            <SolanaCircleIcon size={50} color={useCSSVariable('--color-reward-large-primary') as string} />
          </View>
          <Text variant="h4" className="text-reward-large-primary mb-3">
            You have been rewarded
          </Text>

          <Button variant="gold" size="xl" onPress={handleClaim} disabled={isClaiming} className="w-3/4">
            {hasError ? <Text>{claimError}</Text> : <Text>{isClaiming ? 'Claiming…' : 'Claim Now'}</Text>}
          </Button>

          <View className="flex-row items-center gap-2 mt-2">
            <Text variant="body" className="text-reward-large-primary">
              Share on Socials
            </Text>
            <TwitterIcon size={28} color={useCSSVariable('--color-reward-large-primary') as string} />
            <TelegramIcon size={28} color={useCSSVariable('--color-reward-large-primary') as string} />
          </View>
          <View className="flex-row gap-3 mt-1" />
        </View>

        <View className="flex-row justify-between items-center mt-4 pt-4 ">
          <Text variant="small" className="text-reward-large-primary ">
            {awardedText}
          </Text>
          <Pressable
            // onPress={() => Linking.openURL('https://www.google.com')} // TODO: Add link to claiming guide
            className="flex-row items-center gap-1"
          >
            <Text variant="small" className="text-reward-large-primary ">
              More on claiming
            </Text>
            <LeaveIcon size={16} color={useCSSVariable('--color-reward-large-primary') as string} />
          </Pressable>
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
