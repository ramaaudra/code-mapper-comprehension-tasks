import { Suspense, lazy, useCallback, useEffect } from 'react'

import { CycleTriageWorkspace } from '@/features/cycle-triage'
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
import { isMetricsGuideHash } from '@/shared/lib/utils'

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

const MetricsGuidePage = lazy(() =>
  import('@/features/metrics-guide').then((module) => ({
    default: module.MetricsGuidePage
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
    utilityReturnViewMode,
    setUtilityReturnViewMode,
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    selectedCycleId,
    setSelectedCycleId,
    showCycleNearbyImports,
    setShowCycleNearbyImports,
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
    utilityReturnViewMode,
    setUtilityReturnViewMode,
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    selectedCycleId,
    setSelectedCycleId,
    showCycleNearbyImports,
    setShowCycleNearbyImports,
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

  useEffect(() => {
    if (
      analysisData &&
      viewMode !== 'metrics-guide' &&
      typeof window !== 'undefined' &&
      isMetricsGuideHash(window.location.hash)
    ) {
      explorer.handleShowMetricsGuide('overview')
    }
  }, [analysisData, explorer, viewMode])

  return (
    <ExplorerShell
      runtimeMode='live'
      isLoading={isLoading}
      loadError={loadError}
      hasData={!!analysisData}
      onRefresh={refreshAnalysis}
      activePrimaryViewMode={explorer.activePrimaryViewMode}
      activeUtilityViewMode={explorer.activeUtilityViewMode}
      contextChip={explorer.activeContextChip}
      onShowOverview={explorer.handleShowOverview}
      onShowGraph={explorer.handleShowGraph}
      onShowArchitecture={explorer.handleShowArchitecture}
      onShowMetricsGuide={explorer.handleShowMetricsGuide}
      isTreeCollapsed={
        explorer.viewMode === 'cycle-triage' ||
        explorer.viewMode === 'metrics-guide' ||
        explorer.isTreeCollapsed
      }
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
            <div className='h-full bg-background'>
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
              <ArchitecturePage
                onShowMetricsGuide={() =>
                  explorer.handleShowMetricsGuide('architecture')
                }
                onNavigateToFile={(filePath) =>
                  explorer.navigateToFile(filePath)
                }
              />
            </Suspense>
          ) : explorer.viewMode === 'metrics-guide' ? (
            <Suspense fallback={<DashboardSkeleton />}>
              <MetricsGuidePage onBack={explorer.handleBackFromUtility} />
            </Suspense>
          ) : explorer.viewMode === 'cycle-triage' ? (
            <CycleTriageWorkspace
              analysisData={analysisData}
              selectedCycleId={explorer.selectedCycleId}
              onSelectedCycleIdChange={explorer.handleCycleSelection}
              showNearbyImports={explorer.showCycleNearbyImports}
              onShowNearbyImportsChange={
                explorer.handleCycleNearbyImportsChange
              }
              onBack={explorer.handleBackFromUtility}
              onNavigateToFile={explorer.navigateToFile}
            />
          ) : explorer.viewMode === 'setup-guide' ? (
            <Suspense fallback={<DashboardSkeleton />}>
              <SetupGuidePage
                warnings={analysisData.warnings}
                onBack={explorer.handleBackFromUtility}
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
                onShowMetricsGuide={() =>
                  explorer.handleShowMetricsGuide('overview')
                }
                onShowCycleTriage={(cycleId) =>
                  explorer.handleShowCycleTriage(cycleId, 'overview')
                }
                onShowModuleGraph={explorer.handleShowModuleGraph}
                isLayoutTransitioning={isLayoutTransitioning}
              />
            </Suspense>
          )
        ) : (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/15'>
                <div className='h-12 w-12 rounded-full bg-primary/50' />
              </div>
              <h2 className='mb-2 text-xl font-semibold text-foreground'>
                Waiting for analysis data
              </h2>
              <p className='mx-auto max-w-md text-muted-foreground'>
                Run the command{' '}
                <code className='rounded bg-muted px-1 py-0.5'>
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
            onClose: explorer.handleDetailClose,
            onShowCycleTriage: (cycleId) =>
              explorer.handleShowCycleTriage(
                cycleId,
                explorer.viewMode === 'graph' ? 'graph' : 'overview'
              )
          }}
          modulePanel={{
            panelRef: modulePanelRef,
            panelWidth: modulePanelWidth,
            resizeHandleProps: moduleResizeHandleProps,
            modulePath: explorer.selectedModuleForPanel,
            moduleData: explorer.selectedModuleData,
            onClose: explorer.handleModulePanelClose,
            onViewFile: explorer.handleModuleViewFile,
            onViewModule: (modulePath) =>
              explorer.handleModuleSelect(modulePath)
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
