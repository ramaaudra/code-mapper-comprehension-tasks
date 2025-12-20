import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Network } from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'

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
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Network className="h-4 w-4" />
          Coupling Distribution
        </CardTitle>
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
            <TooltipProvider key={bucket.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {bucket.label} ({bucket.range})
                      </span>
                      <span>
                        {bucket.count} files ({bucket.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${bucket.color}`}
                        style={{ width: `${bucket.percentage}%` }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {bucket.count} files with {bucket.range} dependencies
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
