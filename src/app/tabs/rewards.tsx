import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { address, lamports } from '@solana/kit'
// import * as Clipboard from 'expo-clipboard'
import { useFocusEffect } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { CrossIcon } from '@/components/icons/icons'
import { DashboardHeader } from '@/components/main'
import { RewardCardBig, RewardCardRegular, RewardCardStack } from '@/components/rewards'
import { CollapsibleStack } from '@/components/ui/collapsible-stack'
import { LAMPORTS_PER_SOL } from '@/constants'
import { useClaimPrize } from '@/hooks/useClaimPrize'
import { useIndexMyWins } from '@/lib/api/generated/restApi'
import type { Win } from '@/lib/api/generated/restApi.schemas'
// import { IndexMyWinsMock } from '@/mock/rawards'
import type { Winner } from '@/utils/solana'

const CLAIM_ERROR_RETRY_SECONDS = 3
const REWARDS_NOTIFICATIONS_LIMIT = 4
const REWARD_CARD_VIDEO_LIMIT = 5
const PREVIEW_COLLAPSED_COUNT = 3
const PREVIEW_ITEM_HEIGHT = 68
const PREVIEW_EXPANDED_CONTENT_HEIGHT = 80
const PREVIEW_COLLAPSED_GAP = 6
const PREVIEW_EXPANDED_GAP = 4

function RegularListSeparator() {
  return <View className="h-0.5" />
}

// function ClaimErrorCard({ winKey, message }: { winKey: string; message: string }) {
//   const [copied, setCopied] = useState(false)

//   const handleCopy = useCallback(async () => {
//     const payload = `Claim Error\nTime: ${new Date().toISOString()}\nWin: ${winKey}\nError: ${message}`
//     await Clipboard.setStringAsync(payload)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }, [winKey, message])

//   return (
//     <View className="mt-1.5 flex-row items-center gap-2 rounded-xl border border-critical-secondary/40 bg-critical-secondary/10 px-3 py-2">
//       <Text className="flex-1 text-xs text-critical-secondary" numberOfLines={2}>
//         {message}
//       </Text>
//       <Pressable
//         onPress={handleCopy}
//         className="rounded-lg border border-critical-secondary/40 bg-critical-secondary/20 px-2.5 py-1.5 active:opacity-70"
//       >
//         <Text className="text-xs font-medium text-critical-secondary">{copied ? 'Copied!' : 'Copy'}</Text>
//       </Pressable>
//     </View>
//   )
// }

function winToWinner(win: Win): Winner {
  return {
    stakeId: BigInt(win.stakeId),
    winnerId: BigInt(win.winnerId),
    stake: BigInt(win.stake),
    withdrawer: address(win.walletAddress),
    proof: win.merkleProofs,
    prize: lamports(BigInt(win.prizeLamports)),
    epochOrSlot: BigInt(win.epochOrSlot),
    claimPda: win.claimPda ? address(win.claimPda) : undefined,
    kind: win.drawType,
    revealedAt: BigInt(win.revealedAtSlot ?? '0'),
    revealedAtDate: win.revealedAt ? new Date(win.revealedAt) : undefined,
  }
}

