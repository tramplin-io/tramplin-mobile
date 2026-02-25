import { Text } from '@/components/ui/text'
import { useSegments } from 'expo-router'
import * as React from 'react'
import { View } from 'react-native'

type Props = {
  visible: boolean
}

export const RoutePathOverlay = ({ visible }: Props) => {
  const segments = useSegments()

  if (!visible) return null

  // Build the current route path
  const currentPath = segments.length > 0 ? `/${segments.join('/')}` : '/'

  return (
    <View className="absolute top-16 left-0 right-0 z-50 items-center">
      <View className="bg-black/70 rounded-lg px-2 py-1 flex-row items-center">
        <Text variant="small" className="text-white">
          {currentPath}
        </Text>
      </View>
    </View>
  )
}
