import type { Win } from '@/lib/api/generated/restApi.schemas'
import { DetailSectionHeader } from './DetailSectionHeader'
import { DetailCopyableHash } from './DetailCopyableHash'
import { View } from 'react-native'

type DetailMerkleProofsProps = Readonly<{ win: Win }>

export function DetailMerkleProofs({ win }: DetailMerkleProofsProps) {
  if (win.merkleProofs.length === 0) return null

  return (
    <View className="gap-5">
      <DetailSectionHeader title="Merkle Proofs" />
      <View className="gap-2">
        {win.merkleProofs.map((proof, i) => (
          <DetailCopyableHash key={`proof-${proof.slice(0, 8)}-${i}`} label={`Proof ${i + 1}`} value={proof} />
        ))}
      </View>
    </View>
  )
}
