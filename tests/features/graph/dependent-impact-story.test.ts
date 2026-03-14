import assert from 'node:assert/strict'
import test from 'node:test'

import { describeDependentImpact } from '../../../src/features/graph/lib/dependent-impact-story'
import { createModuleReviewThresholdCalibration } from '../../../src/shared/lib/metric-thresholds'

test('describeDependentImpact reuses shared module impact thresholds and edge-based wording', () => {
  const calibration = createModuleReviewThresholdCalibration({
    impactScopeValues: [0, 4, 9, 18, 30, 45],
    changePressureValues: [0, 0.01, 0.02, 0.04, 0.08, 0.12],
    externalRelianceValues: [0, 2, 4, 6, 8, 10],
    propagationRiskValues: [0, 1, 4, 8, 15, 24]
  })

  const story = describeDependentImpact(30, calibration)

  assert.equal(story.title, 'Moderate Impact')
  assert.equal(story.tone, 'warning')
  assert.match(story.description, /incoming cross-module dependency edges/i)
  assert.match(story.footer, /Impact Scope/i)
})
