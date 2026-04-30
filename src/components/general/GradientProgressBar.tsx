import { useState } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export function GradientProgressBar({
  progress,
  brandColor,
  goldColor,
}: Readonly<{ progress: number; brandColor: string; goldColor: string }>) {
  const [containerWidth, setContainerWidth] = useState(0)
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const fillWidth = containerWidth * (clampedProgress / 100)

  return (
    <View
      className="h-2 w-full rounded-full bg-fill-primary"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && fillWidth > 0 && (
        <View
          style={{
            width: fillWidth,
            height: '100%',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={[brandColor, goldColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: fillWidth, height: '100%' }}
          />
        </View>
      )}
    </View>
  )
}
