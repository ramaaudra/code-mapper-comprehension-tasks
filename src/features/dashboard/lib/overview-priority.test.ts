import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildOverviewReviewQueue,
  getOverviewSectionOrder
} from './overview-priority'

test('puts dependency cycles ahead of structural risk and hotspot follow-up', () => {
  const queue = buildOverviewReviewQueue({
    cycleCount: 3,
    orphanCount: 12,
    criticalRisks: [
      {
        path: 'lib/services',
        riskScore: 4.2,
        instability: 0.42,
        fanIn: 10
      }
    ],
    warningRisks: [
      {
        path: 'stores',
        riskScore: 2.4,
        instability: 0.4,
        fanIn: 6
      }
    ],
    topHotspot: {
      modulePath: 'app/dashboard',
      relativeChurn30d: 0.42,
      hotspotScore: 0.84,
      hotspotPercentile: 0.95,
      hotspotStatus: 'high-review-needed'
    }
  })

  assert.equal(queue[0]?.id, 'cycles')
  assert.equal(
    queue[0]?.title,
    'Break dependency cycles before broader refactors'
  )
  assert.equal(
    queue[1]?.title,
    'Review lib/services before editing shared flows'
  )
  assert.equal(
    queue[2]?.title,
    'Review app/dashboard while this module is still changing'
  )
})

test('returns consequence language and an explicit next step for each queue item', () => {
  const queue = buildOverviewReviewQueue({
    cycleCount: 0,
    orphanCount: 0,
    criticalRisks: [
      {
        path: 'lib/services',
        riskScore: 4.2,
        instability: 0.42,
        fanIn: 10
      }
    ],
    warningRisks: [],
    topHotspot: null
  })

  assert.deepEqual(queue[0], {
    id: 'critical-risk:lib/services',
    tone: 'critical',
    title: 'Review lib/services before editing shared flows',
    reason:
      'Changes here can spread into many dependent modules, so a local edit may need broader verification.',
    recommendedAction:
      'Inspect nearby consumers before merging and treat the change as shared infrastructure work.',
    evidenceLabel: 'Shared by 10 dependent modules',
    target: {
      kind: 'module',
      value: 'lib/services',
      ctaLabel: 'Open module'
    }
  })
})

test('keeps hotspot review in the queue when status is actionable even if the raw score looks low', () => {
  const queue = buildOverviewReviewQueue({
    cycleCount: 0,
    orphanCount: 0,
    criticalRisks: [],
    warningRisks: [],
    topHotspot: {
      modulePath: 'src/critical',
      relativeChurn30d: 0.08,
      hotspotScore: 0.18,
      hotspotPercentile: 0.9,
      hotspotStatus: 'critical-hotspot'
    }
  })

  assert.deepEqual(queue[0], {
    id: 'hotspot:src/critical',
    tone: 'critical',
    title: 'Review src/critical while this module is still changing',
    reason:
      'Recent churn is still concentrated here, so another edit deserves closer review before the area settles down.',
    recommendedAction:
      'Check recent consumers, changed files, and nearby tests before merging more work into this module.',
    evidenceLabel: '8% relative churn in 30 days',
    target: {
      kind: 'module',
      value: 'src/critical',
      ctaLabel: 'Open module'
    }
  })
})

test('keeps a single start-here decision surface before the supporting sections', () => {
  assert.deepEqual(getOverviewSectionOrder(), [
    'start-here',
    'current-issues',
    'system-context',
    'quick-snapshot'
  ])
})

test('routes cleanup follow-up to the cleanup list with explicit cleanup wording', () => {
  const queue = buildOverviewReviewQueue({
    cycleCount: 2,
    orphanCount: 33,
    criticalRisks: [],
    warningRisks: [],
    topHotspot: null
  })

  const cleanupItem = queue.find((item) => item.id === 'cleanup-candidates')

  assert.deepEqual(cleanupItem?.target, {
    kind: 'cleanup',
    ctaLabel: 'Open cleanup list'
  })
})
