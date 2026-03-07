import { Platform, Pressable } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'

import { TextClassContext } from '@/components/ui/text'
import { cn } from '@/lib/utils'

// NOTE: group-* is not supported yet by Uniwind

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    }),
  ),
  {
    variants: {
      variant: {
        default: cn(
          'rounded-full border border-brand-tertiary text-fill-tertiary',
          '[background-image:linear-gradient(to_bottom,#E7E7E7,#8682f7)]',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-primary/90' }),
        ),
        destructive: cn(
          'rounded-full border border-critical-secondary text-fill-tertiary',
          '[background-image:linear-gradient(to_bottom,#E7E7E7,#FF9494)]',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          }),
        ),
        gold: cn(
          'rounded-full border border-reward-large-primary',
          '[background-image:linear-gradient(to_bottom,var(--color-reward-large-secondary),#7E650D00)]',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-reward-large-primary/90' }),
        ),
        black: cn(
          'rounded-full border border-border-quinary',
          'bg-content-primary',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-content-primary/90' }),
        ),
        tertiary: cn(
          'rounded-full bg-fill-tertiary',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-content-tertiary/90' }),
        ),
        gray: cn(
          'rounded-full border border-border-quaternary',
          '[background-image:linear-gradient(to_bottom,#E7E7E7,#FFFFFF)]',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-content-tertiary/90' }),
        ),
        error: cn(
          'rounded-full border border-critical-secondary',
          '[background-image:linear-gradient(to_bottom,var(--color-critical-secondary),var(--color-fill-overlay))]',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-critical-secondary/90' }),
        ),
        errorSmall: cn(
          'rounded-full border border-critical-secondary',
          'bg-content-primary',
          // '[background-image:linear-gradient(to_bottom,var(--color-critical-secondary),var(--color-fill-overlay))]',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-critical-secondary/90' }),
        ),
        preset: cn(
          'rounded-full px-2 py-1 border border-border-quaternary flex-row items-center',
          'hover:scale-[1.02] active:scale-[0.99]',
          Platform.select({ web: 'hover:bg-content-tertiary/90' }),
        ),
        outline: cn(
          'border-border bg-background active:bg-accent dark:bg-input/30 dark:border-input dark:active:bg-input/50 border shadow-sm shadow-black/5',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          }),
        ),
        secondary: cn(
          'bg-secondary active:bg-secondary/80 shadow-sm shadow-black/5',
          Platform.select({ web: 'hover:bg-secondary/80' }),
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' }),
        ),
        link: '',
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-full px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-full px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        xl: cn('h-15 rounded-full px-6 sm:h-15', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// 'bg-destructive active:bg-destructive/90 dark:bg-destructive/60 rounded-full',
// 'shadow-[0_-1px_1px_0_var(--color-fill-tertiary)]',

const buttonTextVariants = cva(cn(Platform.select({ web: 'pointer-events-none transition-colors' })), {
  variants: {
    variant: {
      default:
        'text-body text-content-primary drop-shadow-md shadow-fill-tertiary text-shadow-[0_-1px_1px_0_var(--color-fill-tertiary)]',
      destructive:
        'text-body text-content-primary drop-shadow-md shadow-fill-tertiary text-shadow-[0_-1px_1px_0_var(--color-fill-tertiary)]',
      gold: 'text-body text-reward-large-primary',
      black: 'text-body text-content-tertiary',
      tertiary: 'text-body text-content-tertiary',
      gray: 'text-body text-content-tertiary',
      error: 'text-body text-critical-secondary',
      errorSmall: 'text-body text-critical-secondary',
      preset: 'text-smallBold',
      outline: cn(
        'text-foreground text-sm font-medium',
        'group-active:text-accent-foreground',
        Platform.select({ web: 'group-hover:text-accent-foreground' }),
      ),
      secondary: 'text-foreground text-sm font-medium text-secondary-foreground',
      ghost: 'text-foreground text-sm font-medium group-active:text-accent-foreground',
      link: cn(
        'text-foreground text-sm font-medium',
        'text-primary group-active:underline',
        Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' }),
      ),
    },
    size: {
      default: '',
      sm: '',
      lg: '',
      xl: '',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        // role="button"
        {...props}
      />
    </TextClassContext.Provider>
  )
}

export { Button, buttonTextVariants, buttonVariants }
export type { ButtonProps }
