import { Suspense, lazy } from 'react'

import { ArchitecturePage } from '@/features/architecture/components/ArchitecturePage'
import { DashboardSkeleton } from '@/features/dashboard'
import { ProjectDashboard } from '@/features/dashboard/components/ProjectDashboard'
import { FileTreeSkeleton } from '@/features/file-analysis'
import { DependencyGraph } from '@/features/graph'
import { SimulationDialog } from '@/features/simulation'
import { useSimulation } from '@/features/simulation/hooks/useSimulation'
import { ExplorerRightPanels, ExplorerShell } from '@/shared/components/layouts'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'

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
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No analysis data
        </h2>
        <p className="text-muted-foreground">Report data not found</p>
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

  const main = !analysisData ? (
    renderEmptyState()
  ) : explorer.viewMode === 'graph' ? (
    <div className="h-full bg-background">
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
        hoveredFile={null}
        layoutDirection={ui.layoutDirection}
        onLayoutDirectionChange={ui.setLayoutDirection}
        viewMode={explorer.viewMode}
        selectedFileId={explorer.selectedFileId}
        onNavigateToFile={explorer.navigateToFile}
        onShowArchitecture={explorer.handleShowArchitecture}
        onShowModuleGraph={explorer.handleShowModuleGraph}
        isLayoutTransitioning={ui.isLayoutTransitioning}
      />
    </Suspense>
  )

  return (
    <ExplorerShell
      runtimeMode="report"
      isLoading={false}
      loadError={null}
      hasData={!!analysisData}
      onRefresh={() => {}}
      viewMode={explorer.viewMode}
      onShowOverview={explorer.handleShowOverview}
      onShowGraph={explorer.handleShowGraph}
      onShowArchitecture={explorer.handleShowArchitecture}
      isTreeCollapsed={explorer.isTreeCollapsed}
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
            onClose: explorer.handleDetailClose
          }}
          modulePanel={{
            panelRef: modulePanel.panelRef,
            panelWidth: modulePanel.panelWidth,
            resizeHandleProps: modulePanel.resizeHandleProps,
            modulePath: explorer.selectedModuleForPanel,
            moduleData: explorer.selectedModuleData,
            onClose: explorer.handleModulePanelClose,
            onViewFile: explorer.handleModuleViewFile
          }}
        />
      }
      footerOverlay={
        <SimulationDialog result={simulationResult} onClose={closeSimulation} />
      }
    />
  )
}
