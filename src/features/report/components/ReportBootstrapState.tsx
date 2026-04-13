import { StatusAnnouncer } from '@/shared/components/ui/StatusAnnouncer'

import type { ReportBootstrapData } from '@/shared/types/report-bootstrap'

interface ReportBootstrapStateProps {
  bootstrap: ReportBootstrapData | null
  loadError: string | null
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}

function LoadingStat({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm'>
      <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
        {label}
      </p>
      <p className='mt-2 text-2xl font-semibold text-foreground'>{value}</p>
    </div>
  )
}

export function ReportBootstrapState({
  bootstrap,
  loadError
}: ReportBootstrapStateProps) {
  const bootstrapAnnouncement = !bootstrap
    ? (loadError ??
      'Preparing report. Loading the interactive overview, graph, file explorer, and detail panels.')
    : loadError

  if (!bootstrap) {
    return (
      <div className='flex h-full items-center justify-center px-6'>
        <StatusAnnouncer
          message={bootstrapAnnouncement}
          politeness={loadError ? 'assertive' : 'polite'}
        />
        <div className='max-w-lg space-y-3 text-center'>
          <h2 className='text-xl font-semibold text-foreground'>
            Preparing report
          </h2>
          <p className='text-sm leading-relaxed text-muted-foreground'>
            {loadError ??
              'Loading the full interactive report. Summary content will appear first, then graph and file explorer details follow.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-full overflow-auto bg-background'>
      <StatusAnnouncer
        message={bootstrapAnnouncement}
        politeness={loadError ? 'assertive' : 'polite'}
      />
      <div className='mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8'>
        <section className='space-y-4'>
          <div className='space-y-2'>
            <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
              Report Overview
            </p>
            <h1 className='text-3xl font-semibold text-foreground'>
              {bootstrap.projectName}
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground'>
              Preparing the interactive explorer. Summary signals are ready now
              so you can orient yourself before the full graph, file tree, and
              detail panels finish loading.
            </p>
            <p className='text-xs text-muted-foreground'>
              Generated {formatTimestamp(bootstrap.generatedAt)}
            </p>
          </div>
        </section>

        <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <LoadingStat
            label='Files in Scope'
            value={bootstrap.summary.totalFiles}
          />
          <LoadingStat
            label='Dependency Links'
            value={bootstrap.summary.totalDependencies}
          />
          <LoadingStat
            label='Active Cycles'
            value={bootstrap.summary.cycleCount}
          />
          <LoadingStat
            label='Cleanup Candidates'
            value={bootstrap.summary.orphanCount}
          />
        </section>

        <section className='rounded-2xl border border-border/70 bg-card/80 px-5 py-4 shadow-sm'>
          <h2 className='text-sm font-semibold text-foreground'>
            What happens next
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
            The report is parsing the full analysis snapshot from the embedded
            payload. Once ready, the overview, graph, architecture table, and
            side panels will replace this loading state automatically.
          </p>
          {loadError ? (
            <div className='mt-3 rounded-lg border border-status-critical-border bg-status-critical-surface px-3 py-2 text-sm text-status-critical-foreground'>
              {loadError}
            </div>
          ) : (
            <div className='mt-4 h-2 overflow-hidden rounded-full bg-muted'>
              <div className='h-full w-1/2 animate-pulse rounded-full bg-primary/70' />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