export default function RewardsTab() {
  const [isRegularStackExpanded, setIsRegularStackExpanded] = useState(false)
  const [claimErrorCountdowns, setClaimErrorCountdowns] = useState<Record<string, number>>({})
  // const [claimErrors, setClaimErrors] = useState<Record<string, string>>({})
  const countdownTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const colorBrandPrimary = useCSSVariable('--color-brand-primary') as string

  const {
    data: wins = [],
    isLoading,
    refetch: refetchWins,
  } = useIndexMyWins({
    isClaimed: 'false',
    limit: 250,
  })

  useFocusEffect(
    useCallback(() => {
      refetchWins()
    }, [refetchWins]),
  )
  // const wins = IndexMyWinsMock

  const { claim, isClaiming } = useClaimPrize()

  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetchWins()
    setRefreshing(false)
  }, [refetchWins])

  const startErrorCountdown = useCallback((winKey: string) => {
    //, errorMsg: string
    // setClaimErrors((prev) => ({ ...prev, [winKey]: errorMsg }))
    setClaimErrorCountdowns((prev) => ({ ...prev, [winKey]: CLAIM_ERROR_RETRY_SECONDS }))

    const timer = setInterval(() => {
      setClaimErrorCountdowns((prev) => {
        const next = (prev[winKey] ?? 1) - 1
        if (next <= 0) {
          clearInterval(countdownTimers.current[winKey])
          delete countdownTimers.current[winKey]
          const { [winKey]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [winKey]: next }
      })
    }, 1000)

    countdownTimers.current[winKey] = timer
  }, [])

  useEffect(() => {
    const timers = countdownTimers.current
    return () => {
      Object.values(timers).forEach(clearInterval)
    }
  }, [])

  const handleClaim = useCallback(
    async (wins: Win[], winKey?: string) => {
      try {
        await claim(wins.map(winToWinner))
        Toast.show({ type: 'success', text1: 'Reward claimed!' })
        await refetchWins()
      } catch {
        // const errorMsg = error instanceof Error ? error.message : String(error)
        if (winKey) {
          startErrorCountdown(winKey) //, errorMsg
        } else {
          Toast.show({ type: 'error', text1: 'Failed to claim', text2: 'Please try again' })
        }
      }
    },
    [claim, startErrorCountdown, refetchWins],
  )

  const bigWins = wins.filter((w) => w.drawType === 'big')
  const regularWins = wins.filter((w) => w.drawType === 'regular')
  const regularRewardsTotalLamports = useMemo(
    () => regularWins.reduce((acc, r) => acc + Number(r.prizeLamports ?? 0), 0),
    [regularWins],
  )
  const regularRewardsTotal = regularRewardsTotalLamports / Number(LAMPORTS_PER_SOL)
  const shouldPlayVideo = regularWins.length <= REWARD_CARD_VIDEO_LIMIT

  const useLazyRegularList = regularWins.length > 0

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 40,
    minimumViewTime: 100,
  }).current

  const handleClaimSingle = useCallback((win: Win, winKey: string) => () => handleClaim([win], winKey), [handleClaim])

  const renderRegularClaimCard = useCallback(
    (info: { item: Win; index: number }) => {
      const { item: win } = info
      const winKey = win.id ?? `${win.winnerId}-${win.epochOrSlot}`
      const retryIn = claimErrorCountdowns[winKey]
      const hasError = retryIn !== undefined
      const buttonText = hasError ? `Try again in ${retryIn}s…` : null

      return (
        <View className="px-4">
          <RewardCardRegular
            variant="claim"
            reward={win.prizeSol}
            revealedAt={win.revealedAt}
            onClaim={handleClaimSingle(win, winKey)}
            disabled={isClaiming || hasError}
            hasError={hasError}
            buttonText={buttonText}
            shouldPlayVideo={shouldPlayVideo}
          />
          {/* {hasError && claimErrors[winKey] && <ClaimErrorCard winKey={winKey} message={claimErrors[winKey]} />} */}
        </View>
      )
    },
    [claimErrorCountdowns, isClaiming, handleClaimSingle, shouldPlayVideo], //,visibleRegularIndices, claimErrors
  )

  const regularListKeyExtractor = useCallback((win: Win) => win.id ?? `${win.winnerId}-${win.epochOrSlot}`, [])

  const regularListData = useLazyRegularList && isRegularStackExpanded ? regularWins : []

  const listHeaderComponent = useCallback(
    () => (
      <View className="gap-3 px-4 pt-8 pb-0.5">
        <DashboardHeader title="Congratulations!" className="mb-6" />
        {isLoading && <RewardCardRegular variant="loading" shouldPlayVideo={false} />}

        {!isLoading && wins.length === 0 && <RewardCardRegular variant="empty" shouldPlayVideo={false} />}

        {!isLoading && bigWins.length > 0 && (
          <View className="gap-4 mb-4">
            {bigWins.map((win) => {
              const winKey = win.id ?? `${win.winnerId}-${win.epochOrSlot}`
              const retryIn = claimErrorCountdowns[winKey]
              const hasError = retryIn !== undefined
              const buttonText = hasError ? `Error Claiming! Try again in ${retryIn}s…` : 'Claim Now'
              return (
                <View key={winKey}>
                  <RewardCardBig
                    win={win}
                    reward={win.prizeSol}
                    revealedAt={win.revealedAt}
                    onClaim={() => handleClaim([win], winKey)}
                    disabled={isClaiming || hasError}
                    hasError={hasError}
                    buttonText={buttonText}
                  />
                  {/* {hasError && claimErrors[winKey] && <ClaimErrorCard winKey={winKey} message={claimErrors[winKey]} />} */}
                </View>
              )
            })}
          </View>
        )}

        {!isLoading &&
          useLazyRegularList &&
          regularWins.length > 0 &&
          (isRegularStackExpanded ? (
            <>
              <View className="flex-row justify-end pr-1">
                <Pressable
                  onPress={() => setIsRegularStackExpanded(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Collapse"
                >
                  <CrossIcon size={20} strokeWidth="1.5" />
                </Pressable>
              </View>
              {(() => {
                // const summaryRetryIn = claimErrorCountdowns['regular-summary']
                // const hasSummaryError = summaryRetryIn !== undefined
                return (
                  <>
                    <RewardCardStack count={regularWins.length} reward={regularRewardsTotal} />
                    {/* TODO: Add summary claim card */}
                    {/* <RewardCardRegular
                      variant="summary"
                      reward={regularRewardsTotal}
                      onClaim={() => handleClaim(regularWins, 'regular-summary')}
                      disabled={isClaiming || hasSummaryError}
                      hasError={hasSummaryError}
                      buttonText={hasSummaryError ? `Try again in ${summaryRetryIn}s…` : undefined}
                      claimCount={regularWins.length}
                      shouldPlayVideo={shouldPlayVideo}
                    /> */}
                    {/* {hasSummaryError && claimErrors['regular-summary'] && (
                      <ClaimErrorCard winKey="regular-summary" message={claimErrors['regular-summary']} />
                    )} */}
                  </>
                )
              })()}
            </>
          ) : (
            (() => {
              return (
                <CollapsibleStack
                  collapsedCount={PREVIEW_COLLAPSED_COUNT}
                  gap={PREVIEW_COLLAPSED_GAP}
                  expandedGap={PREVIEW_EXPANDED_GAP}
                  itemHeight={PREVIEW_ITEM_HEIGHT}
                  expandedContentHeight={PREVIEW_EXPANDED_CONTENT_HEIGHT}
                  open={false}
                  onOpenChange={(open) => {
                    if (open) setIsRegularStackExpanded(true)
                  }}
                  cover={<RewardCardStack count={regularWins.length} reward={regularRewardsTotal} />}
                >
                  <RewardCardStack count={regularWins.length} />
                  <RewardCardStack count={regularWins.length} />
                  <RewardCardStack count={regularWins.length} />
                </CollapsibleStack>
              )
            })()
          ))}
      </View>
    ),
    [
      isLoading,
      wins.length,
      bigWins,
      claimErrorCountdowns,
      // claimErrors,
      isClaiming,
      handleClaim,
      isRegularStackExpanded,
      regularWins,
      regularRewardsTotal,
      useLazyRegularList,
      // shouldPlayVideo,
    ],
  )

  const listFooterComponent = useCallback(() => <View className="h-40" />, [])

  return (
    <ScreenWrapper>
      <FlatList
        data={regularListData}
        keyExtractor={regularListKeyExtractor}
        renderItem={renderRegularClaimCard}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={listFooterComponent}
        ItemSeparatorComponent={RegularListSeparator}
        // onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={REWARDS_NOTIFICATIONS_LIMIT}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        // contentContainerClassName="pb-40"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={40}
            colors={[colorBrandPrimary]}
          />
        }
      />
    </ScreenWrapper>
  )
}
