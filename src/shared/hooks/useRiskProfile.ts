import { useMemo } from 'react'

import { normalizePath } from '@/shared/lib/utils/path'
import type { FileRiskProfile } from '@/shared/types/risk'

/**
 * Get risk profile for a file with memoization
 */
export function useRiskProfile(
  fileId: string | null,
  riskProfileMap: Map<string, FileRiskProfile>
): FileRiskProfile | null {
  return useMemo(() => {
    if (!fileId) {
      return null
    }

    const normalizedId = normalizePath(fileId)

    // Direct lookup
    if (riskProfileMap.has(normalizedId)) {
      return riskProfileMap.get(normalizedId) || null
    }

    // Fuzzy match
    for (const [key, profile] of riskProfileMap.entries()) {
      if (key === normalizedId || key.endsWith(`/${normalizedId}`)) {
        return profile
      }
    }

    return null
  }, [fileId, riskProfileMap])
}
