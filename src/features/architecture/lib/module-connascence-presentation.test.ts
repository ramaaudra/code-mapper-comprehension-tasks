import assert from 'node:assert/strict'
import test from 'node:test'

import { buildModuleConnascenceItems } from './module-connascence-presentation'

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

test('buildModuleConnascenceItems deduplicates repeated signals and keeps action wording', () => {
  const items = buildModuleConnascenceItems([
    sharedTypeSignal,
    { ...sharedTypeSignal }
  ])

  assert.equal(items.length, 1)
  assert.equal(items[0]?.headline, 'SharedUser is a shared type contract')
  assert.equal(items[0]?.declarationFile.basename, 'contracts.ts')
  assert.equal(items[0]?.relatedFiles[0]?.basename, 'consumer-a.ts')
  assert.equal(items[0]?.reviewTargetsLabel, '2 consumer files')
  assert.equal(
    items[0]?.nextStep.includes('Inspect all linked consumers'),
    true
  )
})
