import assert from 'node:assert/strict'
import test from 'node:test'

import { buildEvolutionaryHotspots } from '../../../../src/shared/lib/utils/evolution'

import type { FolderArchitectureMetrics } from '../../../../src/features/architecture/types/architecture'
import type { HotspotStatus } from '../../../../src/shared/types/analysis'

function createFolderMetrics(params: {
  folderPath: string
  hotspotStatus: HotspotStatus
  hotspotScore: number
  hotspotPercentile: number
  relativeChurn30d?: number
}): FolderArchitectureMetrics {
  const {
    folderPath,
    hotspotStatus,
    hotspotScore,
    hotspotPercentile,
    relativeChurn30d = 0.05
  } = params

  return {
    folderPath,
    fileCount: 3,
    ca: 4,
    ce: 2,
    instability: 2 / 6,
    hasCycle: false,
    couplingTo: {},
    couplingFrom: {},
    evolution: {
      effectiveLoc: 120,
      churn30d: {
        windowDays: 30,
        churnLoc: 6,
        commitCount: 2,
        relativeChurn: relativeChurn30d
      },
      churn90d: {
        windowDays: 90,
        churnLoc: 12,
        commitCount: 3,
        relativeChurn: relativeChurn30d * 2
      },
      relativeChurnPercentile: 0.5,
      structuralRiskPercentile: 0.4,
      hotspotScore,
      hotspotPercentile,
      hotspotStatus,
      changedFileCount30d: 2
    }
  }
}

test('buildEvolutionaryHotspots prioritizes hotspot status before raw hotspot score', () => {
  const hotspots = buildEvolutionaryHotspots([
    createFolderMetrics({
      folderPath: 'src/critical',
      hotspotStatus: 'critical-hotspot',
      hotspotScore: 0.18,
      hotspotPercentile: 0.9
    }),
    createFolderMetrics({
      folderPath: 'src/active',
      hotspotStatus: 'active',
      hotspotScore: 0.62,
      hotspotPercentile: 0.45
    })
  ])

  assert.equal(hotspots[0]?.modulePath, 'src/critical')
  assert.equal(hotspots[0]?.hotspotStatus, 'critical-hotspot')
})
