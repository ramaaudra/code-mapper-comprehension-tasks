import { useMemo, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Network } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { getBasename, getRelativePath } from '@/shared/lib/utils'

import { dashboardCopy } from '../content/dashboardCopy'
import {
  couplingBucketDefinitions,
  type CouplingBucket
} from '../lib/couplingBuckets'

interface CouplingDistributionProps {
  avgDependencies: number
  distribution: CouplingBucket[]
  mostCoupledFile?: { path: string; count: number }
  onNavigateToFile?: (file: string) => void
}

export function CouplingDistribution({
  avgDependencies,
  distribution,
  mostCoupledFile,
  onNavigateToFile
}: CouplingDistributionProps) {
  const [selectedBucketLabel, setSelectedBucketLabel] = useState<string | null>(
    null
  )

  const selectedBucket = useMemo(
    () =>
      selectedBucketLabel
        ? (distribution.find(
            (bucket) => bucket.label === selectedBucketLabel
          ) ?? null)
        : null,
    [distribution, selectedBucketLabel]
  )

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between gap-3'>
            <div className='space-y-1'>
              <CardTitle className='flex items-center gap-2 text-base font-medium'>
                <Network className='h-4 w-4' />
                {dashboardCopy.couplingSnapshot.title}
              </CardTitle>
              <CardDescription className='max-w-[34rem] leading-relaxed'>
                {dashboardCopy.couplingSnapshot.description}
              </CardDescription>
            </div>
            <InfoTooltip
              title='What is Coupling?'
              side='top'
              triggerLabel='Explain how coupling is grouped in this snapshot'
            >
              <div className='space-y-2'>
                <p className='text-xs text-popover-foreground'>
                  Coupling describes how strongly files or modules depend on one
                  another. This chart groups files by outgoing dependency count.
                </p>
                <div className='space-y-1 border-t border-border pt-1 text-xs'>
                  <p className='font-semibold text-popover-foreground'>
                    Coupling Levels:
                  </p>
                  <div className='space-y-0.5 text-popover-foreground/80'>
                    {couplingBucketDefinitions.map((bucket) => (
                      <p key={bucket.label}>
                        •{' '}
                        <span className={`font-medium ${bucket.textColor}`}>
                          {bucket.label}
                        </span>
                        : {bucket.range} dependencies — {bucket.descriptor}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </InfoTooltip>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='max-w-[36rem] text-sm leading-relaxed text-foreground'>
            <span className='text-muted-foreground'>
              {dashboardCopy.couplingSnapshot.averagePrefix}{' '}
            </span>
            <span className='font-semibold'>{avgDependencies.toFixed(2)}</span>
            <span className='text-muted-foreground'>
              {' '}
              {dashboardCopy.couplingSnapshot.averageSuffix}
            </span>{' '}
            {mostCoupledFile ? (
              <>
                <span className='text-muted-foreground'>
                  {dashboardCopy.couplingSnapshot.mostCoupledPrefix}{' '}
                </span>
                <span className='font-mono font-semibold'>
                  {getBasename(mostCoupledFile.path)}
                </span>
                <span className='text-muted-foreground'>
                  {' '}
                  (
                  {dashboardCopy.couplingSnapshot.mostCoupledValue(
                    mostCoupledFile.count
                  )}
                  ).
                </span>
              </>
            ) : null}
          </p>

          <div className='space-y-2.5'>
            {distribution.map((bucket) => (
              <button
                key={bucket.label}
                type='button'
                onClick={() => setSelectedBucketLabel(bucket.label)}
                className='w-full space-y-1 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                title={`${bucket.count} files with ${bucket.range} dependencies`}
              >
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>
                    {bucket.label} ({bucket.range})
                  </span>
                  <span>
                    {bucket.count} files ({bucket.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20'>
                  <div
                    className={`h-full transition-all ${bucket.color}`}
                    style={{ width: `${bucket.percentage}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          <p className='border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground'>
            {dashboardCopy.couplingSnapshot.bucketHelper}
          </p>

          <Dialog
            open={selectedBucket !== null}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedBucketLabel(null)
              }
            }}
          >
            <DialogContent className='max-h-[80vh] max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  {selectedBucket
                    ? dashboardCopy.couplingSnapshot.dialogTitle(
                        selectedBucket.label,
                        selectedBucket.count
                      )
                    : 'Coupling bucket'}
                </DialogTitle>
              </DialogHeader>
              {selectedBucket ? (
                <div className='space-y-3 overflow-y-auto pr-1'>
                  <p className='text-sm text-muted-foreground'>
                    {dashboardCopy.couplingSnapshot.dialogDescription(
                      selectedBucket.label,
                      selectedBucket.range
                    )}
                  </p>
                  <div className='space-y-2'>
                    {selectedBucket.files.map((file) => (
                      <button
                        key={file.path}
                        type='button'
                        onClick={() => {
                          onNavigateToFile?.(file.path)
                          setSelectedBucketLabel(null)
                        }}
                        className='w-full rounded-lg bg-muted/20 px-3 py-3 text-left transition hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                        title={file.path}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <span className='mb-1 block truncate font-mono text-sm font-medium'>
                              {getBasename(file.path)}
                            </span>
                            <span className='block break-all font-mono text-xs leading-tight text-foreground/70'>
                              {getRelativePath(file.path)}
                            </span>
                          </div>
                          <span className='shrink-0 rounded-full border border-border/70 px-2 py-0.5 text-xs text-muted-foreground'>
                            {file.count} outgoing
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
