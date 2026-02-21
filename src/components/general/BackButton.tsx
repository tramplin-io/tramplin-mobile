import { cn } from '@/lib/utils'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text } from '@/components/ui/text'
import { useCSSVariable } from 'uniwind'

interface BackButtonProps {
  onPress: () => void
  className?: string
  buttonClassName?: string
  textClassName?: string
  arrowSize?: number
  text?: string
  disabled?: boolean
}

export const BackButton = ({
  onPress,
  className = '',
  buttonClassName = '',
  textClassName = '',
  arrowSize = 10,
  text = '',
  disabled = false,
}: BackButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={cn('flex-row items-center mb-8', disabled ? 'opacity-70' : '', className)}
    >
      <View className={cn('size-10 items-center justify-center rounded-2xl bg-fill-tertiary', buttonClassName)}>
        <View
          className="border-l-2 border-b-2 rotate-45 "
          style={{
            marginLeft: 4,
            width: arrowSize,
            height: arrowSize,
            borderColor: String(useCSSVariable('--color-brand-primary')),
          }}
        />
      </View>
      {!!text && <Text className={cn('text-small text-content-primary ', textClassName)}>{text}</Text>}
    </TouchableOpacity>
  )
}
