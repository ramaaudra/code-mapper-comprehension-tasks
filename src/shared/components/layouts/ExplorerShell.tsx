import { AppLayout } from './AppLayout'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

import type {
  ExplorerRuntimeMode,
  ExplorerViewMode
} from '@/shared/types/explorer'
import type { ReactNode } from 'react'

interface ExplorerShellProps {
  runtimeMode: ExplorerRuntimeMode
  isLoading: boolean
  loadError: string | null
  hasData: boolean
  onRefresh: () => void
  viewMode: ExplorerViewMode
  onShowOverview: () => void
  onShowGraph: () => void
  onShowArchitecture: () => void
  isTreeCollapsed: boolean
  onToggleTree: () => void
  onShowSetupGuide: () => void
  hasUnresolvedImports: boolean
  fileCount?: number
  analysisLoadedAt?: number | string | null
  hasChanges?: boolean
  totalChanges?: number
  sidebar: ReactNode
  main: ReactNode
  rightPanels?: ReactNode
  footerOverlay?: ReactNode
}

export function ExplorerShell({
  runtimeMode,
  isLoading,
  loadError,
  hasData,
  onRefresh,
  viewMode,
  onShowOverview,
  onShowGraph,
  onShowArchitecture,
  isTreeCollapsed,
  onToggleTree,
  onShowSetupGuide,
  hasUnresolvedImports,
  fileCount,
  analysisLoadedAt,
  hasChanges,
  totalChanges,
  sidebar,
  main,
  rightPanels,
  footerOverlay
}: ExplorerShellProps) {
  return (
    <AppLayout>
      <TopBar
        runtimeMode={runtimeMode}
        isLoading={isLoading}
        loadError={loadError}
        hasData={hasData}
        onRefresh={onRefresh}
        viewMode={viewMode}
        onShowOverview={onShowOverview}
        onShowGraph={onShowGraph}
        onShowArchitecture={onShowArchitecture}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTree={onToggleTree}
        onShowSetupGuide={onShowSetupGuide}
        hasUnresolvedImports={hasUnresolvedImports}
        fileCount={fileCount}
        analysisLoadedAt={analysisLoadedAt}
        hasChanges={hasChanges}
        totalChanges={totalChanges}
      />

      <div className='flex h-[calc(100vh-56px)] w-full overflow-hidden'>
        <Sidebar isCollapsed={isTreeCollapsed}>{sidebar}</Sidebar>
        <div className='flex-1 overflow-hidden'>{main}</div>
        {rightPanels}
      </div>

      {footerOverlay}
    </AppLayout>
  )
}
