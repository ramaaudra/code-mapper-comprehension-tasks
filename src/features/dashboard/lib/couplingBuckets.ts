export interface CouplingBucketFile {
  path: string
  count: number
}

export interface CouplingBucketDefinition {
  label: 'Loose' | 'Medium' | 'Tight' | 'Heavy'
  range: string
  min: number
  max?: number
  color: string
  textColor: string
  descriptor: string
}

export interface CouplingBucket {
  label: CouplingBucketDefinition['label']
  range: string
  count: number
  percentage: number
  color: string
  files: CouplingBucketFile[]
}

export const couplingBucketDefinitions: readonly CouplingBucketDefinition[] = [
  {
    label: 'Loose',
    range: '0-2',
    min: 0,
    max: 2,
    color: 'bg-status-success-solid',
    textColor: 'text-status-success-foreground',
    descriptor: 'healthy'
  },
  {
    label: 'Medium',
    range: '3-6',
    min: 3,
    max: 6,
    color: 'bg-status-caution-solid',
    textColor: 'text-status-caution-foreground',
    descriptor: 'moderate'
  },
  {
    label: 'Tight',
    range: '7-10',
    min: 7,
    max: 10,
    color: 'bg-status-warning-solid',
    textColor: 'text-status-warning-foreground',
    descriptor: 'high'
  },
  {
    label: 'Heavy',
    range: '11+',
    min: 11,
    color: 'bg-status-critical-solid',
    textColor: 'text-status-critical-foreground',
    descriptor: 'very high'
  }
] as const

function isCountInBucket(
  count: number,
  definition: Pick<CouplingBucketDefinition, 'min' | 'max'>
) {
  return (
    count >= definition.min &&
    count <= (definition.max ?? Number.POSITIVE_INFINITY)
  )
}

export function buildCouplingDistribution(
  depCounts: CouplingBucketFile[]
): CouplingBucket[] {
  const denominator = Math.max(depCounts.length, 1)

  return couplingBucketDefinitions.map((definition) => {
    const files = depCounts
      .filter((item) => isCountInBucket(item.count, definition))
      .sort((left, right) => right.count - left.count)

    return {
      label: definition.label,
      range: definition.range,
      count: files.length,
      percentage: (files.length / denominator) * 100,
      color: definition.color,
      files
    }
  })
}
