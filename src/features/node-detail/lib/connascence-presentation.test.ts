import assert from 'node:assert/strict'
import test from 'node:test'

import { buildNodeDetailConnascenceItems } from './connascence-presentation'

const positionalSignal = {
  kind: 'fragile-positional-api' as const,
  signalKey: 'fragile-positional-api:/repo/contract.ts#createUser',
  title: 'Fragile Positional API' as const,
  symbolName: 'createUser',
  declarationPreview:
    'createUser(name: string, role: string, isActive: boolean, city: string)',
  declaredIn: '/repo/contract.ts',
  targetFiles: ['/repo/caller-a.ts', '/repo/caller-b.ts'],
  requiredParamCount: 4,
  callerCount: 2,
  moduleBoundaryCount: 2,
  severity: 'high' as const,
  confidence: 'high' as const,
  whyItMatters:
    'This exported API relies on argument order across 2 cross-file call sites.',
  recommendedAction:
    'Review the linked call sites before changing the signature.',
  evidence: []
}

const sharedTypeSignal = {
  kind: 'shared-type-contract' as const,
  signalKey: 'shared-type-contract:/repo/contracts.ts#SharedUser',
  title: 'Shared Type Contract' as const,
  typeName: 'SharedUser',
  declarationPreview: 'SharedUser { id, name }',
  declaredIn: '/repo/contracts.ts',
  targetFiles: ['/repo/consumer-a.ts', '/repo/consumer-b.ts'],
  importerCount: 2,
  moduleBoundaryCount: 1,
  severity: 'medium' as const,
  confidence: 'high' as const,
  usageKind: 'parameter' as const,
  whyItMatters: 'This exported type acts as a shared contract.',
  recommendedAction: 'Inspect all linked consumers before changing this shape.',
  evidence: []
}

test('buildNodeDetailConnascenceItems keeps action-oriented copy for positional and type signals', () => {
  const items = buildNodeDetailConnascenceItems([
    positionalSignal,
    sharedTypeSignal
  ])

  assert.equal(items.length, 2)
  assert.equal(items[0]?.headline, 'createUser depends on argument order')
  assert.equal(items[0]?.scopeLabel, 'Cross-module')
  assert.equal(items[0]?.reviewTargetsLabel, '2 caller files')
  assert.equal(
    items[0]?.declarationPreview,
    'createUser(name: string, role: string, isActive: boolean, city: string)'
  )
  assert.equal(items[0]?.relatedFiles[0]?.basename, 'caller-a.ts')
  assert.equal(items[0]?.primaryActionLabel, 'Open Used By tab')
  assert.equal(items[0]?.secondaryActionLabel, 'Focus in graph')
  assert.equal(items[1]?.headline, 'SharedUser is a shared type contract')
  assert.equal(items[1]?.declarationPreview, 'SharedUser { id, name }')
  assert.equal(items[1]?.scopeLabel, 'Mostly local')
  assert.equal(items[1]?.reviewTargetsLabel, '2 consumer files')
  assert.equal(items[0]?.impactSummary.includes('2 caller files'), true)
  assert.equal(items[1]?.impactSummary.includes('2 consumer files'), true)
})

test('buildNodeDetailConnascenceItems hides low-confidence signals', () => {
  const items = buildNodeDetailConnascenceItems([
    { ...positionalSignal, confidence: 'low' as const }
  ])

  assert.equal(items.length, 0)
})

test('buildNodeDetailConnascenceItems hides signals without usable rationale or action', () => {
  const items = buildNodeDetailConnascenceItems([
    {
      ...sharedTypeSignal,
      whyItMatters: '',
      recommendedAction: ''
    }
  ])

  assert.equal(items.length, 0)
})
