import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Ghost,
  Lightbulb,
  RefreshCw
} from '@/shared/components/ui/icons'
import {
  getHotspotStatusPriority,
  isActionableHotspotStatus
} from '@/shared/lib/metric-thresholds'
import { getRiskBgOpacityClass } from '@/shared/lib/utils/risk'

import { dashboardCopy } from '../content/dashboardCopy'

import type { HotspotStatus } from '@/shared/types/analysis'
import type { RiskLevel } from '@/shared/types/risk'

interface RiskItem {
  path: string
  riskScore: number
  instability: number
  fanIn: number
}

interface HotspotItem {
  modulePath: string
  relativeChurn30d: number
  hotspotScore: number
  hotspotPercentile: number
  hotspotStatus: HotspotStatus
}

interface GodObjectItem {
  path: string
  dependencyCount: number
}

interface ActionableInsightsProps {
  cycleCount: number
  orphanCount: number
  criticalRisks: RiskItem[]
  warningRisks: RiskItem[]
  godObjects: GodObjectItem[] // Files with >15 dependencies
  topHotspot?: HotspotItem | null
  onNavigateToFile?: (fileId: string) => void
  onViewModule?: (modulePath: string) => void
  onShowArchitecture?: () => void
  onShowCycleTriage?: (cycleId?: string) => void
}

interface InsightTarget {
  kind: 'file' | 'module' | 'architecture' | 'cycles'
  value?: string
  ctaLabel: string
}

interface Insight {
  priority: number
  type: 'critical' | 'warning' | 'info' | 'success'
  icon: React.ReactNode
  message: string
  action?: string
  level: RiskLevel
  target?: InsightTarget
}

function getBasename(path: string): string {
  const segments = path.split('/')
  return segments[segments.length - 1] || path
}

/**
 * Triage Priority Order (highest to lowest):
 * 1. Circular Dependencies (BLOCKER - system integrity)
 * 2. Broad Spread-Risk Modules
 * 3. God Objects (architectural smell)
 * 4. High Propagation-Risk Modules
 * 5. Orphans (cleanup)
 */
