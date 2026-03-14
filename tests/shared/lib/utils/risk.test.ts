import assert from 'node:assert/strict'
import test from 'node:test'

import { createModuleReviewThresholdCalibration } from '../../../../src/shared/lib/metric-thresholds'
import {
  getRiskLevel,
  isActionableRiskScore
} from '../../../../src/shared/lib/utils/risk'

test('getRiskLevel and actionable risk checks honor repo-relative propagation-risk calibration', () => {
  const calibration = createModuleReviewThresholdCalibration({
    impactScopeValues: [0, 2, 4, 8, 13, 21],
    changePressureValues: [0, 0.01, 0.02, 0.05, 0.09, 0.14],
    externalRelianceValues: [0, 1, 3, 5, 9, 13],
    propagationRiskValues: [0, 1, 3, 6, 11, 18, 31]
  })

  assert.equal(getRiskLevel(16), 'high')
  assert.equal(getRiskLevel(16, calibration), 'medium')
  assert.equal(isActionableRiskScore(16, calibration), false)
  assert.equal(isActionableRiskScore(18, calibration), true)
})
