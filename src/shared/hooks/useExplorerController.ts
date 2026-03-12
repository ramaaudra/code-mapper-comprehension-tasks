import { useCallback, useMemo } from 'react'

import { useModuleExplorerState } from '@/features/graph'
import { matchesFile } from '@/shared/lib/utils'

import type { FileTreeViewRef } from '@/features/file-analysis'
import type { AnalysisData, AnalysisNode } from '@/shared/types/analysis'
import type {
  ExplorerViewMode,
  GraphViewMode,
  NonGuideViewMode
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
  guideReturnViewMode: NonGuideViewMode
  setGuideReturnViewMode: Dispatch<SetStateAction<NonGuideViewMode>>
  highlightedModule: string | null
  setHighlightedModule: Dispatch<SetStateAction<string | null>>
  focusedModulePath: string | null
  setFocusedModulePath:
    | Dispatch<SetStateAction<string | null>>
    | ((value: string | null) => void)
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
  guideReturnViewMode,
  setGuideReturnViewMode,
  highlightedModule,
  setHighlightedModule,
  focusedModulePath,
  setFocusedModulePath,
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

  const clearMetricsGuideHash = useCallback(() => {
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
        setSelectedFileId(null)
        setSelectedNode(null)
        resetModulePanel()
        setViewMode('overview')
        clearGraph()
        return null
      }

      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)
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
      generateGraphForFile,
      resetModulePanel,
      resolveFileId,
      resolveNode,
      setFocusedModulePath,
      setGraphViewMode,
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
    clearMetricsGuideHash()
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    clearGraph()
  }, [
    clearGraph,
    clearMetricsGuideHash,
    setSelectedFileId,
    setSelectedNode,
    setViewMode
  ])

  const handleShowGraph = useCallback(() => {
    clearMetricsGuideHash()
    setViewMode('graph')
    setGraphViewMode('file')
    setHighlightedModule(null)
  }, [
    clearMetricsGuideHash,
    setGraphViewMode,
    setHighlightedModule,
    setViewMode
  ])

  const handleShowArchitecture = useCallback(() => {
    clearMetricsGuideHash()
    setViewMode('architecture')
  }, [clearMetricsGuideHash, setViewMode])

  const handleShowSetupGuide = useCallback(() => {
    clearMetricsGuideHash()
    setViewMode('setup-guide')
  }, [clearMetricsGuideHash, setViewMode])

  const handleShowMetricsGuide = useCallback(
    (sourceView?: NonGuideViewMode) => {
      const nextSource =
        sourceView ??
        (viewMode === 'metrics-guide' ? guideReturnViewMode : viewMode)

      setGuideReturnViewMode(nextSource as NonGuideViewMode)
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '#metrics-guide/quick')
      }
      setViewMode('metrics-guide')
    },
    [guideReturnViewMode, setGuideReturnViewMode, setViewMode, viewMode]
  )

  const handleBackFromMetricsGuide = useCallback(() => {
    clearMetricsGuideHash()
    setViewMode(guideReturnViewMode)
  }, [clearMetricsGuideHash, guideReturnViewMode, setViewMode])

  const handleShowModuleGraph = useCallback(
    (modulePath: string) => {
      clearMetricsGuideHash()
      setViewMode('graph')
      setGraphViewMode('module')
      setFocusedModulePath(modulePath)
      setHighlightedModule(modulePath)

      setTimeout(() => {
        setHighlightedModule(null)
      }, 5000)
    },
    [
      clearMetricsGuideHash,
      setFocusedModulePath,
      setGraphViewMode,
      setHighlightedModule,
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

  return {
    treeRef,
    selectedFileId,
    viewMode,
    graphViewMode,
    highlightedModule,
    focusedModulePath,
    isTreeCollapsed,
    selectedNode,
    selectedModuleForPanel,
    selectedModuleData,
    fileCount,
    hasUnresolvedImports,
    handleFileSelect,
    navigateToFile,
    handleShowOverview,
    handleShowGraph,
    handleShowArchitecture,
    handleShowSetupGuide,
    handleShowMetricsGuide,
    handleBackFromMetricsGuide,
    handleShowModuleGraph,
    handleModuleSelect,
    handleModulePanelClose,
    handleModuleViewFile,
    handleGraphViewModeChange,
    handleDetailClose,
    toggleTreeView
  }
}
