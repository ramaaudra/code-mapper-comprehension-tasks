import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createCycleReviewStorageKey,
  getAdjacentCycleId,
  getCycleReviewProgress,
  markCycleAsReviewing,
  parseCycleReviewState,
  serializeCycleReviewState,
  setCycleReviewStatus
} from './cycle-triage-review-state'

test('creates a stable storage key regardless of cycle order', () => {
  assert.equal(
    createCycleReviewStorageKey(['src/b.ts', 'src/a.ts']),
    createCycleReviewStorageKey(['src/a.ts', 'src/b.ts'])
  )
})

test('parses persisted review state while pruning invalid and stale entries', () => {
  assert.deepEqual(
    parseCycleReviewState(
      JSON.stringify({
        'src/a.ts': 'reviewed',
        'src/b.ts': 'reviewing',
        'src/c.ts': 'unreviewed',
        'src/stale.ts': 'reviewed',
        'src/invalid.ts': 'done'
      }),
      ['src/a.ts', 'src/b.ts', 'src/c.ts']
    ),
    {
      'src/a.ts': 'reviewed',
      'src/b.ts': 'reviewing'
    }
  )
})

test('marks only one pending cycle as reviewing at a time', () => {
  assert.deepEqual(
    markCycleAsReviewing(
      {
        'src/a.ts': 'reviewing',
        'src/b.ts': 'reviewed'
      },
      'src/c.ts'
    ),
    {
      'src/b.ts': 'reviewed',
      'src/c.ts': 'reviewing'
    }
  )
})

test('keeps reviewed cycles reviewed when revisited', () => {
  assert.deepEqual(
    markCycleAsReviewing(
      {
        'src/a.ts': 'reviewing',
        'src/b.ts': 'reviewed'
      },
      'src/b.ts'
    ),
    {
      'src/b.ts': 'reviewed'
    }
  )
})

test('counts reviewed, reviewing, and unreviewed cycles for progress copy', () => {
  const state = setCycleReviewStatus(
    {
      'src/a.ts': 'reviewing'
    },
    'src/b.ts',
    'reviewed'
  )

  assert.deepEqual(
    getCycleReviewProgress(state, ['src/a.ts', 'src/b.ts', 'src/c.ts']),
    {
      totalCount: 3,
      reviewedCount: 1,
      reviewingCount: 1,
      unreviewedCount: 1
    }
  )
})

test('serializes only non-default review states', () => {
  assert.equal(
    serializeCycleReviewState({
      'src/a.ts': 'reviewed',
      'src/b.ts': 'reviewing'
    }),
    JSON.stringify({
      'src/a.ts': 'reviewed',
      'src/b.ts': 'reviewing'
    })
  )
})

test('moves through the review queue deterministically for keyboard navigation', () => {
  const cycleIds = ['src/a.ts', 'src/b.ts', 'src/c.ts']

  assert.equal(getAdjacentCycleId(cycleIds, null, 'next'), 'src/a.ts')
  assert.equal(getAdjacentCycleId(cycleIds, null, 'previous'), 'src/c.ts')
  assert.equal(getAdjacentCycleId(cycleIds, 'src/a.ts', 'next'), 'src/b.ts')
  assert.equal(getAdjacentCycleId(cycleIds, 'src/c.ts', 'next'), 'src/c.ts')
  assert.equal(getAdjacentCycleId(cycleIds, 'src/b.ts', 'previous'), 'src/a.ts')
  assert.equal(getAdjacentCycleId(cycleIds, 'src/a.ts', 'previous'), 'src/a.ts')
})
