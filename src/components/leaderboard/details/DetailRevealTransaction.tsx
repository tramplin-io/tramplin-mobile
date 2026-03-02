import { View } from 'react-native'

import type { Win } from '@/lib/api/generated/restApi.schemas'

import { DetailCopyableHash } from './DetailCopyableHash'
import { DetailSectionHeader } from './DetailSectionHeader'

type DetailRevealTransactionProps = Readonly<{ win: Win }>

export function DetailRevealTransaction({ win }: DetailRevealTransactionProps) {
  const url = win.revealTransactionUrl
  if (!url) return null

  return (
    <View className="gap-5">
      <DetailSectionHeader title="Reveal Transaction" url={url} />
      <View className="gap-2">
        <DetailCopyableHash label="Secret" value={win.revealSecret} />
      </View>
    </View>
  )
}
