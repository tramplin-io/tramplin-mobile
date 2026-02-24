import { ScrollView } from 'react-native'
import { Container } from '@/components/ui/Container'
import {
  CommunityStats,
  DashboardHeader,
  // StakePromptCard,
  YourStake,
} from '@/components/main'

/**
 * Home / Dashboard Tab.
 * Welcome header, staking prompt, your-stake placeholder, community stats.
 */
export default function HomeTab() {
  const handleMore = () => {
    // Open notifications or more info when implemented
  }

  return (
    <Container safe={false}>
      <ScrollView
        contentContainerClassName="px-6 pb-40 py-8 bg-fill-secondary flex-grow"
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader className="mb-6" />
        {/* <StakePromptCard onMorePress={handleMore} className="mb-6" /> */}
        <YourStake className="mb-6" />

        <CommunityStats
          // className="mt-16"
          stakedLabel="Staked"
          distributionLabel="Distributed"
          // textClassName="text-fill-primary"
          dividerClassName="bg-border-quaternary"
        />
      </ScrollView>
    </Container>
  )
}
