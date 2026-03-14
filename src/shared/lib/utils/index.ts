import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert absolute file path to relative path from project root
 * Tries to find common project markers like "src/", "components/", etc.
 */
export function getRelativePath(filePath: string): string {
  if (!filePath) {
    return filePath
  }

  // Common project root indicators
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

  // Try to find the last occurrence of any project marker
  let relativeIndex = -1

  for (const marker of projectMarkers) {
    const index = filePath.lastIndexOf(marker)
    if (index > relativeIndex) {
      relativeIndex = index
    }
  }

  // If found a marker, return path starting from the marker (without leading slash)
  if (relativeIndex >= 0) {
    return filePath.substring(relativeIndex + 1)
  }

  // Otherwise, try to find the project name in path
  const pathParts = filePath.split('/')

  // Look for common project folder patterns
  const projectFolderIndex = pathParts.findIndex((_part, index) => {
    // Skip early parts (like Users, home, etc.)
    if (index < 2) {
      return false
    }

    // Look for folders that might be project names
    // Usually after "Project", "workspace", "code", "dev", etc.
    const prevPart = pathParts[index - 1]?.toLowerCase()
    return [
      'project',
      'projects',
      'workspace',
      'code',
      'dev',
      'development'
    ].includes(prevPart)
  })

  if (projectFolderIndex > 0) {
    return pathParts.slice(projectFolderIndex).join('/')
  }

  // Last resort: return last 3-4 parts of the path
  return pathParts.slice(-4).join('/')
}

/**
 * Get just the filename from a path
 */
export function getBasename(filePath: string): string {
  if (!filePath) {
    return filePath
  }
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}

export function truncateMiddle(value: string, maxLength = 48): string {
  if (!value || value.length <= maxLength) {
    return value
  }

  if (maxLength <= 3) {
    return value.slice(0, maxLength)
  }

  const visibleChars = maxLength - 3
  const startLength = Math.ceil(visibleChars / 2)
  const endLength = Math.floor(visibleChars / 2)

  return `${value.slice(0, startLength)}...${value.slice(-endLength)}`
}

export function getModulePathFromNodeLabel(label?: string): string | null {
  if (!label) {
    return null
  }

  const normalizedLabel = label.replace(/\\/g, '/')
  const lastSlashIndex = normalizedLabel.lastIndexOf('/')

  if (lastSlashIndex === -1) {
    return '(root)'
  }

  return normalizedLabel.slice(0, lastSlashIndex)
}

export {
  buildMetricsGuideHash,
  parseMetricsGuideHash,
  resolveExplorerContextChip
} from './explorer-shell'
export { resolveTopBarActionGroups, resolveTopBarIconLabels } from './top-bar'

// Re-export file status utilities
export {
  normalizePath,
  matchesFile,
  hasMatchInSet,
  getValueFromMap
} from './file-status'

// Re-export file icon utilities
export { getFileIcon } from './file-icons'

// Re-export evolutionary metric utilities
export {
  buildEvolutionaryHotspots,
  formatRelativeChurn,
  getFileEvolutionMetrics,
  getGraphHotspotStatusLabel,
  getHotspotStatusLabel,
  getHotspotTone,
  summarizeEvolutionAvailability
} from './evolution'

// Re-export decision assessment utilities
export { createDecisionAssessment } from './decision-assessment'
export {
  buildFileReviewStoryMap,
  createFileReviewStory,
  createFileReviewThresholdCalibrationFromAnalysisData
} from './file-review-story'
export {
  getChangePressureTone,
  getAssessmentMethodItems,
  getExternalRelianceTone,
  getImpactScopeTone,
  getReviewPriorityTone,
  getStructuralPositionTone,
  formatChangePressureHelper,
  formatChangePressureValue,
  formatExternalRelianceHelper,
  formatExternalRelianceValue,
  formatImpactScopeHelper,
  formatImpactScopeValue,
  formatStructuralPositionHelper,
  formatStructuralPositionValue
} from './decision-assessment'

export type {
  DecisionAssessment,
  DecisionStatusTone,
  ReviewPriority
} from './decision-assessment'
export type { FileReviewStory, FileReviewStoryTone } from './file-review-story'
export type {
  ChangePressure,
  ExternalReliance,
  ImpactScope,
  ReviewThresholdCalibration,
  StructuralPosition
} from '../metric-thresholds'
export {
  createFileReviewThresholdCalibration,
  createModuleReviewThresholdCalibration
} from '../metric-thresholds'
