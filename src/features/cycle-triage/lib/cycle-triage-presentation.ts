import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { getPriorityDriverChipLabel } from '../content/priorityDriverCopy'

import type { CycleTriageItem, FixPriority } from '../types/cycle-triage'
import type { CycleReviewStatus } from './cycle-triage-review-state'

export type CycleSignalTone = 'loading' | 'ready' | 'warning'

export interface CycleSignalSummary {
  label: string
  detail: string
  tone: CycleSignalTone
}

interface GetCycleWorkspaceSummaryInput {
  totalCount: number
  highPriorityCount: number
  reviewedCount: number
  reviewingCount: number
}

export const cycleReviewToneClass: Record<CycleReviewStatus, string> = {
  unreviewed:
    'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  reviewing: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  reviewed:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
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

export function getCycleWorkspaceSummary(
  input: GetCycleWorkspaceSummaryInput
): string {
  const reviewBits: string[] = []

  if (input.reviewedCount > 0) {
    reviewBits.push(`${input.reviewedCount} reviewed`)
  }

  if (input.reviewingCount > 0) {
    reviewBits.push(`${input.reviewingCount} in review`)
  }

  const queueLead =
    input.highPriorityCount > 0
      ? `Start with ${input.highPriorityCount} high-priority loops out of ${input.totalCount}.`
      : `Review ${input.totalCount} detected loops. No high-priority blockers right now.`

  if (reviewBits.length === 0) {
    return queueLead
  }

  return `${queueLead} ${reviewBits.join(', ')}.`
}

export function getCycleFixPriorityLabel(priority: FixPriority): string {
  switch (priority) {
    case 'high':
      return 'High review priority'
    case 'medium':
      return 'Normal review priority'
    default:
      return 'Low review priority'
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

export function getCycleReviewStatusLabel(status: CycleReviewStatus): string {
  switch (status) {
    case 'reviewing':
      return cycleTriageCopy.detail.statusReviewing
    case 'reviewed':
      return cycleTriageCopy.detail.statusReviewed
    default:
      return cycleTriageCopy.detail.statusUnreviewed
  }
}
