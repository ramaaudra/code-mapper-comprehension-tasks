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

interface HealthBreakdown {
  stabilityScore: number
  cycleCount: number
  orphanCount: number
}

interface CriticalInsight {
  type: 'success' | 'warning' | 'critical'
  message: string
}

interface ArchitectureHealthScoreProps {
  breakdown: HealthBreakdown
  totalFiles: number
  criticalInsights?: CriticalInsight[]
}

function calculateHealthScore(
  breakdown: HealthBreakdown,
  _totalFiles: number
): number {
  let score = 100

  // Stability penalty: -15 if avg instability > 0.6, -5 if 0.4-0.6
  if (breakdown.stabilityScore > 0.6) {
    score -= 15
  } else if (breakdown.stabilityScore > 0.4) {
    score -= 5
  }

  // Cycle penalty: -20 per cycle (max -40)
  score -= Math.min(breakdown.cycleCount * 20, 40)

  // Orphan penalty: -1 per 5 orphans (max -20)
  score -= Math.min(Math.floor(breakdown.orphanCount / 5), 20)

  return Math.max(0, score)
}

function getScoreLabel(score: number): string {
  if (score >= 90) {
    return 'Excellent'
  }
  if (score >= 75) {
    return 'Good'
  }
  if (score >= 60) {
    return 'Fair'
  }
  if (score >= 40) {
    return 'Needs Work'
  }
  return 'Critical'
}

export function ArchitectureHealthScore({
  breakdown,
  totalFiles,
  criticalInsights = []
}: ArchitectureHealthScoreProps) {
  const score = calculateHealthScore(breakdown, totalFiles)
  const label = getScoreLabel(score)

  const getStabilityLabel = (value: number) => {
    if (value <= 0.3) {
      return 'Stable'
    }
    if (value <= 0.5) {
      return 'Balanced'
    }
    if (value <= 0.7) {
      return 'Moderate'
    }
    return 'Unstable'
  }

  const getInsightIcon = (type: CriticalInsight['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
      case 'success':
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />
      default:
        return <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Architecture Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          {/* Circular Score - Larger focal point */}
          <div className="flex-shrink-0">
            <CircularProgress
              value={score}
              max={100}
              size={120}
              strokeWidth={10}
            >
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums">{score}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                  {label}
                </div>
              </div>
            </CircularProgress>
          </div>

          {/* Right side: Metrics Grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Left column: Core metrics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {breakdown.stabilityScore <= 0.5 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-sm">
                  <span className="text-muted-foreground">Stability:</span>{' '}
                  <span className="font-medium">
                    {getStabilityLabel(breakdown.stabilityScore)}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {breakdown.cycleCount === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  <span className="text-muted-foreground">Cycles:</span>{' '}
                  <span className="font-medium">{breakdown.cycleCount}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {breakdown.orphanCount <= 5 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Ghost className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  <span className="text-muted-foreground">Orphans:</span>{' '}
                  <span className="font-medium">{breakdown.orphanCount}</span>
                </span>
              </div>
            </div>

            {/* Right column: Critical insights */}
            {criticalInsights.length > 0 && (
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium cursor-help hover:text-foreground transition-colors inline-flex items-center gap-1">
                        Top Priority
                        <span className="text-[8px]">ⓘ</span>
                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs bg-popover border-border"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-popover-foreground">
                          Critical issues requiring immediate attention:
                        </p>
                        <ul className="text-xs text-popover-foreground space-y-0.5 list-disc list-inside">
                          <li>
                            <strong>Circular dependencies:</strong> Any cycles
                            detected in your codebase
                          </li>
                          <li>
                            <strong>
                              Unstable modules with many dependents:
                            </strong>{' '}
                            Modules with Instability {'>'} 0.7 AND ≥3 dependents
                          </li>
                          <li>
                            <strong>God objects:</strong> Files with 15+
                            dependencies
                          </li>
                        </ul>
                        <p className="text-xs text-popover-foreground/80 pt-1 border-t border-border">
                          These are calculated from your dependency graph
                          analysis.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {criticalInsights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/90">
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
