import { useCallback } from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useCSSVariable } from 'uniwind'

import { BackButton } from '@/components/general/BackButton'
import { Text } from '@/components/ui/text'

export interface ProfileHeaderProps {
  title?: string
  onBack?: () => void
}

export function ProfileHeader({ title = 'My Profile', onBack }: Readonly<ProfileHeaderProps>) {
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.replace('/tabs/')
    }
  }, [onBack])

  const fillPrimary = useCSSVariable('--color-fill-primary') as string
  const fillFade = useCSSVariable('--color-fill-fade') as string

  return (
    <>
      <View className="flex-row items-center justify-between mb-2 mt-2 px-4">
        <BackButton onPress={handleBack} className="mb-0 z-10" />
        <Text variant="h4" className="text-center w-full -ml-10">
          {title}
        </Text>
      </View>
      <LinearGradient
        colors={[fillPrimary, fillFade]}
        locations={[0, 1]}
        className="w-full h-10 z-10"
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          height: 32,
        }}
      />
    </>
  )
}
