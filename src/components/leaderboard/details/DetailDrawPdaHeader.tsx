import { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import Toast from 'react-native-toast-message'
import { useCSSVariable } from 'uniwind'

import { CopyIcon, WalletIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

type DetailHeaderProps = Readonly<{
  pda?: string
}>

function formatAddressTwoLines(address: string): [string, string] {
  const mid = Math.ceil(address.length / 2)
  return [address.slice(0, mid), address.slice(mid)]
}

export function DetailDrawPdaHeader({ pda }: DetailHeaderProps) {
  const handleCopy = useCallback(async () => {
    if (!pda) return
    await Clipboard.setStringAsync(pda)
    Toast.show({ type: 'success', text1: 'Draw PDA copied' })
  }, [pda])

  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  if (!pda) return null

  const [line1, line2] = pda ? formatAddressTwoLines(pda) : ['—', '']

  return (
    <View className="mb-2.5">
      <View
        className={cn(
          'flex-row flex-1 p-5 justify-between items-center rounded-md border',
          'bg-fill-secondary border-fill-tertiary',
          'shadow-[0_0_3px_0_var(--border-quaternary,#FFF)]',
        )}
      >
        <WalletIcon size={24} color={contentTertiary} className="shrink-0" />
        <View className="flex-1 min-w-0 mx-3">
          <Text variant="small" className={cn('text-center')} numberOfLines={2}>
            {line2 ? `${line1}\n${line2}` : line1}
          </Text>
        </View>
        <Pressable onPress={handleCopy} hitSlop={8} className="shrink-0 p-1 flex justify-center items-center">
          <CopyIcon size={16} color={contentTertiary} />
        </Pressable>
      </View>
    </View>
  )
}
