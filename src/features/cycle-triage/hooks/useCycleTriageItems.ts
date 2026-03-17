import { useMemo } from 'react'

import { useArchitectureFiles } from '@/features/architecture'
import { isEvolutionaryMetricsAvailable } from '@/shared/lib/utils'

import { buildCycleTriageItems } from '../lib/cycle-triage'

import type { AnalysisData } from '@/shared/types/analysis'

export function useCycleTriageItems(analysisData: AnalysisData | null) {
  const architectureFilesQuery = useArchitectureFiles()
  const fileMetrics = useMemo(
    () => architectureFilesQuery.data?.files ?? [],
    [architectureFilesQuery.data?.files]
  )

  const items = useMemo(() => {
    if (!analysisData?.issues?.circularDependencies?.length) {
      return []
    }

    return buildCycleTriageItems({
      cycles: analysisData.issues.circularDependencies,
      dependencyMap: analysisData.dependencyMap,
      fileMetrics
    })
  }, [analysisData, fileMetrics])

  return {
    items,
    isLoading:
      architectureFilesQuery.isLoading &&
      Boolean(analysisData?.issues?.circularDependencies?.length),
    hasCycleData: Boolean(analysisData?.issues?.circularDependencies?.length),
    hasMeasuredSignals:
      fileMetrics.length > 0 &&
      isEvolutionaryMetricsAvailable(analysisData?.evolutionaryMetrics.summary)
  }
}
