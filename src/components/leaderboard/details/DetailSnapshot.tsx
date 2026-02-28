import { View } from 'react-native'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { DetailCopyableHash } from './DetailCopyableHash'
import { DetailSectionHeader } from './DetailSectionHeader'
import { StatCell } from './StatCell'
import { SolanaIcon } from '@/components/icons/icons'

type DetailSnapshotProps = Readonly<{ win: Win; isGold: Boolean }>

export function DetailSnapshot({ win, isGold }: DetailSnapshotProps) {
  return (
    <View className="gap-5">
      <DetailSectionHeader title="Snapshot" />
      <View className="gap-2">
        <StatCell
          label={isGold ? 'Epoch number' : 'Solana slot'}
          value={win.epochOrSlot}
          icon={isGold ? undefined : SolanaIcon}
        />
        <DetailCopyableHash label="Merkle Root Hash" value={'---'} />
        {/* TODO: add merkle root hash */}
      </View>
    </View>
  )
}
