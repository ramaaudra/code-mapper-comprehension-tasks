import { Suspense, lazy, useEffect } from 'react'

import { ArchitecturePage } from '@/features/architecture/components/ArchitecturePage'
import { CycleTriageWorkspace } from '@/features/cycle-triage'
import { DashboardSkeleton } from '@/features/dashboard'
import { ProjectDashboard } from '@/features/dashboard/components/ProjectDashboard'
import { FileTreeSkeleton } from '@/features/file-analysis'
import { DependencyGraph } from '@/features/graph'
import { MetricsGuidePage } from '@/features/metrics-guide'
import { SimulationDialog } from '@/features/simulation'
import { useSimulation } from '@/features/simulation/hooks/useSimulation'
import { ExplorerRightPanels, ExplorerShell } from '@/shared/components/layouts'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'
import { isMetricsGuideHash } from '@/shared/lib/utils'

import { useReportExplorer } from '../hooks/useReportExplorer'
import { useReportSimulation } from '../hooks/useReportSimulation'

const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((module) => ({
    default: module.FileTreeView
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
  const { analysisData, generatedAt, graphElements, explorer, ui } =
    useReportExplorer()

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

  const main = !analysisData ? (
    renderEmptyState()
  ) : explorer.viewMode === 'graph' ? (
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
    <CycleTriageWorkspace
      analysisData={analysisData}
      selectedCycleId={explorer.selectedCycleId}
      onSelectedCycleIdChange={explorer.handleCycleSelection}
      showNearbyImports={explorer.showCycleNearbyImports}
      onShowNearbyImportsChange={explorer.handleCycleNearbyImportsChange}
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
        hoveredFile={null}
        layoutDirection={ui.layoutDirection}
        onLayoutDirectionChange={ui.setLayoutDirection}
        viewMode={explorer.viewMode}
        selectedFileId={explorer.selectedFileId}
        onNavigateToFile={explorer.navigateToFile}
        onShowArchitecture={explorer.handleShowArchitecture}
        onShowMetricsGuide={() => explorer.handleShowMetricsGuide('overview')}
        onShowCycleTriage={(cycleId) =>
          explorer.handleShowCycleTriage(cycleId, 'overview')
        }
        onShowModuleGraph={explorer.handleShowModuleGraph}
        isLayoutTransitioning={ui.isLayoutTransitioning}
      />
    </Suspense>
  )

  return (
    <ExplorerShell
      runtimeMode='report'
      isLoading={false}
      loadError={null}
      hasData={!!analysisData}
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
      fileCount={explorer.fileCount}
      analysisLoadedAt={generatedAt ?? null}
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
            onShowCycleTriage: (cycleId) =>
              explorer.handleShowCycleTriage(
                cycleId,
                explorer.viewMode === 'graph' ? 'graph' : 'overview'
              )
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
        <SimulationDialog result={simulationResult} onClose={closeSimulation} />
      }
    />
  )
}
