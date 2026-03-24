import { getPriorityDriverChipLabel } from '../content/priorityDriverCopy'

import type { CycleTriageItem, FixPriority } from '../types/cycle-triage'
import type { ReviewPriority } from '@/shared/lib/utils'

export type CycleSignalTone = 'loading' | 'ready' | 'warning'

export interface CycleSignalSummary {
  label: string
  detail: string
  tone: CycleSignalTone
}

interface GetCycleSignalSummaryInput {
  isLoading: boolean
  hasMeasuredSignals: boolean
}

export function getCycleSignalSummary(
  input: GetCycleSignalSummaryInput
): CycleSignalSummary {
  if (input.isLoading) {
    return {
      label: 'Loading signals…',
      detail:
        'Priority reasons are loading downstream usage and recent change signals.',
      tone: 'loading'
    }
  }

  if (input.hasMeasuredSignals) {
    return {
      label: 'Graph + change signals',
      detail:
        'Priority reasons use downstream usage and recent change activity.',
      tone: 'ready'
    }
  }

  return {
    label: 'Graph-only priority',
    detail:
      'Priority reasons currently use graph structure only. Recent change activity is unavailable for this analysis.',
    tone: 'warning'
  }
}

function lowerFirstCharacter(value: string): string {
  if (!value) {
    return value
  }

  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`
}

export function getCycleFixPriorityLabel(
  priority: FixPriority
): ReviewPriority {
  switch (priority) {
    case 'high':
      return 'High Review Priority'
    case 'medium':
      return 'Normal Review Priority'
    default:
      return 'Low Review Priority'
  }
}

export function getCycleEvidenceItems(
  item: Pick<CycleTriageItem, 'uniqueFileCount' | 'priorityDrivers'>
): string[] {
  const evidence = [
    `${item.uniqueFileCount} file${item.uniqueFileCount === 1 ? '' : 's'}`
  ]

  for (const driver of item.priorityDrivers) {
    const label = getPriorityDriverChipLabel(driver)

    if (evidence.includes(label)) {
      continue
    }

    evidence.push(label)

    if (evidence.length === 3) {
      break
    }
  }

  return evidence
}

export function getCycleQueueSummary(
  item: Pick<CycleTriageItem, 'uniqueFileCount' | 'priorityDrivers'>
): string {
  const [fileCount, ...supportingSignals] = getCycleEvidenceItems(item)
  const primarySignal = supportingSignals[0]

  if (!primarySignal) {
    return fileCount
  }

  return [fileCount, lowerFirstCharacter(primarySignal)].join(', ')
}

export function getLoopPathDefaultExpanded(_fileCount: number): boolean {
  return false
}

export function getNearbyImportsToggleLabel(
  nearbyCount: number,
  showNearbyImports: boolean
): string {
  if (nearbyCount <= 0) {
    return 'No nearby imports'
  }

  return `${showNearbyImports ? 'Hide' : 'Show'} nearby imports (${nearbyCount})`
}
