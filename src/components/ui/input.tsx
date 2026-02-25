import { cn } from '@/lib/utils'
import * as React from 'react'
import { Platform, TextInput, type TextInputProps } from 'react-native'

type InputProps = TextInputProps & {
  hasError?: boolean
}

function Input({ className, hasError, ...props }: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  return (
    <TextInput
      className={cn(
        'web:flex h-10 native:h-16 web:w-full rounded-md border-none bg-fill-tertiary px-3 web:py-2 text-[16px] lg:text-[17px] native:text-lg native:leading-tight text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 native:pl-4 shadow-[0_0_3px_0_var(--border-quaternary,#FFF)]',
        isFocused && 'border border-border-tertiary shadow-[0_0_3px_0_var(--border-tertiary,#8E8E8E)]',
        hasError && 'border border-destructive shadow-[0_0_3px_0_var(--border-destructive,#FF9494)]',
        props.editable === false &&
          cn('opacity-50', Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className,
      )}
      onFocus={(e) => {
        setIsFocused(true)
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        props.onBlur?.(e)
      }}
      {...props}
    />
  )
}

export { Input }
