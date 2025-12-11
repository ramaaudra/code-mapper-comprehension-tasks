/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { TreeApi } from 'react-arborist'

import {
  FileAnalysisProvider,
  useFileAnalysisContext
} from '@/features/file-analysis'
import { GraphSkeleton, useGraphGeneration } from '@/features/graph'
import { SimulationDialog, useSimulation } from '@/features/simulation'
import {
  AppLayout,
  Sidebar,
  StatsBar,
  TopBar
} from '@/shared/components/layouts'
import {
  ThemeProvider,
  useTheme
} from '@/shared/components/providers/ThemeProvider'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { matchesFile } from '@/shared/lib/utils'

// Lazy load heavy components from features
const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((m) => ({
    default: m.FileTreeView
  }))
)
const NodeDetailPanel = lazy(() =>
  import('@/features/node-detail').then((m) => ({
    default: m.NodeDetailPanel
  }))
)
const ProjectDashboard = lazy(() =>
  import('@/features/dashboard').then((m) => ({
    default: m.ProjectDashboard
  }))
)

function AppContent() {
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR')
  const { theme, setTheme } = useTheme()
  const treeRef = useRef<TreeApi<any> | null>(null)

  // Get context data
  const {
    selectedFileId,
    setSelectedFileId,
    hoveredFile,
    setHoveredFile,
    searchQuery,
    setSearchQuery,
    filesInCycle,
    highImpactFilesMap,
    orphanFilesSet,
    riskProfileMap,
    brokenFilesSet,
    newOrphansSet,
    setSimulationResult,
    getRiskProfileForFile,
    setIsSimulating
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
  const [viewMode, setViewMode] = useState<'overview' | 'file'>('overview')
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)

  // Graph generation hook
  const { graphElements, generateGraphForFile, clearGraph } =
    useGraphGeneration({
      analysisData,
      filesInCycle,
      highImpactFilesMap,
      orphanFilesSet,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet
    })

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

      setViewMode('file')
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

  // Regenerate graph when file changes
  useEffect(() => {
    if (selectedFileId) {
      generateGraphForFile(selectedFileId, analysisData)
    }
  }, [analysisData, generateGraphForFile, selectedFileId])

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
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  const toggleTreeView = () => setIsTreeCollapsed((prev) => !prev)

  return (
    <AppLayout>
      <TopBar
        isLoading={isLoading}
        loadError={loadError}
        hasData={!!analysisData}
        onRefresh={refreshAnalysis}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={setLayoutDirection}
        viewMode={viewMode}
        onShowOverview={handleShowOverview}
        theme={theme}
        onToggleTheme={toggleTheme}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTree={toggleTreeView}
      />

      {analysisData && (
        <StatsBar
          fileCount={Object.keys(analysisData.dependencyMap).length}
          selectedFileId={selectedFileId}
          selectedNodeId={selectedNode?.id}
          analysisLoadedAt={analysisLoadedAt}
        />
      )}

      <div className="flex h-[calc(100vh-140px)] overflow-hidden w-full">
        <Sidebar isCollapsed={isTreeCollapsed}>
          {analysisData && (
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                </div>
              }
            >
              <FileTreeView
                ref={treeRef}
                data={analysisData.fileTree}
                onFileSelect={handleFileSelect}
                onSimulateDelete={handleSimulateDelete}
              />
            </Suspense>
          )}
        </Sidebar>

        <div className="flex-1 overflow-hidden">
          {analysisData ? (
            <Suspense fallback={<GraphSkeleton />}>
              <ProjectDashboard
                analysisData={analysisData}
                dependencyGraph={graphElements}
                hoveredFile={hoveredFile}
                layoutDirection={layoutDirection}
                viewMode={viewMode}
                onNavigateToFile={navigateToFile}
              />
            </Suspense>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                  <div className="w-12 h-12 bg-white rounded-full opacity-90"></div>
                </div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Menunggu data analisis
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Jalankan perintah{' '}
                  <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">
                    code-mapper analyze &lt;path-proyek&gt;
                  </code>{' '}
                  di terminal Anda.
                </p>
              </div>
            </div>
          )}
        </div>

        {analysisData && viewMode === 'file' && selectedNode && (
          <div className="w-96 border-l border-slate-200 dark:border-slate-800 overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                </div>
              }
            >
              <NodeDetailPanel
                node={selectedNode}
                data={analysisData}
                onClose={() => handleFileSelect(null)}
                riskProfile={getRiskProfileForFile(selectedFileId)}
              />
            </Suspense>
          </div>
        )}
      </div>

      <SimulationDialog
        result={simulationResult}
        onClose={() => {
          closeSimulation()
          setSimulationResult(null)
        }}
      />
    </AppLayout>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="code-mapper-theme">
      <FileAnalysisProvider>
        <AppContent />
      </FileAnalysisProvider>
    </ThemeProvider>
  )
}
