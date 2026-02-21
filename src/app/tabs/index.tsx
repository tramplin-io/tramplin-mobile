import { View, Text, ScrollView } from 'react-native'
import { Container } from '@/components/ui/Container'

/**
 * Home / Dashboard Tab.
 *
 * TODO: Implementation
 * ─────────────────────
 * 1. Layout:
 *    - Header with "Tramplin" title + optional settings icon
 *    - Wallet card (AccountInfo component — address, balance)
 *    - Quick actions row (Send, Receive, Sign, etc.)
 *    - Community stats preview cards (StatCard components)
 *    - Recent activity / notifications preview
 *
 * 2. Components needed:
 *    - Header (new: @/components/ui/Header)
 *    - AccountInfo (existing: @/components/wallet/AccountInfo)
 *    - StatCard (new: @/components/ui/StatCard)
 *    - Card (existing)
 *    - Quick action buttons (small icon buttons in a row)
 *
 * 3. Data:
 *    - Wallet balance from useWalletBalance()
 *    - Community stats from API (useQuery)
 *    - Recent notifications (from notification store or API)
 *
 * 4. Pull-to-refresh:
 *    - RefreshControl on ScrollView
 *    - Invalidate balance + stats queries
 */
export default function HomeTab() {
  return (
    <Container safe={false}>
      <ScrollView contentContainerClassName="px-6 py-8 bg-brand-primary">
        <Text className="text-2xl font-bold text-content-primary mb-6">Stake</Text>
        <Text className="text-content-secondary">[Stake placeholder]</Text>
        <View className=" h-[200vh]" />
      </ScrollView>
    </Container>
  )
}
