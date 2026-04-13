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
import { StatusAnnouncer } from '@/shared/components/ui/StatusAnnouncer'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'
import { shellCopy } from '@/shared/content/shellCopy'
import {
  cn,
  resolveTopBarActionGroups,
  resolveTopBarIconLabels,
  resolveTopBarLayoutClasses,
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
  const layoutClasses = resolveTopBarLayoutClasses()
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
  const primaryNavigationValue = activePrimaryViewMode ?? ''

  return (
    <header className={layoutClasses.header}>
      <StatusAnnouncer message={loadError} politeness='assertive' />
      <div className={layoutClasses.brandRow}>
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
            className='h-9 w-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground sm:h-10 sm:w-10'
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
        className={layoutClasses.navigation}
      >
        {hasData && actionGroups.showHelpGroup && (
          <ToggleGroup
            type='single'
            size='lg'
            value={primaryNavigationValue}
            className={layoutClasses.navigationGroup}
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
            <ToggleGroupItem
              value='overview'
              className={layoutClasses.navigationItem}
            >
              {shellCopy.navigation.overview}
            </ToggleGroupItem>
            <ToggleGroupItem
              value='graph'
              className={layoutClasses.navigationItem}
            >
              {shellCopy.navigation.graph}
            </ToggleGroupItem>
            <ToggleGroupItem
              value='architecture'
              className={layoutClasses.navigationItem}
            >
              {shellCopy.navigation.architecture}
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </nav>

      <div className={layoutClasses.actions}>
        {actionGroups.showHelpGroup && (
          <div
            role='group'
            aria-label={shellCopy.regions.help}
            className={layoutClasses.helpGroup}
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
                  'h-9 touch-manipulation gap-1.5 px-3 text-xs font-medium sm:h-10',
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
                  'h-9 touch-manipulation gap-1.5 px-3 text-xs font-medium sm:h-10',
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
            <span aria-hidden='true' className={layoutClasses.divider} />
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
                  'h-9 gap-1.5 border border-border/70 px-3 text-xs font-medium touch-manipulation text-muted-foreground hover:bg-muted hover:text-foreground sm:h-10'
              }}
            />
          </div>
        )}

        {actionGroups.showExportGroup && actionGroups.showOperationsGroup && (
          <span aria-hidden='true' className={layoutClasses.divider} />
        )}

        {actionGroups.showOperationsGroup && (
          <div
            role='group'
            aria-label={shellCopy.regions.operations}
            className='flex shrink-0 items-center gap-1'
          >
            {loadError && runtimeMode === 'live' && (
              <SimpleTooltip content={loadError} side='bottom' asChild>
                <button
                  type='button'
                  aria-label={loadError}
                  className='flex h-9 w-9 items-center justify-center rounded-md text-status-warning-solid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-10 sm:w-10'
                >
                  <AlertTriangle className='h-4 w-4' aria-hidden='true' />
                </button>
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
                    className='h-9 w-9 touch-manipulation text-muted-foreground hover:text-foreground sm:h-10 sm:w-10'
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
