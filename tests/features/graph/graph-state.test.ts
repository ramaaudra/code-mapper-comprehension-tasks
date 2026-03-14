import assert from 'node:assert/strict'
import test from 'node:test'

import { createGraphStatusSignature } from '../../../src/features/graph/lib/graph-state'

test('createGraphStatusSignature is order-insensitive but changes when simulation state changes', () => {
  const stableSignature = createGraphStatusSignature({
    filesInCycle: new Set(['src/a.ts', 'src/b.ts']),
    orphanFilesSet: new Set(['src/c.ts']),
    brokenFilesSet: new Set(),
    newOrphansSet: new Set()
  })
  const reorderedSignature = createGraphStatusSignature({
    filesInCycle: new Set(['src/b.ts', 'src/a.ts']),
    orphanFilesSet: new Set(['src/c.ts']),
    brokenFilesSet: new Set(),
    newOrphansSet: new Set()
  })
  const simulatedSignature = createGraphStatusSignature({
    filesInCycle: new Set(['src/a.ts', 'src/b.ts']),
    orphanFilesSet: new Set(['src/c.ts']),
    brokenFilesSet: new Set(['src/d.ts']),
    newOrphansSet: new Set()
  })

  assert.equal(stableSignature, reorderedSignature)
  assert.notEqual(stableSignature, simulatedSignature)
})
