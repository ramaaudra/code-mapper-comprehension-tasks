/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, useCallback } from 'react'

import { FileAnalysisProvider } from '@/features/file-analysis'
import { GraphSkeleton } from '@/features/graph'
import { SimulationDialog } from '@/features/simulation'
import { useAppLogic } from '@/hooks/useAppLogic'
import {
  AppLayout,
  Sidebar,
  StatsBar,
  TopBar
} from '@/shared/components/layouts'
import { ThemeProvider } from '@/shared/components/providers/ThemeProvider'

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
  const {
    layoutDirection,
    setLayoutDirection,
    theme,
    toggleTheme,
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
    handleSimulateDelete,
    getRiskProfileForFile,
    isLayoutTransitioning
  } = useAppLogic()

  // Stable callbacks to prevent child re-renders
  const handleDetailClose = useCallback(() => {
    handleFileSelect(null)
  }, [handleFileSelect])

  const handleSimulationClose = useCallback(() => {
    closeSimulation()
    setSimulationResult(null)
  }, [closeSimulation, setSimulationResult])

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
                isLayoutTransitioning={isLayoutTransitioning}
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
                onClose={handleDetailClose}
                riskProfile={getRiskProfileForFile(selectedFileId)}
              />
            </Suspense>
          </div>
        )}
      </div>

      <SimulationDialog
        result={simulationResult}
        onClose={handleSimulationClose}
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
