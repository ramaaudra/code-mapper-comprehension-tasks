import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { AlertTriangle } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import {
  RISK_THRESHOLDS,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

interface RiskModule {
  path: string
  instability: number
  fanIn: number
  riskScore: number
}

interface HighRiskModulesProps {
  modules: RiskModule[]
  onViewModule?: (modulePath: string) => void
  onViewArchitecture?: () => void
}

// Get color class from unified risk system
function getRiskScoreColor(score: number): string {
  return getRiskColorClass(getRiskLevel(score))
}

export function HighRiskModules({
  modules,
  onViewModule,
  onViewArchitecture
}: HighRiskModulesProps) {
  // Sort by risk score (Ca × I formula - Robert C. Martin's Risk Metric)
  const sortedModules = [...modules]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)

  // Normalize bar width against the highest risk score in the displayed list
  // This creates a relative scale where the top module = 100% width
  const maxRiskScore = Math.max(...sortedModules.map((m) => m.riskScore), 0.01)

  if (sortedModules.length === 0) {
    return (
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-base font-medium'>
            <AlertTriangle className='h-4 w-4' />
            Top Change-Risk Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-4 text-center text-muted-foreground'>
            <AlertTriangle className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>No module data available</p>
            <p className='mt-1 text-xs'>
              Run analysis to see change-risk hotspots
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base font-medium'>
            <AlertTriangle className='h-4 w-4 text-orange-500' />
            Top Change-Risk Modules
            <span className='text-xs font-normal text-muted-foreground'>
              ({sortedModules.length})
            </span>
          </CardTitle>
          <InfoTooltip title='What is Change Risk?' side='top'>
            <div className='space-y-2'>
              <p className='text-xs text-popover-foreground'>
                Change Risk is a derived architectural metric based on Robert C.
                Martin's dependency model. It estimates how widely a module
                change may propagate.
              </p>
              <div className='space-y-1 border-t border-border pt-1 text-xs'>
                <p className='text-popover-foreground'>
                  <strong>Formula:</strong> Change Risk = Ca × I
                </p>
                <p className='text-popover-foreground/80'>
                  • <strong>Ca:</strong> Number of incoming cross-module
                  dependencies
                  <br />• <strong>I:</strong> Instability, calculated as
                  Ce/(Ca+Ce)
                </p>
              </div>
              <div className='space-y-1 border-t border-border pt-1 text-xs'>
                <p className='font-semibold text-popover-foreground'>
                  Risk Zones:
                </p>
                <p className='text-popover-foreground/80'>
                  •{' '}
                  <span className='font-medium text-red-500'>
                    ≥{RISK_THRESHOLDS.CRITICAL}
                  </span>
                  : Critical — The "Zone of Pain"
                  <br />•{' '}
                  <span className='font-medium text-orange-500'>
                    {RISK_THRESHOLDS.HIGH} to &lt;{RISK_THRESHOLDS.CRITICAL}
                  </span>
                  : High change risk
                  <br />•{' '}
                  <span className='font-medium text-yellow-500'>
                    {RISK_THRESHOLDS.MEDIUM} to &lt;{RISK_THRESHOLDS.HIGH}
                  </span>
                  : Medium change risk
                  <br />•{' '}
                  <span className='font-medium text-green-500'>
                    &lt;{RISK_THRESHOLDS.MEDIUM}
                  </span>
                  : Low change risk
                </p>
              </div>
              <p className='pt-1 text-xs text-popover-foreground/80'>
                A high score means many dependents combined with a dependency
                structure that can spread change impact widely.
              </p>
            </div>
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Column Headers */}
        <div className='flex items-center gap-4 px-4 text-[10px] uppercase tracking-wider text-muted-foreground'>
          <div className='flex-1'>Change Risk</div>
          <div className='w-16 text-right'>I Value</div>
          <div className='w-20 text-right'>Dependents</div>
        </div>
        {sortedModules.map((module) => {
          const barWidth = (module.riskScore / maxRiskScore) * 100

          return (
            <button
              type='button'
              key={module.path}
              onClick={() => onViewModule?.(module.path)}
              className={cn(
                'w-full rounded-lg bg-muted/20 p-4 text-left',
                'hover:bg-muted/30 hover:ring-2 hover:ring-[hsl(var(--primary))]/50',
                'cursor-pointer transition-all'
              )}
            >
              <div className='mb-3'>
                <span
                  className='block truncate font-mono text-sm'
                  title={module.path}
                >
                  {module.path}
                </span>
              </div>
              <div className='flex items-center gap-4'>
                <div
                  className='flex-1 cursor-help'
                  title={`Risk: ${module.riskScore.toFixed(1)} (Ca × I)`}
                >
                  <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20'>
                    <div
                      className={`h-full transition-all ${getRiskScoreColor(module.riskScore)}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className='flex shrink-0 items-center gap-4 text-xs'>
                  <span
                    className='w-16 cursor-help text-right tabular-nums text-muted-foreground transition-colors hover:text-foreground'
                    title={`Instability: ${module.instability.toFixed(2)}\n0.0 = Stable, 1.0 = Unstable`}
                  >
                    I: {module.instability.toFixed(2)}
                  </span>
                  <span className='w-20 text-right tabular-nums text-muted-foreground'>
                    {module.fanIn}
                  </span>
                </div>
              </div>
            </button>
          )
        })}

        {onViewArchitecture && (
          <button
            onClick={onViewArchitecture}
            className='w-full py-2 text-center text-xs text-primary hover:underline'
          >
            View all in Architecture tab →
          </button>
        )}
      </CardContent>
    </Card>
  )
}
