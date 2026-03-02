import { View } from 'react-native'

import { SolanaIcon } from '@/components/icons/icons'
import type { Win } from '@/lib/api/generated/restApi.schemas'

import { DetailCopyableHash } from './DetailCopyableHash'
import { DetailSectionHeader } from './DetailSectionHeader'
import { StatCell } from './StatCell'

type DetailSnapshotProps = Readonly<{ win: Win; isGold: boolean }>

export function DetailSnapshot({ win, isGold }: DetailSnapshotProps) {
  const snapshotValue = isGold ? (win.epochNumber ?? '—') : (win.epochOrSlot ?? '—')

  const epochNumber = win.epochNumber

  return (
    <View className="gap-5">
      <DetailSectionHeader title="Snapshot" />
      <View className="gap-2">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <StatCell
              label={isGold ? 'Epoch number' : 'Solana slot'}
              value={snapshotValue}
              icon={isGold ? undefined : SolanaIcon}
            />
          </View>
          {epochNumber && !isGold && (
            <View className="flex-1">
              <StatCell label={'Epoch number'} value={epochNumber} />
            </View>
          )}
        </View>
        <DetailCopyableHash label="Merkle Root Hash" value={win.merkleRootHash} />
      </View>
    </View>
  )
}
