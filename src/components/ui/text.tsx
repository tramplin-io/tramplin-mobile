import { cn } from '@/lib/utils'
import * as Slot from '@rn-primitives/slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { Platform, Text as RNText, type Role } from 'react-native'

const textVariants = cva(
  cn(
    'text-content-primary text-body font-family-regular-light',
    Platform.select({
      web: 'select-text',
    }),
  ),
  {
    variants: {
      variant: {
        default: '',
        h1: cn('text-h1'),
        h1Digits: cn('text-h1 font-family-digits'),
        h2: cn('text-h2'),
        h2Digits: cn('text-h2 font-family-digits'),
        h3: cn('text-h3'),
        h3Digits: cn('text-h3 font-family-digits'),
        h4: cn('text-h4'),
        h4Digits: cn('text-h4 font-family-digits'),
        h5: cn('text-h5'),
        h5Digits: cn('text-h5 font-family-digits'),
        body: cn('text-body font-family-regular-medium'),
        small: cn('text-small font-family-regular-medium'),
        smallBold: cn('text-small-bold font-family-bold-light'),
        p: 'mt-3 leading-7 sm:mt-6',
        blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn('bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'),
        lead: 'text-muted-foreground text-xl',
        large: 'text-lg font-semibold',
        muted: 'text-muted-foreground text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type TextVariantProps = VariantProps<typeof textVariants>

type TextVariant = NonNullable<TextVariantProps['variant']>

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h1Digits: 'heading',
  h2Digits: 'heading',
  h3Digits: 'heading',
  h4Digits: 'heading',
  h5Digits: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
}

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
  h5: '5',
  h1Digits: '1',
  h2Digits: '2',
  h3Digits: '3',
  h4Digits: '4',
  h5Digits: '5',
}

const TextClassContext = React.createContext<string | undefined>(undefined)

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean
  }) {
  const textClass = React.useContext(TextClassContext)
  const Component = asChild ? Slot.Text : RNText
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  )
}

export { Text, TextClassContext }
