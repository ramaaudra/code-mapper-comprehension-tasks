import {
  getStructuralPositionBandLabel,
  resolveStructuralPosition
} from '../../../shared/lib/metric-thresholds'

import type { StructuralPosition } from '../../../shared/lib/metric-thresholds'
import type { FileArchitectureMetrics } from '../types/architecture'

export interface PrioritizedModuleReviewFile {
  file: FileArchitectureMetrics
  basename: string
  relativePath: string
  structuralRole: StructuralPosition
  structuralRoleLabel: string
  reviewReason: string
  secondarySignal: string | null
  reviewPriorityScore: number
}

export interface ModuleReviewGroups {
  startHere: PrioritizedModuleReviewFile[]
  nextToVerify: PrioritizedModuleReviewFile[]
  remaining: PrioritizedModuleReviewFile[]
}

const START_HERE_LIMIT = 3
const NEXT_TO_VERIFY_LIMIT = 2

function formatRelativeChurn(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function getRelativePath(filePath: string): string {
  if (!filePath) {
    return filePath
  }

  const projectMarkers = [
    '/src/',
    '/components/',
    '/lib/',
    '/pages/',
    '/app/',
    '/styles/',
    '/public/',
    '/assets/'
  ]

  let relativeIndex = -1

  for (const marker of projectMarkers) {
    const markerIndex = filePath.lastIndexOf(marker)

    if (markerIndex > relativeIndex) {
      relativeIndex = markerIndex
    }
  }

  if (relativeIndex >= 0) {
    return filePath.substring(relativeIndex + 1)
  }

  const pathParts = filePath.split('/')
  return pathParts.slice(-4).join('/')
}

function getBasename(filePath: string): string {
  if (!filePath) {
    return filePath
  }

  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

function calculateReviewPriorityScore(file: FileArchitectureMetrics): number {
  const cycleWeight = file.hasCycle ? 10_000 : 0
  const dependentsWeight = file.ca * 100
  const dependenciesWeight = file.ce * 10
  const changeWeight = (file.evolution?.churn30d.relativeChurn ?? 0) * 100

  return cycleWeight + dependentsWeight + dependenciesWeight + changeWeight
}

function buildReviewReason(file: FileArchitectureMetrics): string {
  if (file.hasCycle) {
    return 'Part of a dependency cycle. Review this before broader module edits.'
  }

  if (file.ca > 0) {
    return `Imported by ${file.ca} files, so changes here can spread review work quickly.`
  }

  if ((file.evolution?.churn30d.relativeChurn ?? 0) > 0) {
    return 'Recently active relative to its size, so double-check current assumptions before refactoring.'
  }

  if (file.ce > 0) {
    return `Relies on ${file.ce} internal dependencies, so isolated edits may still need a dependency check.`
  }

  return 'Lower-signal file inside this module. Verify only after higher-impact files are understood.'
}

function buildSecondarySignal(file: FileArchitectureMetrics): string | null {
  const relativeChurn = file.evolution?.churn30d.relativeChurn ?? 0

  if (relativeChurn > 0) {
    return `${formatRelativeChurn(relativeChurn)} relative churn in 30d`
  }

  if (file.ce > 0) {
    return `${file.ce} internal dependencies to verify`
  }

  if (file.ca > 0) {
    return `${file.ca} downstream dependents`
  }

  return null
}

function prioritizeModuleFile(
  file: FileArchitectureMetrics
): PrioritizedModuleReviewFile {
  const structuralRole = resolveStructuralPosition(file.instability)

  return {
    file,
    basename: getBasename(file.filePath),
    relativePath: getRelativePath(file.filePath),
    structuralRole,
    structuralRoleLabel: getStructuralPositionBandLabel(structuralRole),
    reviewReason: buildReviewReason(file),
    secondarySignal: buildSecondarySignal(file),
    reviewPriorityScore: calculateReviewPriorityScore(file)
  }
}

export function buildModuleReviewGroups(
  files: FileArchitectureMetrics[]
): ModuleReviewGroups {
  const prioritizedFiles = files
    .map(prioritizeModuleFile)
    .sort((left, right) => right.reviewPriorityScore - left.reviewPriorityScore)

  return {
    startHere: prioritizedFiles.slice(0, START_HERE_LIMIT),
    nextToVerify: prioritizedFiles.slice(
      START_HERE_LIMIT,
      START_HERE_LIMIT + NEXT_TO_VERIFY_LIMIT
    ),
    remaining: prioritizedFiles.slice(START_HERE_LIMIT + NEXT_TO_VERIFY_LIMIT)
  }
}
