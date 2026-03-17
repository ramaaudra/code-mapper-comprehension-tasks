import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CycleQueue } from '../../../src/features/cycle-triage/components/CycleQueue'

import type { ComponentProps } from 'react'

function createItems(): ComponentProps<typeof CycleQueue>['items'] {
  return [
    {
      id: 'core->index->core',
      title: 'core.ts <-> index.ts loop',
      routeLabel: 'core.ts -> index.ts -> core.ts',
      fixPriority: 'high',
      priorityReason:
        'High priority because broad downstream usage and entry-like file involvement (index.ts).',
      priorityDrivers: [
        'broad downstream usage',
        'entry-like file involvement (index.ts)'
      ],
      whatIsHappening: '',
      whyItMatters: '',
      cyclePath: ['src/core.ts', 'src/index.ts', 'src/core.ts'],
      files: ['src/core.ts', 'src/index.ts'],
      uniqueFileCount: 2,
      entryLikeFiles: ['src/index.ts'],
      moduleKeys: ['src'],
      cycleEdges: [
        { source: 'src/core.ts', target: 'src/index.ts' },
        { source: 'src/index.ts', target: 'src/core.ts' }
      ],
      neighborEdges: [],
      nearbyFiles: [],
      suggestedInvestigation: {
        summary: '',
        detail: '',
        confidence: 'high',
        candidateEdge: {
          source: 'src/core.ts',
          target: 'src/index.ts'
        }
      },
      verificationChecks: []
    }
  ]
}

test('CycleQueue uses human-readable queue badges', () => {
  const html = renderToStaticMarkup(
    <CycleQueue
      items={createItems()}
      selectedCycleId='core->index->core'
      onSelect={() => {}}
    />
  )

  assert.match(html, /Includes entry wiring/)
  assert.match(html, /Used by many other files/)
  assert.doesNotMatch(html, /Entry-like/)
  assert.doesNotMatch(html, /broad downstream usage/)
})
