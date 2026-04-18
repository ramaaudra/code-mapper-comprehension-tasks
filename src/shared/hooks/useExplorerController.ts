import { useCallback, useMemo } from 'react'

import { buildCycleTriageSearch } from '@/features/cycle-triage/lib/cycle-triage-url'
import { useModuleExplorerState } from '@/features/graph'
import {
  buildMetricsGuideHash,
  isMetricsGuideHash,
  matchesFile,
  parseMetricsGuideHash,
  resolveExplorerContextChip
} from '@/shared/lib/utils'

import type { FileTreeViewRef } from '@/features/file-analysis'
import type { AnalysisData, AnalysisNode } from '@/shared/types/analysis'
import type {
  CycleTriageNavigationRequest,
  ExplorerContextChip,
  ExplorerViewMode,
  GraphViewMode,
  NonUtilityViewMode,
  PrimaryExplorerViewMode,
  UtilityExplorerViewMode
} from '@/shared/types/explorer'
import type { Dispatch, RefObject, SetStateAction } from 'react'

interface UseExplorerControllerOptions {
  treeRef: RefObject<FileTreeViewRef | null>
  analysisData: AnalysisData | null
  resolveNodeByFile?: (
    rawFileId: string,
    resolvedFileId: string
  ) => AnalysisNode | null
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
  highlightedModule: string | null
  setHighlightedModule: Dispatch<SetStateAction<string | null>>
  focusedModulePath: string | null
  setFocusedModulePath:
    | Dispatch<SetStateAction<string | null>>
    | ((value: string | null) => void)
  selectedCycleId: string | null
  setSelectedCycleId: Dispatch<SetStateAction<string | null>>
  cycleTriageFocusFilePath: string | null
  setCycleTriageFocusFilePath: Dispatch<SetStateAction<string | null>>
  showCycleNearbyImports: boolean
  setShowCycleNearbyImports: Dispatch<SetStateAction<boolean>>
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
  resolveNodeByFile,
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
      isMetricsGuideHash(window.location.hash)
    ) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`
      )
    }
  }, [])

  const syncCycleTriageSearch = useCallback(
    ({
      nextViewMode,
      nextCycleId,
      nextShowNearbyImports = showCycleNearbyImports,
      nextFocusFilePath = cycleTriageFocusFilePath
    }: {
      nextViewMode: ExplorerViewMode
      nextCycleId: string | null
      nextShowNearbyImports?: boolean
      nextFocusFilePath?: string | null
    }) => {
      if (typeof window === 'undefined') {
        return
      }

      const nextSearch = buildCycleTriageSearch(window.location.search, {
        viewMode: nextViewMode,
        selectedCycleId: nextCycleId,
        focusFilePath:
          nextViewMode === 'cycle-triage' ? nextFocusFilePath : null,
        showNearbyImports:
          nextViewMode === 'cycle-triage' ? nextShowNearbyImports : false
      })
      const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`

      window.history.replaceState(null, '', nextUrl)
    },
    [cycleTriageFocusFilePath, showCycleNearbyImports]
  )

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
      if (resolveNodeByFile) {
        return resolveNodeByFile(rawFileId, resolvedFileId)
      }

      return (
        analysisData?.nodes.find((node) =>
          matchesFile(node.id, resolvedFileId)
        ) ||
        analysisData?.nodes.find((node) => matchesFile(node.id, rawFileId)) ||
        null
      )
    },
    [analysisData, resolveNodeByFile]
  )

  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        clearUtilityHash()
        setSelectedFileId(null)
        setSelectedNode(null)
        setSelectedCycleId(null)
        setCycleTriageFocusFilePath(null)
        setShowCycleNearbyImports(false)
        resetModulePanel()
        setViewMode('overview')
        clearGraph()
        syncCycleTriageSearch({
          nextViewMode: 'overview',
          nextCycleId: null,
          nextFocusFilePath: null
        })
        return null
      }

      clearUtilityHash()
      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)
      setSelectedCycleId(null)
      setCycleTriageFocusFilePath(null)
      setShowCycleNearbyImports(false)
      resetModulePanel()
      syncCycleTriageSearch({
        nextViewMode: 'graph',
        nextCycleId: null,
        nextFocusFilePath: null
      })

      const resolvedFocusId = generateGraphForFile(fileId) || fileId
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
      resolveNode,
      setFocusedModulePath,
      setGraphViewMode,
      setCycleTriageFocusFilePath,
      setShowCycleNearbyImports,
      setSelectedCycleId,
      setSelectedFileId,
      setSelectedNode,
      syncCycleTriageSearch,
      setViewMode
    ]
  )

  const navigateToFile = useCallback(
    (fileId: string) => {
      if (!analysisData) {
        return null
      }

      const resolvedFileId = handleFileSelect(fileId)

      if (treeRef.current) {
        try {
          treeRef.current.select(resolvedFileId ?? fileId, { focus: true })
        } catch (error) {
          console.warn('Failed to focus file in tree:', error)
        }
      }

      return resolvedFileId
    },
    [analysisData, handleFileSelect, treeRef]
  )

  const handleShowOverview = useCallback(() => {
    clearUtilityHash()
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    setSelectedCycleId(null)
    setCycleTriageFocusFilePath(null)
    clearGraph()
    setShowCycleNearbyImports(false)
    syncCycleTriageSearch({
      nextViewMode: 'overview',
      nextCycleId: null,
      nextFocusFilePath: null
    })
  }, [
    clearGraph,
    clearUtilityHash,
    setCycleTriageFocusFilePath,
    setShowCycleNearbyImports,
    setSelectedCycleId,
    setSelectedFileId,
    setSelectedNode,
    syncCycleTriageSearch,
    setViewMode
  ])

  const handleShowGraph = useCallback(() => {
    clearUtilityHash()
    setViewMode('graph')
    setGraphViewMode('file')
    setHighlightedModule(null)
    setSelectedCycleId(null)
    setCycleTriageFocusFilePath(null)
    setShowCycleNearbyImports(false)
    syncCycleTriageSearch({
      nextViewMode: 'graph',
      nextCycleId: null,
      nextFocusFilePath: null
    })
  }, [
    clearUtilityHash,
    setCycleTriageFocusFilePath,
    setGraphViewMode,
    setHighlightedModule,
    setShowCycleNearbyImports,
    setSelectedCycleId,
    syncCycleTriageSearch,
    setViewMode
  ])

  const handleShowArchitecture = useCallback(() => {
    clearUtilityHash()
    setSelectedCycleId(null)
    setCycleTriageFocusFilePath(null)
    setShowCycleNearbyImports(false)
    setViewMode('architecture')
    syncCycleTriageSearch({
      nextViewMode: 'architecture',
      nextCycleId: null,
      nextFocusFilePath: null
    })
  }, [
    clearUtilityHash,
    setCycleTriageFocusFilePath,
    setSelectedCycleId,
    setShowCycleNearbyImports,
    syncCycleTriageSearch,
    setViewMode
  ])

  const handleShowSetupGuide = useCallback(
    (sourceView?: NonUtilityViewMode) => {
      clearUtilityHash()
      setSelectedCycleId(null)
      setCycleTriageFocusFilePath(null)
      setShowCycleNearbyImports(false)
      setUtilityReturnViewMode(resolveUtilitySourceView(sourceView))
      syncCycleTriageSearch({
        nextViewMode: 'setup-guide',
        nextCycleId: null,
        nextFocusFilePath: null
      })
      setViewMode('setup-guide')
    },
    [
      clearUtilityHash,
      resolveUtilitySourceView,
      setCycleTriageFocusFilePath,
      setSelectedCycleId,
      setShowCycleNearbyImports,
      setUtilityReturnViewMode,
      syncCycleTriageSearch,
      setViewMode
    ]
  )

  const handleShowMetricsGuide = useCallback(
    (sourceView?: NonUtilityViewMode) => {
      const nextSource = resolveUtilitySourceView(sourceView)
      const nextSection =
        typeof window !== 'undefined'
          ? parseMetricsGuideHash(window.location.hash)?.section
          : undefined

      setUtilityReturnViewMode(nextSource)
      setSelectedCycleId(null)
      setCycleTriageFocusFilePath(null)
      setShowCycleNearbyImports(false)
      if (typeof window !== 'undefined') {
        const nextSearch = buildCycleTriageSearch(window.location.search, {
          viewMode: 'metrics-guide',
          selectedCycleId: null,
          focusFilePath: null,
          showNearbyImports: false
        })
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${nextSearch}${buildMetricsGuideHash(nextSection)}`
        )
      }
      setViewMode('metrics-guide')
    },
    [
      resolveUtilitySourceView,
      setCycleTriageFocusFilePath,
      setSelectedCycleId,
      setShowCycleNearbyImports,
      setUtilityReturnViewMode,
      setViewMode
    ]
  )

  const handleShowCycleTriage = useCallback(
    ({
      cycleId = null,
      sourceView,
      focusFilePath = null
    }: CycleTriageNavigationRequest & {
      sourceView?: NonUtilityViewMode
    } = {}) => {
      clearUtilityHash()
      setUtilityReturnViewMode(resolveUtilitySourceView(sourceView))
      setSelectedCycleId(cycleId)
      setCycleTriageFocusFilePath(focusFilePath)
      setShowCycleNearbyImports(false)
      setViewMode('cycle-triage')
      syncCycleTriageSearch({
        nextViewMode: 'cycle-triage',
        nextCycleId: cycleId,
        nextShowNearbyImports: false,
        nextFocusFilePath: focusFilePath
      })
    },
    [
      clearUtilityHash,
      resolveUtilitySourceView,
      setCycleTriageFocusFilePath,
      setShowCycleNearbyImports,
      setSelectedCycleId,
      setUtilityReturnViewMode,
      syncCycleTriageSearch,
      setViewMode
    ]
  )

  const handleBackFromUtility = useCallback(() => {
    clearUtilityHash()
    setShowCycleNearbyImports(false)
    setViewMode(utilityReturnViewMode)
    syncCycleTriageSearch({
      nextViewMode: utilityReturnViewMode,
      nextCycleId: null,
      nextFocusFilePath: null
    })
  }, [
    clearUtilityHash,
    setShowCycleNearbyImports,
    setViewMode,
    syncCycleTriageSearch,
    utilityReturnViewMode
  ])

  const handleCycleSelection = useCallback(
    (cycleId: string | null) => {
      setSelectedCycleId(cycleId)

      if (viewMode === 'cycle-triage') {
        syncCycleTriageSearch({
          nextViewMode: 'cycle-triage',
          nextCycleId: cycleId
        })
      }
    },
    [setSelectedCycleId, syncCycleTriageSearch, viewMode]
  )

  const handleCycleFocusFilePathChange = useCallback(
    (focusFilePath: string | null) => {
      setCycleTriageFocusFilePath(focusFilePath)

      if (viewMode === 'cycle-triage') {
        syncCycleTriageSearch({
          nextViewMode: 'cycle-triage',
          nextCycleId: selectedCycleId,
          nextShowNearbyImports: showCycleNearbyImports,
          nextFocusFilePath: focusFilePath
        })
      }
    },
    [
      selectedCycleId,
      setCycleTriageFocusFilePath,
      showCycleNearbyImports,
      syncCycleTriageSearch,
      viewMode
    ]
  )

  const handleCycleNearbyImportsChange = useCallback(
    (value: boolean) => {
      setShowCycleNearbyImports(value)
      syncCycleTriageSearch({
        nextViewMode: viewMode,
        nextCycleId: selectedCycleId,
        nextShowNearbyImports: value
      })
    },
    [
      selectedCycleId,
      setShowCycleNearbyImports,
      syncCycleTriageSearch,
      viewMode
    ]
  )

  const handleShowModuleGraph = useCallback(
    (modulePath: string) => {
      clearUtilityHash()
      setViewMode('graph')
      setGraphViewMode('module')
      setFocusedModulePath(modulePath)
      setHighlightedModule(modulePath)
      setSelectedCycleId(null)
      setCycleTriageFocusFilePath(null)
      setShowCycleNearbyImports(false)
      syncCycleTriageSearch({
        nextViewMode: 'graph',
        nextCycleId: null,
        nextFocusFilePath: null
      })

      setTimeout(() => {
        setHighlightedModule(null)
      }, 5000)
    },
    [
      clearUtilityHash,
      setCycleTriageFocusFilePath,
      setFocusedModulePath,
      setGraphViewMode,
      setHighlightedModule,
      setShowCycleNearbyImports,
      setSelectedCycleId,
      syncCycleTriageSearch,
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

  const projectName = analysisData?.projectName
  const rootPath = analysisData?.rootPath

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
      currentHash: buildMetricsGuideHash(),
      hasUnresolvedImports
    })
  }, [graphViewMode, hasUnresolvedImports, viewMode])

  return {
    treeRef,
    selectedFileId,
    viewMode,
    activePrimaryViewMode,
    activeUtilityViewMode,
    graphViewMode,
    activeContextChip,
    highlightedModule,
    focusedModulePath,
    isTreeCollapsed,
    selectedNode,
    selectedCycleId,
    cycleTriageFocusFilePath,
    showCycleNearbyImports,
    selectedModuleForPanel,
    selectedModuleData,
    fileCount,
    projectName,
    rootPath,
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
    handleShowModuleGraph,
    handleModuleSelect,
    handleModulePanelClose,
    handleModuleViewFile,
    handleGraphViewModeChange,
    handleCycleSelection,
    handleCycleFocusFilePathChange,
    handleCycleNearbyImportsChange,
    handleDetailClose,
    toggleTreeView
  }
}
