import assert from 'node:assert/strict'
import test from 'node:test'

import {
  resolveTopBarActionGroups,
  resolveTopBarIconLabels
} from '../../../../src/shared/lib/utils/top-bar.ts'

test('resolveTopBarActionGroups shows help, export, and operations in live mode with data', () => {
  assert.deepEqual(
    resolveTopBarActionGroups({
      hasData: true,
      runtimeMode: 'live',
      loadError: null
    }),
    {
      showHelpGroup: true,
      showExportGroup: true,
      showOperationsGroup: true
    }
  )
})

test('resolveTopBarActionGroups keeps help in report mode but hides live-only groups', () => {
  assert.deepEqual(
    resolveTopBarActionGroups({
      hasData: true,
      runtimeMode: 'report',
      loadError: null
    }),
    {
      showHelpGroup: true,
      showExportGroup: false,
      showOperationsGroup: false
    }
  )
})

test('resolveTopBarActionGroups still surfaces load errors without analysis data', () => {
  assert.deepEqual(
    resolveTopBarActionGroups({
      hasData: false,
      runtimeMode: 'live',
      loadError: 'Failed to load analysis'
    }),
    {
      showHelpGroup: false,
      showExportGroup: false,
      showOperationsGroup: true
    }
  )
})

test('resolveTopBarIconLabels reuses shell copy for sidebar and refresh actions', () => {
  assert.deepEqual(
    resolveTopBarIconLabels({
      isTreeCollapsed: false,
      isLoading: false,
      hasChanges: true,
      totalChanges: 3
    }),
    {
      sidebarToggle: 'Hide sidebar',
      refresh: '3 files changed - click to reload'
    }
  )

  assert.deepEqual(
    resolveTopBarIconLabels({
      isTreeCollapsed: true,
      isLoading: true,
      hasChanges: false,
      totalChanges: 0
    }),
    {
      sidebarToggle: 'Show sidebar',
      refresh: 'Loading…'
    }
  )
})
