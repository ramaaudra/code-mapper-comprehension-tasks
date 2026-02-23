import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Network } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'

interface CouplingBucket {
  label: string
  range: string
  count: number
  percentage: number
  color: string
}

interface CouplingDistributionProps {
  avgDependencies: number
  distribution: CouplingBucket[]
  mostCoupledFile?: { path: string; count: number }
}

export function CouplingDistribution({
  avgDependencies,
  distribution,
  mostCoupledFile
}: CouplingDistributionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Network className="h-4 w-4" />
            Coupling Distribution
          </CardTitle>
          <InfoTooltip title="What is Coupling?" side="top">
            <div className="space-y-2">
              <p className="text-xs text-popover-foreground">
                Coupling measures how strongly a module depends on other
                modules.
              </p>
              <div className="text-xs space-y-1 pt-1 border-t border-border">
                <p className="font-semibold text-popover-foreground">
                  Coupling Levels:
                </p>
                <p className="text-popover-foreground/80">
                  • <span className="text-green-500 font-medium">Loose</span>:
                  1-2 dependencies — healthy
                  <br />•{' '}
                  <span className="text-yellow-500 font-medium">Medium</span>
                  : 3-5 dependencies — moderate
                  <br />•{' '}
                  <span className="text-orange-500 font-medium">Tight</span>
                  : 6-10 dependencies — high
                  <br />•{' '}
                  <span className="text-red-500 font-medium">Heavy</span>: 10+
                  dependencies — very high
                </p>
              </div>
              <p className="text-xs text-popover-foreground/80 pt-1">
                Lower coupling improves maintainability and reduces the impact
                of changes.
              </p>
            </div>
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Average: </span>
          <span className="font-semibold">{avgDependencies.toFixed(2)}</span>
          <span className="text-muted-foreground"> deps/file</span>
        </div>

        {/* Distribution bars */}
        <div className="space-y-2">
          {distribution.map((bucket) => (
            <div
              key={bucket.label}
              className="space-y-1"
              title={`${bucket.count} files with ${bucket.range} dependencies`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {bucket.label} ({bucket.range})
                </span>
                <span>
                  {bucket.count} files ({bucket.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                <div
                  className={`h-full transition-all ${bucket.color}`}
                  style={{ width: `${bucket.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Most coupled file */}
        {mostCoupledFile && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Most coupled:</p>
            <p
              className="text-sm font-mono truncate"
              title={mostCoupledFile.path}
            >
              {mostCoupledFile.path.split('/').pop()}
              <span className="text-muted-foreground ml-2">
                ({mostCoupledFile.count} deps)
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
