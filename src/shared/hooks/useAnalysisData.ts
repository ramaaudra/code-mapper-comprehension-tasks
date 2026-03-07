import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useContext, useMemo, useState } from 'react'

import { DataContext } from '@/shared/context/DataContext'
import {
  type ChangesStatus,
  fetchAnalysisData,
  fetchChangesStatus,
  reanalyzeProject
} from '@/shared/lib/api/analysis'
import type { AnalysisData } from '@/shared/types/analysis'
import type { FileRiskProfile } from '@/shared/types/risk'

interface UseAnalysisDataResult {
  analysisData: AnalysisData | null
  riskAnalysis: FileRiskProfile[]
  analysisLoadedAt: number | null
  isLoading: boolean
  loadError: string | null
  loadAnalysis: () => Promise<AnalysisData | null>
  reanalyze: () => Promise<AnalysisData | null>
  changesStatus: ChangesStatus | null
  checkChanges: () => Promise<ChangesStatus | null>
}

const EMPTY_RISK_ANALYSIS: FileRiskProfile[] = []

export function useAnalysisData(): UseAnalysisDataResult {
  const context = useContext(DataContext)
  const queryClient = useQueryClient()
  const [changesStatus, setChangesStatus] = useState<ChangesStatus | null>(null)

  // Check if we're in report mode (static data available)
  const isReportMode = context?.analysisData != null

  // In report mode: use static data, no fetching
  // In live mode: use React Query
  const queryResult = useQuery({
    queryKey: ['analysis'],
    queryFn: fetchAnalysisData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !isReportMode // Only fetch in live mode
  })

  const { data, isLoading, error, refetch, dataUpdatedAt } = queryResult

  // Use memoized data based on mode
  const analysisData = useMemo(() => {
    return isReportMode ? context.analysisData : data || null
  }, [isReportMode, context?.analysisData, data])

  const riskAnalysis = useMemo(() => {
    const embeddedRiskAnalysis = analysisData?.riskAnalysis
    return embeddedRiskAnalysis ?? EMPTY_RISK_ANALYSIS
  }, [analysisData?.riskAnalysis])

  const loadAnalysis = useCallback(async () => {
    if (isReportMode) {
      return context.analysisData
    }
    const { data: result } = await refetch()
    return result || null
  }, [isReportMode, context?.analysisData, refetch])

  const checkChanges = useCallback(async () => {
    if (isReportMode) {
      return null // No changes checking in report mode
    }
    try {
      const status = await fetchChangesStatus()
      setChangesStatus(status)
      return status
    } catch {
      return null
    }
  }, [isReportMode])

  const reanalyze = useCallback(async () => {
    if (isReportMode) {
      return context.analysisData // Cannot reanalyze in report mode
    }
    try {
      const result = await reanalyzeProject()
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['analysis'] })
      return result
    } catch (err) {
      console.error('Reanalysis failed:', err)
      return null
    }
  }, [isReportMode, context?.analysisData, queryClient])

  return {
    analysisData,
    riskAnalysis,
    analysisLoadedAt: isReportMode ? Date.now() : dataUpdatedAt,
    isLoading: isReportMode ? false : isLoading,
    loadError: isReportMode ? null : error?.message || null,
    loadAnalysis,
    reanalyze,
    changesStatus: isReportMode ? null : changesStatus,
    checkChanges
  }
}
