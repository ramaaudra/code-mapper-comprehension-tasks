import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CycleQueue } from '../../../src/features/cycle-triage/components/CycleQueue'

import type { ComponentProps } from 'react'

type CycleQueueItem = ComponentProps<typeof CycleQueue>['items'][number]

function createItems(): ComponentProps<typeof CycleQueue>['items'] {
  return [createQueueItem()]
}

function createQueueItem(): CycleQueueItem {
  return {
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
}

function renderQueueHtml(): string {
  return renderToStaticMarkup(
    <CycleQueue
      items={createItems()}
      selectedCycleId='core->index->core'
      onSelect={() => {}}
    />
  )
}

function readWorkspaceSource(): string {
  return readFileSync(
    new URL(
      '../../../src/features/cycle-triage/components/CycleTriageWorkspace.tsx',
      import.meta.url
    ),
    'utf8'
  )
}

test('CycleQueue uses human-readable queue badges', () => {
  const html = renderQueueHtml()

  assert.match(html, /Includes entry wiring/)
  assert.match(html, /Used by many other files/)
  assert.doesNotMatch(html, /Entry-like/)
  assert.doesNotMatch(html, /broad downstream usage/)
})

test('CycleQueue fills the available sidebar height instead of using a fixed viewport height', () => {
  const html = renderQueueHtml()

  assert.match(html, /relative overflow-hidden h-full/)
  assert.doesNotMatch(html, /h-\[min\(70vh,720px\)\]/)
})

test('CycleTriageWorkspace keeps the review queue as a bounded sticky sidebar instead of stretching the grid height', () => {
  const source = readWorkspaceSource()

  assert.match(source, /xl:sticky/)
  assert.match(source, /xl:top-6/)
  assert.match(source, /xl:h-\[calc\(100dvh-8rem\)\]/)
  assert.match(source, /xl:self-start/)
  assert.doesNotMatch(source, /xl:max-h-\[calc\(100dvh-8rem\)\]/)
})
