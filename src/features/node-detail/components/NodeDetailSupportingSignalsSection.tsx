import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import {
  AlertTriangle,
  CheckCircle,
  Cube,
  Ghost,
  Target
} from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'
import {
  getRiskBgOpacityClass,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

import type { NodeDetailSupportingSignal } from '../lib/supporting-signals'
import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'

interface NodeDetailSupportingSignalsSectionProps {
  signals: NodeDetailSupportingSignal[]
  archMetrics: FileArchitectureMetrics | undefined
}

const blastRadiusSignal = getReviewSignalDefinition('blastRadius')

export function NodeDetailSupportingSignalsSection({
  signals,
  archMetrics
}: NodeDetailSupportingSignalsSectionProps) {
  if (signals.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      <DetailPanelSectionHeading
        title={nodeDetailCopy.consequences.title}
        level='section'
      />
      <div className='flex flex-col gap-3 text-sm'>
        {signals.map((signal) => {
          if (signal.id === 'verification-scope' && signal.riskLevel) {
            return (
              <TooltipProvider delayDuration={200} key={signal.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex cursor-help items-start gap-2 rounded-md p-2 ${getRiskBgOpacityClass(signal.riskLevel, 10)}`}
                    >
                      <div className='mt-0.5 shrink-0'>
                        {signal.riskLevel === 'low' ? (
                          <CheckCircle className='h-4 w-4 text-status-success-foreground' />
                        ) : (
                          <AlertTriangle
                            className={`h-4 w-4 ${getRiskTextClass(signal.riskLevel)}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className='font-medium text-foreground'>
                          {signal.title}{' '}
                          {typeof signal.riskScore === 'number' ? (
                            <span className='ml-1 font-normal text-muted-foreground'>
                              (Score: {signal.riskScore.toFixed(1)})
                            </span>
                          ) : null}
                        </p>
                        <p className='mt-0.5 text-sm text-foreground/80'>
                          {signal.description}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side='top'
                    className='max-w-xs border-border bg-popover'
                  >
                    <div className='space-y-2'>
                      <p className='font-semibold text-popover-foreground'>
                        {nodeDetailCopy.blastRadius.tooltipTitle}:{' '}
                        {signal.riskScore?.toFixed(1)}
                      </p>
                      <p className='text-xs text-popover-foreground/80'>
                        {nodeDetailCopy.blastRadius.tooltipDescription}
                      </p>
                      <div className='border-t border-border pt-1 text-xs'>
                        <p className='text-popover-foreground/80'>
                          {nodeDetailCopy.blastRadius.tooltipInterpretation}
                        </p>
                      </div>
                      {archMetrics ? (
                        <div className='space-y-1 border-t border-border pt-1 text-xs'>
                          <p className='text-popover-foreground/80'>
                            • <strong>Dependents (Ca):</strong> {archMetrics.ca}
                          </p>
                          <p className='text-popover-foreground/80'>
                            • <strong>Dependencies (Ce):</strong>{' '}
                            {archMetrics.ce}
                          </p>
                          {typeof signal.riskScore === 'number' ? (
                            <p className='pt-1 text-popover-foreground/80'>
                              Score basis: {archMetrics.ca} + ({archMetrics.ce}{' '}
                              × 0.5) = {signal.riskScore.toFixed(1)}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      <div className='border-t border-border pt-1 text-xs'>
                        <p className='text-popover-foreground/80'>
                          {blastRadiusSignal.scientificStatusNote}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          const icon =
            signal.id === 'unreachable' ? (
              <Ghost className='h-4 w-4 text-status-warning-foreground' />
            ) : signal.id === 'god-object' ? (
              <Cube
                className='h-4 w-4 text-status-warning-foreground'
                weight='fill'
              />
            ) : (
              <Target
                className='h-4 w-4 text-status-warning-foreground'
                weight='fill'
              />
            )

          return (
            <div key={signal.id} className='flex items-start gap-2 py-1'>
              <div className='mt-0.5 shrink-0'>{icon}</div>
              <div>
                <p className='font-medium text-foreground'>{signal.title}</p>
                <p className='mt-0.5 text-sm text-foreground/80'>
                  {signal.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
