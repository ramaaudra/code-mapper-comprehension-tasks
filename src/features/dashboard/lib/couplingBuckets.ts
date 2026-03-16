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
    color: 'bg-green-500',
    textColor: 'text-green-500',
    descriptor: 'healthy'
  },
  {
    label: 'Medium',
    range: '3-6',
    min: 3,
    max: 6,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    descriptor: 'moderate'
  },
  {
    label: 'Tight',
    range: '7-10',
    min: 7,
    max: 10,
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    descriptor: 'high'
  },
  {
    label: 'Heavy',
    range: '11+',
    min: 11,
    color: 'bg-red-500',
    textColor: 'text-red-500',
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
