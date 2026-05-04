import { Pressable, View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { Text } from '@/components/ui/text'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ellipsify } from '@/utils/format'

import { formatResultsDate } from './utils'

export interface PromoCtaCompletedProps {
  isFullyParticipating: boolean
  winners: string[]
  endsAt?: string
}

export function PromoCtaCompleted({ isFullyParticipating, winners, endsAt }: Readonly<PromoCtaCompletedProps>) {
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  if (winners.length === 1) {
    return (
      <View className="bg-fill-primary rounded-lg px-3 py-2.5 flex-row items-center justify-between">
        <Text variant="smallRegular" className="text-content-tertiary">
          Winner:
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="size-6 rounded-full bg-content-tertiary opacity-50" />
          <Text variant="smallRegular" className="text-content-primary font-bold">
            {ellipsify(winners[0], 4)}
          </Text>
        </View>
      </View>
    )
  }

  if (winners.length > 1) {
    return (
      <View className="bg-fill-primary rounded-lg px-3 py-2.5 flex-row items-center justify-between">
        <Text variant="smallRegular" className="text-content-tertiary">
          Winners:
        </Text>
        <Tooltip>
          <TooltipTrigger asChild>
            <Pressable hitSlop={8} className="active:opacity-70">
              <Text variant="smallRegular" className="text-reward-large-secondary font-bold">
                {`${winners.length} winners →`}
              </Text>
            </Pressable>
          </TooltipTrigger>
          <TooltipContent side="top" className="gap-1 px-3 sm:py-2">
            <Text variant="smallRegular" className="text-content-tertiary mb-2">
              Winners:
            </Text>
            {winners.map((addr) => (
              <View key={addr} className="flex-row items-center gap-2">
                <View className="size-5 rounded-full bg-content-tertiary opacity-50" />
                <Text variant="smallRegular" className="text-content-primary font-bold">
                  {ellipsify(addr, 4)}
                </Text>
              </View>
            ))}
          </TooltipContent>
        </Tooltip>
      </View>
    )
  }

  return (
    <View className="bg-fill-primary rounded-lg px-3 py-2.5 flex-row items-center justify-between flex-wrap gap-1">
      <Text variant="smallRegular" className="text-content-tertiary">
        {isFullyParticipating ? "You're in!" : "You're not in!"}
      </Text>

      {endsAt ? (
        <Text variant="smallRegular" className="text-content-tertiary">
          {'Results on: '}
          <Text variant="smallRegular" className="text-content-primary font-bold">
            {formatResultsDate(endsAt)}
          </Text>
        </Text>
      ) : null}
    </View>
  )
}
