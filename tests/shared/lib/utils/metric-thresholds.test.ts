import assert from 'node:assert/strict'
import test from 'node:test'

import { metricsGuideMetrics } from '../../../../src/features/metrics-guide/content/metricsGuideContent'
import {
  blastRadiusThresholdCatalog,
  createFileReviewThresholdCalibration,
  createModuleReviewThresholdCalibration,
  formatThresholdBandRange,
  getAssessmentMethodItemsFromCatalog,
  getImpactScopeThresholds,
  getImpactScopeThresholdCatalog,
  getPropagationRiskThresholds,
  getReviewSignalDefinition,
  hotspotStatusThresholdCatalog,
  propagationRiskThresholdCatalog
} from '../../../../src/shared/lib/metric-thresholds'
import { getHotspotStatusLabel } from '../../../../src/shared/lib/utils'
import {
  getBlastRadiusLevel,
  getPropagationRiskLevel,
  getRiskLevel
} from '../../../../src/shared/lib/utils/risk'

test('impact scope catalog exposes file and module cutoffs with rationale and scientific status', () => {
  const fileThresholds = getImpactScopeThresholdCatalog('file')
  const moduleThresholds = getImpactScopeThresholdCatalog('module')

  assert.equal(fileThresholds.label, 'Impact Scope')
  assert.equal(fileThresholds.scientificStatus, 'heuristic')
  assert.ok(fileThresholds.whyItExists.length > 0)
  assert.equal(fileThresholds.bands[0]?.id, 'Broad')
  assert.equal(fileThresholds.bands[0]?.min, 15)
  assert.equal(moduleThresholds.bands[0]?.min, 30)
  assert.deepEqual(getImpactScopeThresholds('file'), { broad: 15, moderate: 5 })
  assert.deepEqual(getImpactScopeThresholds('module'), {
    broad: 30,
    moderate: 10
  })
  assert.equal(
    formatThresholdBandRange(fileThresholds.bands, 'Moderate'),
    '5 to <15'
  )
})

test('risk and blast-radius utilities stay aligned with the shared threshold catalog', () => {
  const criticalRiskBand = propagationRiskThresholdCatalog.bands[0]
  const highBlastRadiusBand = blastRadiusThresholdCatalog.bands[1]

  assert.ok(criticalRiskBand)
  assert.ok(highBlastRadiusBand)
  assert.equal(getRiskLevel(criticalRiskBand.min), 'critical')
  assert.equal(getBlastRadiusLevel(highBlastRadiusBand.min, false), 'high')
})

test('repo-relative file calibration derives impact, change, and blast-radius bands from positive repository samples', () => {
  const calibration = createFileReviewThresholdCalibration({
    impactScopeValues: [0, 1, 2, 4, 8, 12],
    changePressureValues: [0, 0.02, 0.04, 0.08, 0.12, 0.18],
    externalRelianceValues: [0, 1, 2, 5, 9, 13],
    blastRadiusValues: [0, 0.5, 1, 2, 3, 6]
  })

  assert.equal(calibration.impactScope.file?.calibrationMode, 'repo-relative')
  assert.equal(
    calibration.changePressure.file?.calibrationMode,
    'repo-relative'
  )
  assert.equal(
    calibration.externalReliance.file?.calibrationMode,
    'repo-relative'
  )
  assert.equal(calibration.blastRadius?.calibrationMode, 'repo-relative')
  assert.deepEqual(getImpactScopeThresholds('file', calibration), {
    broad: 12,
    moderate: 4
  })
  assert.equal(getBlastRadiusLevel(3, false, calibration), 'high')
})

test('file calibration tolerates omitted optional signal samples and falls back safely', () => {
  const calibration = createFileReviewThresholdCalibration({
    impactScopeValues: [0, 1, 2, 4, 8, 12],
    changePressureValues: [0, 0.02, 0.04, 0.08, 0.12, 0.18]
  })

  assert.equal(calibration.externalReliance.file?.calibrationMode, 'static')
  assert.equal(calibration.blastRadius?.calibrationMode, 'static')
})

