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
  RefreshCw
} from '@/shared/components/ui/icons'

interface HealthBreakdown {
  stabilityScore: number
  cycleCount: number
  orphanCount: number
}

interface ArchitectureHealthScoreProps {
  breakdown: HealthBreakdown
  totalFiles: number
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
  totalFiles
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Architecture Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circular Score */}
          <CircularProgress value={score} max={100} size={100} strokeWidth={8}>
            <div className="text-center">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </CircularProgress>

          {/* Breakdown */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              {breakdown.stabilityScore <= 0.5 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm">
                Stability:{' '}
                <span className="font-medium">
                  {getStabilityLabel(breakdown.stabilityScore)}
                </span>
                <span className="text-muted-foreground ml-1">
                  (Avg I: {breakdown.stabilityScore.toFixed(2)})
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
                Cycles:{' '}
                <span className="font-medium">{breakdown.cycleCount}</span>
                {breakdown.cycleCount === 0 && (
                  <span className="text-green-600 ml-1">(Perfect)</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {breakdown.orphanCount <= 5 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Ghost className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                Orphans:{' '}
                <span className="font-medium">{breakdown.orphanCount}</span>
                <span className="text-muted-foreground ml-1">
                  ({breakdown.orphanCount <= 5 ? 'Low impact' : 'Review needed'}
                  )
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
