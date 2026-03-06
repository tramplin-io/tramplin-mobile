import { ScrollView, View } from 'react-native'

import { useLogStore } from '@/lib/stores/log-store'

import { Button } from '../ui/button'
import { Text } from '../ui/text'

export const LogDisplay = () => {
  const { logs, clearLogs } = useLogStore()

  return (
    <View>
      <Button onPress={clearLogs}>
        <Text>Clear Logs</Text>
      </Button>
      <ScrollView
      // className="mb-10"
      >
        {logs.map((log, idx) => (
          <Text key={idx} className="border-b border-border-tertiary p-2">
            {/* [{log.timestamp}]  */}
            {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  )
}
