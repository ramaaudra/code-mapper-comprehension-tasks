import { useCallback, useMemo } from 'react'

import { useModuleExplorerState } from '@/features/graph'
import {
  buildMetricsGuideHash,
  matchesFile,
  parseMetricsGuideHash,
  resolveExplorerContextChip
} from '@/shared/lib/utils'

import type { FileTreeViewRef } from '@/features/file-analysis'
import type { AnalysisData, AnalysisNode } from '@/shared/types/analysis'
import type {
  ExplorerContextChip,
  ExplorerViewMode,
  GraphViewMode,
  MetricsGuideMode,
  NonUtilityViewMode,
  PrimaryExplorerViewMode,
  UtilityExplorerViewMode
} from '@/shared/types/explorer'
import type { Dispatch, RefObject, SetStateAction } from 'react'

interface UseExplorerControllerOptions {
  treeRef: RefObject<FileTreeViewRef | null>
  analysisData: AnalysisData | null
  selectedFileId: string | null
  setSelectedFileId: (value: string | null) => void
  selectedNode: AnalysisNode | null
  setSelectedNode: (value: AnalysisNode | null) => void
  viewMode: ExplorerViewMode
  setViewMode: Dispatch<SetStateAction<ExplorerViewMode>>
  graphViewMode: GraphViewMode
  setGraphViewMode: Dispatch<SetStateAction<GraphViewMode>>
  utilityReturnViewMode: NonUtilityViewMode
  setUtilityReturnViewMode: Dispatch<SetStateAction<NonUtilityViewMode>>
  metricsGuideMode: MetricsGuideMode
  setMetricsGuideMode: Dispatch<SetStateAction<MetricsGuideMode>>
  highlightedModule: string | null
  setHighlightedModule: Dispatch<SetStateAction<string | null>>
  focusedModulePath: string | null
  setFocusedModulePath:
    | Dispatch<SetStateAction<string | null>>
    | ((value: string | null) => void)
  selectedCycleId: string | null
  setSelectedCycleId: Dispatch<SetStateAction<string | null>>
  clearFocusedModule?: () => void
  clearGraph: () => void
  generateGraphForFile: (
    fileId: string | null,
    sourceData?: AnalysisData | null
  ) => string | null
  isTreeCollapsed: boolean
  setIsTreeCollapsed: Dispatch<SetStateAction<boolean>>
}

