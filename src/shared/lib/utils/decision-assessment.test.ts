import assert from 'node:assert/strict'
import test from 'node:test'

import { createDecisionAssessment } from './decision-assessment'

test('createDecisionAssessment explains module cycles as cycle member files', () => {
  const assessment = createDecisionAssessment({
    kind: 'module',
    hasCycle: true,
    ca: 6,
    ce: 3,
    instability: 0.33,
    relativeChurn30d: 0,
    changeHistoryAvailable: false
  })

  assert.equal(
    assessment.summary,
    'This module contains files involved in a circular dependency and needs careful review.'
  )
  assert.equal(
    assessment.basisSummary,
    'Based on cycle member files and downstream impact. Git history is unavailable for recent change signals.'
  )
  assert.equal(
    assessment.topDrivers[0],
    'This module contains files involved in a circular dependency.'
  )
})

test('createDecisionAssessment keeps direct cycle wording for files', () => {
  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle: true,
    ca: 2,
    ce: 2,
    instability: 0.5,
    relativeChurn30d: 0,
    changeHistoryAvailable: false
  })

  assert.equal(
    assessment.summary,
    'This file sits in a circular dependency and needs careful review.'
  )
  assert.equal(
    assessment.basisSummary,
    'Based on cycle participation and downstream impact. Git history is unavailable for recent change signals.'
  )
})
