import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildCycleTriageSearch,
  parseCycleTriageSearch
} from './cycle-triage-url'

test('parseCycleTriageSearch reads the focused file path for cycle triage', () => {
  const state = parseCycleTriageSearch(
    '?view=cycle-triage&cycle=cycle-1&cycleFile=src%2Fshared%2Fa.ts&nearby=1'
  ) as ReturnType<typeof parseCycleTriageSearch> & {
    focusFilePath?: string | null
  }

  assert.deepEqual(state, {
    viewMode: 'cycle-triage',
    selectedCycleId: 'cycle-1',
    focusFilePath: 'src/shared/a.ts',
    showNearbyImports: true
  })
})

test('buildCycleTriageSearch keeps the focused file path only in cycle triage view', () => {
  const cycleTriageSearch = buildCycleTriageSearch('?foo=1', {
    viewMode: 'cycle-triage',
    selectedCycleId: 'cycle-1',
    showNearbyImports: false,
    focusFilePath: 'src/shared/a.ts'
  } as Parameters<typeof buildCycleTriageSearch>[1] & {
    focusFilePath: string | null
  })

  assert.equal(
    cycleTriageSearch,
    '?foo=1&view=cycle-triage&cycle=cycle-1&cycleFile=src%2Fshared%2Fa.ts'
  )

  const overviewSearch = buildCycleTriageSearch(cycleTriageSearch, {
    viewMode: 'overview',
    selectedCycleId: null,
    showNearbyImports: false,
    focusFilePath: null
  } as Parameters<typeof buildCycleTriageSearch>[1] & {
    focusFilePath: string | null
  })

  assert.equal(overviewSearch, '?foo=1')
})
