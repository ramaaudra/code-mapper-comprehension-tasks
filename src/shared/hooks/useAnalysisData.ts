import { useQuery } from '@tanstack/react-query'

import { fetchAnalysisData } from '@/shared/lib/api/analysis'
import type { AnalysisData } from '@/shared/types/analysis'
import type { FileRiskProfile } from '@/shared/types/risk'

interface UseAnalysisDataResult {
  analysisData: AnalysisData | null
  riskAnalysis: FileRiskProfile[]
  analysisLoadedAt: number | null
  isLoading: boolean
  loadError: string | null
  loadAnalysis: () => Promise<AnalysisData | null>
}

export function useAnalysisData(): UseAnalysisDataResult {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['analysis'],
    queryFn: fetchAnalysisData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })

  const loadAnalysis = async () => {
    const { data: result } = await refetch()
    return result || null
  }

  return {
    analysisData: data || null,
    riskAnalysis: data?.riskAnalysis || [],
    analysisLoadedAt: data ? dataUpdatedAt : null,
    isLoading,
    loadError: error?.message || null,
    loadAnalysis
  }
}
