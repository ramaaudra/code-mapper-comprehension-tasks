import assert from 'node:assert/strict'
import test from 'node:test'

import { buildModuleReviewGroups } from '../../../src/features/architecture/lib/module-review-priority'

import type { FileArchitectureMetrics } from '../../../src/features/architecture/types/architecture'

function createFileMetrics(
  overrides: Partial<FileArchitectureMetrics> &
    Pick<FileArchitectureMetrics, 'filePath'>
): FileArchitectureMetrics {
  return {
    filePath: overrides.filePath,
    moduleKey: overrides.moduleKey ?? 'lib/services',
    ca: overrides.ca ?? 0,
    ce: overrides.ce ?? 0,
    instability: overrides.instability ?? 0,
    hasCycle: overrides.hasCycle ?? false,
    ...(overrides.evolution ? { evolution: overrides.evolution } : {})
  }
}

test('buildModuleReviewGroups prioritizes cycle members and broadly shared files before lower-signal files', () => {
  const reviewGroups = buildModuleReviewGroups([
    createFileMetrics({
      filePath: '/repo/lib/services/payment-service.ts',
      ca: 4,
      ce: 3,
      instability: 0.43,
      hasCycle: true
    }),
    createFileMetrics({
      filePath: '/repo/lib/services/user-service.ts',
      ca: 13,
      ce: 1,
      instability: 0.07
    }),
    createFileMetrics({
      filePath: '/repo/lib/services/order-orchestrator.ts',
      ca: 5,
      ce: 6,
      instability: 0.55,
      evolution: {
        filePath: '/repo/lib/services/order-orchestrator.ts',
        effectiveLoc: 220,
        churn30d: {
          windowDays: 30,
          churnLoc: 44,
          commitCount: 5,
          relativeChurn: 0.2
        },
        churn90d: {
          windowDays: 90,
          churnLoc: 60,
          commitCount: 9,
          relativeChurn: 0.27
        },
        relativeChurnPercentile: 0.92,
        structuralRiskPercentile: 0.78,
        hotspotScore: 0.88,
        hotspotPercentile: 0.91,
        hotspotStatus: 'high-review-needed'
      }
    }),
    createFileMetrics({
      filePath: '/repo/lib/services/logger.ts',
      ca: 0,
      ce: 1,
      instability: 1
    }),
    createFileMetrics({
      filePath: '/repo/lib/services/internal-types.ts',
      ca: 0,
      ce: 0,
      instability: 0
    })
  ])

  assert.deepEqual(
    reviewGroups.startHere.map((item) => item.file.filePath),
    [
      '/repo/lib/services/payment-service.ts',
      '/repo/lib/services/user-service.ts',
      '/repo/lib/services/order-orchestrator.ts'
    ]
  )

  assert.match(
    reviewGroups.startHere[0]?.reviewReason ?? '',
    /dependency cycle/i
  )
  assert.match(
    reviewGroups.startHere[1]?.reviewReason ?? '',
    /imported by 13 files/i
  )
  assert.equal(
    reviewGroups.startHere[1]?.structuralRoleLabel,
    'Foundation Role'
  )
  assert.match(
    reviewGroups.startHere[2]?.secondarySignal ?? '',
    /20\.0% relative churn in 30d/i
  )

  assert.equal(reviewGroups.nextToVerify.length, 2)
  assert.equal(reviewGroups.remaining.length, 0)
})
