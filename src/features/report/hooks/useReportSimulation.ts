import { useCallback } from 'react'

import { useFileAnalysisInteraction } from '@/features/file-analysis'

export function useReportSimulation() {
  const { setIsSimulating, setSimulationResult } = useFileAnalysisInteraction()

  const handleSimulateDelete = useCallback(
    (_fileId: string) => {
      setIsSimulating(true)
      setSimulationResult({ brokenFiles: [], newOrphans: [] })
      setIsSimulating(false)
    },
    [setIsSimulating, setSimulationResult]
  )

  return { handleSimulateDelete }
}
