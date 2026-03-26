import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createFileReviewThresholdCalibration,
  createDecisionAssessment,
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  formatImpactScopeHelper,
  getHotspotStatusLabel
} from '../../../../src/shared/lib/utils'

test('createDecisionAssessment labels cycle findings as circular dependency', () => {
  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: true,
    ca: 6,
    ce: 4,
    instability: 0.4,
    relativeChurn30d: 0.15
  })

  assert.equal(assessment.title, 'Circular Dependency')
  assert.equal(assessment.reviewPriority, 'Critical Review Priority')
})

test('createDecisionAssessment marks unreachable files with low priority when no stronger structural risk is present', () => {
  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: false,
    ca: 0,
    ce: 1,
    instability: 1,
    relativeChurn30d: 0,
    isOrphan: true
  })

  assert.equal(assessment.title, 'Possibly Unreachable')
  assert.equal(assessment.reviewPriority, 'Low Review Priority')
  assert.equal(assessment.impactScope, 'Local')
  assert.doesNotMatch(assessment.title, /unused/i)
})

test('createDecisionAssessment keeps cycle risk as the dominant verdict when a file is also marked orphaned', () => {
  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: true,
    ca: 2,
    ce: 1,
    instability: 1 / 3,
    relativeChurn30d: 0,
    isOrphan: true
  })

  assert.equal(assessment.title, 'Circular Dependency')
  assert.equal(assessment.reviewPriority, 'Critical Review Priority')
  assert.equal(assessment.tone, 'danger')
  assert.match(assessment.headline, /circular dependency/i)
  assert.match(
    assessment.basisSummary,
    /entry-point reachability|current entry-point/i
  )
  assert.doesNotMatch(assessment.summary, /appears isolated/i)
})

test('createDecisionAssessment describes orphan findings as entry-point reachability, not missing dependents', () => {
  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: false,
    ca: 0,
    ce: 1,
    instability: 1,
    relativeChurn30d: 0,
    isOrphan: true
  })

  assert.match(assessment.headline, /entry points|unreachable/i)
  assert.match(assessment.summary, /entry-point analysis|not reached/i)
  assert.doesNotMatch(assessment.whyItMatters, /no dependents were detected/i)
  assert.doesNotMatch(
    assessment.topDrivers.join(' '),
    /no dependents were detected/i
  )
})

test('createDecisionAssessment keeps isolated zero-coupling files in low-pressure local diagnosis', () => {
  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: false,
    ca: 0,
    ce: 0,
    instability: 0,
    relativeChurn30d: 0
  })

  assert.equal(assessment.title, 'Likely Local Change')
  assert.equal(assessment.structuralPosition, 'Foundation-like')
  assert.equal(assessment.changePressure, 'Low')
})

test('createDecisionAssessment uses repo-relative calibration when provided', () => {
  const calibration = createFileReviewThresholdCalibration({
    impactScopeValues: [0, 1, 2, 4, 8, 12],
    changePressureValues: [0, 0.02, 0.04, 0.08, 0.12, 0.18],
    blastRadiusValues: [0, 0.5, 1, 2, 3, 6]
  })

  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: false,
    ca: 12,
    ce: 2,
    instability: 2 / 14,
    relativeChurn30d: 0.18,
    thresholdCalibration: calibration
  })

  assert.equal(assessment.impactScope, 'Broad')
  assert.equal(assessment.changePressure, 'High')
  assert.equal(assessment.title, 'Critical Hotspot')
})

test('createDecisionAssessment avoids churn-driven wording when change history is unavailable', () => {
  const assessment = createDecisionAssessment({
    kind: 'module',
    hasCycle: false,
    ca: 12,
    ce: 2,
    instability: 2 / 14,
    relativeChurn30d: 0,
    changeHistoryAvailable: false
  })

  assert.equal(assessment.title, 'Likely Local Change')
  assert.match(assessment.basisSummary, /Git history is unavailable/i)
  assert.doesNotMatch(assessment.summary, /recent change|lower recent change/i)
})

test('formatChangePressureHelper describes relative churn instead of percent changed', () => {
  assert.equal(
    formatChangePressureHelper(1.25),
    'Relative churn (30d): 125.0% of current size'
  )
})

test('formatImpactScopeHelper and formatExternalRelianceHelper adapt to module units', () => {
  assert.equal(
    formatImpactScopeHelper(2, 'module'),
    '2 incoming cross-module dependency edges point here'
  )
  assert.equal(
    formatExternalRelianceHelper(3, 'module'),
    'Depends on 3 outgoing cross-module dependency edges'
  )
})

test('getHotspotStatusLabel keeps hotspot bands distinct from review-priority labels', () => {
  assert.equal(
    getHotspotStatusLabel('critical-hotspot'),
    'Highest hotspot band'
  )
  assert.equal(
    getHotspotStatusLabel('high-review-needed'),
    'Elevated hotspot band'
  )
})
