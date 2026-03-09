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
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base font-medium'>
            <Network className='h-4 w-4' />
            Coupling Distribution
          </CardTitle>
          <InfoTooltip title='What is Coupling?' side='top'>
            <div className='space-y-2'>
              <p className='text-xs text-popover-foreground'>
                Coupling describes how strongly files or modules depend on one
                another. This chart groups files by outgoing dependency count.
              </p>
              <div className='space-y-1 border-t border-border pt-1 text-xs'>
                <p className='font-semibold text-popover-foreground'>
                  Coupling Levels:
                </p>
                <p className='text-popover-foreground/80'>
                  • <span className='font-medium text-green-500'>Loose</span>:
                  1-2 dependencies — healthy
                  <br />•{' '}
                  <span className='font-medium text-yellow-500'>Medium</span>:
                  3-5 dependencies — moderate
                  <br />•{' '}
                  <span className='font-medium text-orange-500'>Tight</span>:
                  6-10 dependencies — high
                  <br />•{' '}
                  <span className='font-medium text-red-500'>Heavy</span>: 10+
                  dependencies — very high
                </p>
              </div>
              <p className='pt-1 text-xs text-popover-foreground/80'>
                Lower coupling improves maintainability and reduces the impact
                of changes.
              </p>
            </div>
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='text-sm'>
          <span className='text-muted-foreground'>Average: </span>
          <span className='font-semibold'>{avgDependencies.toFixed(2)}</span>
          <span className='text-muted-foreground'>
            {' '}
            outgoing dependencies per file
          </span>
        </div>

        {/* Distribution bars */}
        <div className='space-y-2'>
          {distribution.map((bucket) => (
            <div
              key={bucket.label}
              className='space-y-1'
              title={`${bucket.count} files with ${bucket.range} dependencies`}
            >
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>
                  {bucket.label} ({bucket.range})
                </span>
                <span>
                  {bucket.count} files ({bucket.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20'>
                <div
                  className={`h-full transition-all ${bucket.color}`}
                  style={{ width: `${bucket.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* File with highest outgoing dependency count */}
        {mostCoupledFile && (
          <div className='border-t border-border pt-2'>
            <p className='mb-1 text-xs text-muted-foreground'>
              Highest outgoing dependency count:
            </p>
            <p
              className='truncate font-mono text-sm'
              title={mostCoupledFile.path}
            >
              {mostCoupledFile.path.split('/').pop()}
              <span className='ml-2 text-muted-foreground'>
                ({mostCoupledFile.count} outgoing dependencies)
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
