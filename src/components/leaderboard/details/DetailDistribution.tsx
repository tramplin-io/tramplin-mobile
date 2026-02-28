import { View } from 'react-native'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { DetailSectionHeader } from './DetailSectionHeader'
import { StatCell } from './StatCell'
import { UserIcon, WalletIcon, WinningTicketIcon, TicketPoolIcon } from '@/components/icons/icons'

type DetailDistributionProps = Readonly<{
  win: Win
  participantsCount?: number
}>

export function DetailDistribution({ win, participantsCount }: DetailDistributionProps) {
  return (
    <View className="gap-5">
      <DetailSectionHeader title="Distribution" />
      <View className="gap-5">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <StatCell label="Participants" value={participantsCount ?? '—'} icon={UserIcon} />
          </View>
          <View className="flex-1">
            <StatCell label="Stake ID" value={win.stakeId} icon={WalletIcon} />
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <StatCell label="Winner" value={win.winnerId} icon={WinningTicketIcon} />
          </View>
          <View className="flex-1">
            <StatCell label="Pool shares" value={win.stake} icon={TicketPoolIcon} />
          </View>
        </View>
      </View>
    </View>
  )
}
