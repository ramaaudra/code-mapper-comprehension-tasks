import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

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
  const queryClient = useQueryClient()
  const [changesStatus, setChangesStatus] = useState<ChangesStatus | null>(null)

  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['analysis'],
    queryFn: fetchAnalysisData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })

  const loadAnalysis = useCallback(async () => {
    const { data: result } = await refetch()
    return result || null
  }, [refetch])

  const checkChanges = useCallback(async () => {
    try {
      const status = await fetchChangesStatus()
      setChangesStatus(status)
      return status
    } catch {
      return null
    }
  }, [])

  const reanalyze = useCallback(async () => {
    try {
      const result = await reanalyzeProject()
      // Update the analysis cache with fresh data from backend
      queryClient.setQueryData(['analysis'], result)
      // Clear changes status after reanalysis
      setChangesStatus({
        hasChanges: false,
        lastChangeAt: null,
        totalChanges: 0
      })
      return result
    } catch {
      return null
    }
  }, [queryClient])

  return {
    analysisData: data || null,
    riskAnalysis: data?.riskAnalysis || EMPTY_RISK_ANALYSIS,
    analysisLoadedAt: data ? dataUpdatedAt : null,
    isLoading,
    loadError: error?.message || null,
    loadAnalysis,
    reanalyze,
    changesStatus,
    checkChanges
  }
}
