import { describeStructuralPositionStory } from '@/features/architecture/lib/structural-position-story'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { AlertTriangle, CheckCircle } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { TooltipProvider } from '@/shared/components/ui/tooltip'

import { dashboardCopy } from '../content/dashboardCopy'
import { getOverviewHealthStory } from '../lib/overview-health-story'

import type { OverviewHealthStory } from '../lib/overview-health-story'

export interface HealthBreakdown {
  stabilityScore: number
  cycleCount: number
  orphanCount: number
}

export interface RiskMetrics {
  criticalCount: number
  warningCount: number
  godObjectCount: number
}

interface ArchitectureHealthScoreProps {
  breakdown: HealthBreakdown
  riskMetrics: RiskMetrics
}

interface ScoreBreakdown {
  pfatal: number
  prisk: number
  phygiene: number
  finalScore: number
}

function getToneClassName(tone: OverviewHealthStory['tone']): string {
  switch (tone) {
    case 'critical':
      return 'border-status-critical-border bg-status-critical-surface text-status-critical-foreground'
    case 'warning':
      return 'border-status-warning-border bg-status-warning-surface text-status-warning-foreground'
    default:
      return 'border-status-success-border bg-status-success-surface text-status-success-foreground'
  }
}

function getToneIconClassName(tone: OverviewHealthStory['tone']): string {
  switch (tone) {
    case 'critical':
      return 'h-3.5 w-3.5 text-status-critical-foreground'
    case 'warning':
      return 'h-3.5 w-3.5 text-status-warning-foreground'
    default:
      return 'h-3.5 w-3.5 text-status-success-foreground'
  }
}

function calculateHealthScore(
  breakdown: HealthBreakdown,
  riskMetrics: RiskMetrics
): ScoreBreakdown {
  let score = 100

  const pfatal = Math.min(breakdown.cycleCount * 15, 60)
  score -= pfatal

  if (breakdown.cycleCount > 3) {
    score = Math.min(score, 50)
  }

  const prisk = riskMetrics.criticalCount * 5 + riskMetrics.warningCount * 2
  score -= prisk

  const phygiene =
    Math.floor(breakdown.orphanCount * 0.5) + riskMetrics.godObjectCount * 1
  score -= phygiene

  const finalScore = Math.max(0, Math.round(score))

  return {
    pfatal,
    prisk,
    phygiene,
    finalScore
  }
}

export function ArchitectureHealthScore({
  breakdown,
  riskMetrics
}: ArchitectureHealthScoreProps) {
  const { pfatal, prisk, phygiene, finalScore } = calculateHealthScore(
    breakdown,
    riskMetrics
  )
  const structuralProfile = describeStructuralPositionStory(
    breakdown.stabilityScore
  )
  const healthStory = getOverviewHealthStory({
    cycleCount: breakdown.cycleCount,
    criticalRiskCount: riskMetrics.criticalCount,
    warningRiskCount: riskMetrics.warningCount,
    orphanCount: breakdown.orphanCount,
    stabilityScore: breakdown.stabilityScore
  })
  const toneClassName = getToneClassName(healthStory.tone)
  const toneIconClassName = getToneIconClassName(healthStory.tone)
  const ToneIcon = healthStory.tone === 'healthy' ? CheckCircle : AlertTriangle

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1'>
            <CardTitle className='text-base font-medium text-muted-foreground'>
              {dashboardCopy.architectureHealth.title}
            </CardTitle>
            {dashboardCopy.architectureHealth.description ? (
              <CardDescription className='max-w-2xl leading-relaxed'>
                {dashboardCopy.architectureHealth.description}
              </CardDescription>
            ) : null}
          </div>
          <TooltipProvider>
            <InfoTooltip
              title={dashboardCopy.architectureHealth.scoreTooltip.title}
              side='left'
              align='end'
              triggerLabel='Explain how the change safety summary is scored'
            >
              <div className='space-y-3 text-xs'>
                <p className='leading-relaxed text-popover-foreground'>
                  {dashboardCopy.architectureHealth.scoreTooltip.description}
                </p>
                <div className='space-y-1.5 border-t border-border pt-2'>
                  <div className='flex justify-between gap-4'>
                    <span className='text-popover-foreground'>
                      {
                        dashboardCopy.architectureHealth.scoreTooltip
                          .baselineLabel
                      }
                    </span>
                    <span className='font-medium text-popover-foreground'>
                      100
                    </span>
                  </div>
                  {pfatal > 0 ? (
                    <div className='flex justify-between gap-4'>
                      <span className='text-popover-foreground'>
                        {dashboardCopy.architectureHealth.scoreTooltip.cyclesLabel(
                          breakdown.cycleCount
                        )}
                      </span>
                      <span className='text-status-critical-foreground'>
                        -{pfatal}
                      </span>
                    </div>
                  ) : null}
                  {prisk > 0 ? (
                    <div className='flex justify-between gap-4'>
                      <span className='text-popover-foreground'>
                        {
                          dashboardCopy.architectureHealth.scoreTooltip
                            .sharedRiskLabel
                        }
                      </span>
                      <span className='text-status-warning-foreground'>
                        -{prisk}
                      </span>
                    </div>
                  ) : null}
                  {phygiene > 0 ? (
                    <div className='flex justify-between gap-4'>
                      <span className='text-popover-foreground'>
                        {
                          dashboardCopy.architectureHealth.scoreTooltip
                            .cleanupLabel
                        }
                      </span>
                      <span className='text-status-caution-foreground'>
                        -{phygiene}
                      </span>
                    </div>
                  ) : null}
                  <div className='flex justify-between gap-4 border-t border-border pt-2 font-semibold'>
                    <span className='text-popover-foreground'>
                      {dashboardCopy.architectureHealth.scoreTooltip.finalLabel}
                    </span>
                    <span className='text-popover-foreground'>
                      {finalScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </InfoTooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-4 space-y-0'>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${toneClassName}`}
          >
            {healthStory.headline}
          </span>
        </div>

        <div className='flex flex-1 flex-col space-y-3'>
          <p className='max-w-2xl text-lg font-semibold leading-relaxed text-foreground'>
            {healthStory.summary}
          </p>
          <div className='space-y-2.5'>
            {healthStory.drivers.map((driver) => (
              <div key={driver} className='flex items-start gap-2.5'>
                <span className='mt-0.5 shrink-0'>
                  <ToneIcon className={toneIconClassName} />
                </span>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  {driver}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-auto flex items-center justify-between border-t border-border/70 pt-3'>
          <div className='flex items-center gap-2 text-sm leading-relaxed text-foreground/90'>
            <span className='text-xs font-medium uppercase tracking-tight text-muted-foreground'>
              {dashboardCopy.architectureHealth.reviewPostureLabel}
            </span>
            <span className='font-semibold text-foreground'>
              {structuralProfile.summaryLabel}
            </span>
          </div>
          <p className='text-xs font-medium text-muted-foreground'>
            {dashboardCopy.architectureHealth.reviewPostureDetail(finalScore)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
