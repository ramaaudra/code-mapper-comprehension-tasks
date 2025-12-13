/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, useCallback } from 'react'

import { FileAnalysisProvider } from '@/features/file-analysis'
import { GraphSkeleton } from '@/features/graph'
import { SimulationDialog } from '@/features/simulation'
import { useAppLogic } from '@/hooks/useAppLogic'
import {
  AppLayout,
  Sidebar,
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
        isTreeCollapsed={isTreeCollapsed}
        onToggleTree={toggleTreeView}
        fileCount={
          analysisData
            ? Object.keys(analysisData.dependencyMap).length
            : undefined
        }
        analysisLoadedAt={analysisLoadedAt}
      />

      <div className="flex h-[calc(100vh-56px)] overflow-hidden w-full">
        <Sidebar isCollapsed={isTreeCollapsed}>
          {analysisData && (
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
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
                <div className="w-24 h-24 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-primary/50 rounded-full" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Menunggu data analisis
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Jalankan perintah{' '}
                  <code className="px-1 py-0.5 bg-muted rounded">
                    code-mapper analyze &lt;path-proyek&gt;
                  </code>{' '}
                  di terminal Anda.
                </p>
              </div>
            </div>
          )}
        </div>

        {analysisData && viewMode === 'file' && selectedNode && (
          <div className="w-96 border-l border-border overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center bg-background">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
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
    <ThemeProvider>
      <FileAnalysisProvider>
        <AppContent />
      </FileAnalysisProvider>
    </ThemeProvider>
  )
}
