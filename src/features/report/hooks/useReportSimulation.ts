import { useCallback } from 'react'

import { useFileAnalysisContext } from '@/features/file-analysis'

export function useReportSimulation() {
  const { setIsSimulating, setSimulationResult } = useFileAnalysisContext()

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
