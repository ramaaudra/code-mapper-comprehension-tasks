import assert from 'node:assert/strict'
import test from 'node:test'

import * as cycleTriageLib from './cycle-triage'

import type { CycleTriageItem } from '../types/cycle-triage'

function createItem(id: string, files: string[]): CycleTriageItem {
  return {
    id,
    title: `${id} title`,
    routeLabel: `${id} route`,
    detectionSeverity: 'medium',
    fixPriority: 'medium',
    priorityReason: 'priority reason',
    priorityDrivers: ['priority driver'],
    whatIsHappening: 'what is happening',
    whyItMatters: 'why it matters',
    cyclePath: [...files, files[0] ?? ''],
    files,
    uniqueFileCount: files.length,
    entryLikeFiles: [],
    moduleKeys: [],
    cycleEdges: [],
    neighborEdges: [],
    nearbyFiles: [],
    suggestedInvestigation: {
      summary: 'summary',
      detail: 'detail',
      confidence: 'medium'
    },
    verificationChecks: []
  }
}

test('filterCycleTriageItemsByFocusFile keeps only loops that include the focused file', () => {
  const items = [
    createItem('cycle-a', ['src/shared/a.ts', 'src/b.ts']),
    createItem('cycle-b', ['src/c.ts', 'src/d.ts'])
  ]

  const visibleItems = cycleTriageLib.filterCycleTriageItemsByFocusFile?.(
    items,
    'src/shared/a.ts'
  )

  assert.deepEqual(
    visibleItems?.map((item) => item.id),
    ['cycle-a']
  )
})

test('filterCycleTriageItemsByFocusFile returns all loops when no focused file is provided', () => {
  const items = [
    createItem('cycle-a', ['src/shared/a.ts', 'src/b.ts']),
    createItem('cycle-b', ['src/c.ts', 'src/d.ts'])
  ]

  const visibleItems = cycleTriageLib.filterCycleTriageItemsByFocusFile?.(
    items,
    null
  )

  assert.deepEqual(
    visibleItems?.map((item) => item.id),
    ['cycle-a', 'cycle-b']
  )
})
