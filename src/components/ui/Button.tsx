import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Button text label */
  label: string
  /** Visual variant */
  variant?: ButtonVariant
  /** Size preset */
  size?: ButtonSize
  /** Show loading spinner */
  loading?: boolean
  /** Icon element to show before label */
  icon?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-dark',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-secondary active:bg-secondary-dark',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border border-border dark:border-dark-border active:bg-surface-muted dark:active:bg-dark-surface-muted',
    text: 'text-text-primary dark:text-dark-text-primary',
  },
  ghost: {
    container: 'bg-transparent active:bg-surface-muted dark:active:bg-dark-surface-muted',
    text: 'text-text-primary dark:text-dark-text-primary',
  },
  danger: {
    container: 'bg-error active:bg-error-dark',
    text: 'text-white',
  },
}

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-4 py-2 rounded-sm',
    text: 'text-sm',
  },
  md: {
    container: 'px-6 py-3 rounded-md',
    text: 'text-base',
  },
  lg: {
    container: 'px-8 py-4 rounded-lg',
    text: 'text-lg',
  },
}

/**
 * Themed button component with variants and loading state.
 *
 * @example
 * <Button label="Connect Wallet" variant="primary" size="lg" onPress={handleConnect} />
 * <Button label="Cancel" variant="outline" loading={isLoading} />
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  ...pressableProps
}: ButtonProps) {
  const variantStyle = variantClasses[variant]
  const sizeStyle = sizeClasses[size]
  const isDisabled = disabled || loading

  return (
    <Pressable
      className={`flex-row items-center justify-center ${sizeStyle.container} ${variantStyle.container} ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#6366f1' : '#ffffff'} />
      ) : (
        <>
          {icon}
          <Text className={`font-semibold ${sizeStyle.text} ${variantStyle.text} ${icon ? 'ml-2' : ''}`}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}
