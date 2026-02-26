import { View, Text, Pressable } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { ellipsify } from '@/utils/format'

/**
 * Displays connected wallet account information including:
 * - Wallet address (truncated, copyable)
 * - SOL balance
 * - Network badge
 *
 * Returns null if no wallet is connected.
 *
 * @example
 * <AccountInfo />
 */
export function AccountInfo() {
  const { account } = useMobileWallet()
  const { balance, loading: balanceLoading, refresh } = useWalletBalance()
  const { copy, copied } = useCopyToClipboard()

  if (!account) return null

  const address = account?.address
  if (address == null) return null

  const addressStr = typeof address.toString === 'function' ? address.toString() : String(address)

  return (
    <Card variant="outlined" className="w-full">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-content-secondary">Connected Wallet</Text>
        <Badge variant="default">
          <Text>Devnet</Text>
        </Badge>
      </View>

      {/* Address */}
      <Pressable onPress={() => copy(addressStr)} className="mb-3">
        <View className="flex-row items-center">
          <Text className="text-base font-mono text-content-primary">{ellipsify(addressStr, 8)}</Text>
          <Text className="ml-2 text-xs text-content-tertiary">{copied ? 'Copied!' : 'Tap to copy'}</Text>
        </View>
      </Pressable>

      {/* Balance */}
      <Pressable onPress={refresh}>
        <View className="flex-row items-center">
          <Text className="text-2xl font-bold text-content-primary">
            {balanceLoading && '...'}
            {!balanceLoading && balance && `${balance.sol} SOL`}
            {!balanceLoading && !balance && '-- SOL'}
          </Text>
          <Text className="ml-2 text-xs text-content-tertiary">Tap to refresh</Text>
        </View>
      </Pressable>
    </Card>
  )
}
