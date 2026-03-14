import assert from 'node:assert/strict'
import test from 'node:test'

import {
  resolveBlastRadiusRole,
  resolveNodeDetailOverviewState,
  resolveNodeDetailSourceState,
  resolveSourceTabBadge,
  shouldShowTracePathAction
} from '../../../src/features/node-detail/lib/panel-state'

test('resolveBlastRadiusRole keeps blast radius as supporting signal when architecture metrics exist', () => {
  assert.equal(
    resolveBlastRadiusRole({
      hasArchitectureMetrics: true
    }),
    'supporting'
  )
  assert.equal(
    resolveBlastRadiusRole({
      hasArchitectureMetrics: false
    }),
    'hidden'
  )
})

test('resolveNodeDetailOverviewState keeps diagnosis visible even when evolution is missing', () => {
  assert.deepEqual(
    resolveNodeDetailOverviewState({
      hasDecisionAssessment: true,
      hasArchitectureMetrics: true,
      hasEvolutionMetrics: false
    }),
    {
      showDiagnosis: true,
      showDiagnosisUnavailableState: false,
      showBlastRadius: true,
      showWhyDisclosure: true,
      showArchitectureMetrics: true,
      showEvolutionMetrics: false
    }
  )
})

test('resolveNodeDetailOverviewState surfaces an explicit unavailable state when diagnosis cannot be created', () => {
  assert.deepEqual(
    resolveNodeDetailOverviewState({
      hasDecisionAssessment: false,
      hasArchitectureMetrics: false,
      hasEvolutionMetrics: true
    }),
    {
      showDiagnosis: false,
      showDiagnosisUnavailableState: true,
      showBlastRadius: false,
      showWhyDisclosure: false,
      showArchitectureMetrics: false,
      showEvolutionMetrics: true
    }
  )
})

test('resolveNodeDetailSourceState prioritizes report mode over loading and content states', () => {
  assert.equal(
    resolveNodeDetailSourceState({
      isReportMode: true,
      isLoadingContent: true,
      hasContentError: true,
      hasFileContent: true
    }),
    'report'
  )
})

test('resolveSourceTabBadge hides misleading line counts in report mode and falls back cleanly in live mode', () => {
  assert.equal(
    resolveSourceTabBadge({
      isReportMode: true,
      fileContentLines: 120,
      fallbackEstimatedLines: 80
    }),
    null
  )
  assert.equal(
    resolveSourceTabBadge({
      isReportMode: false,
      fileContentLines: 120,
      fallbackEstimatedLines: 80
    }),
    '120'
  )
  assert.equal(
    resolveSourceTabBadge({
      isReportMode: false,
      fileContentLines: null,
      fallbackEstimatedLines: 80
    }),
    '80'
  )
})

test('shouldShowTracePathAction disables trace path in report mode', () => {
  assert.equal(shouldShowTracePathAction(true), false)
  assert.equal(shouldShowTracePathAction(false), true)
})
