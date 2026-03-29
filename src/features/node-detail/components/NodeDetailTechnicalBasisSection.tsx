import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import { METRIC_LABELS } from '@/shared/lib/metric-copy'
import { formatRelativeChurn } from '@/shared/lib/utils'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { FileEvolutionMetrics } from '@/shared/types/analysis'

interface NodeDetailTechnicalBasisSectionProps {
  showArchitectureMetrics: boolean
  showEvolutionMetrics: boolean
  changeHistoryAvailable: boolean
  archMetrics: FileArchitectureMetrics | undefined
  fileEvolution: FileEvolutionMetrics | null
}

export function NodeDetailTechnicalBasisSection({
  showArchitectureMetrics,
  showEvolutionMetrics,
  changeHistoryAvailable,
  archMetrics,
  fileEvolution
}: NodeDetailTechnicalBasisSectionProps) {
  return (
    <DetailPanelDisclosure
      title={nodeDetailCopy.technicalBasis.title}
      summary={nodeDetailCopy.technicalBasis.summary}
    >
      {showArchitectureMetrics && archMetrics ? (
        <div className='space-y-3 pb-2'>
          <DetailPanelSectionHeading
            title={nodeDetailCopy.disclosure.architectureMetricsTitle}
          />
          <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
            <dt className='text-muted-foreground'>Dependents (Ca)</dt>
            <dd className='text-right font-medium text-foreground'>
              {archMetrics.ca}
            </dd>
            <dt className='text-muted-foreground'>Dependencies (Ce)</dt>
            <dd className='text-right font-medium text-foreground'>
              {archMetrics.ce}
            </dd>
            <dt className='text-muted-foreground'>Instability</dt>
            <dd className='text-right font-medium text-foreground'>
              {archMetrics.instability.toFixed(2)}
            </dd>
            <dt className='text-muted-foreground'>Cycle</dt>
            <dd className='text-right font-medium text-foreground'>
              {archMetrics.hasCycle ? 'Yes' : 'No'}
            </dd>
          </dl>
        </div>
      ) : null}

      {showEvolutionMetrics && !changeHistoryAvailable ? (
        <DetailPanelState
          title='Evolutionary metrics unavailable'
          description='Git history is unavailable for change activity and hotspot metrics in this file.'
        />
      ) : null}

      {showEvolutionMetrics && fileEvolution && changeHistoryAvailable ? (
        <div className='space-y-3 border-t border-border/50 pt-3'>
          <DetailPanelSectionHeading
            title={nodeDetailCopy.disclosure.evolutionaryMetricsTitle}
          />
          <dl className='grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm'>
            <dt className='text-muted-foreground'>
              {METRIC_LABELS.relativeChurn30d}
            </dt>
            <dd className='text-right font-medium text-foreground'>
              {formatRelativeChurn(fileEvolution.churn30d.relativeChurn)}
            </dd>
            <dt className='text-muted-foreground'>
              {METRIC_LABELS.relativeChurn90d}
            </dt>
            <dd className='text-right font-medium text-foreground'>
              {formatRelativeChurn(fileEvolution.churn90d.relativeChurn)}
            </dd>
            <dt className='text-muted-foreground'>
              {METRIC_LABELS.commits30d}
            </dt>
            <dd className='text-right font-medium text-foreground'>
              {fileEvolution.churn30d.commitCount}
            </dd>
            <dt className='flex items-center gap-2 text-muted-foreground'>
              {METRIC_LABELS.evolutionaryHotspotScore}
            </dt>
            <dd className='flex items-center justify-end gap-2 text-right font-medium text-status-warning-foreground'>
              {fileEvolution.hotspotScore.toFixed(2)}
              <HotspotStatusLabel
                status={fileEvolution.hotspotStatus}
                className='text-[10px] font-bold uppercase text-muted-foreground'
              />
            </dd>
          </dl>
        </div>
      ) : null}
    </DetailPanelDisclosure>
  )
}
