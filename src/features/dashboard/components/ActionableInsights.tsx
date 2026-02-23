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

interface Insight {
  type: 'success' | 'warning' | 'info'
  icon: React.ReactNode
  message: string
  action?: string
}

interface ActionableInsightsProps {
  cycleCount: number
  orphanCount: number
  unstableModules: { path: string; instability: number; fanIn: number }[]
  heavilyCoupledFiles: { path: string; count: number }[]
}

function generateInsights(props: ActionableInsightsProps): Insight[] {
  const { cycleCount, orphanCount, unstableModules, heavilyCoupledFiles } =
    props
  const insights: Insight[] = []

  // Cycle insights
  if (cycleCount === 0) {
    insights.push({
      type: 'success',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      message: 'No circular dependencies detected',
      action: 'Maintain this clean structure'
    })
  } else {
    insights.push({
      type: 'warning',
      icon: <RefreshCw className="h-4 w-4 text-red-500" />,
      message: `${cycleCount} circular ${cycleCount === 1 ? 'dependency' : 'dependencies'} detected`,
      action: 'Review and break cycles to improve maintainability'
    })
  }

  // Unstable modules insight
  const highRiskModules = unstableModules.filter(
    (m) => m.instability > 0.7 && m.fanIn >= 3
  )
  if (highRiskModules.length > 0) {
    const top = highRiskModules[0]
    insights.push({
      type: 'warning',
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      message: `${top.path} is unstable (I=${top.instability.toFixed(2)}) but has ${top.fanIn} dependents`,
      action: 'Consider refactoring interfaces to reduce breaking change risk'
    })
  }

  // Orphan insight
  if (orphanCount > 0) {
    insights.push({
      type: 'info',
      icon: <Ghost className="h-4 w-4 text-muted-foreground" />,
      message: `${orphanCount} orphan files detected`,
      action:
        orphanCount > 10
          ? 'Consider cleanup to reduce bundle size'
          : 'Low impact, review when convenient'
    })
  }

  // Heavily coupled insight
  const godObjects = heavilyCoupledFiles.filter((f) => f.count > 15)
  if (godObjects.length > 0) {
    const top = godObjects[0]
    insights.push({
      type: 'warning',
      icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
      message: `${top.path.split('/').pop()} has ${top.count} dependencies`,
      action: 'Potential God Object - consider splitting responsibilities'
    })
  }

  // If everything is clean
  if (insights.length === 1 && insights[0].type === 'success') {
    insights.push({
      type: 'success',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      message: 'Architecture is in good shape',
      action: 'Keep up the good work!'
    })
  }

  return insights.slice(0, 4)
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
            className={`p-4 rounded-lg ${
              insight.type === 'success'
                ? 'bg-green-500/5'
                : insight.type === 'warning'
                  ? 'bg-orange-500/5'
                  : 'bg-muted/20'
            }`}
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
