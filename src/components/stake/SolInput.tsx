import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { Linking, Pressable, Text as RNText, TextInput, View } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { LinkIcon, SolanaIcon, UpIcon } from '@/components/icons/icons'
import { cn } from '@/lib/utils'
import { formatPrizeSol } from '@/utils/format'
import { getSolscanTxUrl } from '@/utils/wallet'

import { Text } from '../ui/text'

type SolInputProps = {
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  disabled?: boolean
  onValidationChange?: (isValid: boolean, error: 'min' | 'max' | null) => void
  ref?: RefObject<TextInput | null>
}

export function SolInput({ value, onChange, min, max, disabled, onValidationChange, ref }: SolInputProps) {
  const placeholderColor = useCSSVariable('--color-content-tertiary') as string | undefined
  const numValue = Number.parseFloat(value) || 0
  const hasValue = value !== ''
  const isBelowMin = min !== undefined && hasValue && numValue < min
  const isAboveMax = max !== undefined && hasValue && numValue > max
  const hasError = isBelowMin || isAboveMax
  const isValid = hasValue && !hasError
  const measureRef = useRef<RNText>(null)
  const internalRef = useRef<TextInput>(null)
  const inputRef = ref ?? internalRef
  const [outlineWidth, setOutlineWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const error = isBelowMin ? 'min' : isAboveMax ? 'max' : null
    onValidationChange?.(isValid, error)
  }, [isValid, isBelowMin, isAboveMax, onValidationChange])

  // Re-measure error outline when value or container size changes (value drives hidden Text content)
  // biome-ignore lint/correctness/useExhaustiveDependencies: additional dependencies are needed
  useLayoutEffect(() => {
    if (containerWidth <= 0) return
    measureRef.current?.measure((_x, _y, textWidth) => {
      setOutlineWidth(Math.min(textWidth + 10, containerWidth))
    })
  }, [value, containerWidth])

  const handleChange = (newValue: string) => {
    const normalized = newValue.replace(',', '.')
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      const decimalIndex = normalized.indexOf('.')
      if (decimalIndex !== -1 && normalized.length - decimalIndex - 1 > 9) {
        onChange(normalized.slice(0, decimalIndex + 10))
        return
      }
      onChange(normalized)
    }
  }

  return (
    <View
      className={cn(
        'flex-row items-baseline border-b border-content-primary pb-2.5 w-full',
        hasError && 'border-critical-secondary',
        disabled && 'border-content-tertiary',
      )}
    >
      <View className="flex-1 relative overflow-hidden" onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        <TextInput
          value={value}
          onChangeText={handleChange}
          editable={!disabled}
          placeholder="0"
          placeholderTextColor={placeholderColor}
          keyboardType="decimal-pad"
          className={cn(
            'w-full bg-transparent text-h2 font-family-digits text-content-primary px-1.5',
            disabled && 'text-content-tertiary',
          )}
          ref={inputRef}
        />
        <Text
          variant="h2Digits"
          ref={measureRef}
          className="absolute text-content-primary opacity-0 pointer-events-none"
          style={{ left: -9999 }}
        >
          {value || '0'}
        </Text>
        {hasError && (
          <View
            className={cn(
              'absolute left-0 top-0 bottom-0 pointer-events-none rounded-[5px] border border-critical-secondary',
              'bg-linear-to-b from-fill-fade to-critical-primary',
              'shadow-[0_0_3px_0_var(--color-critical-primary)]',
            )}
            style={{ width: outlineWidth }}
          />
        )}
      </View>
      <View className={cn('flex-row items-center gap-1 mx-2.5 shrink-0', disabled && 'text-content-tertiary')}>
        <Text variant="body">SOL</Text>
        <SolanaIcon size={24} />
      </View>
    </View>
  )
}

type SuccessViewProps = {
  amount: number
  signature: string
  action: string
  cluster?: 'devnet' | 'testnet' | 'mainnet-beta'
}

export function SuccessView({ amount, signature, action, cluster = 'devnet' }: SuccessViewProps) {
  const explorerUrl = getSolscanTxUrl(signature, cluster)

  return (
    <View className="flex flex-col items-center">
      <View className="flex flex-row items-end gap-1 px-1.25 pb-[10px] border-b border-content-tertiary">
        <View className="flex-row items-end">
          <UpIcon className="size-6 text-content-primary" />
          <Text className="text-5xl tracking-[-1.44px] text-content-primary">{formatPrizeSol(amount, 5)}</Text>
        </View>
        <View className="flex flex-row justify-end items-center">
          <Text className="text-[16px] leading-[18px] text-content-primary">SOL</Text>
          <SolanaIcon size={24} className="text-content-primary" />
          <Text className="text-[16px] leading-[18px] text-content-primary">{action}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => Linking.openURL(explorerUrl)}
        className="px-2.5 pt-2 flex-row items-center gap-1.25 border-t border-content-tertiary -m-px"
      >
        <Text className="text-body text-content-tertiary">View transaction on Solscan</Text>
        <LinkIcon size={16} className="text-content-tertiary" />
      </Pressable>
    </View>
  )
}
