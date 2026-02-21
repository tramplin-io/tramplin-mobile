import { useLogStore } from '@/lib/stores/log-store'
import { ScrollView, View } from 'react-native'
import { Button } from '../ui/button'
import { Text } from '../ui/text'

export const LogDisplay = () => {
  const { logs, clearLogs } = useLogStore()

  return (
    <View>
      <Button onPress={clearLogs}>
        <Text>Clear Logs</Text>
      </Button>
      <ScrollView className="max-h-[200px]">
        {logs.map((log, idx) => (
          <Text key={idx}>
            {/* [{log.timestamp}]  */}
            {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  )
}
