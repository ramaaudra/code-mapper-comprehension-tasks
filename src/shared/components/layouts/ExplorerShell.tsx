import { AppLayout } from './AppLayout'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

import type {
  ExplorerContextChip,
  ExplorerRuntimeMode,
  PrimaryExplorerViewMode,
  UtilityExplorerViewMode
} from '@/shared/types/explorer'
import type { ReactNode } from 'react'

interface ExplorerShellProps {
  runtimeMode: ExplorerRuntimeMode
  isLoading: boolean
  loadError: string | null
  hasData: boolean
  onRefresh: () => void
  activePrimaryViewMode: PrimaryExplorerViewMode | null
  activeUtilityViewMode: UtilityExplorerViewMode | null
  contextChip: ExplorerContextChip | null
  onShowOverview: () => void
  onShowGraph: () => void
  onShowArchitecture: () => void
  onShowMetricsGuide: () => void
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
  activePrimaryViewMode,
  activeUtilityViewMode,
  contextChip,
  onShowOverview,
  onShowGraph,
  onShowArchitecture,
  onShowMetricsGuide,
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
        activePrimaryViewMode={activePrimaryViewMode}
        activeUtilityViewMode={activeUtilityViewMode}
        contextChip={contextChip}
        onShowOverview={onShowOverview}
        onShowGraph={onShowGraph}
        onShowArchitecture={onShowArchitecture}
        onShowMetricsGuide={onShowMetricsGuide}
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
        <main className='flex-1 overflow-hidden' aria-label='Primary content'>
          {main}
        </main>
        {rightPanels}
      </div>

      {footerOverlay}
    </AppLayout>
  )
}
