import { Suspense, lazy, useCallback, useEffect } from 'react'

import { DashboardSkeleton } from '@/features/dashboard'
import {
  FileAnalysisProvider,
  FileTreeSkeleton
} from '@/features/file-analysis'
import { useAppLogic } from '@/hooks/useAppLogic'
import { ExplorerRightPanels, ExplorerShell } from '@/shared/components/layouts'
import { ThemeProvider } from '@/shared/components/providers/ThemeProvider'
import { useExplorerController } from '@/shared/hooks/useExplorerController'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'
import { lazyWithPreload } from '@/shared/lib/performance/lazy-with-preload'
import { scheduleIdleWork } from '@/shared/lib/performance/schedule-idle-work'
import {
  isMetricsGuideHash,
  resolveAnalysisShellState
} from '@/shared/lib/utils'

const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((module) => ({
    default: module.FileTreeView
  }))
)

const DependencyGraph = lazyWithPreload(() =>
  import('@/features/graph').then((module) => ({
    default: module.DependencyGraph
  }))
)

const CycleTriageWorkspace = lazyWithPreload(() =>
  import('@/features/cycle-triage').then((module) => ({
    default: module.CycleTriageWorkspace
  }))
)

const SimulationDialog = lazyWithPreload(() =>
  import('@/features/simulation').then((module) => ({
    default: module.SimulationDialog
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
    cycleTriageFocusFilePath,
    setCycleTriageFocusFilePath,
    showCycleNearbyImports,
    setShowCycleNearbyImports,
    clearFocusedModule,
    resolveNodeByFile,
    prefetchFile,
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
    cycleTriageFocusFilePath,
    setCycleTriageFocusFilePath,
    showCycleNearbyImports,
    setShowCycleNearbyImports,
    resolveNodeByFile,
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

  useEffect(() => {
    if (!analysisData) {
      return
    }

    const preloadHeavyViews = () => {
      DependencyGraph.preload()
      CycleTriageWorkspace.preload()
      SimulationDialog.preload()
    }

    if (typeof window === 'undefined') {
      preloadHeavyViews()
      return
    }

    return scheduleIdleWork(preloadHeavyViews)
  }, [analysisData])

  const analysisShellState = resolveAnalysisShellState({
    hasAnalysisData: analysisData != null,
    isLoading
  })

  let sidebarContent = null

  if (analysisShellState === 'ready' && analysisData) {
    sidebarContent = (
      <Suspense fallback={<FileTreeSkeleton />}>
        <FileTreeView
          ref={explorer.treeRef}
          data={analysisData.fileTree}
          onFileSelect={explorer.handleFileSelect}
          onSimulateDelete={handleSimulateDelete}
          onFileHover={prefetchFile}
        />
      </Suspense>
    )
  } else if (analysisShellState === 'loading') {
    sidebarContent = <FileTreeSkeleton />
  }

  let mainContent = null

  if (analysisShellState === 'ready' && analysisData) {
    mainContent =
      explorer.viewMode === 'graph' ? (
        <Suspense fallback={<DashboardSkeleton />}>
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
        </Suspense>
      ) : explorer.viewMode === 'architecture' ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <ArchitecturePage
            onShowMetricsGuide={() =>
              explorer.handleShowMetricsGuide('architecture')
            }
            onNavigateToFile={(filePath) => explorer.navigateToFile(filePath)}
          />
        </Suspense>
      ) : explorer.viewMode === 'metrics-guide' ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <MetricsGuidePage onBack={explorer.handleBackFromUtility} />
        </Suspense>
      ) : explorer.viewMode === 'cycle-triage' ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <CycleTriageWorkspace
            analysisData={analysisData}
            selectedCycleId={explorer.selectedCycleId}
            onSelectedCycleIdChange={explorer.handleCycleSelection}
            focusFilePath={explorer.cycleTriageFocusFilePath}
            onFocusFilePathChange={explorer.handleCycleFocusFilePathChange}
            showNearbyImports={explorer.showCycleNearbyImports}
            onShowNearbyImportsChange={explorer.handleCycleNearbyImportsChange}
            onBack={explorer.handleBackFromUtility}
            onNavigateToFile={explorer.navigateToFile}
          />
        </Suspense>
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
              explorer.handleShowCycleTriage({
                cycleId,
                sourceView: 'overview'
              })
            }
            onShowSetupGuide={() => explorer.handleShowSetupGuide('overview')}
            onShowModuleGraph={explorer.handleShowModuleGraph}
            isLayoutTransitioning={isLayoutTransitioning}
          />
        </Suspense>
      )
  } else if (analysisShellState === 'loading') {
    mainContent = <DashboardSkeleton />
  } else {
    mainContent = (
      <div className='flex h-full items-center justify-center'>
        <div className='mx-auto max-w-lg space-y-5 px-6 text-center'>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-border/70 bg-muted/25'>
            <div className='h-10 w-10 rounded-xl border border-border/70 bg-muted/70' />
          </div>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold text-foreground'>
              Waiting for analysis data
            </h2>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Run the command{' '}
              <code className='rounded bg-muted px-1 py-0.5'>
                code-mapper analyze &lt;project-path&gt;
              </code>{' '}
              in your terminal to load the first project snapshot.
            </p>
          </div>
        </div>
      </div>
    )
  }

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
      projectName={explorer.projectName}
      rootPath={explorer.rootPath}
      analysisLoadedAt={analysisLoadedAt}
      hasChanges={changesStatus?.hasChanges ?? false}
      totalChanges={changesStatus?.totalChanges ?? 0}
      sidebar={sidebarContent}
      main={mainContent}
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
            onViewFile: explorer.navigateToFile,
            onShowCycleTriage: ({ cycleId, focusFilePath }) =>
              explorer.handleShowCycleTriage({
                cycleId,
                focusFilePath: focusFilePath ?? null,
                sourceView: explorer.viewMode === 'graph' ? 'graph' : 'overview'
              })
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
        <Suspense fallback={null}>
          <SimulationDialog
            result={simulationResult}
            onClose={handleSimulationClose}
          />
        </Suspense>
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
