import { useCallback, useState } from 'react'
import { ScrollView } from 'react-native'
import {
  CommunityStats,
  DashboardHeader,
  // StakePromptCard,
  YourStake,
} from '@/components/main'
import { ScreenWrapper } from '@/components/general'
import { UnstakeModal } from '@/components/unstake'

/**
 * Home / Dashboard Tab.
 * Welcome header, staking prompt, your-stake placeholder, community stats.
 */
export default function HomeTab() {
  const [unstakeModalOpen, setUnstakeModalOpen] = useState(false)
  const handleOpenUnstake = useCallback(() => setUnstakeModalOpen(true), [])

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerClassName="px-6 pb-40 py-8 bg-fill-secondary flex-grow"
        showsVerticalScrollIndicator={false}
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
