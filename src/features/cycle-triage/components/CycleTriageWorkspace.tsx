import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Network
} from '@/shared/components/ui/icons'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { getRelativePath } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { useCycleTriageItems } from '../hooks/useCycleTriageItems'
import { useCycleTriageReviewState } from '../hooks/useCycleTriageReviewState'
import {
  getCycleEvidenceItems,
  getCycleFixPriorityLabel,
  getCycleReviewStatusLabel,
  getCycleWorkspaceSummary,
  getLoopPathDefaultExpanded,
  getNearbyImportsToggleLabel
} from '../lib/cycle-triage-presentation'
import { CycleEvidenceList } from './CycleEvidenceList'
import { CycleGraph } from './CycleGraph'
import { CycleQueue } from './CycleQueue'

import type { CycleReviewStatus } from '../lib/cycle-triage-review-state'
import type { CycleTriageItem } from '../types/cycle-triage'
import type { AnalysisData } from '@/shared/types/analysis'

interface CycleTriageWorkspaceProps {
  analysisData: AnalysisData | null
  selectedCycleId?: string | null
  onSelectedCycleIdChange?: (cycleId: string | null) => void
  showNearbyImports?: boolean
  onShowNearbyImportsChange?: (value: boolean) => void
  onBack?: () => void
  onNavigateToFile?: (filePath: string) => void
}

function getBasename(filePath: string): string {
  const relativePath = getRelativePath(filePath)
  return relativePath.split('/').pop() ?? relativePath
}

