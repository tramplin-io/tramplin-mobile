import { useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
      <Text className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-3">Sign Message</Text>

      <TextInput
        className="border border-border dark:border-dark-border rounded-md px-3 py-2 mb-3 text-text-primary dark:text-dark-text-primary bg-surface dark:bg-dark-surface"
        placeholder="Enter message to sign..."
        placeholderTextColor="#94a3b8"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
      />

      <Button label="Sign Message" variant="primary" size="md" onPress={handleSign} loading={loading} disabled={!message.trim()} />

      {error && <Text className="text-error dark:text-error-light text-sm mt-3">{error}</Text>}

      {signature && (
        <View className="mt-3 p-3 bg-surface-muted dark:bg-dark-surface-muted rounded-md">
          <Text className="text-xs font-medium text-success dark:text-success-light mb-1">Signature:</Text>
          <Text className="text-xs font-mono text-text-secondary dark:text-dark-text-secondary" numberOfLines={3}>
            {signature}
          </Text>
        </View>
      )}
    </Card>
  )
}
