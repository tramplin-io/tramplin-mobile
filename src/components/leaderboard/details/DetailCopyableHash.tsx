import { useCallback } from 'react'
import { View, Pressable } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import Toast from 'react-native-toast-message'
import { Text } from '@/components/ui/text'
import { CopyIcon } from '@/components/icons/icons'
import { useCSSVariable } from 'uniwind'
import { cn } from '@/lib/utils'

type DetailCopyableHashProps = Readonly<{
  label: string
  value?: string | null
}>

export function DetailCopyableHash({ label, value }: DetailCopyableHashProps) {
  const handleCopy = useCallback(async () => {
    if (!value) return
    await Clipboard.setStringAsync(value)
    Toast.show({ type: 'success', text1: 'Copied to clipboard' })
  }, [value])

  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  if (!value) return null

  return (
    <View className="mb-0">
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="small" className="uppercase tracking-wide text-content-tertiary">
          {label}
        </Text>
        <Pressable onPress={handleCopy} hitSlop={8} className="p-1">
          <CopyIcon size={16} color={contentTertiary} />
        </Pressable>
      </View>
      <View
        className={cn(
          'flex-row flex-1 p-5 justify-between items-center rounded-md border',
          'bg-fill-secondary border-fill-tertiary',
          'shadow-[0_0_3px_0_var(--border-quaternary,#FFF)]',
        )}
      >
        <Text variant="small" className="flex-1" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  )
}
