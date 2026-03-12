import { ReportDownloadButton } from '@/features/report/components/ReportDownloadButton'
import { Badge } from '@/shared/components/ui/badge'
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
import { shellCopy } from '@/shared/content/shellCopy'
import { cn } from '@/shared/lib/utils'

import type {
  ExplorerContextChip,
  ExplorerRuntimeMode,
  PrimaryExplorerViewMode,
  UtilityExplorerViewMode
} from '@/shared/types/explorer'

interface TopBarProps {
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
}

export function TopBar({
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
  hasChanges = false,
  totalChanges = 0
}: TopBarProps) {
  const timestampLabel =
    runtimeMode === 'report' && analysisLoadedAt
      ? `${shellCopy.timestamps.generatedPrefix} ${new Date(
          analysisLoadedAt
        ).toLocaleString(undefined, {
          dateStyle: 'long',
          timeStyle: 'short'
        })}`
      : null

  const contextChipClassName =
    contextChip?.tone === 'warning'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
      : 'border-border/70 bg-muted/60 text-muted-foreground'

  return (
    <header className='grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-border bg-background px-3 sm:px-4'>
      <div className='flex min-w-0 items-center gap-3'>
        <SimpleTooltip
          content={
            isTreeCollapsed ? shellCopy.sidebar.show : shellCopy.sidebar.hide
          }
          side='bottom'
          asChild
        >
          <Button
            variant='ghost'
            size='icon'
            onClick={onToggleTree}
            className='h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground'
          >
            {isTreeCollapsed ? (
              <PanelLeftOpen className='h-4 w-4' />
            ) : (
              <PanelLeftClose className='h-4 w-4' />
            )}
          </Button>
        </SimpleTooltip>

        <div className='flex min-w-0 items-center gap-2'>
          <h1 className='truncate text-base font-semibold text-foreground'>
            {shellCopy.brand}
          </h1>
          {hasData && fileCount !== undefined && (
            <span className='hidden rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground xl:inline-flex'>
              {shellCopy.fileCount(fileCount)}
            </span>
          )}
        </div>
      </div>

      <div className='justify-self-center'>
        {hasData && (
          <ToggleGroup
            type='single'
            value={activePrimaryViewMode ?? undefined}
            onValueChange={(value: string) => {
              if (value === 'overview') {
                onShowOverview()
              } else if (value === 'graph') {
                onShowGraph()
              } else if (value === 'architecture') {
                onShowArchitecture()
              }
            }}
            size='sm'
          >
            <ToggleGroupItem value='overview' size='sm'>
              {shellCopy.navigation.overview}
            </ToggleGroupItem>
            <ToggleGroupItem value='graph' size='sm'>
              {shellCopy.navigation.graph}
            </ToggleGroupItem>
            <ToggleGroupItem value='architecture' size='sm'>
              {shellCopy.navigation.architecture}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      <div className='flex min-w-0 items-center justify-end gap-1.5'>
        {hasData && (
          <>
            <SimpleTooltip
              content={shellCopy.utilities.metricsGuide.tooltip}
              side='bottom'
              asChild
            >
              <Button
                variant={
                  activeUtilityViewMode === 'metrics-guide'
                    ? 'secondary'
                    : 'ghost'
                }
                size='sm'
                onClick={onShowMetricsGuide}
                className={cn(
                  'gap-2 px-2.5',
                  activeUtilityViewMode !== 'metrics-guide' &&
                    'text-muted-foreground hover:text-foreground'
                )}
              >
                {shellCopy.utilities.metricsGuide.label}
              </Button>
            </SimpleTooltip>

            <SimpleTooltip
              content={shellCopy.utilities.analysisSetup.tooltip}
              side='bottom'
              asChild
            >
              <Button
                variant={
                  activeUtilityViewMode === 'setup-guide'
                    ? 'secondary'
                    : 'ghost'
                }
                size='sm'
                onClick={onShowSetupGuide}
                className={cn(
                  'gap-2 px-2.5',
                  activeUtilityViewMode !== 'setup-guide' &&
                    'text-muted-foreground hover:text-foreground'
                )}
              >
                {shellCopy.utilities.analysisSetup.label}
                {hasUnresolvedImports && (
                  <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                )}
              </Button>
            </SimpleTooltip>

            {contextChip && (
              <Badge
                variant='outline'
                className={cn(
                  'hidden shrink-0 border text-[11px] lg:inline-flex',
                  contextChipClassName
                )}
              >
                {contextChip.label}
              </Badge>
            )}
          </>
        )}

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
                ? shellCopy.actions.loading
                : hasChanges
                  ? shellCopy.actions.reloadChanged(totalChanges)
                  : shellCopy.actions.reload
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
                  className={cn('h-4 w-4', isLoading && 'animate-spin')}
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

        {runtimeMode === 'report' && timestampLabel && (
          <span className='hidden shrink-0 text-xs text-muted-foreground xl:inline'>
            {timestampLabel}
          </span>
        )}
      </div>
    </header>
  )
}
