import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveNodeDetailSupportingSignals } from '../../../src/features/node-detail/lib/supporting-signals'

import type { FileArchitectureMetrics } from '../../../src/features/architecture/types/architecture'
import type { RiskLevel } from '../../../src/shared/types/risk'

function createArchMetrics(
  overrides: Partial<FileArchitectureMetrics> = {}
): FileArchitectureMetrics {
  return {
    filePath: 'src/example.ts',
    moduleKey: 'src',
    ca: 0,
    ce: 0,
    instability: 0.5,
    hasCycle: false,
    evolution: undefined,
    ...overrides
  }
}

function createBlastRadiusAssessment(
  overrides: Partial<{
    riskScore: number
    level: RiskLevel
    isInCycle: boolean
  }> = {}
) {
  return {
    riskScore: 1.5,
    level: 'medium' as RiskLevel,
    isInCycle: false,
    ...overrides
  }
}

test('resolveNodeDetailSupportingSignals hides supporting signals when cycle is the only signal left', () => {
  const signals = resolveNodeDetailSupportingSignals({
    decisionTitle: 'Circular Dependency',
    isPossiblyUnreachable: false,
    archMetrics: createArchMetrics(),
    blastRadiusAssessment: createBlastRadiusAssessment({
      isInCycle: true,
      level: 'low',
      riskScore: 0.5
    })
  })

  assert.deepEqual(signals, [])
})

test('resolveNodeDetailSupportingSignals keeps unreachable nuance when cycle is already primary', () => {
  const signals = resolveNodeDetailSupportingSignals({
    decisionTitle: 'Circular Dependency',
    isPossiblyUnreachable: true,
    archMetrics: createArchMetrics(),
    blastRadiusAssessment: createBlastRadiusAssessment({
      isInCycle: true,
      level: 'low',
      riskScore: 0.5
    })
  })

  assert.deepEqual(
    signals.map((signal) => signal.id),
    ['unreachable']
  )
})

test('resolveNodeDetailSupportingSignals keeps orthogonal structural warnings in stable order', () => {
  const signals = resolveNodeDetailSupportingSignals({
    decisionTitle: 'Circular Dependency',
    isPossiblyUnreachable: true,
    archMetrics: createArchMetrics({
      ca: 21,
      ce: 16
    }),
    blastRadiusAssessment: createBlastRadiusAssessment({
      isInCycle: true,
      level: 'medium',
      riskScore: 7
    })
  })

  assert.deepEqual(
    signals.map((signal) => signal.id),
    ['unreachable', 'verification-scope', 'god-object', 'bottleneck']
  )
})

test('resolveNodeDetailSupportingSignals suppresses weak low-blast-radius noise for non-cycle files', () => {
  const signals = resolveNodeDetailSupportingSignals({
    decisionTitle: 'Likely Local Change',
    isPossiblyUnreachable: false,
    archMetrics: createArchMetrics(),
    blastRadiusAssessment: createBlastRadiusAssessment({
      level: 'low',
      riskScore: 0.5
    })
  })

  assert.deepEqual(signals, [])
})
