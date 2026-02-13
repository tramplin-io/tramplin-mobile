import { View, type ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ContainerProps extends ViewProps {
  /** Whether to use SafeAreaView */
  safe?: boolean
  /** Center content vertically and horizontally */
  centered?: boolean
  /** Additional className overrides */
  className?: string
}

/**
 * Screen container component with theme-aware background.
 * Optionally wraps content in SafeAreaView and centers content.
 *
 * @example
 * <Container safe centered>
 *   <Text>Screen content</Text>
 * </Container>
 */
export function Container({ safe = true, centered = false, className = '', children, ...viewProps }: ContainerProps) {
  const baseClasses = `flex-1 bg-background dark:bg-dark-background ${centered ? 'items-center justify-center' : ''} ${className}`

  if (safe) {
    return (
      <SafeAreaView className={baseClasses} {...viewProps}>
        {children}
      </SafeAreaView>
    )
  }

  return (
    <View className={baseClasses} {...viewProps}>
      {children}
    </View>
  )
}
