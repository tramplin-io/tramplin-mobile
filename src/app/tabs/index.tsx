import { useCallback, useState } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import {
  CommunityStats,
  DashboardHeader,
  // StakePromptCard,
  YourStake,
} from '@/components/main'
import { ScreenWrapper } from '@/components/general'
import { UnstakeModal } from '@/components/unstake'
import { useCSSVariable } from 'uniwind'

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
        <DashboardHeader className="mb-6" />
        {/* <StakePromptCard onMorePress={handleMore} className="mb-6" /> */}
        <YourStake className="mb-6" onUnstakePress={handleOpenUnstake} />

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
