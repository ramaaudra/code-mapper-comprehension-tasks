import { useCallback, useEffect, useMemo } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Network
} from '@/shared/components/ui/icons'
import { ReviewPriorityBadge } from '@/shared/components/ui/review-priority-badge'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { getRelativePath } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { useCycleTriageItems } from '../hooks/useCycleTriageItems'
import { filterCycleTriageItemsByFocusFile } from '../lib/cycle-triage'
import {
  getCycleEvidenceItems,
  getCycleFixPriorityLabel,
  getLoopPathDefaultExpanded,
  getNearbyImportsToggleLabel
} from '../lib/cycle-triage-presentation'
import { CycleEvidenceList } from './CycleEvidenceList'
import { CycleGraph } from './CycleGraph'
import { CycleQueue } from './CycleQueue'

import type { CycleTriageItem } from '../types/cycle-triage'
import type { AnalysisData } from '@/shared/types/analysis'

interface CycleTriageWorkspaceProps {
  analysisData: AnalysisData | null
  selectedCycleId?: string | null
  onSelectedCycleIdChange?: (cycleId: string | null) => void
  focusFilePath?: string | null
  onFocusFilePathChange?: (filePath: string | null) => void
  showNearbyImports?: boolean
  onShowNearbyImportsChange?: (value: boolean) => void
  onBack?: () => void
  onNavigateToFile?: (filePath: string) => void
}

function getBasename(filePath: string): string {
  const relativePath = getRelativePath(filePath)
  return relativePath.split('/').pop() ?? relativePath
}

function getWorkspaceSummary(params: {
  focusFileLabel: string | null
  totalCount: number
  allItemCount: number
  highPriorityCount: number
}): string {
  const { focusFileLabel, totalCount, allItemCount, highPriorityCount } = params

  if (focusFileLabel) {
    return cycleTriageCopy.page.focusedSummary(
      totalCount,
      allItemCount,
      focusFileLabel
    )
  }

  if (highPriorityCount > 0) {
    return `Start with ${highPriorityCount} high-priority loops out of ${totalCount}.`
  }

  return `Review ${totalCount} detected loops. No high-priority blockers right now.`
}

