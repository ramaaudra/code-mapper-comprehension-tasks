import { Suspense, lazy, useEffect } from 'react'

import { DashboardSkeleton } from '@/features/dashboard'
import { ProjectDashboard } from '@/features/dashboard/components/ProjectDashboard'
import { FileTreeSkeleton } from '@/features/file-analysis'
import { MetricsGuidePage } from '@/features/metrics-guide'
import { useSimulation } from '@/features/simulation/hooks/useSimulation'
import { ExplorerRightPanels, ExplorerShell } from '@/shared/components/layouts'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'
import { lazyWithPreload } from '@/shared/lib/performance/lazy-with-preload'
import { scheduleIdleWork } from '@/shared/lib/performance/schedule-idle-work'
import { isMetricsGuideHash } from '@/shared/lib/utils'

import { useReportExplorer } from '../hooks/useReportExplorer'
import { useReportSimulation } from '../hooks/useReportSimulation'
import { ReportBootstrapState } from './ReportBootstrapState'

const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((module) => ({
    default: module.FileTreeView
  }))
)

const ArchitecturePage = lazyWithPreload(() =>
  import('@/features/architecture').then((module) => ({
    default: module.ArchitecturePage
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

const SetupGuidePage = lazy(() =>
  import('@/features/setup-guide').then((module) => ({
    default: module.SetupGuidePage
  }))
)

function renderEmptyState() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='text-center'>
        <h2 className='mb-2 text-xl font-semibold text-foreground'>
          No analysis data
        </h2>
        <p className='text-muted-foreground'>Report data not found</p>
      </div>
    </div>
  )
}

export function ReportShell() {
  const { result: simulationResult, reset: closeSimulation } = useSimulation()
  const { handleSimulateDelete } = useReportSimulation()
  const {
    analysisData,
    generatedAt,
    isLoading,
    loadError,
    reportBootstrap,
    graphElements,
    prefetchFile,
    explorer,
    ui
  } = useReportExplorer()

  const nodePanel = useResizablePanel()
  const modulePanel = useResizablePanel()

  useKeyboardShortcut({ key: 'f', meta: true, preventDefault: true }, () => {
    explorer.treeRef.current?.focusSearch()
  })

  useEffect(() => {
    if (
      analysisData &&
      explorer.viewMode !== 'metrics-guide' &&
      typeof window !== 'undefined' &&
      isMetricsGuideHash(window.location.hash)
    ) {
      explorer.handleShowMetricsGuide('overview')
    }
  }, [analysisData, explorer])

  useEffect(() => {
    if (!analysisData) {
      return
    }

    const preloadHeavyViews = () => {
      ArchitecturePage.preload()
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

  const main = !analysisData ? (
    reportBootstrap || isLoading ? (
      <ReportBootstrapState
        bootstrap={reportBootstrap ?? null}
        loadError={loadError}
      />
    ) : (
      renderEmptyState()
    )
  ) : explorer.viewMode === 'graph' ? (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className='h-full bg-background'>
        <DependencyGraph
          nodes={graphElements.nodes}
          edges={graphElements.edges}
          focusNodeId={graphElements.focusNodeId}
          hoveredFile={null}
          layoutDirection={ui.layoutDirection}
          onLayoutDirectionChange={ui.setLayoutDirection}
          onNodeClick={explorer.handleFileSelect}
          isLayoutTransitioning={ui.isLayoutTransitioning}
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
        hoveredFile={null}
        layoutDirection={ui.layoutDirection}
        onLayoutDirectionChange={ui.setLayoutDirection}
        viewMode={explorer.viewMode}
        selectedFileId={explorer.selectedFileId}
        onNavigateToFile={explorer.navigateToFile}
        onShowMetricsGuide={() => explorer.handleShowMetricsGuide('overview')}
        onShowCycleTriage={(cycleId) =>
          explorer.handleShowCycleTriage({
            cycleId,
            sourceView: 'overview'
          })
        }
        onShowSetupGuide={() => explorer.handleShowSetupGuide('overview')}
        onShowModuleGraph={explorer.handleShowModuleGraph}
        isLayoutTransitioning={ui.isLayoutTransitioning}
      />
    </Suspense>
  )

  return (
    <ExplorerShell
      runtimeMode='report'
      isLoading={isLoading}
      loadError={loadError}
      hasData={Boolean(analysisData || reportBootstrap)}
      onRefresh={() => {}}
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
      fileCount={
        analysisData ? explorer.fileCount : reportBootstrap?.summary.totalFiles
      }
      projectName={
        analysisData ? explorer.projectName : reportBootstrap?.projectName
      }
      rootPath={explorer.rootPath}
      analysisLoadedAt={generatedAt ?? reportBootstrap?.generatedAt ?? null}
      hasChanges={false}
      totalChanges={0}
      sidebar={
        analysisData?.fileTree ? (
          <Suspense fallback={<FileTreeSkeleton />}>
            <FileTreeView
              ref={ui.treeRef}
              data={analysisData.fileTree}
              onFileSelect={explorer.handleFileSelect}
              onSimulateDelete={handleSimulateDelete}
              onFileHover={prefetchFile}
            />
          </Suspense>
        ) : null
      }
      main={main}
      rightPanels={
        <ExplorerRightPanels
          analysisData={analysisData}
          selectedNode={explorer.selectedNode}
          viewMode={explorer.viewMode}
          graphViewMode={explorer.graphViewMode}
          nodePanel={{
            panelRef: nodePanel.panelRef,
            panelWidth: nodePanel.panelWidth,
            resizeHandleProps: nodePanel.resizeHandleProps,
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
            panelRef: modulePanel.panelRef,
            panelWidth: modulePanel.panelWidth,
            resizeHandleProps: modulePanel.resizeHandleProps,
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
            onClose={closeSimulation}
          />
        </Suspense>
      }
    />
  )
}
