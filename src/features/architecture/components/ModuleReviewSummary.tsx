import { Badge } from '@/shared/components/ui/badge'

import { architectureCopy } from '../content/architectureCopy'

import type { FolderArchitectureMetrics } from '../types/architecture'

interface ModuleReviewSummaryProps {
  folder: FolderArchitectureMetrics
  evolutionaryMetricsAvailable?: boolean
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

function getReviewFocusStory(folder: FolderArchitectureMetrics): string {
  if (folder.hasCycle) {
    return `This module is used by ${folder.ca} other modules and still contains cycle members. Start with the cycle files before broader refactors.`
  }

  if (folder.ca > 0) {
    return `This module is used by ${folder.ca} other modules, so changes here can spread review work. Start with the most depended-on files first.`
  }

  if (folder.ce > 0) {
    return `This module mostly depends on other modules. Start with the files that carry the most outgoing dependencies before refactoring.`
  }

  return 'This module looks structurally quieter. Review the highest-signal files first, then confirm the remaining files stay local.'
}

export function ModuleReviewSummary({
  folder,
  evolutionaryMetricsAvailable = true
}: ModuleReviewSummaryProps) {
  const changedFileCount30d = folder.evolution?.changedFileCount30d ?? 0

  return (
    <div className='space-y-3 rounded-xl border border-border/60 bg-background/70 p-4'>
      <div className='space-y-1'>
        <p className='text-xs font-medium tracking-label text-muted-foreground'>
          {architectureCopy.table.expanded.reviewFocusTitle}
        </p>
        <p className='text-sm leading-relaxed text-foreground'>
          {getReviewFocusStory(folder)}
        </p>
      </div>

      <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
        <Badge variant='outline' className='bg-background/60 font-medium'>
          {pluralize(folder.ca, 'external dependent', 'external dependents')}
        </Badge>
        <Badge variant='outline' className='bg-background/60 font-medium'>
          {pluralize(folder.ce, 'external import', 'external imports')}
        </Badge>
        <Badge variant='outline' className='bg-background/60 font-medium'>
          {pluralize(folder.fileCount, 'file', 'files')}
        </Badge>
        {folder.hasCycle ? (
          <Badge
            variant='outline'
            className='border-destructive/30 bg-destructive/5 text-destructive'
          >
            Cycle members present
          </Badge>
        ) : null}
        {evolutionaryMetricsAvailable && changedFileCount30d > 0 ? (
          <Badge variant='outline' className='bg-background/60 font-medium'>
            {pluralize(changedFileCount30d, 'changed file', 'changed files')} in
            30d
          </Badge>
        ) : null}
      </div>
    </div>
  )
}
