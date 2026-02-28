import { View } from 'react-native'

import { Text } from '@/components/ui/text'

type StatCellProps = Readonly<{
  label: string
  value: string | number
  icon?: React.ComponentType<{ size?: number; className?: string }>
}>

export function StatCell({ label, value, icon: Icon }: StatCellProps) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-1">
        {Icon && <Icon size={20} className="text-content-primary" />}
        <Text variant="small" className="uppercase tracking-wide">
          {label}
        </Text>
      </View>
      <Text variant="h5Digits">{value}</Text>
    </View>
  )
}
