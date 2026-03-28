import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveNodeDetailCycleTriageSummary } from './cycle-triage-link'

import type { CircularDependencyInfo } from '@/shared/types/analysis'

function createCycle(
  overrides: Partial<Pick<CircularDependencyInfo, 'cycle' | 'files'>> = {}
): CircularDependencyInfo {
  return {
    cycle: overrides.cycle ?? ['src/a.ts', 'src/b.ts', 'src/a.ts'],
    length: 3,
    files: overrides.files ?? ['src/a.ts', 'src/b.ts'],
    severity: 'medium'
  }
}

test('resolveNodeDetailCycleTriageSummary returns a direct cycle CTA when one related cycle exists', () => {
  const summary = resolveNodeDetailCycleTriageSummary({
    filePath: 'src/a.ts',
    cycles: [createCycle()]
  })

  assert.deepEqual(summary, {
    relatedCycleCount: 1,
    selectedCycleId: 'src/a.ts->src/b.ts->src/a.ts',
    title: '1 related dependency cycle',
    description:
      'This file is part of 1 detected dependency cycle. Open cycle triage to inspect the full loop before changing this file.',
    actionLabel: 'Open related cycle'
  })
})

test('resolveNodeDetailCycleTriageSummary returns a review CTA when multiple related cycles exist', () => {
  const summary = resolveNodeDetailCycleTriageSummary({
    filePath: 'src/shared/a.ts',
    cycles: [
      createCycle({
        cycle: ['src/shared/a.ts', 'src/b.ts', 'src/shared/a.ts'],
        files: ['src/shared/a.ts', 'src/b.ts']
      }),
      createCycle({
        cycle: ['src/c.ts', 'src/shared/a.ts', 'src/d.ts', 'src/c.ts'],
        files: ['src/c.ts', 'src/shared/a.ts', 'src/d.ts']
      })
    ]
  })

  assert.deepEqual(summary, {
    relatedCycleCount: 2,
    selectedCycleId: null,
    title: '2 related dependency cycles',
    description:
      'This file appears in 2 detected dependency cycles. Open cycle triage to compare the loops and decide which one to inspect first.',
    actionLabel: 'Review related cycles (2)'
  })
})

test('resolveNodeDetailCycleTriageSummary returns null when the file has no related cycles', () => {
  const summary = resolveNodeDetailCycleTriageSummary({
    filePath: 'src/z.ts',
    cycles: [createCycle()]
  })

  assert.equal(summary, null)
})
