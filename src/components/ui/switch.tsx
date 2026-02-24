import { cn } from '@/lib/utils'
import * as SwitchPrimitives from '@rn-primitives/switch'
import * as React from 'react'
import { Platform } from 'react-native'
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'

const SwitchWeb = React.forwardRef<SwitchPrimitives.RootRef, SwitchPrimitives.RootProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        'peer flex-row h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed',
        props.checked ? 'bg-brand-primary' : 'bg-fill-secondary',
        props.disabled && 'opacity-50',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-fill-tertiary shadow-md shadow-foreground/5 ring-0 transition-transform',
          props.checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </SwitchPrimitives.Root>
  ),
)

SwitchWeb.displayName = 'SwitchWeb'

const SwitchNative = React.forwardRef<SwitchPrimitives.RootRef, SwitchPrimitives.RootProps>(
  ({ className, ...props }, ref) => {
    const brandPrimary = useCSSVariable('--color-brand-primary') as string | undefined
    const fillSecondary = useCSSVariable('--color-fill-secondary') as string | undefined
    const fillTertiary = useCSSVariable('--color-fill-tertiary') as string | undefined
    const borderTertiary = useCSSVariable('--color-border-tertiary') as string | undefined

    const translateX = useDerivedValue(() => (props.checked ? 19 : 2))
    const animatedRootStyle = useAnimatedStyle(() => ({
      backgroundColor: props.checked ? brandPrimary ?? '#8682F7' : fillSecondary ?? '#F0F0F0',
    }))
    const animatedThumbStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
    }))

    return (
      <Animated.View
        style={animatedRootStyle}
        className={cn('h-[32px] w-[51px] rounded-full', props.disabled && 'opacity-50')}
      >
        <SwitchPrimitives.Root
          className={cn(
            'flex-row h-[32px] w-[51px] shrink-0 items-center rounded-full border-2 border-transparent',
            className,
          )}
          {...props}
          ref={ref}
        >
          <Animated.View style={animatedThumbStyle}>
            <SwitchPrimitives.Thumb
              style={{
                height: 27,
                width: 27,
                borderRadius: 14,
                backgroundColor: fillTertiary ?? '#FFFFFF',
                borderWidth: 1,
                borderColor: borderTertiary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </Animated.View>
        </SwitchPrimitives.Root>
      </Animated.View>
    )
  },
)
SwitchNative.displayName = 'SwitchNative'

const Switch = Platform.select({
  web: SwitchWeb,
  default: SwitchNative,
})

export { Switch }