export function useExplorerController({
  treeRef,
  analysisData,
  selectedFileId,
  setSelectedFileId,
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
  clearFocusedModule,
  clearGraph,
  generateGraphForFile,
  isTreeCollapsed,
  setIsTreeCollapsed
}: UseExplorerControllerOptions) {
  const {
    selectedModuleForPanel,
    selectedModuleData,
    resetModulePanel,
    clearModuleFocus,
    handleModuleSelect,
    handleModulePanelClose,
    handleGraphViewModeChange
  } = useModuleExplorerState({
    selectedNodeLabel: selectedNode?.label,
    setGraphViewMode,
    setFocusedModulePath,
    clearFocusedModule
  })

  const resolveFileId = useCallback(
    (fileId: string) => {
      const dependencyMap = analysisData?.dependencyMap ?? {}
      const allFiles = Object.keys(dependencyMap)

      return (
        allFiles.find((candidate) => matchesFile(candidate, fileId)) || fileId
      )
    },
    [analysisData]
  )

  const isPrimaryViewMode = useCallback(
    (candidate: ExplorerViewMode): candidate is PrimaryExplorerViewMode => {
      return (
        candidate === 'overview' ||
        candidate === 'graph' ||
        candidate === 'architecture'
      )
    },
    []
  )

  const clearUtilityHash = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hash.startsWith('#metrics-guide')
    ) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`
      )
    }
  }, [])

  const resolveUtilitySourceView = useCallback(
    (sourceView?: NonUtilityViewMode): NonUtilityViewMode => {
      if (sourceView) {
        return sourceView
      }

      if (isPrimaryViewMode(viewMode)) {
        return viewMode
      }

      return utilityReturnViewMode
    },
    [isPrimaryViewMode, utilityReturnViewMode, viewMode]
  )

  const resolveNode = useCallback(
    (rawFileId: string, resolvedFileId: string) => {
      return (
        analysisData?.nodes.find((node) =>
          matchesFile(node.id, resolvedFileId)
        ) ||
        analysisData?.nodes.find((node) => matchesFile(node.id, rawFileId)) ||
        null
      )
    },
    [analysisData]
  )

  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        clearUtilityHash()
        setSelectedFileId(null)
        setSelectedNode(null)
        setSelectedCycleId(null)
        resetModulePanel()
        setViewMode('overview')
        clearGraph()
        return null
      }

      clearUtilityHash()
      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)
      setSelectedCycleId(null)
      resetModulePanel()

      const matchedFileId = resolveFileId(fileId)
      const resolvedFocusId =
        generateGraphForFile(matchedFileId) || matchedFileId
      setSelectedFileId(resolvedFocusId)
      setSelectedNode(resolveNode(fileId, resolvedFocusId))

      return resolvedFocusId
    },
    [
      analysisData,
      clearGraph,
      clearUtilityHash,
      generateGraphForFile,
      resetModulePanel,
      resolveFileId,
      resolveNode,
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
        return null
      }

      const matchedFile = resolveFileId(fileId)
      const resolvedFileId = handleFileSelect(matchedFile)

      if (treeRef.current && matchedFile) {
        try {
          treeRef.current.select(matchedFile, { focus: true })
        } catch (error) {
          console.warn('Failed to focus file in tree:', error)
        }
      }

      return resolvedFileId
    },
    [analysisData, handleFileSelect, resolveFileId, treeRef]
  )

  const handleShowOverview = useCallback(() => {
    clearUtilityHash()
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    setSelectedCycleId(null)
    clearGraph()
  }, [
    clearGraph,
    clearUtilityHash,
    setSelectedCycleId,
    setSelectedFileId,
    setSelectedNode,
    setViewMode
  ])

  const handleShowGraph = useCallback(() => {
    clearUtilityHash()
    setViewMode('graph')
    setGraphViewMode('file')
    setHighlightedModule(null)
    setSelectedCycleId(null)
  }, [
    clearUtilityHash,
    setGraphViewMode,
    setHighlightedModule,
    setSelectedCycleId,
    setViewMode
  ])

  const handleShowArchitecture = useCallback(() => {
    clearUtilityHash()
    setSelectedCycleId(null)
    setViewMode('architecture')
  }, [clearUtilityHash, setSelectedCycleId, setViewMode])

  const handleShowSetupGuide = useCallback(
    (sourceView?: NonUtilityViewMode) => {
      clearUtilityHash()
      setSelectedCycleId(null)
      setUtilityReturnViewMode(resolveUtilitySourceView(sourceView))
      setViewMode('setup-guide')
    },
    [
      clearUtilityHash,
      resolveUtilitySourceView,
      setSelectedCycleId,
      setUtilityReturnViewMode,
      setViewMode
    ]
  )

  const handleShowMetricsGuide = useCallback(
    (sourceView?: NonUtilityViewMode) => {
      const nextSource = resolveUtilitySourceView(sourceView)
      const hashMode =
        typeof window !== 'undefined'
          ? parseMetricsGuideHash(window.location.hash)?.mode
          : null
      const nextMode = hashMode ?? 'quick'

      setUtilityReturnViewMode(nextSource)
      setSelectedCycleId(null)
      setMetricsGuideMode(nextMode)
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', buildMetricsGuideHash(nextMode))
      }
      setViewMode('metrics-guide')
    },
    [
      resolveUtilitySourceView,
      setMetricsGuideMode,
      setSelectedCycleId,
      setUtilityReturnViewMode,
      setViewMode
    ]
  )

  const handleShowCycleTriage = useCallback(
    (cycleId?: string | null, sourceView?: NonUtilityViewMode) => {
      clearUtilityHash()
      setUtilityReturnViewMode(resolveUtilitySourceView(sourceView))
      setSelectedCycleId(cycleId ?? null)
      setViewMode('cycle-triage')
    },
    [
      clearUtilityHash,
      resolveUtilitySourceView,
      setSelectedCycleId,
      setUtilityReturnViewMode,
      setViewMode
    ]
  )

  const handleBackFromUtility = useCallback(() => {
    clearUtilityHash()
    setViewMode(utilityReturnViewMode)
  }, [clearUtilityHash, setViewMode, utilityReturnViewMode])

  const handleMetricsGuideModeChange = useCallback(
    (mode: MetricsGuideMode) => {
      setMetricsGuideMode(mode)
    },
    [setMetricsGuideMode]
  )

  const handleShowModuleGraph = useCallback(
    (modulePath: string) => {
      clearUtilityHash()
      setViewMode('graph')
      setGraphViewMode('module')
      setFocusedModulePath(modulePath)
      setHighlightedModule(modulePath)
      setSelectedCycleId(null)

      setTimeout(() => {
        setHighlightedModule(null)
      }, 5000)
    },
    [
      clearUtilityHash,
      setFocusedModulePath,
      setGraphViewMode,
      setHighlightedModule,
      setSelectedCycleId,
      setViewMode
    ]
  )

  const handleModuleViewFile = useCallback(
    (filePath: string) => {
      setGraphViewMode('file')
      clearModuleFocus()
      navigateToFile(filePath)
    },
    [clearModuleFocus, navigateToFile, setGraphViewMode]
  )

  const handleDetailClose = useCallback(() => {
    handleFileSelect(null)
  }, [handleFileSelect])

  const toggleTreeView = useCallback(() => {
    setIsTreeCollapsed((current) => !current)
  }, [setIsTreeCollapsed])

  const fileCount = useMemo(() => {
    return analysisData
      ? Object.keys(analysisData.dependencyMap).length
      : undefined
  }, [analysisData])

  const hasUnresolvedImports =
    (analysisData?.warnings?.unresolvedImports?.length ?? 0) > 0

  const activePrimaryViewMode = useMemo<PrimaryExplorerViewMode | null>(() => {
    return isPrimaryViewMode(viewMode) ? viewMode : null
  }, [isPrimaryViewMode, viewMode])

  const activeUtilityViewMode = useMemo<UtilityExplorerViewMode | null>(() => {
    if (
      viewMode === 'metrics-guide' ||
      viewMode === 'setup-guide' ||
      viewMode === 'cycle-triage'
    ) {
      return viewMode
    }

    return null
  }, [viewMode])

  const activeContextChip = useMemo<ExplorerContextChip | null>(() => {
    return resolveExplorerContextChip({
      viewMode,
      graphViewMode,
      currentHash: buildMetricsGuideHash(metricsGuideMode),
      hasUnresolvedImports
    })
  }, [graphViewMode, hasUnresolvedImports, metricsGuideMode, viewMode])

  return {
    treeRef,
    selectedFileId,
    viewMode,
    activePrimaryViewMode,
    activeUtilityViewMode,
    graphViewMode,
    activeContextChip,
    metricsGuideMode,
    highlightedModule,
    focusedModulePath,
    isTreeCollapsed,
    selectedNode,
    selectedCycleId,
    selectedModuleForPanel,
    selectedModuleData,
    fileCount,
    hasUnresolvedImports,
    handleFileSelect,
    navigateToFile,
    handleShowOverview,
    handleShowGraph,
    handleShowArchitecture,
    handleShowCycleTriage,
    handleShowSetupGuide,
    handleShowMetricsGuide,
    handleBackFromUtility,
    handleMetricsGuideModeChange,
    handleShowModuleGraph,
    handleModuleSelect,
    handleModulePanelClose,
    handleModuleViewFile,
    handleGraphViewModeChange,
    handleCycleSelection: setSelectedCycleId,
    handleDetailClose,
    toggleTreeView
  }
}
