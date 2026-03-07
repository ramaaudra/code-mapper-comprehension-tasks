import { Suspense, lazy, useCallback } from 'react'

import { DashboardSkeleton } from '@/features/dashboard'
import {
  FileAnalysisProvider,
  FileTreeSkeleton
} from '@/features/file-analysis'
import { DependencyGraph } from '@/features/graph'
import { SimulationDialog } from '@/features/simulation'
import { useAppLogic } from '@/hooks/useAppLogic'
import { ExplorerRightPanels, ExplorerShell } from '@/shared/components/layouts'
import { ThemeProvider } from '@/shared/components/providers/ThemeProvider'
import { useExplorerController } from '@/shared/hooks/useExplorerController'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'

const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((module) => ({
    default: module.FileTreeView
  }))
)

const ProjectDashboard = lazy(() =>
  import('@/features/dashboard').then((module) => ({
    default: module.ProjectDashboard
  }))
)

const ArchitecturePage = lazy(() =>
  import('@/features/architecture').then((module) => ({
    default: module.ArchitecturePage
  }))
)

const SetupGuidePage = lazy(() =>
  import('@/features/setup-guide').then((module) => ({
    default: module.SetupGuidePage
  }))
)

function AppContent() {
  const {
    layoutDirection,
    setLayoutDirection,
    treeRef,
    selectedFileId,
    setSelectedFileId,
    hoveredFile,
    analysisData,
    analysisLoadedAt,
    isLoading,
    loadError,
    refreshAnalysis,
    changesStatus,
    selectedNode,
    setSelectedNode,
    viewMode,
    setViewMode,
    isTreeCollapsed,
    setIsTreeCollapsed,
    graphElements,
    generateGraphForFile,
    clearGraph,
    simulationResult,
    closeSimulation,
    setSimulationResult,
    handleSimulateDelete,
    graphViewMode,
    setGraphViewMode,
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    clearFocusedModule,
    isLayoutTransitioning
  } = useAppLogic()

  useKeyboardShortcut({ key: 'f', meta: true, preventDefault: true }, () => {
    treeRef.current?.focusSearch()
  })

  const { panelWidth, panelRef, resizeHandleProps } = useResizablePanel()
  const {
    panelWidth: modulePanelWidth,
    panelRef: modulePanelRef,
    resizeHandleProps: moduleResizeHandleProps
  } = useResizablePanel()

  const explorer = useExplorerController({
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
  })

  const handleSimulationClose = useCallback(() => {
    closeSimulation()
    setSimulationResult(null)
  }, [closeSimulation, setSimulationResult])

  return (
    <ExplorerShell
      runtimeMode="live"
      isLoading={isLoading}
      loadError={loadError}
      hasData={!!analysisData}
      onRefresh={refreshAnalysis}
      viewMode={explorer.viewMode}
      onShowOverview={explorer.handleShowOverview}
      onShowGraph={explorer.handleShowGraph}
      onShowArchitecture={explorer.handleShowArchitecture}
      isTreeCollapsed={explorer.isTreeCollapsed}
      onToggleTree={explorer.toggleTreeView}
      onShowSetupGuide={explorer.handleShowSetupGuide}
      hasUnresolvedImports={explorer.hasUnresolvedImports}
      fileCount={explorer.fileCount}
      analysisLoadedAt={analysisLoadedAt}
      hasChanges={changesStatus?.hasChanges ?? false}
      totalChanges={changesStatus?.totalChanges ?? 0}
      sidebar={
        analysisData ? (
          <Suspense fallback={<FileTreeSkeleton />}>
            <FileTreeView
              ref={explorer.treeRef}
              data={analysisData.fileTree}
              onFileSelect={explorer.handleFileSelect}
              onSimulateDelete={handleSimulateDelete}
            />
          </Suspense>
        ) : null
      }
      main={
        analysisData ? (
          explorer.viewMode === 'graph' ? (
            <div className="h-full bg-background">
              <DependencyGraph
                nodes={graphElements.nodes}
                edges={graphElements.edges}
                focusNodeId={graphElements.focusNodeId}
                hoveredFile={hoveredFile}
                layoutDirection={layoutDirection}
                onLayoutDirectionChange={setLayoutDirection}
                onNodeClick={(fileId) => explorer.navigateToFile(fileId)}
                isLayoutTransitioning={isLayoutTransitioning}
                initialViewMode={explorer.graphViewMode}
                highlightedModule={explorer.highlightedModule}
                initialFocusedModuleId={explorer.focusedModulePath}
                onViewModeChange={explorer.handleGraphViewModeChange}
                onModuleSelect={explorer.handleModuleSelect}
              />
            </div>
          ) : explorer.viewMode === 'architecture' ? (
            <Suspense fallback={<DashboardSkeleton />}>
              <ArchitecturePage />
            </Suspense>
          ) : explorer.viewMode === 'setup-guide' ? (
            <Suspense fallback={<DashboardSkeleton />}>
              <SetupGuidePage
                warnings={analysisData.warnings}
                onBack={explorer.handleShowOverview}
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
                viewMode={explorer.viewMode}
                selectedFileId={selectedFileId}
                onNavigateToFile={explorer.navigateToFile}
                onShowArchitecture={explorer.handleShowArchitecture}
                onShowModuleGraph={explorer.handleShowModuleGraph}
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
        )
      }
      rightPanels={
        <ExplorerRightPanels
          analysisData={analysisData}
          selectedNode={explorer.selectedNode}
          viewMode={explorer.viewMode}
          graphViewMode={explorer.graphViewMode}
          nodePanel={{
            panelRef,
            panelWidth,
            resizeHandleProps,
            onClose: explorer.handleDetailClose
          }}
          modulePanel={{
            panelRef: modulePanelRef,
            panelWidth: modulePanelWidth,
            resizeHandleProps: moduleResizeHandleProps,
            modulePath: explorer.selectedModuleForPanel,
            moduleData: explorer.selectedModuleData,
            onClose: explorer.handleModulePanelClose,
            onViewFile: explorer.handleModuleViewFile
          }}
        />
      }
      footerOverlay={
        <SimulationDialog
          result={simulationResult}
          onClose={handleSimulationClose}
        />
      }
    />
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
