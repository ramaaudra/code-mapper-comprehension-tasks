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
import {
  cn,
  resolveTopBarActionGroups,
  resolveTopBarIconLabels,
  shouldShowTopBarContextChip
} from '@/shared/lib/utils'

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
  const actionGroups = resolveTopBarActionGroups({
    hasData,
    runtimeMode,
    loadError
  })
  const iconLabels = resolveTopBarIconLabels({
    isTreeCollapsed,
    isLoading,
    hasChanges,
    totalChanges
  })
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
      ? 'border-status-warning-border bg-status-warning-surface text-status-warning-foreground'
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
            aria-label={iconLabels.sidebarToggle}
            className='h-10 w-10 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground'
          >
            {isTreeCollapsed ? (
              <PanelLeftOpen className='h-4 w-4' aria-hidden='true' />
            ) : (
              <PanelLeftClose className='h-4 w-4' aria-hidden='true' />
            )}
          </Button>
        </SimpleTooltip>

        <div className='flex min-w-0 items-center gap-2'>
          <p className='truncate text-base font-semibold text-foreground'>
            {shellCopy.brand}
          </p>
          {hasData && fileCount !== undefined && (
            <span className='hidden rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground xl:inline-flex'>
              {shellCopy.fileCount(fileCount)}
            </span>
          )}
        </div>
      </div>

      <nav
        aria-label={shellCopy.regions.primaryNavigation}
        className='justify-self-center'
      >
        {hasData && actionGroups.showHelpGroup && (
          <ToggleGroup
            type='single'
            size='lg'
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
          >
            <ToggleGroupItem value='overview'>
              {shellCopy.navigation.overview}
            </ToggleGroupItem>
            <ToggleGroupItem value='graph'>
              {shellCopy.navigation.graph}
            </ToggleGroupItem>
            <ToggleGroupItem value='architecture'>
              {shellCopy.navigation.architecture}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </nav>

      <div className='flex min-w-0 items-center justify-end gap-2'>
        {actionGroups.showHelpGroup && (
          <div
            role='group'
            aria-label={shellCopy.regions.help}
            className='flex min-w-0 items-center gap-1'
          >
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
                  'h-10 touch-manipulation gap-1.5 px-3 text-xs font-medium',
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
                  'h-10 touch-manipulation gap-1.5 px-3 text-xs font-medium',
                  activeUtilityViewMode !== 'setup-guide' &&
                    'text-muted-foreground hover:text-foreground'
                )}
              >
                {shellCopy.utilities.analysisSetup.label}
                {hasUnresolvedImports && (
                  <AlertTriangle
                    className='h-3.5 w-3.5 shrink-0 text-status-warning-foreground'
                    aria-hidden='true'
                  />
                )}
              </Button>
            </SimpleTooltip>

            {shouldShowTopBarContextChip(contextChip) && contextChip && (
              <Badge
                variant='outline'
                className={cn(
                  'hidden shrink-0 border text-xs lg:inline-flex',
                  contextChipClassName
                )}
              >
                {contextChip.label}
              </Badge>
            )}
          </div>
        )}

        {actionGroups.showHelpGroup &&
          (actionGroups.showExportGroup ||
            actionGroups.showOperationsGroup ||
            Boolean(timestampLabel)) && (
            <span
              aria-hidden='true'
              className='hidden h-5 w-px shrink-0 bg-border/70 lg:block'
            />
          )}

        {actionGroups.showExportGroup && (
          <div
            role='group'
            aria-label={shellCopy.regions.reportActions}
            className='flex shrink-0 items-center'
          >
            <ReportDownloadButton
              buttonProps={{
                variant: 'ghost',
                size: 'sm',
                className:
                  'h-10 gap-1.5 border border-border/70 px-3 text-xs font-medium touch-manipulation text-muted-foreground hover:bg-muted hover:text-foreground'
              }}
            />
          </div>
        )}

        {actionGroups.showExportGroup && actionGroups.showOperationsGroup && (
          <span
            aria-hidden='true'
            className='hidden h-5 w-px shrink-0 bg-border/70 lg:block'
          />
        )}

        {actionGroups.showOperationsGroup && (
          <div
            role='group'
            aria-label={shellCopy.regions.operations}
            className='flex shrink-0 items-center gap-1'
          >
            {loadError && runtimeMode === 'live' && (
              <SimpleTooltip content={loadError} side='bottom' asChild>
                <div className='flex h-10 w-10 items-center justify-center text-status-warning-solid'>
                  <AlertTriangle className='h-4 w-4' aria-hidden='true' />
                </div>
              </SimpleTooltip>
            )}

            {hasData && runtimeMode === 'live' && (
              <SimpleTooltip content={iconLabels.refresh} side='bottom' asChild>
                <div className='relative'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={onRefresh}
                    disabled={isLoading}
                    aria-label={iconLabels.refresh}
                    className='h-10 w-10 touch-manipulation text-muted-foreground hover:text-foreground'
                  >
                    <RotateCcw
                      className={cn('h-4 w-4', isLoading && 'animate-spin')}
                      aria-hidden='true'
                    />
                  </Button>
                  {hasChanges && totalChanges > 0 && (
                    <span className='absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-status-warning-border bg-status-warning-surface px-1 text-xs font-medium text-status-warning-foreground shadow-sm'>
                      {totalChanges > 9 ? '9+' : totalChanges}
                    </span>
                  )}
                </div>
              </SimpleTooltip>
            )}
          </div>
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
