// src/shared/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Avoid re-fetching large analysis payloads on tab focus
      retry: 1 // Retry failed requests once
    },
    mutations: {
      retry: 0 // Don't retry mutations automatically
    }
  }
})
