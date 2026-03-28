import {
  createCycleId,
  normalizeCyclePath
} from '@/features/cycle-triage/lib/cycle-id'
import { matchesFile } from '@/shared/lib/utils'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

import type { CircularDependencyInfo } from '@/shared/types/analysis'

interface ResolveNodeDetailCycleTriageSummaryInput {
  filePath: string | null
  cycles: Pick<CircularDependencyInfo, 'cycle' | 'files'>[]
}

export interface NodeDetailCycleTriageSummary {
  relatedCycleCount: number
  selectedCycleId: string | null
  title: string
  description: string
  actionLabel: string
}

function filesMatchCycle(
  filePath: string,
  cycleItem: Pick<CircularDependencyInfo, 'files'>,
  fileMatcher: typeof matchesFile
): boolean {
  return cycleItem.files.some((cycleFile) => fileMatcher(cycleFile, filePath))
}

export function resolveNodeDetailCycleTriageSummary(
  input: ResolveNodeDetailCycleTriageSummaryInput,
  fileMatcher: typeof matchesFile = matchesFile
): NodeDetailCycleTriageSummary | null {
  const { filePath, cycles } = input

  if (!filePath || cycles.length === 0) {
    return null
  }

  const relatedCycles = cycles.filter((cycle) =>
    filesMatchCycle(filePath, cycle, fileMatcher)
  )

  if (relatedCycles.length === 0) {
    return null
  }

  const relatedCycleCount = relatedCycles.length
  const isSingleCycle = relatedCycleCount === 1
  const selectedCycleId =
    isSingleCycle && relatedCycles[0]
      ? createCycleId(normalizeCyclePath(relatedCycles[0].cycle))
      : null

  return {
    relatedCycleCount,
    selectedCycleId,
    title: nodeDetailCopy.cycleTriage.title(relatedCycleCount),
    description: nodeDetailCopy.cycleTriage.description(relatedCycleCount),
    actionLabel: isSingleCycle
      ? nodeDetailCopy.cycleTriage.singleAction
      : nodeDetailCopy.cycleTriage.multipleAction(relatedCycleCount)
  }
}
