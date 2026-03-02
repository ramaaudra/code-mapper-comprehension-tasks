/* eslint-disable @typescript-eslint/no-explicit-any */
import { DotsThreeVertical } from '@phosphor-icons/react'
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

import { DashboardSkeleton } from '@/features/dashboard'
import {
  FileAnalysisProvider,
  FileTreeSkeleton
} from '@/features/file-analysis'
import { DependencyGraph } from '@/features/graph'
import { SimulationDialog } from '@/features/simulation'
import { useAppLogic } from '@/hooks/useAppLogic'
import { AppLayout, Sidebar, TopBar } from '@/shared/components/layouts'
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
const ArchitecturePage = lazy(() =>
  import('@/features/architecture').then((m) => ({
    default: m.ArchitecturePage
  }))
)
const SetupGuidePage = lazy(() =>
  import('@/features/setup-guide').then((m) => ({
    default: m.SetupGuidePage
  }))
)

function AppContent() {
  const {
    layoutDirection,
    setLayoutDirection,
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
    handleShowArchitecture,
    handleShowSetupGuide,
    handleSimulateDelete,
    isLayoutTransitioning
  } = useAppLogic()

  // Resizable panel state and refs
  const [panelWidth, setPanelWidth] = useState(448) // Default 448px (w-[28rem])
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Resize handlers
  const startResizing = useCallback(() => {
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && panelRef.current) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX
        // Constrain between 300px and 800px
        setPanelWidth(Math.max(300, Math.min(800, newWidth)))
      }
    },
    [isResizing]
  )

  // Mouse events effect for resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isResizing, resize, stopResizing])

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
        viewMode={viewMode}
        onShowOverview={handleShowOverview}
        onShowGraph={handleShowGraph}
        onShowArchitecture={handleShowArchitecture}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTree={toggleTreeView}
        onShowSetupGuide={handleShowSetupGuide}
        hasUnresolvedImports={
          (analysisData?.warnings?.unresolvedImports?.length ?? 0) > 0
        }
        fileCount={
          analysisData
            ? Object.keys(analysisData.dependencyMap).length
            : undefined
        }
        analysisLoadedAt={analysisLoadedAt}
        hasChanges={changesStatus?.hasChanges ?? false}
        totalChanges={changesStatus?.totalChanges ?? 0}
      />

      <div className="flex h-[calc(100vh-56px)] overflow-hidden w-full">
        <Sidebar isCollapsed={isTreeCollapsed}>
          {analysisData && (
            <Suspense fallback={<FileTreeSkeleton />}>
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
            viewMode === 'graph' ? (
              <div className="h-full bg-background">
                <DependencyGraph
                  nodes={graphElements.nodes}
                  edges={graphElements.edges}
                  focusNodeId={graphElements.focusNodeId}
                  hoveredFile={hoveredFile}
                  layoutDirection={layoutDirection}
                  onLayoutDirectionChange={setLayoutDirection}
                  onNodeClick={navigateToFile}
                  isLayoutTransitioning={isLayoutTransitioning}
                />
              </div>
            ) : viewMode === 'architecture' ? (
              <Suspense fallback={<DashboardSkeleton />}>
                <ArchitecturePage />
              </Suspense>
            ) : viewMode === 'setup-guide' ? (
              <Suspense fallback={<DashboardSkeleton />}>
                <SetupGuidePage
                  warnings={analysisData.warnings}
                  onBack={handleShowOverview}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<DashboardSkeleton />}>
                <ProjectDashboard
                  analysisData={analysisData}
                  dependencyGraph={graphElements}
                  hoveredFile={hoveredFile}
                  layoutDirection={layoutDirection}
                  onLayoutDirectionChange={setLayoutDirection}
                  viewMode={viewMode}
                  selectedFileId={selectedFileId}
                  onNavigateToFile={navigateToFile}
                  onShowArchitecture={handleShowArchitecture}
                  isLayoutTransitioning={isLayoutTransitioning}
                />
              </Suspense>
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-primary/50 rounded-full" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Waiting for analysis data
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Run the command{' '}
                  <code className="px-1 py-0.5 bg-muted rounded">
                    code-mapper analyze &lt;project-path&gt;
                  </code>{' '}
                  in your terminal.
                </p>
              </div>
            </div>
          )}
        </div>

        {analysisData &&
          selectedNode &&
          (viewMode === 'overview' || viewMode === 'graph') && (
            <div
              ref={panelRef}
              className="relative border-l border-border overflow-hidden flex-shrink-0"
              style={{ width: `${panelWidth}px` }}
            >
              {/* Drag handle */}
              <div
                onMouseDown={startResizing}
                className="absolute left-0 top-0 bottom-0 w-4 cursor-col-resize z-50 -ml-2 flex items-center justify-center group"
                title="Drag to resize"
              >
                {/* Visible grip indicator */}
                <div className="flex flex-col items-center justify-center py-2 rounded bg-border/50 group-hover:bg-primary/20 transition-colors">
                  <DotsThreeVertical
                    className="h-4 w-4 text-muted-foreground group-hover:text-primary"
                    weight="bold"
                  />
                </div>
                {/* Active resize line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary/0 group-hover:bg-primary/50 active:bg-primary transition-colors" />
              </div>
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
