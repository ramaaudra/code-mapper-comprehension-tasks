import { Suspense, lazy } from 'react'

import { ModuleSidePanel } from '@/features/graph/components/ModuleSidePanel'

import { ResizeGrip } from './ResizeGrip'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { useResizablePanel } from '@/shared/hooks/useResizablePanel'
import type { AnalysisData, AnalysisNode } from '@/shared/types/analysis'
import type {
  CycleTriageNavigationRequest,
  ExplorerViewMode
} from '@/shared/types/explorer'

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
    onShowCycleTriage?: (request: CycleTriageNavigationRequest) => void
  }
  modulePanel: PanelControls & {
    modulePath: string | null
    moduleData?: FolderArchitectureMetrics
    onClose: () => void
    onViewFile: (filePath: string) => void
    onViewModule?: (modulePath: string) => void
  }
}

function LoadingPanelFallback() {
  return (
    <div className='flex h-full items-center justify-center bg-background'>
      <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
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
          className='relative min-w-0 flex-shrink-0 overflow-hidden border-l border-border'
          style={{
            width: `min(calc(100vw - 1rem), ${nodePanel.panelWidth}px)`
          }}
        >
          <ResizeGrip resizeHandleProps={nodePanel.resizeHandleProps} />
          <Suspense fallback={<LoadingPanelFallback />}>
            <NodeDetailPanel
              node={selectedNode}
              data={analysisData}
              onClose={nodePanel.onClose}
              onShowCycleTriage={nodePanel.onShowCycleTriage}
            />
          </Suspense>
        </div>
      )}

      {showModuleSidePanel && modulePanel.modulePath && (
        <div
          ref={modulePanel.panelRef}
          className='relative min-w-0 flex-shrink-0 overflow-hidden border-l border-border'
          style={{
            width: `min(calc(100vw - 1rem), ${modulePanel.panelWidth}px)`
          }}
        >
          <ResizeGrip resizeHandleProps={modulePanel.resizeHandleProps} />
          <ModuleSidePanel
            modulePath={modulePanel.modulePath}
            moduleData={modulePanel.moduleData}
            onClose={modulePanel.onClose}
            onViewFile={modulePanel.onViewFile}
            onViewModule={modulePanel.onViewModule}
          />
        </div>
      )}
    </>
  )
}
