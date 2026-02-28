import { LinkIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'

import { Linking, Pressable, View } from 'react-native'
import { useCSSVariable } from 'uniwind'

type DetailSectionHeaderProps = Readonly<{ title: string; url?: string }>

export function DetailSectionHeader({ title, url }: DetailSectionHeaderProps) {
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  return (
    <View className="flex-row items-center py-2 border-b border-border-quaternary">
      <Text variant="h4" className="">
        {title}
      </Text>
      {url && (
        <Pressable onPress={() => Linking.openURL(url)} hitSlop={8} className="p-1">
          <LinkIcon size={24} color={contentTertiary} />
        </Pressable>
      )}
    </View>
  )
}
