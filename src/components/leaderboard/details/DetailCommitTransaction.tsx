import { View } from 'react-native'

import type { Win } from '@/lib/api/generated/restApi.schemas'

import { DetailCopyableHash } from './DetailCopyableHash'
import { DetailSectionHeader } from './DetailSectionHeader'

type DetailCommitTransactionProps = Readonly<{ win: Win }>

export function DetailCommitTransaction({ win }: DetailCommitTransactionProps) {
  const url = 'https://solscan.io/tx/...' //`https://solscan.io/tx/${win.commitTransaction}` // TODO: add url

  return (
    <View className="gap-5">
      <DetailSectionHeader title="Commit Transaction" url={url} />
      <View className="gap-2">
        <DetailCopyableHash label="Secret Hash" value={'---'} />
      </View>
    </View>
  )
}
