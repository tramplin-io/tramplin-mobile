import { View } from 'react-native'

import { TicketPoolIcon, UserIcon, WalletIcon, WinningTicketIcon } from '@/components/icons/icons'
import type { Win } from '@/lib/api/generated/restApi.schemas'

import { DetailSectionHeader } from './DetailSectionHeader'
import { StatCell } from './StatCell'

type DetailDistributionProps = Readonly<{
  win: Win
  participantsCount?: number
}>

export function DetailDistribution({ win, participantsCount }: DetailDistributionProps) {
  const participants = participantsCount ?? win.participants

  return (
    <View className="gap-5">
      <DetailSectionHeader title="Distribution" />
      <View className="gap-5">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <StatCell label="Participants" value={participants ?? '—'} icon={UserIcon} />
          </View>
          <View className="flex-1">
            <StatCell label="Stake ID" value={win.stakeId} icon={WalletIcon} />
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <StatCell label="Winner ID" value={win.winnerId} icon={WinningTicketIcon} />
          </View>
          <View className="flex-1">
            <StatCell label="Pool shares" value={win.poolShares ?? '—'} icon={TicketPoolIcon} />
          </View>
        </View>
      </View>
    </View>
  )
}
