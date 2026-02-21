import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Custom theme scales so tailwind-merge correctly resolves conflicts when
 * combining variant classes with className (e.g. Text variant="h4" className="text-olive").
 * - theme.text: typography scale (--text-*) so text-h4, text-body etc. stay in font-size group.
 * - theme.color: design tokens (--color-*) so text-content-primary vs text-olive merge correctly.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['small', 'small-bold', 'body', 'h4', 'h3', 'h2', 'h1'],
      color: [
        'content-primary',
        'content-secondary',
        'content-tertiary',
        'fill-primary',
        'fill-secondary',
        'fill-tertiary',
        'brand-primary',
        'olive',
        'sage',
        'silver',
        'vanilla',
        'liliac',
        'soft-pink',
        'muted-foreground',
        'foreground',
        'background',
        'muted',
        'critical-primary',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
