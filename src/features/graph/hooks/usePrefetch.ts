import { useCallback, useRef } from 'react'

import type { AnalysisData } from '@/shared/types/analysis'

export function usePrefetch(
  analysisData: AnalysisData | null,
  generateGraphForFile: (
    fileId: string,
    sourceData?: AnalysisData | null
  ) => string | null
) {
  // Simple Set to track which files have been prefetched
  const prefetchCache = useRef<Set<string>>(new Set())
  const prefetchQueue = useRef<string[]>([])

  const prefetch = useCallback(
    (fileId: string) => {
      if (prefetchCache.current.has(fileId)) {
        return // Already prefetched
      }

      if (prefetchQueue.current.includes(fileId)) {
        return // Already queued
      }

      prefetchQueue.current.push(fileId)

      // Use requestIdleCallback for low-priority prefetch
      requestIdleCallback(
        () => {
          const result = generateGraphForFile(fileId, analysisData)
          if (result) {
            // Note: actual graph elements are in the main cache (LRU)
            // This just marks as prefetched
            prefetchCache.current.add(fileId)
          }

          // Remove from queue
          const index = prefetchQueue.current.indexOf(fileId)
          if (index > -1) {
            prefetchQueue.current.splice(index, 1)
          }
        },
        { timeout: 2000 } // Max 2s delay
      )
    },
    [generateGraphForFile, analysisData]
  )

  const clearPrefetchCache = useCallback(() => {
    prefetchCache.current.clear()
    prefetchQueue.current = []
  }, [])

  return { prefetch, clearPrefetchCache }
}
