import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { AlertTriangle, Info } from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'

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

// Risk Score color thresholds based on Ca × I magnitude
// Higher scores indicate modules in the "Zone of Pain"
function getRiskScoreColor(score: number): string {
  if (score >= 50) {
    return 'bg-red-500'
  }
  if (score >= 25) {
    return 'bg-orange-500'
  }
  if (score >= 10) {
    return 'bg-yellow-500'
  }
  return 'bg-green-500'
}

export function HighRiskModules({
  modules,
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
            <span className="text-xs text-muted-foreground font-normal">
              ({sortedModules.length})
            </span>
          </CardTitle>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-sm bg-popover border-border"
              >
                <div className="space-y-2">
                  <p className="font-semibold text-popover-foreground">
                    What is Risk Score?
                  </p>
                  <p className="text-xs text-popover-foreground">
                    Scientific metric based on Robert C. Martin's dependency
                    risk formula.
                  </p>
                  <div className="text-xs space-y-1 pt-1 border-t border-border">
                    <p className="text-popover-foreground">
                      <strong>Formula:</strong> Risk = Dependents × Instability
                    </p>
                    <p className="text-popover-foreground/80">
                      • <strong>Dependents (Ca):</strong> Afferent coupling —
                      how many modules import this
                      <br />• <strong>Instability (I):</strong> I = Ce/(Ca+Ce),
                      where 0.0 = stable, 1.0 = unstable
                    </p>
                  </div>
                  <div className="text-xs space-y-1 pt-1 border-t border-border">
                    <p className="font-semibold text-popover-foreground">
                      Risk Zones:
                    </p>
                    <p className="text-popover-foreground/80">
                      • <span className="text-red-500 font-medium">≥50</span>:
                      Critical — The "Zone of Pain"
                      <br />•{' '}
                      <span className="text-orange-500 font-medium">25-49</span>
                      : High risk
                      <br />•{' '}
                      <span className="text-yellow-500 font-medium">10-24</span>
                      : Medium risk
                      <br />•{' '}
                      <span className="text-green-500 font-medium">&lt;10</span>
                      : Low risk
                    </p>
                  </div>
                  <p className="text-xs text-popover-foreground/80 pt-1">
                    High score = Module has many dependents AND is unstable
                    (depends on others). Changes here cause cascading failures.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Column Headers */}
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-muted-foreground px-4">
          <div className="flex-1">Risk Score</div>
          <div className="w-16 text-right">I Value</div>
          <div className="w-20 text-right">Dependents</div>
        </div>
        {sortedModules.map((module) => {
          const isCriticalRisk = module.riskScore >= 50
          const barWidth = (module.riskScore / maxRiskScore) * 100

          return (
            <div
              key={module.path}
              className={`p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors ${
                isCriticalRisk ? 'border-l-2 border-red-500' : ''
              }`}
            >
              <div className="mb-3">
                <span
                  className="font-mono text-sm truncate block"
                  title={module.path}
                >
                  {module.path}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 cursor-help">
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                          <div
                            className={`h-full transition-all ${getRiskScoreColor(module.riskScore)}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs bg-popover border-border"
                    >
                      <div className="space-y-2">
                        <p className="font-semibold text-popover-foreground">
                          Risk Score: {module.riskScore.toFixed(1)}
                        </p>
                        <div className="text-xs text-popover-foreground/80 space-y-1">
                          <p>Formula: Dependents × Instability</p>
                          <div className="pt-1 border-t border-border mt-2 space-y-1">
                            <p>
                              Instability (I): {module.instability.toFixed(2)}
                            </p>
                            <p>Dependents: {module.fanIn}</p>
                          </div>
                          <p className="pt-1 text-popover-foreground/70">
                            Higher score = higher chance of breaking changes
                            when modified
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground cursor-help hover:text-foreground transition-colors tabular-nums w-16 text-right">
                          I: {module.instability.toFixed(2)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-popover border-border"
                      >
                        <p className="text-popover-foreground font-medium">
                          Instability: {module.instability.toFixed(2)}
                        </p>
                        <p className="text-xs text-popover-foreground/80">
                          0.0 = Stable, 1.0 = Unstable
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-muted-foreground tabular-nums w-20 text-right">
                    {module.fanIn}
                  </span>
                </div>
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
