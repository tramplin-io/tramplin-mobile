import { useCallback } from 'react'
import { Linking, Pressable, View } from 'react-native'

import { LinkIcon } from '@/components/icons/icons'
import { Text } from '@/components/ui/text'
import type { Win } from '@/lib/api/generated/restApi.schemas'

type DetailLinksProps = Readonly<{
  win: Win
}>

function LinkItem({ label, onPress }: Readonly<{ label: string; onPress: () => void }>) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-1 border-b border-border-quaternary">
      <Text variant="body">{label}</Text>
      <LinkIcon size={24} className="text-content-primary" />
    </Pressable>
  )
}

export function DetailLinks({ win }: DetailLinksProps) {
  const snapshotUrl = win?.snapshotUrl
  const vrfTransactionUrl = win?.vrfTransactionUrl

  const handleSnapshot = useCallback(() => {
    if (!snapshotUrl) return
    void Linking.openURL(snapshotUrl)
  }, [snapshotUrl])

  const handleOpenVrf = useCallback(() => {
    if (!vrfTransactionUrl) return
    void Linking.openURL(vrfTransactionUrl)
  }, [vrfTransactionUrl])

  if (!snapshotUrl && !vrfTransactionUrl) return null

  return (
    <View className="flex-row items-center justify-between border-b border-border-quaternary py-2">
      <Text variant="h4" className="text-content-primary">
        Links
      </Text>
      <View className="flex-row flex-wrap items-center gap-4">
        {snapshotUrl && <LinkItem label="Snapshot" onPress={handleSnapshot} />}
        {vrfTransactionUrl && <LinkItem label="VRF" onPress={handleOpenVrf} />}
      </View>
    </View>
  )
}
