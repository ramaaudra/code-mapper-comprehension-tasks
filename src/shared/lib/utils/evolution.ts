import { calculateRiskScore } from '@/shared/lib/utils/risk'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import type {
  EvolutionarySummary,
  FileEvolutionMetrics,
  HotspotStatus
} from '@/shared/types/analysis'

export function formatRelativeChurn(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function getHotspotStatusLabel(status: HotspotStatus): string {
  switch (status) {
    case 'critical-hotspot':
      return 'Critical Hotspot'
    case 'high-review-needed':
      return 'High Review Priority'
    case 'active':
      return 'Active Change Area'
    default:
      return 'Stable Change Area'
  }
}

export function getHotspotTone(
  status: HotspotStatus
): 'default' | 'warning' | 'danger' {
  switch (status) {
    case 'critical-hotspot':
      return 'danger'
    case 'high-review-needed':
      return 'warning'
    default:
      return 'default'
  }
}

export interface EvolutionaryHotspotItem {
  modulePath: string
  relativeChurn30d: number
  propagationRisk: number
  hotspotScore: number
  hotspotStatus: HotspotStatus
  changedFileCount30d: number
}

export function buildEvolutionaryHotspots(
  folders: FolderArchitectureMetrics[]
): EvolutionaryHotspotItem[] {
  return folders
    .filter((folder) => folder.evolution)
    .map((folder) => ({
      modulePath: folder.folderPath,
      relativeChurn30d: folder.evolution?.churn30d.relativeChurn ?? 0,
      propagationRisk: calculateRiskScore(folder.ca, folder.instability),
      hotspotScore: folder.evolution?.hotspotScore ?? 0,
      hotspotStatus: folder.evolution?.hotspotStatus ?? 'stable',
      changedFileCount30d: folder.evolution?.changedFileCount30d ?? 0
    }))
    .sort((left, right) => right.hotspotScore - left.hotspotScore)
}

export function getFileEvolutionMetrics(
  filePath: string | null,
  fileMap: Record<string, FileEvolutionMetrics>
): FileEvolutionMetrics | null {
  if (!filePath) {
    return null
  }

  return fileMap[filePath] ?? null
}

export function summarizeEvolutionAvailability(
  summary: EvolutionarySummary | null
): { isAvailable: boolean; message: string } {
  if (!summary) {
    return {
      isAvailable: false,
      message: 'No evolutionary metrics available.'
    }
  }

  if (summary.availability === 'unavailable') {
    return {
      isAvailable: false,
      message:
        summary.unavailableReason ??
        'Git history is unavailable for churn-based metrics.'
    }
  }

  return {
    isAvailable: true,
    message: `${summary.filesWithChurn30d} files changed in the last 30 days.`
  }
}
