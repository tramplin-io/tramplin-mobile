import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import { useLogStore } from '@/lib/stores/log-store'

import { Button } from '../ui/button'
import { Text } from '../ui/text'

export const LogDisplay = () => {
  const { logs, clearLogs } = useLogStore()
  const [copied, setCopied] = useState(false)

  const handleCopyLogs = async () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n')
    await Clipboard.setStringAsync(text || '(no logs)')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <View>
      <View className="flex-row gap-2 mb-2">
        <Button onPress={handleCopyLogs} variant="gray" className="flex-1">
          <Text>{copied ? 'Copied!' : 'Copy Logs'}</Text>
        </Button>
        <Button onPress={clearLogs} variant="gray" className="flex-1">
          <Text>Clear Logs</Text>
        </Button>
      </View>
      <ScrollView
      // className="mb-10"
      >
        {logs.map((log, idx) => (
          <Text key={`${log.timestamp}-${idx}`} className="border-b border-border-tertiary p-2">
            {/* [{log.timestamp}]  */}
            {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  )
}
