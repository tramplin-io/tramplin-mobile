import { useCallback, useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'

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
  const router = useRouter()
  const { account, connect, disconnect } = useMobileWallet()
  const logout = useAuthStore((s) => s.logout)
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

  const handleDisconnect = useCallback(() => {
    setLoading(true)
    setError(null)
    void logout({ disconnect, router }).finally(() => setLoading(false))
  }, [logout, disconnect, router])

  const isConnected = account !== undefined && account !== null

  return (
    <View className="items-center">
      {error !== null && (
        <View className="items-center mb-4">
          <Text className="text-critical-primary text-center mb-3 px-2 text-sm">{error}</Text>
          <Button variant="outline" size="sm" onPress={handleConnect}>
            <Text>Try Again</Text>
          </Button>
        </View>
      )}

      {error === null && (
        <Button
          variant={isConnected ? 'destructive' : 'default'}
          size="lg"
          onPress={isConnected ? handleDisconnect : handleConnect}
          disabled={loading}
        >
          <Text>{isConnected ? 'Disconnect' : 'Connect Wallet'}</Text>
        </Button>
      )}
    </View>
  )
}
