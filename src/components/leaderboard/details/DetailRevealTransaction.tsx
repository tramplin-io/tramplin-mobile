import { View } from 'react-native'
import type { Win } from '@/lib/api/generated/restApi.schemas'
import { DetailCopyableHash } from './DetailCopyableHash'
import { DetailSectionHeader } from './DetailSectionHeader'

type DetailRevealTransactionProps = Readonly<{ win: Win }>

export function DetailRevealTransaction({ win }: DetailRevealTransactionProps) {
  const url = 'https://solscan.io/tx/...' //`https://solscan.io/tx/${win.revealTransaction}` // TODO: add url

  return (
    <View className="gap-5">
      <DetailSectionHeader title="Reveal Transaction" url={url} />
      <View className="gap-2">
        <DetailCopyableHash label="Secret seed" value={'---'} />
      </View>
    </View>
  )
}
