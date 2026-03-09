import { ReportDownloadButton } from '@/features/report/components/ReportDownloadButton'
import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw
} from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'

import type {
  ExplorerRuntimeMode,
  ExplorerViewMode
} from '@/shared/types/explorer'

interface TopBarProps {
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
}

export function TopBar({
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
  hasChanges = false,
  totalChanges = 0
}: TopBarProps) {
  const timestampLabel =
    runtimeMode === 'report' && analysisLoadedAt
      ? `Generated: ${new Date(analysisLoadedAt).toLocaleString(undefined, {
          dateStyle: 'long',
          timeStyle: 'short'
        })}`
      : runtimeMode === 'live' && analysisLoadedAt
        ? new Intl.DateTimeFormat(undefined, {
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(analysisLoadedAt))
        : null

  return (
    <header className='flex h-14 items-center justify-between border-b border-border bg-background px-4'>
      {/* Left: Toggle Sidebar + Brand */}
      <div className='flex items-center gap-3'>
        <SimpleTooltip
          content={isTreeCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          side='bottom'
          asChild
        >
          <Button
            variant='ghost'
            size='icon'
            onClick={onToggleTree}
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
          >
            {isTreeCollapsed ? (
              <PanelLeftOpen className='h-4 w-4' />
            ) : (
              <PanelLeftClose className='h-4 w-4' />
            )}
          </Button>
        </SimpleTooltip>

        <div className='flex items-center gap-2'>
          <h1 className='text-base font-semibold text-foreground'>
            Code Mapper
          </h1>
          {hasData && fileCount !== undefined && (
            <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              {fileCount} files
            </span>
          )}
        </div>
      </div>

      {/* Center: Mode Switch (Overview | Graph | Architecture) */}
      {hasData && (
        <div className='absolute left-1/2 -translate-x-1/2 transform'>
          <ToggleGroup
            type='single'
            value={viewMode}
            onValueChange={(value: string) => {
              if (value === 'overview') {
                onShowOverview()
              } else if (value === 'graph') {
                onShowGraph()
              } else if (value === 'architecture') {
                onShowArchitecture()
              } else if (value === 'setup-guide') {
                onShowSetupGuide()
              }
            }}
            size='sm'
          >
            <ToggleGroupItem value='overview' size='sm'>
              Overview
            </ToggleGroupItem>
            <ToggleGroupItem value='graph' size='sm'>
              Graph
            </ToggleGroupItem>
            <ToggleGroupItem value='architecture' size='sm'>
              Architecture
            </ToggleGroupItem>
            <ToggleGroupItem value='setup-guide' size='sm'>
              <span className='flex items-center gap-1.5'>
                Setup
                {hasUnresolvedImports && (
                  <AlertTriangle className='h-3 w-3 text-yellow-500' />
                )}
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Right: Actions */}
      <div className='flex items-center gap-2'>
        {loadError && runtimeMode === 'live' && (
          <SimpleTooltip content={loadError} side='bottom' asChild>
            <div className='flex h-8 w-8 items-center justify-center text-amber-500'>
              <AlertTriangle className='h-4 w-4' />
            </div>
          </SimpleTooltip>
        )}

        {hasData && runtimeMode === 'live' && <ReportDownloadButton />}

        {hasData && runtimeMode === 'live' && (
          <SimpleTooltip
            content={
              isLoading
                ? 'Loading...'
                : hasChanges
                  ? `${totalChanges} file${totalChanges !== 1 ? 's' : ''} changed - click to reload`
                  : 'Reload analysis'
            }
            side='bottom'
            asChild
          >
            <div className='relative'>
              <Button
                variant='ghost'
                size='icon'
                onClick={onRefresh}
                disabled={isLoading}
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
              >
                <RotateCcw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
              {hasChanges && totalChanges > 0 && (
                <span className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-medium text-white'>
                  {totalChanges > 9 ? '9+' : totalChanges}
                </span>
              )}
            </div>
          </SimpleTooltip>
        )}

        {/* Timestamp (subtle) */}
        {timestampLabel && (
          <span className='hidden text-xs text-muted-foreground lg:inline'>
            {timestampLabel}
          </span>
        )}
      </div>
    </header>
  )
}
