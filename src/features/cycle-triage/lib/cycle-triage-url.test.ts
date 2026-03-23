import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildCycleTriageSearch,
  parseCycleTriageSearch
} from './cycle-triage-url'

test('parses cycle triage search state from query params', () => {
  assert.deepEqual(
    parseCycleTriageSearch('?view=cycle-triage&cycle=src%2Fa.ts&nearby=1'),
    {
      viewMode: 'cycle-triage',
      selectedCycleId: 'src/a.ts',
      showNearbyImports: true
    }
  )
})

test('ignores triage params when the view is not cycle triage', () => {
  assert.deepEqual(parseCycleTriageSearch('?view=overview&cycle=abc'), {
    viewMode: null,
    selectedCycleId: null,
    showNearbyImports: false
  })
})

test('builds search params for cycle triage while preserving unrelated params', () => {
  assert.equal(
    buildCycleTriageSearch('?foo=bar', {
      viewMode: 'cycle-triage',
      selectedCycleId: 'src/a.ts->src/b.ts',
      showNearbyImports: true
    }),
    '?foo=bar&view=cycle-triage&cycle=src%2Fa.ts-%3Esrc%2Fb.ts&nearby=1'
  )
})

test('removes triage params when leaving the triage workspace', () => {
  assert.equal(
    buildCycleTriageSearch('?foo=bar&view=cycle-triage&cycle=abc&nearby=1', {
      viewMode: 'overview',
      selectedCycleId: null,
      showNearbyImports: false
    }),
    '?foo=bar'
  )
})
