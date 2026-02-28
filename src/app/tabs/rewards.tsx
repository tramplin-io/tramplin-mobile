import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { address, lamports } from '@solana/kit'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import { DashboardHeader } from '@/components/main'
import { RewardCardBig, RewardCardRegular, RewardCardStack } from '@/components/rewards'
import { CollapsibleStack } from '@/components/ui/collapsible-stack'
import { useClaimPrize } from '@/hooks/useClaimPrize'
import { useIndexMyWins } from '@/lib/api/generated/restApi'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import type { Winner } from '@/utils/solana'

const CLAIM_ERROR_RETRY_SECONDS = 3

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
  const countdownTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({})

  const colorBrandPrimary = useCSSVariable('--color-brand-primary') as string

  const { data: wins = [], isLoading, refetch } = useIndexMyWins({ isClaimed: 'false' })

  // const wins = IndexMyWinsMock

  const { claim, isClaiming } = useClaimPrize()

  const [refreshing, setRefreshing] = useState(false)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const startErrorCountdown = useCallback((winKey: string) => {
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
      } catch {
        if (winKey) {
          startErrorCountdown(winKey)
        } else {
          Toast.show({ type: 'error', text1: 'Failed to claim', text2: 'Please try again' })
        }
      }
    },
    [claim, startErrorCountdown],
  )

  const bigWins = wins.filter((w) => w.drawType === 'big')
  const regularWins = wins.filter((w) => w.drawType === 'regular')

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerClassName="px-6 pb-40 py-8 bg-fill-secondary flex-grow"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={40}
            colors={[colorBrandPrimary]}
          />
        }
      >
        <DashboardHeader title="Congratulations!" className="mb-6" />

        {isLoading && <RewardCardRegular variant="loading" />}

        {!isLoading && wins.length === 0 && <RewardCardRegular variant="empty" />}

        {!isLoading && bigWins.length > 0 && (
          <View className="gap-4 mb-4">
            {bigWins.map((win) => {
              const winKey = win.id ?? `${win.winnerId}-${win.epochOrSlot}`
              const retryIn = claimErrorCountdowns[winKey]
              const hasError = retryIn !== undefined
              const buttonText = hasError ? `Error Claiming! Try again in ${retryIn}s…` : 'Claim Now'

              return (
                <RewardCardBig
                  key={winKey}
                  win={win}
                  reward={win.prizeSol}
                  revealedAt={win.revealedAt}
                  onClaim={() => handleClaim([win], winKey)}
                  disabled={isClaiming || hasError}
                  hasError={hasError}
                  buttonText={buttonText}
                />
              )
            })}
          </View>
        )}

        {!isLoading && regularWins.length > 0 && (
          <View className="gap-3">
            {regularWins.length === 1 ? (
              (() => {
                const win = regularWins[0]
                if (!win) return null
                const winKey = win.id ?? `${win.winnerId}-${win.epochOrSlot}`
                const retryIn = claimErrorCountdowns[winKey]
                const hasError = retryIn !== undefined
                const buttonText = hasError ? `Error Claiming! Try again in ${retryIn}s…` : null
                return (
                  <RewardCardRegular
                    variant="claim"
                    reward={win.prizeSol}
                    revealedAt={win.revealedAt}
                    onClaim={() => handleClaim([win], winKey)}
                    disabled={isClaiming || hasError}
                    hasError={hasError}
                    buttonText={buttonText}
                  />
                )
              })()
            ) : (
              <CollapsibleStack
                collapsedCount={3}
                gap={6}
                expandedGap={4}
                open={isRegularStackExpanded}
                onOpenChange={setIsRegularStackExpanded}
                cover={
                  <RewardCardStack
                    count={regularWins.length}
                    reward={regularWins.reduce((acc, r) => acc + (r.prizeSol ?? 0), 0)}
                    revealedAt={regularWins[0]?.revealedAt ?? undefined}
                    onPress={() => setIsRegularStackExpanded(true)}
                  />
                }
              >
                {/* Summary card */}
                {regularWins.length > 1 &&
                  (() => {
                    const summaryKey = 'regular-summary'
                    const summaryRetryIn = claimErrorCountdowns[summaryKey]
                    const summaryHasError = summaryRetryIn !== undefined
                    const summaryButtonText = summaryHasError ? `Try again in ${summaryRetryIn}s…` : undefined
                    return (
                      <RewardCardRegular
                        variant="summary"
                        reward={regularWins.reduce((acc, r) => acc + (r.prizeSol ?? 0), 0)}
                        onClaim={() => handleClaim(regularWins, summaryKey)}
                        disabled={isClaiming || summaryHasError}
                        hasError={summaryHasError}
                        buttonText={summaryButtonText}
                        claimCount={regularWins.length}
                      />
                    )
                  })()}
                {/* Claim cards */}
                {regularWins.map((win) => {
                  const winKey = win.id ?? `${win.winnerId}-${win.epochOrSlot}`
                  const retryIn = claimErrorCountdowns[winKey]
                  const hasError = retryIn !== undefined
                  const buttonText = hasError ? `Try again in ${retryIn}s…` : null
                  return (
                    <RewardCardRegular
                      key={winKey}
                      variant="claim"
                      reward={win.prizeSol}
                      revealedAt={win.revealedAt}
                      onClaim={() => handleClaim([win], winKey)}
                      disabled={isClaiming || hasError}
                      hasError={hasError}
                      buttonText={buttonText}
                    />
                  )
                })}
              </CollapsibleStack>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  )
}
