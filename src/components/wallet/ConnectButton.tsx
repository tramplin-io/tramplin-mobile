import { useCallback, useState } from 'react'
import { View, Text } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Button } from '@/components/ui/Button'

const NO_WALLET_MESSAGE =
  'No Solana wallet app found. Install a compatible wallet (e.g. Phantom) that supports the mobile wallet protocol.'

/**
 * Wallet connect/disconnect button with error handling.
 *
 * Shows:
 * - "Connect Wallet" when disconnected
 * - "Disconnect" when connected
 * - Error state with retry option
 *
 * @example
 * <ConnectButton />
 */
export function ConnectButton() {
  const { account, connect, disconnect } = useMobileWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      await connect()
    } catch (err) {
      let message = 'Failed to connect wallet'
      if (err instanceof Error) {
        message = err.message.includes('no installed wallet') ? NO_WALLET_MESSAGE : err.message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [connect])

  const handleDisconnect = useCallback(async () => {
    setLoading(true)
    try {
      await disconnect()
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [disconnect])

  const isConnected = account !== undefined && account !== null

  return (
    <View className="items-center">
      {error !== null && (
        <View className="items-center mb-4">
          <Text className="text-error dark:text-error-light text-center mb-3 px-2 text-sm">{error}</Text>
          <Button label="Try Again" variant="outline" size="sm" onPress={handleConnect} loading={loading} />
        </View>
      )}

      {error === null && (
        <Button
          label={isConnected ? 'Disconnect' : 'Connect Wallet'}
          variant={isConnected ? 'danger' : 'primary'}
          size="lg"
          onPress={isConnected ? handleDisconnect : handleConnect}
          loading={loading}
        />
      )}
    </View>
  )
}
