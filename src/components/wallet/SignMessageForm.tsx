import { useState } from 'react'
import { View, Text } from 'react-native'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useWalletActions } from '@/hooks/useWalletActions'
import { toHexString } from '@/utils/format'

/**
 * Form to sign a text message with the connected wallet.
 * Displays the resulting signature on success.
 *
 * @example
 * <SignMessageForm />
 */
export function SignMessageForm() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const { signMessage, loading, error, clearError } = useWalletActions()

  const handleSign = async () => {
    if (!message.trim()) return

    clearError()
    setSignature(null)

    const result = await signMessage(message)
    if (result) {
      setSignature(toHexString(result.signature))
    }
  }

  return (
    <Card variant="outlined" className="w-full">
      <Text className="text-sm font-medium text-content-secondary mb-3">Sign Message</Text>

      <Textarea
        className="mb-3"
        placeholder="Enter message to sign..."
        value={message}
        onChangeText={setMessage}
        numberOfLines={3}
      />

      <Button variant="default" size="lg" onPress={handleSign} disabled={!message.trim()}>
        <Text>Sign Message</Text>
      </Button>

      {error && <Text className="text-critical-primary text-sm mt-3">{error}</Text>}

      {signature && (
        <View className="mt-3 p-3 bg-fill-primary rounded-md">
          <Text className="text-xs font-medium text-brand-primary mb-1">Signature:</Text>
          <Text className="text-xs font-mono text-content-secondary" numberOfLines={3}>
            {signature}
          </Text>
        </View>
      )}
    </Card>
  )
}
