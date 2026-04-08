import { useMemo } from 'react'

import {
  prepareAnalysisSnapshot,
  type PreparedAnalysisSnapshot
} from '@/shared/lib/analysis-preparation'

import type { AnalysisData } from '@/shared/types/analysis'

export function usePreparedAnalysis(
  analysisData: AnalysisData | null | undefined
): PreparedAnalysisSnapshot {
  return useMemo(() => prepareAnalysisSnapshot(analysisData), [analysisData])
}
