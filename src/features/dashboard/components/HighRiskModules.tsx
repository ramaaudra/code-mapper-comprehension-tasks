import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { AlertTriangle } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { HEURISTIC_LABELS, METRIC_LABELS } from '@/shared/lib/metric-copy'
import { truncateMiddle } from '@/shared/lib/utils'
import {
  RISK_THRESHOLDS,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

import { dashboardCopy } from '../content/dashboardCopy'

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
  // Sort by derived propagation-risk heuristic (Ca × I)
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
            {dashboardCopy.highRiskModules.title}
          </CardTitle>
          <CardDescription>
            {dashboardCopy.highRiskModules.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='py-4 text-center text-muted-foreground'>
            <AlertTriangle className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>
              {dashboardCopy.highRiskModules.emptyTitle}
            </p>
            <p className='mt-1 text-xs'>
              {dashboardCopy.highRiskModules.emptyDescription}
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
          <div className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-base font-medium'>
              <AlertTriangle className='h-4 w-4 text-orange-500' />
              {dashboardCopy.highRiskModules.title}
              <span className='text-xs font-normal text-muted-foreground'>
                ({sortedModules.length})
              </span>
            </CardTitle>
            <CardDescription>
              {dashboardCopy.highRiskModules.description}
            </CardDescription>
          </div>
          <InfoTooltip
            title={dashboardCopy.highRiskModules.tooltip.title}
            side='top'
          >
            <div className='space-y-2'>
              <p className='text-xs text-popover-foreground'>
                {dashboardCopy.highRiskModules.tooltip.intro}
              </p>
              <div className='space-y-1 border-t border-border pt-1 text-xs'>
                <p className='text-popover-foreground'>
                  <strong>
                    {dashboardCopy.highRiskModules.tooltip.heuristicLabel}
                  </strong>{' '}
                  Propagation Risk = Ca × I
                </p>
                <p className='text-popover-foreground/80'>
                  • <strong>{METRIC_LABELS.dependentsCa}:</strong> Number of
                  incoming cross-module dependencies
                  <br />• <strong>I:</strong> Instability, calculated as
                  Ce/(Ca+Ce)
                </p>
              </div>
              <div className='space-y-1 border-t border-border pt-1 text-xs'>
                <p className='font-semibold text-popover-foreground'>
                  {dashboardCopy.highRiskModules.tooltip.thresholdsIntro}
                </p>
                <p className='text-popover-foreground/80'>
                  •{' '}
                  <span className='font-medium text-red-500'>
                    ≥{RISK_THRESHOLDS.CRITICAL}
                  </span>
                  : Critical — {HEURISTIC_LABELS.criticalPropagationRiskBand}
                  <br />•{' '}
                  <span className='font-medium text-orange-500'>
                    {RISK_THRESHOLDS.HIGH} to &lt;{RISK_THRESHOLDS.CRITICAL}
                  </span>
                  : High spread risk
                  <br />•{' '}
                  <span className='font-medium text-yellow-500'>
                    {RISK_THRESHOLDS.MEDIUM} to &lt;{RISK_THRESHOLDS.HIGH}
                  </span>
                  : Medium spread risk
                  <br />•{' '}
                  <span className='font-medium text-green-500'>
                    &lt;{RISK_THRESHOLDS.MEDIUM}
                  </span>
                  : Low spread risk
                </p>
              </div>
              <p className='border-t border-border pt-1 text-xs text-popover-foreground/80'>
                {dashboardCopy.highRiskModules.tooltip.thresholdsNote}
              </p>
              <p className='pt-1 text-xs text-popover-foreground/80'>
                {dashboardCopy.highRiskModules.tooltip.summary}
              </p>
            </div>
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Column Headers */}
        <div className='flex items-center gap-4 px-4 text-[10px] uppercase tracking-wider text-muted-foreground'>
          <div className='flex-1'>
            {dashboardCopy.highRiskModules.columns.spreadRisk}
          </div>
          <div className='w-16 text-right'>
            {dashboardCopy.highRiskModules.columns.spreadPotential}
          </div>
          <div className='w-20 text-right'>
            {dashboardCopy.highRiskModules.columns.sharedBy}
          </div>
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
                  {truncateMiddle(module.path, 48)}
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
                    title={dashboardCopy.highRiskModules.instabilityTitle(
                      module.instability.toFixed(2)
                    )}
                  >
                    {module.instability.toFixed(2)}
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
            {dashboardCopy.highRiskModules.footerCta}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
