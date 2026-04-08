import { useCallback, useRef } from 'react'

import { scheduleIdleWork } from '@/shared/lib/performance/schedule-idle-work'
import { normalizePath } from '@/shared/lib/utils'

import type { AnalysisData } from '@/shared/types/analysis'

export function usePrefetch(
  analysisData: AnalysisData | null,
  prepareGraphForFile: (
    fileId: string,
    sourceData?: AnalysisData | null
  ) => string | null
) {
  const prefetchCache = useRef<Set<string>>(new Set())
  const pendingPrefetches = useRef<Map<string, () => void>>(new Map())

  const prefetch = useCallback(
    (fileId: string) => {
      if (!analysisData) {
        return
      }

      const cacheKey = normalizePath(fileId)

      if (prefetchCache.current.has(cacheKey)) {
        return
      }

      if (pendingPrefetches.current.has(cacheKey)) {
        return
      }

      const cancelScheduledPrefetch = scheduleIdleWork(
        () => {
          pendingPrefetches.current.delete(cacheKey)
          const result = prepareGraphForFile(fileId, analysisData)
          if (result) {
            prefetchCache.current.add(cacheKey)
            prefetchCache.current.add(normalizePath(result))
          }
        },
        globalThis,
        {
          idleTimeoutMs: 2000,
          fallbackDelayMs: 150
        }
      )

      pendingPrefetches.current.set(cacheKey, cancelScheduledPrefetch)
    },
    [analysisData, prepareGraphForFile]
  )

  const clearPrefetchCache = useCallback(() => {
    pendingPrefetches.current.forEach((cancelScheduledPrefetch) => {
      cancelScheduledPrefetch()
    })
    pendingPrefetches.current.clear()
    prefetchCache.current.clear()
  }, [])

  return { prefetch, clearPrefetchCache }
}
