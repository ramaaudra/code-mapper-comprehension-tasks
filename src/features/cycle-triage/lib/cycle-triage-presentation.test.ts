import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getCycleEvidenceItems,
  getCycleFixPriorityLabel,
  getCycleQueueSummary,
  getCycleSignalSummary,
  getLoopPathDefaultExpanded,
  getNearbyImportsToggleLabel
} from './cycle-triage-presentation'

import type { CycleTriageItem } from '../types/cycle-triage'

function createCycleTriageItem(
  overrides: Partial<CycleTriageItem> = {}
): CycleTriageItem {
  return {
    id: 'cycle-1',
    title: 'payment-service.ts <-> user-service.ts loop',
    routeLabel: 'payment-service.ts -> user-service.ts -> payment-service.ts',
    detectionSeverity: 'medium',
    fixPriority: 'high',
    priorityReason:
      'High priority because broad downstream usage and recent change activity overlap in the same loop.',
    priorityDrivers: ['broad downstream usage', 'recent change activity'],
    whatIsHappening:
      'This loop routes payment-service.ts and user-service.ts back into the same dependency chain.',
    whyItMatters:
      'Changes here can bounce through shared paths and widen retest scope.',
    cyclePath: [
      'src/services/payment-service.ts',
      'src/services/user-service.ts',
      'src/services/payment-service.ts'
    ],
    files: ['src/services/payment-service.ts', 'src/services/user-service.ts'],
    uniqueFileCount: 2,
    entryLikeFiles: [],
    moduleKeys: ['src/services'],
    cycleEdges: [],
    neighborEdges: [],
    nearbyFiles: [],
    suggestedInvestigation: {
      summary:
        'Inspect whether payment-service.ts and user-service.ts can depend on a shared contract instead of each other.',
      detail:
        'A two-file loop is often easiest to break by extracting shared contracts, types, or coordination code into a lower-level module.',
      confidence: 'medium'
    },
    verificationChecks: [
      'Confirm the dependency path no longer returns to the starting file.'
    ],
    ...overrides
  }
}

test('describes loading signal state explicitly', () => {
  assert.deepEqual(
    getCycleSignalSummary({ isLoading: true, hasMeasuredSignals: false }),
    {
      label: 'Loading signals…',
      detail:
        'Priority reasons are loading downstream usage and recent change signals.',
      tone: 'loading'
    }
  )
})

test('describes graph-only fallback when measured signals are unavailable', () => {
  assert.deepEqual(
    getCycleSignalSummary({ isLoading: false, hasMeasuredSignals: false }),
    {
      label: 'Graph-only priority',
      detail:
        'Priority reasons currently use graph structure only. Recent change activity is unavailable for this analysis.',
      tone: 'warning'
    }
  )
})

test('describes full signal state when architecture and change signals are ready', () => {
  assert.deepEqual(
    getCycleSignalSummary({ isLoading: false, hasMeasuredSignals: true }),
    {
      label: 'Graph + change signals',
      detail:
        'Priority reasons use downstream usage and recent change activity.',
      tone: 'ready'
    }
  )
})

test('maps fix priority to review-first language instead of raw severity', () => {
  assert.equal(getCycleFixPriorityLabel('high'), 'High Review Priority')
  assert.equal(getCycleFixPriorityLabel('medium'), 'Normal Review Priority')
  assert.equal(getCycleFixPriorityLabel('low'), 'Low Review Priority')
})

test('compresses cycle evidence into a short readable list', () => {
  assert.deepEqual(getCycleEvidenceItems(createCycleTriageItem()), [
    '2 files',
    'Used by many other files',
    'Recently active'
  ])
})

test('keeps cycle evidence focused on the most useful three signals', () => {
  assert.deepEqual(
    getCycleEvidenceItems(
      createCycleTriageItem({
        uniqueFileCount: 5,
        priorityDrivers: [
          'broad downstream usage',
          'recent change activity',
          'entry-like file involvement (index.ts)',
          'a longer loop across 5 files'
        ]
      })
    ),
    ['5 files', 'Used by many other files', 'Recently active']
  )
})

test('keeps queue evidence to one compact sentence', () => {
  assert.equal(
    getCycleQueueSummary(createCycleTriageItem()),
    '2 files, used by many other files'
  )
})

test('keeps loop path collapsed by default to reduce reading load', () => {
  assert.equal(getLoopPathDefaultExpanded(3), false)
  assert.equal(getLoopPathDefaultExpanded(5), false)
  assert.equal(getLoopPathDefaultExpanded(6), false)
})

test('includes nearby import count in the toggle label', () => {
  assert.equal(getNearbyImportsToggleLabel(0, false), 'No nearby imports')
  assert.equal(getNearbyImportsToggleLabel(4, false), 'Show nearby imports (4)')
  assert.equal(getNearbyImportsToggleLabel(4, true), 'Hide nearby imports (4)')
})
