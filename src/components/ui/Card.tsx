import { View, type ViewProps } from 'react-native'

type CardVariant = 'default' | 'elevated' | 'outlined'

interface CardProps extends ViewProps {
  /** Visual variant */
  variant?: CardVariant
  /** Additional className overrides */
  className?: string
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface dark:bg-dark-surface rounded-lg p-4',
  elevated: 'bg-surface-elevated dark:bg-dark-surface-elevated rounded-lg p-4 shadow-sm',
  outlined: 'bg-transparent border border-border dark:border-dark-border rounded-lg p-4',
}

/**
 * Themed card container component.
 *
 * @example
 * <Card variant="elevated">
 *   <Text>Card content</Text>
 * </Card>
 */
export function Card({ variant = 'default', className = '', children, ...viewProps }: CardProps) {
  return (
    <View className={`${variantClasses[variant]} ${className}`} {...viewProps}>
      {children}
    </View>
  )
}
