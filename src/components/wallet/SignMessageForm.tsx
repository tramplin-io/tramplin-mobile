import { useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import { useCSSVariable } from 'uniwind'
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
  const placeholderColor = useCSSVariable('--color-content-tertiary')

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

      <TextInput
        className="border border-border-tertiary rounded-md px-3 py-2 mb-3 text-content-primary bg-fill-secondary"
        placeholder="Enter message to sign..."
        placeholderTextColor={placeholderColor}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
      />

      <Button label="Sign Message" variant="primary" size="md" onPress={handleSign} loading={loading} disabled={!message.trim()} />

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