export function CycleTriageWorkspace({
  analysisData,
  selectedCycleId,
  onSelectedCycleIdChange,
  showNearbyImports = false,
  onShowNearbyImportsChange,
  onBack,
  onNavigateToFile
}: CycleTriageWorkspaceProps) {
  const { items } = useCycleTriageItems(analysisData)
  const activeSelectedCycleId = selectedCycleId ?? items[0]?.id ?? null
  const {
    selectedCycleReviewStatus,
    progress,
    selectCycle,
    selectNextCycle,
    selectPreviousCycle,
    markSelectedCycleReviewed,
    markSelectedCycleUnreviewed
  } = useCycleTriageReviewState({
    items,
    selectedCycleId: activeSelectedCycleId,
    onSelectedCycleIdChange
  })
  const highPriorityCount = items.filter(
    (item) => item.fixPriority === 'high'
  ).length
  const workspaceSummary = getCycleWorkspaceSummary({
    totalCount: progress.totalCount,
    highPriorityCount,
    reviewedCount: progress.reviewedCount,
    reviewingCount: progress.reviewingCount
  })
  const queueKeyboardNavigationEnabled = items.length > 1

  useKeyboardShortcut(
    {
      key: 'ArrowDown',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    selectNextCycle
  )
  useKeyboardShortcut(
    {
      key: 'ArrowUp',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    selectPreviousCycle
  )
  useKeyboardShortcut(
    {
      key: 'j',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    selectNextCycle
  )
  useKeyboardShortcut(
    {
      key: 'k',
      preventDefault: true,
      enabled: queueKeyboardNavigationEnabled,
      ignoreEditableTargets: true
    },
    selectPreviousCycle
  )

  useEffect(() => {
    if (!items.length) {
      if (selectedCycleId) {
        onSelectedCycleIdChange?.(null)
      }
      onShowNearbyImportsChange?.(false)
      return
    }

    const selectedStillExists = selectedCycleId
      ? items.some((item) => item.id === selectedCycleId)
      : false

    if (!selectedStillExists) {
      onSelectedCycleIdChange?.(items[0]?.id ?? null)
    }
  }, [
    items,
    onSelectedCycleIdChange,
    onShowNearbyImportsChange,
    selectedCycleId
  ])

  const selectedItem = useMemo(() => {
    if (!items.length) {
      return null
    }

    return items.find((item) => item.id === selectedCycleId) ?? items[0] ?? null
  }, [items, selectedCycleId])

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
              <h1 className='font-mono text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-foreground'>
                {cycleTriageCopy.page.title}
              </h1>
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
        ) : (
          <div className='grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]'>
            <Card className='flex min-h-0 flex-col overflow-hidden xl:sticky xl:top-6 xl:h-[calc(100dvh-8rem)] xl:self-start'>
              <CardHeader className='pb-2'>
                <CardTitle className='font-mono text-lg tracking-[-0.01em]'>
                  {cycleTriageCopy.queue.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex min-h-0 flex-1 overflow-hidden pt-0'>
                <CycleQueue
                  items={items}
                  selectedCycleId={selectedItem?.id ?? null}
                  onSelect={selectCycle}
                />
              </CardContent>
            </Card>

            <div className='space-y-4'>
              {selectedItem ? (
                <SelectedCyclePanel
                  key={selectedItem.id}
                  item={selectedItem}
                  reviewStatus={selectedCycleReviewStatus}
                  showNearbyImports={showNearbyImports}
                  onShowNearbyImportsChange={onShowNearbyImportsChange}
                  onMarkReviewed={markSelectedCycleReviewed}
                  onMarkUnreviewed={markSelectedCycleUnreviewed}
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
  reviewStatus: CycleReviewStatus
  showNearbyImports: boolean
  onShowNearbyImportsChange?: (value: boolean) => void
  onMarkReviewed?: () => void
  onMarkUnreviewed?: () => void
  onNavigateToFile?: (filePath: string) => void
}

function SelectedCyclePanel({
  item,
  reviewStatus,
  showNearbyImports,
  onShowNearbyImportsChange,
  onMarkReviewed,
  onMarkUnreviewed,
  onNavigateToFile
}: SelectedCyclePanelProps) {
  const [isLoopPathExpanded, setIsLoopPathExpanded] = useState(() =>
    getLoopPathDefaultExpanded(item.uniqueFileCount)
  )
  const candidateEdge = item.suggestedInvestigation.candidateEdge
  const evidenceItems = getCycleEvidenceItems(item)
  const fixPriorityLabel = getCycleFixPriorityLabel(item.fixPriority)
  const toggleNearbyLabel = getNearbyImportsToggleLabel(
    item.nearbyFiles.length,
    showNearbyImports
  )
  const shouldShowReviewStatus = reviewStatus !== 'unreviewed'
  const startHereSummary = candidateEdge
    ? `Break the loop at ${getBasename(candidateEdge.source)} -> ${getBasename(candidateEdge.target)} first.`
    : item.suggestedInvestigation.summary

  return (
    <>
      <Card className='overflow-hidden border-amber-500/25 bg-amber-500/[0.04]'>
        <CardContent className='space-y-4 px-5 py-5'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='min-w-0 space-y-2'>
              <p className='text-[11px] font-medium uppercase tracking-[0.08em] text-amber-200/85'>
                {cycleTriageCopy.detail.startHere}
              </p>
              <p className='max-w-[30ch] font-mono text-[1.375rem] font-semibold leading-[1.35] tracking-[-0.02em] text-foreground'>
                {startHereSummary}
              </p>
            </div>
            <p className='text-[11px] tabular-nums text-muted-foreground'>
              {cycleTriageCopy.detail.confidence}:{' '}
              <span className='font-medium text-foreground'>
                {item.suggestedInvestigation.confidence}
              </span>
            </p>
          </div>
          {candidateEdge ? (
            <div className='rounded-lg border border-amber-500/20 bg-background/80 px-3 py-2 font-mono text-sm leading-6 text-muted-foreground'>
              {getRelativePath(candidateEdge.source)} -&gt;{' '}
              {getRelativePath(candidateEdge.target)}
              {candidateEdge.line ? ` (line ${candidateEdge.line})` : ''}
              {candidateEdge.strength
                ? `, import strength ${candidateEdge.strength}`
                : ''}
            </div>
          ) : null}
          {candidateEdge ? (
            <div className='flex flex-wrap gap-2'>
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
            </div>
          ) : null}
          <details className='text-sm leading-6 text-muted-foreground'>
            <summary className='cursor-pointer font-medium text-foreground/80'>
              {cycleTriageCopy.detail.whySuggestion}
            </summary>
            <p className='mt-2 max-w-[64ch]'>
              {item.suggestedInvestigation.detail}
            </p>
          </details>
        </CardContent>
      </Card>

      <div className='rounded-2xl border border-border/70 bg-card/70 px-5 py-4'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0 space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground'>
                {fixPriorityLabel}
              </span>
              {shouldShowReviewStatus ? (
                <p className='text-[11px] text-muted-foreground'>
                  {getCycleReviewStatusLabel(reviewStatus)}
                </p>
              ) : null}
            </div>
            <div className='space-y-2'>
              <CardTitle className='max-w-[34ch] font-mono text-[1.625rem] leading-[1.2] tracking-[-0.02em] text-foreground'>
                {item.title}
              </CardTitle>
              <CardDescription className='max-w-[62ch] text-sm leading-6 text-muted-foreground'>
                {item.whatIsHappening}
              </CardDescription>
            </div>
            <CycleEvidenceList
              items={evidenceItems}
              className='text-[11px] tabular-nums'
            />
          </div>
          {reviewStatus === 'reviewed' ? (
            <Button size='sm' variant='outline' onClick={onMarkUnreviewed}>
              {cycleTriageCopy.detail.markUnreviewed}
            </Button>
          ) : (
            <Button size='sm' variant='secondary' onClick={onMarkReviewed}>
              {cycleTriageCopy.detail.markReviewed}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className='gap-3 pb-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='space-y-1'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Network className='h-4 w-4' />
                {cycleTriageCopy.detail.cycleGraph}
              </CardTitle>
              <CardDescription className='max-w-[52ch] text-sm leading-6 text-muted-foreground'>
                {item.whyItMatters}
              </CardDescription>
            </div>
            <Button
              variant={showNearbyImports ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => onShowNearbyImportsChange?.(!showNearbyImports)}
              disabled={item.nearbyFiles.length === 0}
              className='h-8 px-2.5 text-xs'
            >
              {toggleNearbyLabel}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CycleGraph
            item={item}
            showNearbyDependents={showNearbyImports}
            onNavigateToFile={onNavigateToFile}
          />
          {item.files.length > 2 ? (
            <details
              open={isLoopPathExpanded}
              onToggle={(event) =>
                setIsLoopPathExpanded(event.currentTarget.open)
              }
              className='rounded-lg border border-border/60 bg-background/70 px-3 py-2'
            >
              <summary className='cursor-pointer text-xs font-medium text-foreground'>
                {cycleTriageCopy.detail.loopPath}
              </summary>
              <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
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
                        className='rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs text-foreground transition hover:border-primary/35 hover:text-primary'
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
            </details>
          ) : null}
        </CardContent>
      </Card>

      <Card>
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
