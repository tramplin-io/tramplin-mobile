import { Component, type ComponentProps, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { useCSSVariable } from 'uniwind'

import { cn } from '@/lib/utils'

import { Text } from './text'

type GradientTextProps = Readonly<{
  children: string
  colors?: [string, string, ...string[]]
  className?: string
  variant?: ComponentProps<typeof Text>['variant']
  hasError?: boolean
}>

class GradientTextErrorBoundary extends Component<
  { props: GradientTextProps; children: ReactNode },
  { useFallback: boolean }
> {
  state = { useFallback: false }

  static readonly getDerivedStateFromError = () => ({ useFallback: true })

  render() {
    if (this.state.useFallback) {
      const { props } = this.props
      const colors = props.colors ?? ['#F5F5F5', '#737373']
      return (
        <Text
          variant={props.variant ?? 'default'}
          className={cn('flex items-center gap-1', props.className)}
          style={{ color: colors[0] }}
        >
          {props.children}
        </Text>
      )
    }
    return this.props.children
  }
}

export function GradientText({
  children,
  colors = ['--color-fill-primary', '--color-content-tertiary'],
  className,
  variant = 'default',
  hasError = false,
}: GradientTextProps) {
  const criticalSecondary = useCSSVariable('--color-critical-secondary') as string
  const rewardSmallPrimary = useCSSVariable(colors[0]) as string
  const rewardSmallSecondary = useCSSVariable(colors[1]) as string

  const props = { children, colors, className, variant }
  return (
    <GradientTextErrorBoundary props={props}>
      <MaskedView
        maskElement={
          <View style={maskWrapperStyle}>
            <Text variant={variant} className={cn('flex items-center gap-1', className)} style={maskTextStyle}>
              {children}
            </Text>
          </View>
        }
        style={maskedViewStyle}
      >
        <View style={contentWrapperStyle}>
          <Text variant={variant} className={cn('flex items-center gap-1', className)} style={invisibleTextStyle}>
            {children}
          </Text>
          <LinearGradient
            colors={hasError ? [criticalSecondary, criticalSecondary] : [rewardSmallPrimary, rewardSmallSecondary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </MaskedView>
    </GradientTextErrorBoundary>
  )
}

const maskTextStyle = { backgroundColor: 'transparent', color: 'black' }
const maskWrapperStyle = { backgroundColor: 'transparent' }
const maskedViewStyle = {
  flexDirection: 'row' as const,
  alignSelf: 'center' as const,
}
const contentWrapperStyle = { position: 'relative' as const }
const invisibleTextStyle = { opacity: 0 }
