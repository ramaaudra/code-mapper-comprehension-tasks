import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
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
import { getRelativePath } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { getPriorityDriverChipLabel } from '../content/priorityDriverCopy'
import { useCycleTriageItems } from '../hooks/useCycleTriageItems'
import { CycleGraph } from './CycleGraph'
import { CycleQueue } from './CycleQueue'

import type { CycleTriageItem, FixPriority } from '../types/cycle-triage'
import type { AnalysisData } from '@/shared/types/analysis'

interface CycleTriageWorkspaceProps {
  analysisData: AnalysisData | null
  selectedCycleId?: string | null
  onSelectedCycleIdChange?: (cycleId: string | null) => void
  onBack?: () => void
  onNavigateToFile?: (filePath: string) => void
}

const priorityToneClass: Record<FixPriority, string> = {
  high: 'border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-300',
  medium:
    'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300'
}

export function CycleTriageWorkspace({
  analysisData,
  selectedCycleId,
  onSelectedCycleIdChange,
  onBack,
  onNavigateToFile
}: CycleTriageWorkspaceProps) {
  const { items, hasMeasuredSignals } = useCycleTriageItems(analysisData)
  const highPriorityCount = items.filter(
    (item) => item.fixPriority === 'high'
  ).length

  useEffect(() => {
    if (!items.length) {
      if (selectedCycleId) {
        onSelectedCycleIdChange?.(null)
      }
      return
    }

    const selectedStillExists = selectedCycleId
      ? items.some((item) => item.id === selectedCycleId)
      : false

    if (!selectedStillExists) {
      onSelectedCycleIdChange?.(items[0]?.id ?? null)
    }
  }, [items, onSelectedCycleIdChange, selectedCycleId])

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
            <div className='space-y-1'>
              <h1 className='text-2xl font-semibold text-foreground'>
                {cycleTriageCopy.page.title}
              </h1>
              <p className='max-w-3xl text-sm text-muted-foreground'>
                {cycleTriageCopy.page.description}
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline' className='bg-background/80'>
                {items.length} cycles
              </Badge>
              <Badge
                variant='outline'
                className='border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300'
              >
                {highPriorityCount} high priority
              </Badge>
              <Badge variant='outline' className='bg-background/80'>
                {hasMeasuredSignals ? 'Signals ready' : 'Limited signals'}
              </Badge>
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
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>
                  {cycleTriageCopy.queue.title}
                </CardTitle>
                <CardDescription>
                  {cycleTriageCopy.queue.description}
                </CardDescription>
              </CardHeader>
              <CardContent className='flex min-h-0 flex-1 overflow-hidden pt-0'>
                <CycleQueue
                  items={items}
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
  onNavigateToFile?: (filePath: string) => void
}

function SelectedCyclePanel({
  item,
  onNavigateToFile
}: SelectedCyclePanelProps) {
  const [showNearbyDependents, setShowNearbyDependents] = useState(false)

  return (
    <>
      <Card className='overflow-hidden border-primary/20 bg-primary/5'>
        <CardHeader className='gap-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='space-y-1.5'>
              <CardTitle className='text-xl'>{item.title}</CardTitle>
              <CardDescription className='max-w-3xl text-sm text-muted-foreground'>
                {item.whatIsHappening}
              </CardDescription>
            </div>
            <Badge
              variant='outline'
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${priorityToneClass[item.fixPriority]}`}
            >
              Fix priority: {item.fixPriority}
            </Badge>
          </div>
          <div className='flex flex-wrap gap-2'>
            {item.priorityDrivers.map((driver) => (
              <Badge
                key={driver}
                variant='outline'
                className='bg-background/70'
              >
                {getPriorityDriverChipLabel(driver)}
              </Badge>
            ))}
            <Badge variant='outline' className='bg-background/70'>
              {item.uniqueFileCount} files
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className='gap-3 pb-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='space-y-1'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Network className='h-4 w-4' />
                {cycleTriageCopy.detail.cycleGraph}
              </CardTitle>
              <CardDescription>{item.whyItMatters}</CardDescription>
            </div>
            <Button
              variant={showNearbyDependents ? 'secondary' : 'outline'}
              size='sm'
              onClick={() => setShowNearbyDependents((current) => !current)}
            >
              {showNearbyDependents
                ? cycleTriageCopy.detail.hideNearby
                : cycleTriageCopy.detail.showNearby}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CycleGraph item={item} showNearbyDependents={showNearbyDependents} />
          {item.files.length > 2 ? (
            <details className='rounded-lg border border-border/60 bg-background/70 px-3 py-2'>
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

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='border-amber-500/20 bg-amber-500/5'>
          <CardHeader className='pb-3'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <CardTitle className='text-base'>
                {cycleTriageCopy.detail.suggestedInvestigation}
              </CardTitle>
              <Badge variant='outline' className='bg-background/80'>
                {cycleTriageCopy.detail.confidence}:{' '}
                {item.suggestedInvestigation.confidence}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 text-sm leading-relaxed'>
            <p className='font-medium text-foreground'>
              {item.suggestedInvestigation.summary}
            </p>
            {item.suggestedInvestigation.candidateEdge ? (
              <div className='rounded-lg border border-amber-500/20 bg-background/80 px-3 py-2 text-xs text-muted-foreground'>
                {cycleTriageCopy.detail.candidateEdge}:{' '}
                {getRelativePath(
                  item.suggestedInvestigation.candidateEdge.source
                )}{' '}
                -&gt;{' '}
                {getRelativePath(
                  item.suggestedInvestigation.candidateEdge.target
                )}
              </div>
            ) : null}
            <details className='text-xs text-muted-foreground'>
              <summary className='cursor-pointer font-medium text-foreground/80'>
                Why this suggestion?
              </summary>
              <p className='mt-2'>{item.suggestedInvestigation.detail}</p>
            </details>
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
      </div>
    </>
  )
}
