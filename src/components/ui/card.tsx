import { Text, TextClassContext } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { View, type ViewProps } from 'react-native'

const cardVariants = cva('flex flex-col gap-6 rounded-xl', {
  variants: {
    variant: {
      default: 'bg-card border-border border py-6 shadow-sm shadow-black/5 rounded-lg p-4',
      profile:
        'bg-border-quaternary border-border-quaternary border shadow-sm shadow-black/5 rounded-lg py-2 px-5 gap-0',
      elevated: 'bg-card border-0 py-6 shadow-md shadow-black/10 rounded-lg p-4',
      outlined: 'bg-transparent border border-border py-6 rounded-lg p-4',
      ghost: 'bg-transparent border-0 py-6 rounded-lg p-4',
    },
    padding: {
      default: '',
      none: '!p-0 !py-0',
      sm: '!py-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'default',
  },
})

type CardProps = ViewProps & React.RefAttributes<View> & VariantProps<typeof cardVariants>

function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View className={cn(cardVariants({ variant, padding }), className)} {...props} />
    </TextClassContext.Provider>
  )
}

function CardHeader({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('flex flex-col gap-1.5 px-6', className)} {...props} />
}

function CardTitle({ className, variant, ...props }: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return <Text variant={variant ?? 'h3'} className={cn('leading-none', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...props} />
}

function CardContent({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('px-6', className)} {...props} />
}

function CardFooter({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('flex flex-row items-center px-6', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants }
export type { CardProps }
