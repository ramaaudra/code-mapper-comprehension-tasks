/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'

import type { FileTreeViewRef } from '@/features/file-analysis'
import { useFileAnalysisContext } from '@/features/file-analysis'
import { useGraphGeneration, usePrefetch } from '@/features/graph'
import { useSimulation } from '@/features/simulation'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { matchesFile } from '@/shared/lib/utils'

export function useAppLogic() {
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR')
  const isLayoutTransitioning = false
  const treeRef = useRef<FileTreeViewRef | null>(null)

  // Get context data
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

  // Analysis data from React Query
  const {
    analysisData,
    analysisLoadedAt,
    isLoading,
    loadError,
    reanalyze,
    changesStatus,
    checkChanges
  } = useAnalysisData()

  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<
    'overview' | 'graph' | 'architecture' | 'setup-guide'
  >('overview')
  const [graphViewMode, setGraphViewMode] = useState<'file' | 'module'>('file')
  const [highlightedModule, setHighlightedModule] = useState<string | null>(
    null
  )
  const [focusedModulePath, setFocusedModulePath] = useState<string | null>(
    null
  )
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)

  // Graph generation hook
  const { graphElements, generateGraphForFile, clearGraph } =
    useGraphGeneration({
      analysisData,
      filesInCycle,
      orphanFilesSet,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet,
      dataUpdatedAt: analysisLoadedAt
    })

  const { prefetch, clearPrefetchCache } = usePrefetch(
    analysisData,
    generateGraphForFile
  )

  // Clear prefetch cache when analysis changes
  useEffect(() => {
    clearPrefetchCache()
  }, [analysisData, clearPrefetchCache])

  // Simulation hook
  const {
    result: simulationResult,
    reset: closeSimulation,
    simulate
  } = useSimulation()

  // Handle file selection
  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        setSelectedFileId(null)
        setSelectedNode(null)
        setViewMode('overview')
        clearGraph()
        return
      }

      // Switch to graph view with file mode when file is selected
      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)

      const resolvedFileId = generateGraphForFile(fileId) || fileId
      setSelectedFileId(resolvedFileId)

      const nodeData =
        analysisData.nodes?.find((n: any) =>
          matchesFile(n.id, resolvedFileId)
        ) || analysisData.nodes?.find((n: any) => matchesFile(n.id, fileId))

      setSelectedNode(nodeData || null)
    },
    [
      analysisData,
      generateGraphForFile,
      clearGraph,
      setSelectedFileId,
      setGraphViewMode,
      setFocusedModulePath
    ]
  )

  // Navigate to file (from dashboard/graph)
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
    [analysisData, handleFileSelect]
  )

  // Show overview mode
  const handleShowOverview = useCallback(() => {
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    clearGraph()
  }, [setSelectedFileId, clearGraph])

  // Show architecture mode
  const handleShowArchitecture = useCallback(() => {
    setViewMode('architecture')
  }, [])

  // Show graph-only mode
  const handleShowGraph = useCallback(() => {
    setViewMode('graph')
    setGraphViewMode('file')
    setHighlightedModule(null)
  }, [])

  // Show graph with module view and highlighted module
  const handleShowModuleGraph = useCallback((modulePath: string) => {
    setViewMode('graph')
    setGraphViewMode('module')
    setFocusedModulePath(modulePath)
    setHighlightedModule(modulePath)
    // Clear highlight after 5 seconds
    setTimeout(() => {
      setHighlightedModule(null)
    }, 5000)
  }, [])

  const clearFocusedModule = useCallback(() => {
    setFocusedModulePath(null)
  }, [])

  // Show setup guide mode
  const handleShowSetupGuide = useCallback(() => {
    setViewMode('setup-guide')
  }, [])

  // Refresh analysis data - triggers real reanalysis via POST /api/reanalyze
  const refreshAnalysis = useCallback(async () => {
    const result = await reanalyze()
    // Clear cache and regenerate graph with new data
    if (result) {
      clearGraph() // Clear graph state and cache
      if (selectedFileId) {
        // Regenerate graph for currently selected file with new data
        generateGraphForFile(selectedFileId, result)
      } else {
        // No file selected, show overview
        setSelectedNode(null)
        setHoveredFile(null)
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
    reanalyze,
    selectedFileId,
    generateGraphForFile,
    clearGraph,
    setSelectedNode,
    setHoveredFile
  ])

  // Poll changes status every 10 seconds when analysis is loaded
  useEffect(() => {
    if (!analysisData) {
      return
    }

    // Initial check
    checkChanges()

    // Poll every 10 seconds
    const interval = setInterval(() => {
      checkChanges()
    }, 10000)

    return () => clearInterval(interval)
  }, [analysisData, checkChanges])

  // Handle simulation
  const handleSimulateDelete = useCallback(
    (fileId: string) => {
      setIsSimulating(true)
      simulate({ fileToRemove: fileId })
    },
    [simulate, setIsSimulating]
  )

  // Sync simulation result to context
  useEffect(() => {
    if (simulationResult) {
      setSimulationResult(simulationResult)
      setIsSimulating(false)
    }
  }, [simulationResult, setSimulationResult, setIsSimulating])

  // Toggle handlers
  const toggleTreeView = () => setIsTreeCollapsed((prev) => !prev)

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
    handleShowOverview,
    handleShowGraph,
    handleShowModuleGraph,
    handleShowArchitecture,
    handleShowSetupGuide,
    graphViewMode,
    setGraphViewMode,
    highlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    clearFocusedModule,
    handleSimulateDelete,
    getRiskProfileForFile,
    prefetchFile: prefetch
  }
}
