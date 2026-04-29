import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

import { Text, TextClassContext } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { formatStopwatchTime } from '@/utils/format'

export function Countdown({
  date,
  format = 'ms',
  className,
  digitsClassName,
  unitsClassName,
  showPrefix = true,
  onExpire,
}: Readonly<{
  date: Date | null
  format?: 'dhm' | 'dhms' | 'hms' | 'ms'
  className?: string
  digitsClassName?: string
  unitsClassName?: string
  showPrefix?: boolean
  onExpire: (() => void) | undefined
}>) {
  const [countdown, setCountdown] = useState<[string, string, string, string] | null>(null)
  const hasExpiredRef = useRef(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: date is needed to reset the expiration tracking
  useEffect(() => {
    hasExpiredRef.current = false
  }, [date])

  useEffect(() => {
    const update = () => {
      setCountdown(date ? formatStopwatchTime(date) : null)

      if (date && !hasExpiredRef.current && date.getTime() - Date.now() <= 0) {
        hasExpiredRef.current = true
        onExpire?.()
      }
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [date, onExpire])

  const digitCn = cn('text-h4 tabular-nums', digitsClassName)
  const unitCn = cn('text-body', unitsClassName)

  if (!countdown) {
    return (
      <TextClassContext.Provider value={className}>
        <Text className={unitCn}>...</Text>
      </TextClassContext.Provider>
    )
  }

  const [days, hours, minutes, seconds] = countdown

  const d = (
    <>
      <Text className={digitCn}>{days}</Text>
      <Text className={unitCn}>d </Text>
    </>
  )

  const hrs = (
    <>
      <Text className={digitCn}>{hours}</Text>
      <Text className={unitCn}>h </Text>
    </>
  )

  const min = (
    <>
      <Text className={digitCn}>{minutes}</Text>
      <Text className={unitCn}>m </Text>
    </>
  )

  const sec = (
    <>
      <Text className={digitCn}>{seconds}</Text>
      <Text className={unitCn}>s</Text>
    </>
  )

  let content: React.ReactNode = null

  switch (format) {
    case 'ms':
      content = (
        <>
          {min}
          {sec}
        </>
      )
      break

    case 'hms':
      content = (
        <>
          {hrs}
          {min}
          {sec}
        </>
      )
      break

    case 'dhm':
      content = (
        <>
          {d}
          {hrs}
          {min}
        </>
      )
      break

    case 'dhms':
      content = (
        <>
          {d}
          {hrs}
          {min}
          {sec}
        </>
      )
      break
  }

  return (
    <TextClassContext.Provider value={className}>
      <View className="flex-row items-end">
        {showPrefix && <Text className={unitCn}>in </Text>}
        {content}
      </View>
    </TextClassContext.Provider>
  )
}
