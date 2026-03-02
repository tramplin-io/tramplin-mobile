import { Children, useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { CrossIcon } from '@/components/icons/icons'
import { cn } from '@/lib/utils'

const CLOSE_BUTTON_HEIGHT = 32

type CollapsibleStackProps = Readonly<{
  children: ReactNode
  collapsedCount?: number
  gap?: number
  expandedGap?: number
  itemHeight?: number
  /** When set, overrides computed expanded height (e.g. when a child is a FlatList). */
  expandedContentHeight?: number
  open?: boolean
  cover?: ReactNode
  onOpenChange?: (open: boolean) => void
  className?: string
}>

export function CollapsibleStack({
  children,
  collapsedCount = 3,
  gap = 5,
  expandedGap = 8,
  itemHeight = 68,
  expandedContentHeight,
  open: controlledOpen,
  cover,
  onOpenChange,
  className,
}: CollapsibleStackProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value)
    onOpenChange?.(value)
  }

  const childArray = Children.toArray(children)
  const visibleCount = Math.min(collapsedCount, childArray.length)
  const count = childArray.length

  const collapsedHeight = useMemo(() => itemHeight + (visibleCount - 1) * gap, [itemHeight, visibleCount, gap])
  const expandedHeight = useMemo(
    () =>
      expandedContentHeight ?? CLOSE_BUTTON_HEIGHT + count * itemHeight + count * expandedGap,
    [expandedContentHeight, count, itemHeight, expandedGap],
  )

  const height = useSharedValue(isOpen ? expandedHeight : collapsedHeight)

  const updateHeight = useCallback(
    (open: boolean) => {
      height.value = withTiming(open ? expandedHeight : collapsedHeight, {
        duration: 300,
      })
    },
    [expandedHeight, collapsedHeight, height],
  )

  useEffect(() => {
    updateHeight(isOpen)
  }, [isOpen, updateHeight])

  const handleExpand = () => {
    setOpen(true)
    updateHeight(true)
  }

  const handleCollapse = () => {
    setOpen(false)
    updateHeight(false)
  }

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }))

  return (
    <Animated.View
      className={cn('relative overflow-hidden', !isOpen && 'opacity-100', className)}
      style={containerAnimatedStyle}
    >
      {!isOpen && !cover ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleExpand}
          accessibilityRole="button"
          accessibilityLabel="Expand"
        />
      ) : null}
      <Pressable
        className={cn(
          'absolute right-0 top-0 z-50 p-1 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onPress={(e) => {
          e.stopPropagation()
          handleCollapse()
        }}
        accessibilityRole="button"
        accessibilityLabel="Collapse"
      >
        <CrossIcon size={20} strokeWidth="1.5" />
      </Pressable>

      <View className="relative">
        {cover ? (
          <Pressable
            className="absolute left-0 right-0 z-100 transition-opacity duration-300"
            style={{
              opacity: isOpen ? 0 : 1,
              zIndex: isOpen ? 0 : collapsedCount + 1,
              pointerEvents: isOpen ? 'none' : 'auto',
            }}
            onPress={handleExpand}
          >
            {/* <View className="h-[300px] bg-red-500" /> */}
            {cover}
          </Pressable>
        ) : null}
        {childArray.map((child, i) => {
          const collapsedY = i * gap
          const expandedY = CLOSE_BUTTON_HEIGHT + i * (itemHeight + expandedGap)
          const isHidden = !isOpen && i >= collapsedCount
          const key =
            typeof child === 'object' && child !== null && 'key' in child && (child as ReactElement).key != null
              ? String((child as ReactElement).key)
              : `collapsible-${i}`

          return (
            <View
              key={key}
              className="absolute left-0 right-0 transition-all duration-300 ease-out"
              style={{
                transform: [{ translateY: isOpen ? expandedY : collapsedY }],
                opacity: isHidden ? 0 : 1,
                zIndex: isOpen ? 1 : collapsedCount - i,
                pointerEvents: isHidden ? 'none' : 'auto',
              }}
            >
              {child}
            </View>
          )
        })}
      </View>
    </Animated.View>
  )
}
