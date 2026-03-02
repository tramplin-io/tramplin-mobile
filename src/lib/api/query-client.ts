import { QueryClient } from '@tanstack/react-query'

/**
 * React Query client with mobile-optimized defaults.
 *
 * - retry: 2 attempts before failing
 * - staleTime: 5 minutes (data considered fresh)
 * - gcTime: 10 minutes (garbage collection)
 *
 * Kept in a separate file to avoid require cycles (auth-store → api → api-setup → sentry → auth-store).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})
