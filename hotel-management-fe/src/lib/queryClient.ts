import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          typeof (error as { response?: { status?: number } }).response?.status === 'number'
        ) {
          const status = (error as { response: { status: number } }).response.status
          if (status >= 400 && status < 500) return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
