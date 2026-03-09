import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { CircularProgress } from '@/shared/components/ui/circular-progress'
import {
  AlertTriangle,
  CheckCircle,
  Ghost,
  Lightbulb,
  RefreshCw
} from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { RISK_THRESHOLDS } from '@/shared/lib/utils/risk'

interface HealthBreakdown {
  stabilityScore: number
  cycleCount: number
  orphanCount: number
}

interface RiskMetrics {
  criticalCount: number
  warningCount: number
  godObjectCount: number
}

interface CriticalInsight {
  type: 'success' | 'warning' | 'critical'
  message: string
}

interface ArchitectureHealthScoreProps {
  breakdown: HealthBreakdown
  riskMetrics: RiskMetrics
  criticalInsights?: CriticalInsight[]
}

interface ScoreBreakdown {
  pfatal: number
  prisk: number
  phygiene: number
  finalScore: number
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

const EMPTY_INSIGHTS: CriticalInsight[] = []

export function ArchitectureHealthScore({
  breakdown,
  riskMetrics,
  criticalInsights = EMPTY_INSIGHTS
}: ArchitectureHealthScoreProps) {
  const { pfatal, prisk, phygiene, finalScore } = calculateHealthScore(
    breakdown,
    riskMetrics
  )

  const getStructuralProfileLabel = (value: number) => {
    if (value <= 0.3) {
      return 'Rigid'
    }
    if (value <= 0.6) {
      return 'Balanced'
    }
    return 'Flexible'
  }

  const getInsightIcon = (type: CriticalInsight['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className='h-3.5 w-3.5 text-red-500' />
      case 'warning':
        return <AlertTriangle className='h-3.5 w-3.5 text-orange-500' />
      case 'success':
        return <CheckCircle className='h-3.5 w-3.5 text-green-500' />
      default:
        return <Lightbulb className='h-3.5 w-3.5 text-muted-foreground' />
    }
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-medium'>
          Architecture Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-8'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex-shrink-0 cursor-help'>
                  <CircularProgress
                    value={finalScore}
                    max={100}
                    size={120}
                    strokeWidth={10}
                  >
                    <div className='text-center'>
                      <div className='text-4xl font-bold tabular-nums'>
                        {finalScore}
                      </div>
                    </div>
                  </CircularProgress>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side='right'
                className='w-64 border-border bg-popover'
              >
                <div className='space-y-3 text-xs'>
                  <p className='border-b border-border pb-2 font-semibold text-popover-foreground'>
                    Score Breakdown
                  </p>
                  <div className='space-y-1.5'>
                    <div className='flex justify-between'>
                      <span className='text-popover-foreground'>Baseline:</span>
                      <span className='font-medium text-popover-foreground'>
                        100
                      </span>
                    </div>
                    {pfatal > 0 && (
                      <div className='flex justify-between text-red-500'>
                        <span className='text-popover-foreground'>
                          Circular Dependencies ({breakdown.cycleCount}× 15):
                        </span>
                        <span className='text-red-500'>-{pfatal}</span>
                      </div>
                    )}
                    {prisk > 0 && (
                      <div className='flex justify-between text-orange-500'>
                        <span className='text-popover-foreground'>
                          Change-Risk Modules ({riskMetrics.criticalCount}×5 +{' '}
                          {riskMetrics.warningCount}×2):
                        </span>
                        <span className='text-orange-500'>-{prisk}</span>
                      </div>
                    )}
                    {phygiene > 0 && (
                      <div className='flex justify-between text-yellow-500'>
                        <span className='text-popover-foreground'>
                          Code Hygiene (Orphans + Gods):
                        </span>
                        <span className='text-yellow-500'>-{phygiene}</span>
                      </div>
                    )}
                    <div className='mt-2 flex justify-between border-t border-border pt-2 font-semibold'>
                      <span className='text-popover-foreground'>
                        Final Score:
                      </span>
                      <span className='text-popover-foreground'>
                        {finalScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className='grid flex-1 grid-cols-2 gap-x-8 gap-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Lightbulb className='h-4 w-4 text-blue-500' />
                <span className='text-sm'>
                  <span className='text-muted-foreground'>
                    Structural Profile:
                  </span>{' '}
                  <span className='font-medium'>
                    {getStructuralProfileLabel(breakdown.stabilityScore)}
                  </span>
                </span>
              </div>

              <div className='flex items-center gap-2'>
                {breakdown.cycleCount === 0 ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <RefreshCw className='h-4 w-4 text-red-500' />
                )}
                <span className='text-sm'>
                  <span className='text-muted-foreground'>Cycles:</span>{' '}
                  <span className='font-medium'>{breakdown.cycleCount}</span>
                </span>
              </div>

              <div className='flex items-center gap-2'>
                {riskMetrics.criticalCount === 0 ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <AlertTriangle className='h-4 w-4 text-red-500' />
                )}
                <span className='text-sm'>
                  <span className='text-muted-foreground'>Critical Risks:</span>{' '}
                  <span className='font-medium'>
                    {riskMetrics.criticalCount}
                  </span>
                </span>
              </div>

              <div className='flex items-center gap-2'>
                {breakdown.orphanCount <= 5 ? (
                  <CheckCircle className='h-4 w-4 text-green-500' />
                ) : (
                  <Ghost className='h-4 w-4 text-muted-foreground' />
                )}
                <span className='text-sm'>
                  <span className='text-muted-foreground'>Orphans:</span>{' '}
                  <span className='font-medium'>{breakdown.orphanCount}</span>
                </span>
              </div>
            </div>

            {criticalInsights.length > 0 && (
              <div className='space-y-2'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className='inline-flex cursor-help items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground'>
                        Top Priority
                        <span className='text-[8px]'>ⓘ</span>
                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side='top'
                      className='max-w-xs border-border bg-popover'
                    >
                      <div className='space-y-2'>
                        <p className='text-xs font-semibold text-popover-foreground'>
                          Critical issues requiring immediate attention:
                        </p>
                        <ul className='list-inside list-disc space-y-0.5 text-xs text-popover-foreground'>
                          <li>
                            <strong>Circular dependencies:</strong> Any cycles
                            detected in your codebase
                          </li>
                          <li>
                            <strong>High change-risk modules:</strong> Modules
                            with Ca × I ≥ {RISK_THRESHOLDS.HIGH}
                          </li>
                          <li>
                            <strong>God objects:</strong> Files with 15+
                            dependencies
                          </li>
                        </ul>
                        <p className='border-t border-border pt-1 text-xs text-popover-foreground/80'>
                          These are calculated from your dependency graph
                          analysis.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {criticalInsights.slice(0, 2).map((insight, index) => (
                  <div
                    key={`${insight.type}-${index}`}
                    className='flex items-start gap-2'
                  >
                    <div className='mt-0.5 shrink-0'>
                      {getInsightIcon(insight.type)}
                    </div>
                    <p className='text-xs leading-relaxed text-foreground/90'>
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
