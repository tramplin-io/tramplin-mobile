import * as React from 'react'
import { View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { Input } from './input'

type ContactRowProps = {
  label: string
  value: string
  placeholder: string
  error?: string | null
  onChangeText?: (text: string) => void
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'placeholder' | 'onChangeText'>

export function InputRow({ label, value, placeholder, error, onChangeText, ...inputProps }: Readonly<ContactRowProps>) {
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string

  return (
    <View className="gap-2">
      <Text variant="small" className="uppercase tracking-wide">
        {label}
      </Text>
      <View
        className={cn(
          'flex-row items-center rounded-md bg-fill-tertiary border px-0 py-0',
          'shadow-[0_0_3px_0_var(--border-quaternary,#FFF)]',
          error
            ? 'border-critical-secondary bg-linear-to-b from-fill-primary to-critical-primary shadow-[0_0_3px_0_var(--critical-primary,#FFAFAF)]'
            : 'border-transparent',
        )}
      >
        <Input
          value={value}
          placeholder={placeholder}
          placeholderTextColor={contentTertiary}
          onChangeText={onChangeText}
          hasError={!!error}
          className="flex-1 h-14 min-w-0 border-0 bg-transparent px-0 py-2 text-content-primary shadow-none"
          {...inputProps}
        />
      </View>
      {error ? (
        <Text variant="small" className="absolute top-0 right-0 text-content-tertiary uppercase text-end">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
