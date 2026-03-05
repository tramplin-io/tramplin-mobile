import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useCSSVariable } from 'uniwind'

import { ScreenWrapper } from '@/components/general'
import {
  CommunityStats,
  DashboardHeader,
  // StakePromptCard,
  YourStake,
} from '@/components/main'
import { ReferralStats } from '@/components/referrals'
import { UnstakeModal } from '@/components/unstake'

/**
 * Home / Dashboard Tab.
 * Welcome header, staking prompt, your-stake placeholder, community stats.
 */
export default function HomeTab() {
  const queryClient = useQueryClient()
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const colorBrandPrimary = useCSSVariable('--color-brand-primary') as string

  const handleOpenUnstake = useCallback(() => setUnstakeModalOpen(true), [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      queryClient.invalidateQueries(),
      queryClient.invalidateQueries({ queryKey: ['indexMyWins'] }),
      queryClient.invalidateQueries({ queryKey: ['indexMyStake'] }),
    ])
    setRefreshing(false)
  }, [queryClient])

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerClassName="px-4 pb-40 py-8 flex-grow gap-8"
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
        <DashboardHeader />
        {/* <StakePromptCard onMorePress={handleMore} className="mb-6" /> */}
        <YourStake onUnstakePress={handleOpenUnstake} />
        <ReferralStats />

        <CommunityStats
          // className="mt-16"
          stakedLabel="Staked"
          distributionLabel="Distributed"
          // textClassName="text-fill-primary"
          dividerClassName="bg-border-quaternary"
        />
      </ScrollView>

      <UnstakeModal open={unstakeModalOpen} onOpenChange={setUnstakeModalOpen} />
    </ScreenWrapper>
  )
}
