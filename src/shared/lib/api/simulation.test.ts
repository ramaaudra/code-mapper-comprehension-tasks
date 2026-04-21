import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeSimulationResponse } from './simulation-normalization'

test('normalizeSimulationResponse falls back to empty lists for partial payloads', () => {
  assert.deepEqual(normalizeSimulationResponse(undefined), {
    brokenFiles: [],
    newOrphans: []
  })

  assert.deepEqual(normalizeSimulationResponse({ brokenFiles: ['src/a.ts'] }), {
    brokenFiles: ['src/a.ts'],
    newOrphans: []
  })

  assert.deepEqual(
    normalizeSimulationResponse({
      brokenFiles: ['src/a.ts', 42 as never],
      newOrphans: ['src/b.ts', null as never]
    }),
    {
      brokenFiles: ['src/a.ts'],
      newOrphans: ['src/b.ts']
    }
  )
})
