import { useCallback, useEffect } from 'react'

import {
  useFileAnalysisInteraction,
  useFileAnalysisPrepared
} from '@/features/file-analysis'
import { useGraphGeneration, usePrefetch } from '@/features/graph'
import { useDataContext } from '@/shared/context/DataContext'
import { useExplorerController } from '@/shared/hooks/useExplorerController'
import { useExplorerUiState } from '@/shared/hooks/useExplorerUiState'
import { normalizePath } from '@/shared/lib/utils'

export function useReportExplorer() {
  const ui = useExplorerUiState()
  const { analysisData, generatedAt, isLoading, error, reportBootstrap } =
    useDataContext()
  const { selectedFileId, setSelectedFileId, brokenFilesSet, newOrphansSet } =
    useFileAnalysisInteraction()
  const {
    filesInCycle,
    orphanFilesSet,
    fileReviewStoryMap,
    reverseDependencyMap,
    nodeLookup
  } = useFileAnalysisPrepared()

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
    reverseDependencyMap
  })

  const { prefetch, clearPrefetchCache } = usePrefetch(
    analysisData,
    prepareGraphForFile
  )

  useEffect(() => {
    clearPrefetchCache()
  }, [analysisData, clearPrefetchCache])

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

  const explorer = useExplorerController({
    treeRef: ui.treeRef,
    analysisData,
    resolveNodeByFile,
    selectedFileId,
    setSelectedFileId,
    selectedNode: ui.selectedNode,
    setSelectedNode: ui.setSelectedNode,
    viewMode: ui.viewMode,
    setViewMode: ui.setViewMode,
    graphViewMode: ui.graphViewMode,
    setGraphViewMode: ui.setGraphViewMode,
    utilityReturnViewMode: ui.utilityReturnViewMode,
    setUtilityReturnViewMode: ui.setUtilityReturnViewMode,
    highlightedModule: ui.highlightedModule,
    setHighlightedModule: ui.setHighlightedModule,
    focusedModulePath: ui.focusedModulePath,
    setFocusedModulePath: ui.setFocusedModulePath,
    selectedCycleId: ui.selectedCycleId,
    setSelectedCycleId: ui.setSelectedCycleId,
    cycleTriageFocusFilePath: ui.cycleTriageFocusFilePath,
    setCycleTriageFocusFilePath: ui.setCycleTriageFocusFilePath,
    showCycleNearbyImports: ui.showCycleNearbyImports,
    setShowCycleNearbyImports: ui.setShowCycleNearbyImports,
    clearGraph,
    generateGraphForFile,
    isTreeCollapsed: ui.isTreeCollapsed,
    setIsTreeCollapsed: ui.setIsTreeCollapsed
  })

  return {
    analysisData,
    generatedAt,
    isLoading,
    loadError: error?.message ?? null,
    reportBootstrap,
    graphElements,
    prefetchFile: prefetch,
    explorer,
    ui
  }
}
