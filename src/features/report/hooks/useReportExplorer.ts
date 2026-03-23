import { useFileAnalysisContext } from '@/features/file-analysis'
import { useGraphGeneration } from '@/features/graph'
import { useDataContext } from '@/shared/context/DataContext'
import { useExplorerController } from '@/shared/hooks/useExplorerController'
import { useExplorerUiState } from '@/shared/hooks/useExplorerUiState'

export function useReportExplorer() {
  const ui = useExplorerUiState()
  const { analysisData, generatedAt } = useDataContext()
  const {
    selectedFileId,
    setSelectedFileId,
    filesInCycle,
    orphanFilesSet,
    brokenFilesSet,
    newOrphansSet
  } = useFileAnalysisContext()

  const { graphElements, generateGraphForFile, clearGraph } =
    useGraphGeneration({
      analysisData,
      filesInCycle,
      orphanFilesSet,
      brokenFilesSet,
      newOrphansSet
    })

  const explorer = useExplorerController({
    treeRef: ui.treeRef,
    analysisData,
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
    metricsGuideMode: ui.metricsGuideMode,
    setMetricsGuideMode: ui.setMetricsGuideMode,
    highlightedModule: ui.highlightedModule,
    setHighlightedModule: ui.setHighlightedModule,
    focusedModulePath: ui.focusedModulePath,
    setFocusedModulePath: ui.setFocusedModulePath,
    selectedCycleId: ui.selectedCycleId,
    setSelectedCycleId: ui.setSelectedCycleId,
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
    graphElements,
    explorer,
    ui
  }
}
