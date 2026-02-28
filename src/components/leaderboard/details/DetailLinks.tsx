import { useCallback } from 'react'
import { Linking, Pressable, View } from 'react-native'

import { LinkIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { getExplorerUrl } from '@/utils/wallet'

const CLUSTER = (process.env.EXPO_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta' | 'testnet') ?? 'devnet'

type DetailLinksProps = Readonly<{
  walletAddress?: string
  epochOrSlot?: string
}>

function LinkItem({ label, onPress }: Readonly<{ label: string; onPress: () => void }>) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-1 border-b border-border-quaternary"
      // hitSlop={8}
    >
      <Text variant="body">{label}</Text>
      <LinkIcon size={24} className="text-content-primary" />
    </Pressable>
  )
}

export function DetailLinks({ walletAddress, epochOrSlot }: DetailLinksProps) {
  // TODO: update links to Snapshot, VRF

  const handleOpenWallet = useCallback(() => {
    if (!walletAddress) return
    void Linking.openURL(getExplorerUrl('address', walletAddress, CLUSTER))
  }, [walletAddress])

  const handleOpenVrf = useCallback(() => {
    if (!epochOrSlot) return
    void Linking.openURL(getExplorerUrl('block', epochOrSlot, CLUSTER))
  }, [epochOrSlot])

  return (
    <View className="flex-row items-center justify-between border-b border-border-quaternary py-2">
      <Text variant="h4" className="text-content-primary">
        Links
      </Text>
      <View className="flex-row items-center gap-4">
        {epochOrSlot && <LinkItem label="VRF" onPress={handleOpenVrf} />}
        {walletAddress && <LinkItem label="Wallet" onPress={handleOpenWallet} />}
      </View>
    </View>
  )
}
