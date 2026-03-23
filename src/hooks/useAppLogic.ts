import { useCallback, useEffect } from 'react'

import { useFileAnalysisContext } from '@/features/file-analysis'
import { useGraphGeneration, usePrefetch } from '@/features/graph'
import { useSimulation } from '@/features/simulation'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { useExplorerUiState } from '@/shared/hooks/useExplorerUiState'
import { matchesFile } from '@/shared/lib/utils'

export function useAppLogic() {
  const explorerUi = useExplorerUiState()
  const {
    treeRef,
    layoutDirection,
    setLayoutDirection,
    selectedNode,
    setSelectedNode,
    viewMode,
    setViewMode,
    graphViewMode,
    setGraphViewMode,
    utilityReturnViewMode,
    setUtilityReturnViewMode,
    metricsGuideMode,
    setMetricsGuideMode,
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    selectedCycleId,
    setSelectedCycleId,
    showCycleNearbyImports,
    setShowCycleNearbyImports,
    isTreeCollapsed,
    setIsTreeCollapsed,
    toggleTreeView,
    isLayoutTransitioning
  } = explorerUi

  const {
    selectedFileId,
    setSelectedFileId,
    setHoveredFile,
    filesInCycle,
    orphanFilesSet,
    riskProfileMap,
    brokenFilesSet,
    newOrphansSet,
    setSimulationResult,
    getRiskProfileForFile,
    setIsSimulating,
    hoveredFile
  } = useFileAnalysisContext()

  const {
    analysisData,
    analysisLoadedAt,
    isLoading,
    loadError,
    reanalyze,
    changesStatus,
    checkChanges
  } = useAnalysisData()

  const { graphElements, generateGraphForFile, clearGraph } =
    useGraphGeneration({
      analysisData,
      filesInCycle,
      orphanFilesSet,
      brokenFilesSet,
      newOrphansSet,
      dataUpdatedAt: analysisLoadedAt
    })

  const { prefetch, clearPrefetchCache } = usePrefetch(
    analysisData,
    generateGraphForFile
  )

  useEffect(() => {
    clearPrefetchCache()
  }, [analysisData, clearPrefetchCache])

  const {
    result: simulationResult,
    reset: closeSimulation,
    simulate
  } = useSimulation()

  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        setSelectedFileId(null)
        setSelectedNode(null)
        setSelectedCycleId(null)
        setViewMode('overview')
        clearGraph()
        return
      }

      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)
      setSelectedCycleId(null)

      const resolvedFileId = generateGraphForFile(fileId) || fileId
      setSelectedFileId(resolvedFileId)

      const nodeData =
        analysisData.nodes?.find((node) =>
          matchesFile(node.id, resolvedFileId)
        ) ||
        analysisData.nodes?.find((node) => matchesFile(node.id, fileId)) ||
        null

      setSelectedNode(nodeData)
    },
    [
      analysisData,
      clearGraph,
      generateGraphForFile,
      setFocusedModulePath,
      setGraphViewMode,
      setSelectedCycleId,
      setSelectedFileId,
      setSelectedNode,
      setViewMode
    ]
  )

  const navigateToFile = useCallback(
    (fileId: string) => {
      if (!analysisData) {
        return
      }

      const dependencyMap = analysisData.dependencyMap ?? {}
      const allFiles = Object.keys(dependencyMap)
      const matchedFile =
        allFiles.find((candidate) => matchesFile(candidate, fileId)) || fileId

      handleFileSelect(matchedFile)

      if (treeRef.current) {
        try {
          treeRef.current.select(matchedFile, { focus: true })
        } catch (error) {
          console.warn('Failed to focus file in tree:', error)
        }
      }
    },
    [analysisData, handleFileSelect, treeRef]
  )

  const clearFocusedModule = useCallback(() => {
    setFocusedModulePath(null)
  }, [setFocusedModulePath])

  const refreshAnalysis = useCallback(async () => {
    const result = await reanalyze()

    if (result) {
      clearGraph()

      if (selectedFileId) {
        generateGraphForFile(selectedFileId, result)
      } else {
        setSelectedNode(null)
        setHoveredFile(null)
        setSelectedCycleId(null)
        setViewMode('overview')
      }
    }

    if (result?.issues?.circularDependencies?.length) {
      console.info(
        'Circular Dependencies Found:',
        result.issues.circularDependencies
      )
    }

    return result
  }, [
    clearGraph,
    generateGraphForFile,
    reanalyze,
    selectedFileId,
    setHoveredFile,
    setSelectedCycleId,
    setSelectedNode,
    setViewMode
  ])

  useEffect(() => {
    if (!analysisData) {
      return
    }

    checkChanges()

    const interval = setInterval(() => {
      checkChanges()
    }, 10000)

    return () => clearInterval(interval)
  }, [analysisData, checkChanges])

  const handleSimulateDelete = useCallback(
    (fileId: string) => {
      setIsSimulating(true)
      simulate({ fileToRemove: fileId })
    },
    [setIsSimulating, simulate]
  )

  useEffect(() => {
    if (simulationResult) {
      setSimulationResult(simulationResult)
      setIsSimulating(false)
    }
  }, [setIsSimulating, setSimulationResult, simulationResult])

  return {
    layoutDirection,
    setLayoutDirection,
    isLayoutTransitioning,
    treeRef,
    selectedFileId,
    hoveredFile,
    analysisData,
    analysisLoadedAt,
    isLoading,
    loadError,
    refreshAnalysis,
    changesStatus,
    selectedNode,
    viewMode,
    isTreeCollapsed,
    toggleTreeView,
    graphElements,
    simulationResult,
    closeSimulation,
    setSimulationResult,
    handleFileSelect,
    navigateToFile,
    graphViewMode,
    setGraphViewMode,
    utilityReturnViewMode,
    setUtilityReturnViewMode,
    metricsGuideMode,
    setMetricsGuideMode,
    highlightedModule,
    selectedCycleId,
    showCycleNearbyImports,
    focusedModulePath,
    setFocusedModulePath,
    clearFocusedModule,
    setShowCycleNearbyImports,
    handleSimulateDelete,
    getRiskProfileForFile,
    prefetchFile: prefetch,
    filesInCycle,
    orphanFilesSet,
    riskProfileMap,
    brokenFilesSet,
    newOrphansSet,
    generateGraphForFile,
    clearGraph,
    setSelectedFileId,
    setSelectedNode,
    setViewMode,
    setHighlightedModule,
    setSelectedCycleId,
    setIsTreeCollapsed
  }
}