export function CycleTriageWorkspace({
  analysisData,
  selectedCycleId,
  onSelectedCycleIdChange,
  focusFilePath,
  onFocusFilePathChange,
  showNearbyImports = false,
  onShowNearbyImportsChange,
  onBack,
  onNavigateToFile
}: CycleTriageWorkspaceProps) {
  const { items } = useCycleTriageItems(analysisData)
  const visibleItems = useMemo(
    () => filterCycleTriageItemsByFocusFile(items, focusFilePath ?? null),
    [focusFilePath, items]
  )
  const focusFileLabel = focusFilePath ? getRelativePath(focusFilePath) : null
  const activeSelectedCycleId = selectedCycleId ?? visibleItems[0]?.id ?? null
  const highPriorityCount = visibleItems.filter(
    (item) => item.fixPriority === 'high'
  ).length
  const totalCount = visibleItems.length
  const workspaceSummary = getWorkspaceSummary({
    focusFileLabel,
    totalCount,
    allItemCount: items.length,
    highPriorityCount
  })
  const queueKeyboardNavigationEnabled = visibleItems.length > 1

  const selectCycleByOffset = useCallback(
    (offset: number) => {
      const currentIndex = visibleItems.findIndex(
        (item) => item.id === activeSelectedCycleId
      )
      const fallbackIndex = currentIndex >= 0 ? currentIndex : 0
      const nextIndex = Math.max(
        0,
        Math.min(fallbackIndex + offset, visibleItems.length - 1)
      )

      onSelectedCycleIdChange?.(visibleItems[nextIndex]?.id ?? null)
    },
    [activeSelectedCycleId, onSelectedCycleIdChange, visibleItems]
  )

  useKeyboardShortcut(
    {
      key: 'ArrowDown',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    () => selectCycleByOffset(1)
  )
  useKeyboardShortcut(
    {
      key: 'ArrowUp',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    () => selectCycleByOffset(-1)
  )
  useKeyboardShortcut(
    {
      key: 'j',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    () => selectCycleByOffset(1)
  )
  useKeyboardShortcut(
    {
      key: 'k',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    () => selectCycleByOffset(-1)
  )

  useEffect(() => {
    if (!visibleItems.length) {
      if (selectedCycleId) {
        onSelectedCycleIdChange?.(null)
      }
      onShowNearbyImportsChange?.(false)
      return
    }

    const selectedStillExists = selectedCycleId
      ? visibleItems.some((item) => item.id === selectedCycleId)
      : false

    if (!selectedStillExists) {
      onSelectedCycleIdChange?.(visibleItems[0]?.id ?? null)
    }
  }, [
    visibleItems,
    onSelectedCycleIdChange,
    onShowNearbyImportsChange,
    selectedCycleId
  ])

  const selectedItem = useMemo(() => {
    if (!visibleItems.length) {
      return null
    }

    return (
      visibleItems.find((item) => item.id === selectedCycleId) ??
      visibleItems[0] ??
      null
    )
  }, [selectedCycleId, visibleItems])

  if (!analysisData) {
    return null
  }

  return (
    <div className='h-full overflow-y-auto bg-background'>
      <div className='mx-auto max-w-full space-y-6 px-6 py-6 pb-12 md:px-8 lg:px-12'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='space-y-3'>
            {onBack ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={onBack}
                className='h-8 gap-1 px-2 text-xs text-muted-foreground'
              >
                <ArrowLeft className='h-3.5 w-3.5' />
                {cycleTriageCopy.page.backToOverview}
              </Button>
            ) : null}
            <div className='space-y-3'>
              <h1 className='font-sans text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-foreground'>
                {cycleTriageCopy.page.title}
              </h1>
              {focusFileLabel ? (
                <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3'>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                      {cycleTriageCopy.page.focusedFileLabel}
                    </p>
                    <p className='font-mono text-sm font-medium text-foreground'>
                      {focusFileLabel}
                    </p>
                    <p className='text-xs leading-5 text-muted-foreground'>
                      {cycleTriageCopy.page.focusedFileHint}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 px-3 text-xs'
                    onClick={() => onFocusFilePathChange?.(null)}
                  >
                    {cycleTriageCopy.page.clearFocusedFile}
                  </Button>
                </div>
              ) : null}
              <div className='max-w-2xl rounded-2xl border border-border/70 bg-muted/20 px-4 py-3'>
                <p className='max-w-[48ch] text-base font-medium leading-7 text-foreground'>
                  {workspaceSummary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!items.length ? (
          <Card className='border-emerald-500/20 bg-emerald-500/5'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <CheckCircle className='h-5 w-5 text-emerald-500' />
                {cycleTriageCopy.detail.noCycles}
              </CardTitle>
            </CardHeader>
          </Card>
        ) : !visibleItems.length && focusFileLabel ? (
          <Card className='border-border/70 bg-card/80'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <AlertTriangle className='h-5 w-5 text-status-warning-foreground' />
                {cycleTriageCopy.detail.noFocusedCyclesTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='max-w-[60ch] text-sm leading-6 text-muted-foreground'>
                {cycleTriageCopy.detail.noFocusedCyclesDescription(
                  focusFileLabel
                )}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onFocusFilePathChange?.(null)}
              >
                {cycleTriageCopy.page.clearFocusedFile}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]'>
            <Card className='flex min-h-0 flex-col overflow-hidden border-border/70 bg-card/80 xl:sticky xl:top-6 xl:h-[calc(100dvh-8rem)] xl:self-start'>
              <CardHeader className='pb-2'>
                <CardTitle className='font-sans text-lg tracking-[-0.01em]'>
                  {cycleTriageCopy.queue.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex min-h-0 flex-1 overflow-hidden pt-0'>
                <CycleQueue
                  items={visibleItems}
                  selectedCycleId={selectedItem?.id ?? null}
                  onSelect={(cycleId) => onSelectedCycleIdChange?.(cycleId)}
                />
              </CardContent>
            </Card>

            <div className='space-y-4'>
              {selectedItem ? (
                <SelectedCyclePanel
                  key={selectedItem.id}
                  item={selectedItem}
                  showNearbyImports={showNearbyImports}
                  onShowNearbyImportsChange={onShowNearbyImportsChange}
                  onNavigateToFile={onNavigateToFile}
                />
              ) : (
                <Card>
                  <CardContent className='py-12 text-center text-sm text-muted-foreground'>
                    {cycleTriageCopy.detail.selectPrompt}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface SelectedCyclePanelProps {
  item: CycleTriageItem
  showNearbyImports: boolean
  onShowNearbyImportsChange?: (value: boolean) => void
  onNavigateToFile?: (filePath: string) => void
}

function SelectedCyclePanel({
  item,
  showNearbyImports,
  onShowNearbyImportsChange,
  onNavigateToFile
}: SelectedCyclePanelProps) {
  const candidateEdge = item.suggestedInvestigation.candidateEdge
  const evidenceItems = getCycleEvidenceItems(item)
  const fixPriorityLabel = getCycleFixPriorityLabel(item.fixPriority)
  const toggleNearbyLabel = getNearbyImportsToggleLabel(
    item.nearbyFiles.length,
    showNearbyImports
  )
  const startHereSummary = candidateEdge
    ? `Break the loop at ${getBasename(candidateEdge.source)} -> ${getBasename(candidateEdge.target)} first.`
    : item.suggestedInvestigation.summary

  return (
    <>
      <Card className='border-border/70 bg-card/80 shadow-sm'>
        <CardContent className='space-y-5 px-5 py-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='min-w-0 space-y-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <ReviewPriorityBadge priority={fixPriorityLabel} />
              </div>
              <div className='space-y-2'>
                <p className='max-w-[30ch] font-sans text-[1.5rem] font-semibold leading-[1.28] tracking-[-0.02em] text-foreground'>
                  {startHereSummary}
                </p>
                <p className='font-mono text-sm font-medium leading-6 text-foreground'>
                  {item.title}
                </p>
                <p className='max-w-[60ch] text-sm leading-6 text-muted-foreground'>
                  {item.whatIsHappening}
                </p>
              </div>
              <CycleEvidenceList
                items={evidenceItems}
                className='text-[11px] tabular-nums'
              />
            </div>
          </div>
          {candidateEdge ? (
            <div className='rounded-lg border border-border/70 bg-background/70 px-3 py-2 font-mono text-sm leading-6 text-muted-foreground'>
              {getRelativePath(candidateEdge.source)} -&gt;{' '}
              {getRelativePath(candidateEdge.target)}
              {candidateEdge.line ? ` (line ${candidateEdge.line})` : ''}
              {candidateEdge.strength
                ? `, import strength ${candidateEdge.strength}`
                : ''}
            </div>
          ) : null}
          <div className='flex flex-wrap items-center gap-2'>
            {candidateEdge ? (
              <>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => onNavigateToFile?.(candidateEdge.source)}
                >
                  Open source file
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onNavigateToFile?.(candidateEdge.target)}
                >
                  Open target file
                </Button>
              </>
            ) : null}
          </div>
          <DetailPanelDisclosure
            title={cycleTriageCopy.detail.whySuggestion}
            summary={`${cycleTriageCopy.detail.confidence}: ${item.suggestedInvestigation.confidence}`}
            className='border-border/70 bg-background/40 shadow-none'
            contentClassName='space-y-0'
          >
            <p className='max-w-[64ch] text-sm leading-6 text-muted-foreground'>
              {item.suggestedInvestigation.detail}
            </p>
          </DetailPanelDisclosure>
        </CardContent>
      </Card>

      <Card className='border-border/70'>
        <CardHeader className='flex flex-row items-center justify-between gap-3 pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Network className='h-4 w-4' />
            {cycleTriageCopy.detail.cycleGraph}
          </CardTitle>
          <Button
            variant={showNearbyImports ? 'secondary' : 'ghost'}
            size='sm'
            onClick={() => onShowNearbyImportsChange?.(!showNearbyImports)}
            disabled={item.nearbyFiles.length === 0}
            className='h-8 px-2.5 text-xs'
          >
            {toggleNearbyLabel}
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CycleGraph
            item={item}
            showNearbyDependents={showNearbyImports}
            onNavigateToFile={onNavigateToFile}
          />
          {item.files.length > 2 ? (
            <DetailPanelDisclosure
              title={cycleTriageCopy.detail.loopPath}
              defaultOpen={getLoopPathDefaultExpanded(item.uniqueFileCount)}
              className='border-border/60 bg-background/70 shadow-none'
            >
              <div className='flex flex-wrap items-center gap-2 text-xs'>
                {item.cyclePath.map((filePath, index) => {
                  const nextFilePath = item.cyclePath[index + 1]
                  const stepKey = nextFilePath
                    ? `${filePath}->${nextFilePath}`
                    : `${filePath}::end`

                  return (
                    <div key={stepKey} className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => onNavigateToFile?.(filePath)}
                        className='rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 font-mono text-xs text-foreground transition hover:border-primary/35 hover:text-primary'
                      >
                        {getRelativePath(filePath)}
                      </button>
                      {nextFilePath ? (
                        <ArrowRight className='h-3 w-3 text-muted-foreground' />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </DetailPanelDisclosure>
          ) : null}
        </CardContent>
      </Card>

      <Card className='border-border/70'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
            {cycleTriageCopy.detail.verifyAfterFix}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2 text-sm leading-relaxed text-muted-foreground'>
            {item.verificationChecks.map((check) => (
              <li key={check} className='flex items-start gap-2'>
                <span className='mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/70' />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