function generateInsights(props: ActionableInsightsProps): Insight[] {
  const {
    cycleCount,
    orphanCount,
    criticalRisks,
    warningRisks,
    godObjects,
    topHotspot
  } = props
  const insights: Insight[] = []

  // 1. BLOCKER: Circular Dependencies
  if (cycleCount > 0) {
    insights.push({
      priority: 1,
      type: 'critical',
      level: 'critical',
      icon: <RefreshCw className='h-4 w-4 text-red-600' />,
      message: dashboardCopy.actionableInsights.cycle.message(cycleCount),
      action: dashboardCopy.actionableInsights.cycle.action,
      target: {
        kind: 'cycles',
        ctaLabel: dashboardCopy.actionableInsights.cta.cycles
      }
    })
  }

  // 2. CRITICAL: Critical propagation-risk band
  if (criticalRisks.length > 0) {
    const top = criticalRisks[0]
    insights.push({
      priority: 2,
      type: 'critical',
      level: 'critical',
      icon: <AlertTriangle className='h-4 w-4 text-red-500' />,
      message: dashboardCopy.actionableInsights.criticalRisk.message(top.path),
      action: dashboardCopy.actionableInsights.criticalRisk.action,
      target: {
        kind: 'module',
        value: top.path,
        ctaLabel: dashboardCopy.actionableInsights.cta.module
      }
    })
  }

  // 3. WARNING: God Objects (>15 dependencies)
  if (godObjects.length > 0) {
    const top = godObjects[0]
    insights.push({
      priority: 3,
      type: 'warning',
      level: 'high',
      icon: <Lightbulb className='h-4 w-4 text-orange-500' />,
      message: dashboardCopy.actionableInsights.godObject.message(
        getBasename(top.path)
      ),
      action: dashboardCopy.actionableInsights.godObject.action(
        top.dependencyCount
      ),
      target: {
        kind: 'file',
        value: top.path,
        ctaLabel: dashboardCopy.actionableInsights.cta.file
      }
    })
  }

  // 4. WARNING: High propagation risk
  if (warningRisks.length > 0) {
    const top = warningRisks[0]
    insights.push({
      priority: 4,
      type: 'warning',
      level: 'high',
      icon: <AlertTriangle className='h-4 w-4 text-orange-500' />,
      message: dashboardCopy.actionableInsights.warningRisk.message(top.path),
      action: dashboardCopy.actionableInsights.warningRisk.action,
      target: {
        kind: 'module',
        value: top.path,
        ctaLabel: dashboardCopy.actionableInsights.cta.module
      }
    })
  }

  if (topHotspot && isActionableHotspotStatus(topHotspot.hotspotStatus)) {
    insights.push({
      priority: 3,
      type: 'warning',
      level:
        getHotspotStatusPriority(topHotspot.hotspotStatus) >=
        getHotspotStatusPriority('critical-hotspot')
          ? 'critical'
          : 'high',
      icon: <AlertTriangle className='h-4 w-4 text-orange-500' />,
      message: dashboardCopy.actionableInsights.hotspot.message(
        topHotspot.modulePath
      ),
      action: dashboardCopy.actionableInsights.hotspot.action(
        Math.round(topHotspot.relativeChurn30d * 100)
      ),
      target: {
        kind: 'module',
        value: topHotspot.modulePath,
        ctaLabel: dashboardCopy.actionableInsights.cta.module
      }
    })
  }

  // 5. INFO: Orphans
  if (orphanCount > 0) {
    insights.push({
      priority: 5,
      type: 'info',
      level: 'low',
      icon: <Ghost className='h-4 w-4 text-muted-foreground' />,
      message: dashboardCopy.actionableInsights.orphans.message(orphanCount),
      action:
        orphanCount > 10
          ? dashboardCopy.actionableInsights.orphans.actionHigh
          : dashboardCopy.actionableInsights.orphans.actionLow
    })
  }

  // Success state: only if no actionable items
  if (insights.length === 0) {
    insights.push({
      priority: 0,
      type: 'success',
      level: 'low',
      icon: <CheckCircle className='h-4 w-4 text-green-500' />,
      message: dashboardCopy.actionableInsights.success.message,
      action: dashboardCopy.actionableInsights.success.action
    })
  }

  // Sort by priority and take top 4
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

export function ActionableInsights(props: ActionableInsightsProps) {
  const insights = generateInsights(props)

  const handleInsightSelect = (target?: InsightTarget) => {
    if (!target) {
      return
    }

    if (target.kind === 'file' && target.value) {
      props.onNavigateToFile?.(target.value)
      return
    }

    if (target.kind === 'module' && target.value) {
      props.onViewModule?.(target.value)
      return
    }

    if (target.kind === 'architecture') {
      props.onShowArchitecture?.()
      return
    }

    if (target.kind === 'cycles') {
      props.onShowCycleTriage?.()
    }
  }

  return (
    <Card className='border-primary/20 bg-primary/5'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base font-medium'>
          <Lightbulb className='h-4 w-4' />
          {dashboardCopy.actionableInsights.title}
        </CardTitle>
        <CardDescription>
          {dashboardCopy.actionableInsights.description}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {insights.map((insight, index) => {
          const interactive = Boolean(insight.target)
          const insightKey = `${insight.priority}-${insight.type}-${insight.message}`

          const content = (
            <>
              <div className='flex items-start gap-2'>
                <div className='mt-0.5 shrink-0'>{insight.icon}</div>
                <div className='min-w-0 flex-1'>
                  <p className='mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground'>
                    {index === 0
                      ? dashboardCopy.actionableInsights.primaryLabel
                      : dashboardCopy.actionableInsights.secondaryLabel}
                  </p>
                  <p className='text-sm font-medium'>{insight.message}</p>
                  {insight.action && (
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {insight.action}
                    </p>
                  )}
                </div>
              </div>
              {interactive ? (
                <div className='mt-3 flex items-center justify-end text-xs font-medium text-primary'>
                  <span>{insight.target?.ctaLabel}</span>
                  <ArrowRight className='ml-1 h-3 w-3' />
                </div>
              ) : null}
            </>
          )

          const className = `rounded-lg p-4 ${getRiskBgOpacityClass(insight.level, 5)} ${
            index === 0
              ? 'border border-primary/30 bg-primary/10 shadow-sm'
              : 'border border-border/50'
          } ${interactive ? 'transition-all hover:border-primary/40 hover:bg-primary/5 hover:ring-1 hover:ring-primary/30' : ''}`

          if (interactive) {
            return (
              <button
                key={insightKey}
                type='button'
                onClick={() => handleInsightSelect(insight.target)}
                className={`${className} w-full text-left`}
              >
                {content}
              </button>
            )
          }

          return (
            <div key={insightKey} className={className}>
              {content}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
