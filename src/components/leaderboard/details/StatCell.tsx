import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { Text } from '@/components/ui/text'

type StatCellProps = Readonly<{
  label: string
  value: string | number
  icon?: React.ComponentType<{ size?: number; className?: string; color?: string }>
}>

export function StatCell({ label, value, icon: Icon }: StatCellProps) {
  const contentPrimary = useCSSVariable('--color-content-primary') as string
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  const iconColor = (Icon as { displayName?: string })?.displayName === 'WalletIcon' ? contentTertiary : contentPrimary
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-1">
        {Icon && <Icon size={20} color={iconColor} />}
        <Text variant="small" className="uppercase tracking-wide">
          {label}
        </Text>
      </View>
      <Text variant="h5Digits" className="text-content-primary">
        {value}
      </Text>
    </View>
  )
}
