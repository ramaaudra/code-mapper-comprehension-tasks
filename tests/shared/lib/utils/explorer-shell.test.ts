import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildMetricsGuideHash,
  parseMetricsGuideHash,
  resolveExplorerContextChip
} from '../../../../src/shared/lib/utils/explorer-shell.ts'

test('parseMetricsGuideHash defaults to quick mode when no explicit mode is provided', () => {
  assert.deepEqual(parseMetricsGuideHash('#metrics-guide'), {
    mode: 'quick'
  })
})

test('parseMetricsGuideHash reads reference mode and section from hash', () => {
  assert.deepEqual(parseMetricsGuideHash('#metrics-guide/reference/glossary'), {
    mode: 'reference',
    section: 'glossary'
  })
})

test('buildMetricsGuideHash builds hashes with optional sections', () => {
  assert.equal(buildMetricsGuideHash('quick'), '#metrics-guide/quick')
  assert.equal(
    buildMetricsGuideHash('reference', 'core-metrics'),
    '#metrics-guide/reference/core-metrics'
  )
})

test('resolveExplorerContextChip only surfaces non-default graph context', () => {
  assert.deepEqual(
    resolveExplorerContextChip({
      viewMode: 'graph',
      graphViewMode: 'file',
      currentHash: '',
      hasUnresolvedImports: false
    }),
    null
  )

  assert.deepEqual(
    resolveExplorerContextChip({
      viewMode: 'graph',
      graphViewMode: 'module',
      currentHash: '',
      hasUnresolvedImports: false
    }),
    { label: 'Graph: Module View' }
  )
})

test('resolveExplorerContextChip hides guide mode because the page already explains it', () => {
  assert.equal(
    resolveExplorerContextChip({
      viewMode: 'metrics-guide',
      graphViewMode: 'file',
      currentHash: '#metrics-guide/quick',
      hasUnresolvedImports: false
    }),
    null
  )
})

test('resolveExplorerContextChip hides setup status because the button and page already carry it', () => {
  assert.equal(
    resolveExplorerContextChip({
      viewMode: 'setup-guide',
      graphViewMode: 'file',
      currentHash: '',
      hasUnresolvedImports: true
    }),
    null
  )
})
