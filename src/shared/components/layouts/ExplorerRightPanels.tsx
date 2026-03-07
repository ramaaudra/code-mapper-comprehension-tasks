import { Suspense, lazy } from 'react'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import { ModuleSidePanel } from '@/features/graph/components/ModuleSidePanel'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'
import type { AnalysisData, AnalysisNode } from '@/shared/types/analysis'
import type { ExplorerViewMode } from '@/shared/types/explorer'

import { ResizeGrip } from './ResizeGrip'

const NodeDetailPanel = lazy(() =>
  import('@/features/node-detail').then((module) => ({
    default: module.NodeDetailPanel
  }))
)

type ResizeHandleProps = ReturnType<
  typeof useResizablePanel
>['resizeHandleProps']
type PanelRef = ReturnType<typeof useResizablePanel>['panelRef']

interface PanelControls {
  panelRef: PanelRef
  panelWidth: number
  resizeHandleProps: ResizeHandleProps
}

interface ExplorerRightPanelsProps {
  analysisData: AnalysisData | null
  selectedNode: AnalysisNode | null
  viewMode: ExplorerViewMode
  graphViewMode: 'file' | 'module'
  nodePanel: PanelControls & {
    onClose: () => void
  }
  modulePanel: PanelControls & {
    modulePath: string | null
    moduleData?: FolderArchitectureMetrics
    onClose: () => void
    onViewFile: (filePath: string) => void
  }
}

function LoadingPanelFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  )
}

export function ExplorerRightPanels({
  analysisData,
  selectedNode,
  viewMode,
  graphViewMode,
  nodePanel,
  modulePanel
}: ExplorerRightPanelsProps) {
  const showNodeDetailPanel =
    analysisData &&
    selectedNode &&
    (viewMode === 'overview' ||
      (viewMode === 'graph' && graphViewMode !== 'module'))

  const showModuleSidePanel =
    analysisData &&
    modulePanel.modulePath &&
    graphViewMode === 'module' &&
    viewMode === 'graph'

  return (
    <>
      {showNodeDetailPanel && (
        <div
          ref={nodePanel.panelRef}
          className="relative border-l border-border overflow-hidden flex-shrink-0"
          style={{ width: `${nodePanel.panelWidth}px` }}
        >
          <ResizeGrip resizeHandleProps={nodePanel.resizeHandleProps} />
          <Suspense fallback={<LoadingPanelFallback />}>
            <NodeDetailPanel
              node={selectedNode}
              data={analysisData}
              onClose={nodePanel.onClose}
            />
          </Suspense>
        </div>
      )}

      {showModuleSidePanel && modulePanel.modulePath && (
        <div
          ref={modulePanel.panelRef}
          className="relative border-l border-border overflow-hidden flex-shrink-0"
          style={{ width: `${modulePanel.panelWidth}px` }}
        >
          <ResizeGrip resizeHandleProps={modulePanel.resizeHandleProps} />
          <ModuleSidePanel
            modulePath={modulePanel.modulePath}
            moduleData={modulePanel.moduleData}
            onClose={modulePanel.onClose}
            onViewFile={modulePanel.onViewFile}
          />
        </div>
      )}
    </>
  )
}
