import { View } from 'react-native'

import { Text } from '@/components/ui/text'

import { DetailCopyableHash } from './DetailCopyableHash'
import { DetailSectionHeader } from './DetailSectionHeader'

const VERIFICATION_STEPS = [
  'Check the Solana slot timestamp on any explorer',
  'Verify the snapshot hash matches eligible holders',
  'Validate the VRF signature on-chain',
  'Confirm "randomIndex = VRF_output % totalTickets"',
] as const

export function DetailVerification() {
  return (
    <View className="gap-5">
      <DetailSectionHeader title="Verification" />
      <Text variant="small" className=" uppercase tracking-wide">
        How to verify
      </Text>
      <View className="gap-2">
        {VERIFICATION_STEPS.map((step, i) => (
          <View key={step} className="flex-row gap-3 mb-3">
            <View className="size-4 items-center justify-center">
              <Text variant="small">{i + 1}</Text>
            </View>
            <Text variant="body" className="flex-1">
              {step}
            </Text>
          </View>
        ))}
      </View>
      <View className="gap-2">
        <DetailCopyableHash label="VRF Seed" value={'---'} />
        {/* TODO: add VRF seed */}
      </View>
    </View>
  )
}
