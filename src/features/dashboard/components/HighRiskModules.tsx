import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { AlertTriangle } from '@/shared/components/ui/icons'
import { Progress } from '@/shared/components/ui/progress'

interface RiskModule {
  path: string
  instability: number
  fanIn: number
  riskScore: number
}

interface HighRiskModulesProps {
  modules: RiskModule[]
  onViewArchitecture?: () => void
}

function getRiskLevel(score: number): {
  label: string
  variant: 'destructive' | 'outline'
} {
  if (score >= 0.7) {
    return { label: 'High Risk', variant: 'destructive' }
  }
  return { label: 'Medium Risk', variant: 'outline' }
}

export function HighRiskModules({
  modules,
  onViewArchitecture
}: HighRiskModulesProps) {
  // Sort by risk score (instability * fanIn normalized)
  const sortedModules = [...modules]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)

  if (sortedModules.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <AlertTriangle className="h-4 w-4" />
            High Risk Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No high-risk modules detected</p>
            <p className="text-xs mt-1">Your architecture looks healthy!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            High Risk Modules
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {sortedModules.length} flagged
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedModules.map((module) => {
          const risk = getRiskLevel(module.riskScore)

          return (
            <div
              key={module.path}
              className="p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className="font-mono text-sm truncate flex-1"
                  title={module.path}
                >
                  {module.path}
                </span>
                <Badge variant={risk.variant} className="text-xs shrink-0">
                  {risk.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Progress
                    value={module.instability * 100}
                    className="h-1.5"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  I: {module.instability.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {module.fanIn} dependents
                </span>
              </div>
            </div>
          )
        })}

        {onViewArchitecture && (
          <button
            onClick={onViewArchitecture}
            className="w-full text-center text-xs text-primary hover:underline py-2"
          >
            View all in Architecture tab →
          </button>
        )}
      </CardContent>
    </Card>
  )
}
