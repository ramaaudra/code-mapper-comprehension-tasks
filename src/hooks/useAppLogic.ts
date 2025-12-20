/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'
import { TreeApi } from 'react-arborist'

import { useFileAnalysisContext } from '@/features/file-analysis'
import { useGraphGeneration, usePrefetch } from '@/features/graph'
import { useSimulation } from '@/features/simulation'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { matchesFile } from '@/shared/lib/utils'

export function useAppLogic() {
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR')
  const isLayoutTransitioning = false
  const treeRef = useRef<TreeApi<any> | null>(null)

  // Get context data
  const {
    selectedFileId,
    setSelectedFileId,
    setHoveredFile,
    searchQuery,
    setSearchQuery,
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
    loadAnalysis: fetchAnalysis
  } = useAnalysisData()

  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'architecture'>(
    'overview'
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
      newOrphansSet
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

      const resolvedFileId = generateGraphForFile(fileId) || fileId
      setSelectedFileId(resolvedFileId)

      const nodeData =
        analysisData.nodes?.find((n: any) =>
          matchesFile(n.id, resolvedFileId)
        ) || analysisData.nodes?.find((n: any) => matchesFile(n.id, fileId))

      setSelectedNode(nodeData || null)
    },
    [analysisData, generateGraphForFile, clearGraph, setSelectedFileId]
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

  // Refresh analysis data
  const refreshAnalysis = useCallback(async () => {
    const result = await fetchAnalysis()
    setSelectedFileId(null)
    setSelectedNode(null)
    setHoveredFile(null)
    clearGraph()
    setViewMode('overview')
    if (result?.issues?.circularDependencies?.length) {
      console.info(
        'Circular Dependencies Found:',
        result.issues.circularDependencies
      )
    }
    return result
  }, [fetchAnalysis, setSelectedFileId, setHoveredFile, clearGraph])

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

  // Load analysis on mount
  useEffect(() => {
    refreshAnalysis()
  }, [refreshAnalysis])

  // Toggle handlers
  const toggleTreeView = () => setIsTreeCollapsed((prev) => !prev)

  return {
    layoutDirection,
    setLayoutDirection,
    isLayoutTransitioning,
    treeRef,
    selectedFileId,
    hoveredFile,
    searchQuery,
    setSearchQuery,
    analysisData,
    analysisLoadedAt,
    isLoading,
    loadError,
    refreshAnalysis,
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
    handleShowArchitecture,
    handleSimulateDelete,
    getRiskProfileForFile,
    prefetchFile: prefetch
  }
}
