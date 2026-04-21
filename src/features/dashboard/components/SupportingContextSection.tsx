import {
  ArchitectureHealthScore,
  type HealthBreakdown,
  type RiskMetrics
} from './ArchitectureHealthScore'
import { CouplingDistribution } from './CouplingDistribution'

import type { CouplingBucket } from '../lib/couplingBuckets'

interface SupportingContextSectionProps {
  breakdown: HealthBreakdown
  riskMetrics: RiskMetrics
  couplingDistribution: {
    avgDependencies: number
    distribution: CouplingBucket[]
    mostCoupledFile?: { path: string; count: number }
  }
  onNavigateToFile?: (file: string) => void
}

export function SupportingContextSection({
  breakdown,
  riskMetrics,
  couplingDistribution,
  onNavigateToFile
}: SupportingContextSectionProps) {
  return (
    <div className='grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]'>
      <ArchitectureHealthScore
        breakdown={breakdown}
        riskMetrics={riskMetrics}
      />
      <CouplingDistribution
        {...couplingDistribution}
        onNavigateToFile={onNavigateToFile}
      />
    </div>
  )
}
