import { View, Text } from 'react-native'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  /** Badge text */
  label: string
  /** Visual variant */
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: 'bg-surface-muted dark:bg-dark-surface-muted',
    text: 'text-text-secondary dark:text-dark-text-secondary',
  },
  success: {
    container: 'bg-success/15',
    text: 'text-success-dark dark:text-success-light',
  },
  warning: {
    container: 'bg-warning/15',
    text: 'text-warning-dark dark:text-warning-light',
  },
  error: {
    container: 'bg-error/15',
    text: 'text-error-dark dark:text-error-light',
  },
  info: {
    container: 'bg-info/15',
    text: 'text-info-dark dark:text-info-light',
  },
}

/**
 * Small badge component for status indicators.
 *
 * @example
 * <Badge label="Connected" variant="success" />
 * <Badge label="Devnet" variant="info" />
 */
export function Badge({ label, variant = 'default' }: BadgeProps) {
  const style = variantClasses[variant]

  return (
    <View className={`px-3 py-1 rounded-full ${style.container}`}>
      <Text className={`text-xs font-medium ${style.text}`}>{label}</Text>
    </View>
  )
}
