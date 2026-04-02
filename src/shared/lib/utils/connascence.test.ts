import assert from 'node:assert/strict'
import test from 'node:test'

import {
  filterVisibleConnascenceSignals,
  hasActionableConnascenceGuidance,
  getFileConnascenceSignals,
  getModuleConnascenceSignals,
  getConnascenceHeadline,
  getConnascenceImpactSummary,
  getConnascenceReviewTargetsLabel,
  getConnascenceScopeLabel
} from './connascence'

const positionSignal = {
  kind: 'fragile-positional-api' as const,
  signalKey: 'fragile-positional-api:/repo/contract.ts#createUser',
  title: 'Fragile Positional API' as const,
  symbolName: 'createUser',
  declaredIn: '/repo/contract.ts',
  targetFiles: ['/repo/caller-a.ts', '/repo/caller-b.ts'],
  requiredParamCount: 4,
  callerCount: 2,
  moduleBoundaryCount: 2,
  severity: 'high' as const,
  confidence: 'high' as const,
  whyItMatters:
    'This exported API relies on argument order across cross-file callers.',
  recommendedAction: 'Review the linked call sites before changing it.',
  evidence: []
}

const lowConfidenceSignal = {
  ...positionSignal,
  signalKey: 'fragile-positional-api:/repo/contract.ts#createDraftUser',
  symbolName: 'createDraftUser',
  confidence: 'low' as const
}

const sharedTypeSignal = {
  kind: 'shared-type-contract' as const,
  signalKey: 'shared-type-contract:/repo/contracts.ts#SharedUser',
  title: 'Shared Type Contract' as const,
  typeName: 'SharedUser',
  declaredIn: '/repo/contracts.ts',
  targetFiles: ['/repo/consumer-a.ts', '/repo/consumer-b.ts'],
  importerCount: 2,
  moduleBoundaryCount: 1,
  severity: 'medium' as const,
  confidence: 'high' as const,
  usageKind: 'parameter' as const,
  whyItMatters: 'This exported type is acting as a shared contract.',
  recommendedAction: 'Inspect all linked consumers before changing this shape.',
  evidence: []
}

test('filterVisibleConnascenceSignals hides low-confidence signals and deduplicates by signalKey', () => {
  const visible = filterVisibleConnascenceSignals([
    positionSignal,
    lowConfidenceSignal,
    { ...positionSignal }
  ])

  assert.equal(visible.length, 1)
  assert.equal(visible[0]?.signalKey, positionSignal.signalKey)
})

test('getFileConnascenceSignals prefers architecture payload and falls back to analysis data', () => {
  const fromArchitecture = getFileConnascenceSignals({
    filePath: '/repo/contract.ts',
    architectureSignals: [positionSignal],
    analysisFileSignals: {
      '/repo/contract.ts': [sharedTypeSignal]
    }
  })

  const fromAnalysis = getFileConnascenceSignals({
    filePath: '/repo/contracts.ts',
    architectureSignals: [],
    analysisFileSignals: {
      '/repo/contracts.ts': [sharedTypeSignal]
    }
  })

  assert.equal(fromArchitecture[0]?.signalKey, positionSignal.signalKey)
  assert.equal(fromAnalysis[0]?.signalKey, sharedTypeSignal.signalKey)
})

test('getModuleConnascenceSignals returns deduplicated module signals', () => {
  const signals = getModuleConnascenceSignals([
    sharedTypeSignal,
    { ...sharedTypeSignal }
  ])

  assert.equal(signals.length, 1)
  assert.equal(signals[0]?.signalKey, sharedTypeSignal.signalKey)
})

test('hasActionableConnascenceGuidance requires both explanation and action wording', () => {
  assert.equal(hasActionableConnascenceGuidance(positionSignal), true)
  assert.equal(
    hasActionableConnascenceGuidance({
      ...sharedTypeSignal,
      whyItMatters: '   '
    }),
    false
  )
  assert.equal(
    hasActionableConnascenceGuidance({
      ...sharedTypeSignal,
      recommendedAction: ''
    }),
    false
  )
})

test('connascence copy helpers prefer concrete subject and review labels', () => {
  assert.equal(
    getConnascenceHeadline(positionSignal),
    'createUser depends on argument order'
  )
  assert.equal(getConnascenceScopeLabel(positionSignal), 'Cross-module')
  assert.equal(
    getConnascenceReviewTargetsLabel(positionSignal),
    '2 caller files'
  )
  assert.equal(
    getConnascenceImpactSummary(sharedTypeSignal),
    'Changing this shared type may require updates in 2 consumer files.'
  )
  assert.equal(getConnascenceScopeLabel(sharedTypeSignal), 'Mostly local')
})