test('repo-relative calibration falls back to static bands when positive samples are flat and non-discriminative', () => {
  const calibration = createFileReviewThresholdCalibration({
    impactScopeValues: [2, 2, 2, 2, 2],
    changePressureValues: [0.08, 0.08, 0.08, 0.08, 0.08],
    externalRelianceValues: [3, 3, 3, 3, 3],
    blastRadiusValues: [2, 2, 2, 2, 2]
  })

  assert.equal(calibration.impactScope.file?.calibrationMode, 'static')
  assert.equal(calibration.changePressure.file?.calibrationMode, 'static')
  assert.equal(calibration.externalReliance.file?.calibrationMode, 'static')
  assert.equal(calibration.blastRadius?.calibrationMode, 'static')
  assert.equal(
    formatThresholdBandRange(
      calibration.impactScope.file?.bands ?? [],
      'Moderate'
    ),
    '5 to <15'
  )
})

test('repo-relative module calibration falls back to static bands when repository samples are too small', () => {
  const calibration = createModuleReviewThresholdCalibration({
    impactScopeValues: [0, 2, 4],
    changePressureValues: [0, 0.03, 0.08],
    externalRelianceValues: [0, 1, 2],
    propagationRiskValues: [0, 2, 4]
  })

  assert.equal(calibration.impactScope.module?.calibrationMode, 'static')
  assert.equal(calibration.changePressure.module?.calibrationMode, 'static')
  assert.equal(calibration.externalReliance.module?.calibrationMode, 'static')
  assert.equal(calibration.propagationRisk?.calibrationMode, 'static')
  assert.deepEqual(getImpactScopeThresholds('module', calibration), {
    broad: 30,
    moderate: 10
  })
})

test('repo-relative module calibration derives propagation-risk cutoffs from repository module scores', () => {
  const calibration = createModuleReviewThresholdCalibration({
    impactScopeValues: [0, 2, 4, 8, 13, 21],
    changePressureValues: [0, 0.01, 0.02, 0.05, 0.09, 0.14],
    externalRelianceValues: [0, 1, 3, 5, 9, 13],
    propagationRiskValues: [0, 1, 3, 6, 11, 18, 31]
  })

  assert.equal(calibration.propagationRisk?.calibrationMode, 'repo-relative')
  assert.deepEqual(getPropagationRiskThresholds(calibration), {
    CRITICAL: 31,
    HIGH: 18,
    MEDIUM: 6
  })
  assert.equal(getPropagationRiskLevel(18, calibration), 'high')
})

test('catalog exposes scientific status, rationale, and assessment method copy', () => {
  const blastRadiusDefinition = getReviewSignalDefinition('blastRadius')
  const assessmentMethodItems = getAssessmentMethodItemsFromCatalog()

  assert.equal(blastRadiusDefinition.scientificStatus, 'heuristic')
  assert.match(blastRadiusDefinition.whyItExists, /verification[- ]scope/i)
  assert.deepEqual(assessmentMethodItems, [
    'Change Activity uses Relative Churn (30d).',
    'Impact Scope uses Dependents (Ca).',
    'Dependencies uses Ce.',
    'Architecture Role uses Instability (I).',
    'Decision labels are product heuristics built from repository signals, not universal scientific thresholds.'
  ])
})

test('hotspot labels and metrics guide caveats reuse hotspot catalog language', () => {
  const hotspotMetric = metricsGuideMetrics.find(
    (metric) => metric.id === 'hotspot-status'
  )
  const blastRadiusMetric = metricsGuideMetrics.find(
    (metric) => metric.id === 'blast-radius'
  )

  assert.ok(hotspotMetric)
  assert.ok(blastRadiusMetric)
  assert.equal(
    getHotspotStatusLabel('critical-hotspot'),
    hotspotStatusThresholdCatalog.bands[0]?.label
  )
  assert.equal(
    hotspotMetric.caveat,
    hotspotStatusThresholdCatalog.scientificStatusNote
  )
  assert.equal(
    blastRadiusMetric.caveat,
    getReviewSignalDefinition('blastRadius').scientificStatusNote
  )
})
