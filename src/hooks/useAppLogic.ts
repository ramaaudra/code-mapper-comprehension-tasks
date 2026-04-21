import { useCallback, useEffect } from 'react'

import {
  useFileAnalysisInteraction,
  useFileAnalysisPrepared
} from '@/features/file-analysis'
import { useGraphGeneration, usePrefetch } from '@/features/graph'
import { useSimulation } from '@/features/simulation'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { useExplorerUiState } from '@/shared/hooks/useExplorerUiState'
import { createUiLogger } from '@/shared/lib/logger/uiLogger'
import { normalizePath } from '@/shared/lib/utils'

const appLogicLogger = createUiLogger('AppLogic')

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
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    selectedCycleId,
    setSelectedCycleId,
    cycleTriageFocusFilePath,
    setCycleTriageFocusFilePath,
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
    brokenFilesSet,
    newOrphansSet,
    setSimulationResult,
    setIsSimulating,
    hoveredFile
  } = useFileAnalysisInteraction()
  const {
    filesInCycle,
    orphanFilesSet,
    riskProfileMap,
    fileReviewStoryMap,
    reverseDependencyMap,
    nodeLookup,
    getRiskProfileForFile
  } = useFileAnalysisPrepared()

  const {
    analysisData,
    analysisLoadedAt,
    isLoading,
    loadError,
    reanalyze,
    changesStatus,
    checkChanges
  } = useAnalysisData()

  const {
    graphElements,
    generateGraphForFile,
    prepareGraphForFile,
    clearGraph
  } = useGraphGeneration({
    analysisData,
    filesInCycle,
    orphanFilesSet,
    brokenFilesSet,
    newOrphansSet,
    fileReviewStoryMap,
    reverseDependencyMap,
    dataUpdatedAt: analysisLoadedAt
  })

  const { prefetch, clearPrefetchCache } = usePrefetch(
    analysisData,
    prepareGraphForFile
  )

  useEffect(() => {
    clearPrefetchCache()
  }, [analysisData, clearPrefetchCache])

  const {
    result: simulationResult,
    reset: closeSimulation,
    simulate
  } = useSimulation()

  const resolveNodeByFile = useCallback(
    (rawFileId: string, resolvedFileId: string) => {
      return (
        nodeLookup.get(normalizePath(resolvedFileId)) ??
        nodeLookup.get(normalizePath(rawFileId)) ??
        null
      )
    },
    [nodeLookup]
  )

  const handleFileSelect = useCallback(
    (fileId: string | null): string | null => {
      if (!fileId || !analysisData) {
        setSelectedFileId(null)
        setSelectedNode(null)
        setSelectedCycleId(null)
        setCycleTriageFocusFilePath(null)
        setViewMode('overview')
        clearGraph()
        return null
      }

      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)
      setSelectedCycleId(null)
      setCycleTriageFocusFilePath(null)

      const resolvedFileId = generateGraphForFile(fileId) || fileId
      setSelectedFileId(resolvedFileId)
      setSelectedNode(resolveNodeByFile(fileId, resolvedFileId))
      return resolvedFileId
    },
    [
      analysisData,
      clearGraph,
      generateGraphForFile,
      resolveNodeByFile,
      setFocusedModulePath,
      setGraphViewMode,
      setCycleTriageFocusFilePath,
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
      const resolvedFileId = handleFileSelect(fileId)

      if (treeRef.current) {
        try {
          treeRef.current.select(resolvedFileId ?? fileId, { focus: true })
        } catch (error) {
          appLogicLogger.warn('Failed to focus file in tree', error, {
            event: 'tree_focus_failed',
            fileId,
            resolvedFileId: resolvedFileId ?? fileId
          })
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
        setCycleTriageFocusFilePath(null)
        setViewMode('overview')
      }
    }

    if (result?.issues?.circularDependencies?.length) {
      appLogicLogger.info('Circular dependencies found after reanalysis', {
        cycleCount: result.issues.circularDependencies.length,
        event: 'circular_dependencies_found'
      })
    }

    return result
  }, [
    clearGraph,
    generateGraphForFile,
    reanalyze,
    selectedFileId,
    setHoveredFile,
    setCycleTriageFocusFilePath,
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
    highlightedModule,
    selectedCycleId,
    cycleTriageFocusFilePath,
    showCycleNearbyImports,
    focusedModulePath,
    setFocusedModulePath,
    clearFocusedModule,
    setShowCycleNearbyImports,
    handleSimulateDelete,
    getRiskProfileForFile,
    resolveNodeByFile,
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
    setCycleTriageFocusFilePath,
    setIsTreeCollapsed
  }
}
