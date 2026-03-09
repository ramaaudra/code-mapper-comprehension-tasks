import { useCallback, useMemo } from 'react'

import { useModuleExplorerState } from '@/features/graph'
import { matchesFile } from '@/shared/lib/utils'

import type { FileTreeViewRef } from '@/features/file-analysis'
import type { AnalysisData, AnalysisNode } from '@/shared/types/analysis'
import type { ExplorerViewMode, GraphViewMode } from '@/shared/types/explorer'
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
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    clearGraph()
  }, [clearGraph, setSelectedFileId, setSelectedNode, setViewMode])

  const handleShowGraph = useCallback(() => {
    setViewMode('graph')
    setGraphViewMode('file')
    setHighlightedModule(null)
  }, [setGraphViewMode, setHighlightedModule, setViewMode])

  const handleShowArchitecture = useCallback(() => {
    setViewMode('architecture')
  }, [setViewMode])

  const handleShowSetupGuide = useCallback(() => {
    setViewMode('setup-guide')
  }, [setViewMode])

  const handleShowModuleGraph = useCallback(
    (modulePath: string) => {
      setViewMode('graph')
      setGraphViewMode('module')
      setFocusedModulePath(modulePath)
      setHighlightedModule(modulePath)

      setTimeout(() => {
        setHighlightedModule(null)
      }, 5000)
    },
    [setFocusedModulePath, setGraphViewMode, setHighlightedModule, setViewMode]
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
    handleShowModuleGraph,
    handleModuleSelect,
    handleModulePanelClose,
    handleModuleViewFile,
    handleGraphViewModeChange,
    handleDetailClose,
    toggleTreeView
  }
}
