import { View, Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  /** Current 0-based page index */
  currentPage: number
  /** Total number of pages (≥ 1) */
  totalPages: number
  /** Called with the new 0-based page index */
  onPageChange: (page: number) => void
  /** Optional class name for the root container */
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: Readonly<PaginationProps>) {
  const canGoPrev = currentPage > 0
  const canGoNext = currentPage < totalPages - 1

  return (
    <View className={cn('w-full flex-row items-center justify-between gap-4', className)}>
      <Pressable onPress={() => onPageChange(currentPage - 1)} disabled={!canGoPrev} className="py-2 px-1">
        <Text
          variant="small"
          className={cn('uppercase', canGoPrev ? 'text-content-secondary' : 'text-content-tertiary')}
        >
          ← Previous
        </Text>
      </Pressable>
      <View className="flex-row items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const pageIndex = pageNum - 1
          const isActive = pageIndex === currentPage
          return (
            <Pressable
              key={pageNum}
              onPress={() => onPageChange(pageIndex)}
              className={cn(
                'size-6 items-center justify-center rounded-full',
                isActive && 'bg-fill-tertiary shadow-[0_0_3px_0_var(--border-quaternary,#FFF)]',
              )}
            >
              <Text
                variant="small"
                className={cn('uppercase', isActive ? 'text-content-primary' : 'text-content-tertiary')}
              >
                {pageNum}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <Pressable onPress={() => onPageChange(currentPage + 1)} disabled={!canGoNext} className="py-2 px-1">
        <Text
          variant="small"
          className={cn('uppercase', canGoNext ? 'text-content-secondary' : 'text-content-tertiary')}
        >
          Next →
        </Text>
      </Pressable>
    </View>
  )
}
