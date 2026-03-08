import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  AlertTriangle,
  CheckCircle,
  Ghost,
  Lightbulb,
  RefreshCw
} from '@/shared/components/ui/icons'
import { getRiskBgOpacityClass } from '@/shared/lib/utils/risk'
import type { RiskLevel } from '@/shared/types/risk'

interface RiskItem {
  path: string
  riskScore: number
  instability: number
  fanIn: number
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
}

interface Insight {
  priority: number
  type: 'critical' | 'warning' | 'info' | 'success'
  icon: React.ReactNode
  message: string
  action?: string
  level: RiskLevel
}

/**
 * Triage Priority Order (highest to lowest):
 * 1. Circular Dependencies (BLOCKER - system integrity)
 * 2. Critical Change-Risk Modules (Zone of Pain)
 * 3. God Objects (architectural smell)
 * 4. High Change-Risk Modules
 * 5. Orphans (cleanup)
 */
function generateInsights(props: ActionableInsightsProps): Insight[] {
  const { cycleCount, orphanCount, criticalRisks, warningRisks, godObjects } =
    props
  const insights: Insight[] = []

  // 1. BLOCKER: Circular Dependencies
  if (cycleCount > 0) {
    insights.push({
      priority: 1,
      type: 'critical',
      level: 'critical',
      icon: <RefreshCw className="h-4 w-4 text-red-600" />,
      message: `${cycleCount} circular ${cycleCount === 1 ? 'dependency' : 'dependencies'} detected`,
      action:
        'Break cycles immediately to prevent memory leaks and compilation issues'
    })
  }

  // 2. CRITICAL: Zone of Pain
  if (criticalRisks.length > 0) {
    const top = criticalRisks[0]
    insights.push({
      priority: 2,
      type: 'critical',
      level: 'critical',
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      message: `${top.path} is in the Zone of Pain (Change Risk: ${top.riskScore.toFixed(1)})`,
      action: `Ca=${top.fanIn}, I=${top.instability.toFixed(2)}. Many dependents plus outward dependencies can propagate failures widely.`
    })
  }

  // 3. WARNING: God Objects (>15 dependencies)
  if (godObjects.length > 0) {
    const top = godObjects[0]
    insights.push({
      priority: 3,
      type: 'warning',
      level: 'high',
      icon: <Lightbulb className="h-4 w-4 text-orange-500" />,
      message: `${top.path.split('/').pop()} has ${top.dependencyCount} dependencies`,
      action: 'Potential God Object - consider splitting responsibilities'
    })
  }

  // 4. WARNING: High change risk
  if (warningRisks.length > 0) {
    const top = warningRisks[0]
    insights.push({
      priority: 4,
      type: 'warning',
      level: 'high',
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      message: `${top.path} has high change risk (Score: ${top.riskScore.toFixed(1)})`,
      action: 'Review dependents and regression-test before making changes'
    })
  }

  // 5. INFO: Orphans
  if (orphanCount > 0) {
    insights.push({
      priority: 5,
      type: 'info',
      level: 'low',
      icon: <Ghost className="h-4 w-4 text-muted-foreground" />,
      message: `${orphanCount} orphan files detected`,
      action:
        orphanCount > 10
          ? 'Consider cleanup to reduce bundle size'
          : 'Low impact, review when convenient'
    })
  }

  // Success state: only if no actionable items
  if (insights.length === 0) {
    insights.push({
      priority: 0,
      type: 'success',
      level: 'low',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      message: 'Architecture is in excellent shape',
      action: 'No critical risks detected - keep up the good work!'
    })
  }

  // Sort by priority and take top 4
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4)
}

export function ActionableInsights(props: ActionableInsightsProps) {
  const insights = generateInsights(props)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Lightbulb className="h-4 w-4" />
          Actionable Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${getRiskBgOpacityClass(insight.level, 5)}`}
          >
            <div className="flex items-start gap-2">
              <div className="shrink-0 mt-0.5">{insight.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{insight.message}</p>
                {insight.action && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
