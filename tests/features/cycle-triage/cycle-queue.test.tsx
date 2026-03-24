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

function readQueueSource(): string {
  return readFileSync(
    new URL(
      '../../../src/features/cycle-triage/components/CycleQueue.tsx',
      import.meta.url
    ),
    'utf8'
  )
}

function readGraphSource(): string {
  return readFileSync(
    new URL(
      '../../../src/features/cycle-triage/components/CycleGraph.tsx',
      import.meta.url
    ),
    'utf8'
  )
}

function countOccurrences(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0
}

test('CycleQueue keeps queue evidence compact and decision-first', () => {
  const html = renderQueueHtml()

  assert.match(html, /2 files, used by many other files/)
  assert.doesNotMatch(html, /High review priority/)
  assert.doesNotMatch(
    html,
    /High priority because broad downstream usage and entry-like file involvement/
  )
  assert.doesNotMatch(html, /Currently reviewing/)
  assert.doesNotMatch(html, /1 module area/)
  assert.doesNotMatch(html, /Touches entry wiring \(index\.ts\)/)
})

test('CycleQueue removes repeated status labels from the sidebar row', () => {
  const html = renderQueueHtml()

  assert.doesNotMatch(html, /High review priority/)
  assert.doesNotMatch(html, /Currently reviewing/)
})

test('CycleQueue avoids a secondary reason paragraph in the sidebar row', () => {
  const html = renderQueueHtml()
  const source = readQueueSource()

  assert.doesNotMatch(html, /line-clamp-2/)
  assert.doesNotMatch(source, /CycleEvidenceList/)
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

test('CycleTriageWorkspace removes internal detection labels from the primary surface', () => {
  const source = readWorkspaceSource()

  assert.doesNotMatch(source, /Detection model/)
  assert.doesNotMatch(source, /Detection severity:/)
})

test('CycleTriageWorkspace removes repeated helper copy from the primary reading path', () => {
  const source = readWorkspaceSource()

  assert.doesNotMatch(source, /signalSummary\.detail/)
  assert.doesNotMatch(source, /cycleTriageCopy\.queue\.keyboardHint/)
  assert.doesNotMatch(source, /cycleTriageCopy\.detail\.whyPrioritized/)
  assert.doesNotMatch(source, /cycleTriageCopy\.detail\.nearbyHint/)
  assert.doesNotMatch(source, /cycleTriageCopy\.page\.description/)
  assert.doesNotMatch(source, /cycleTriageCopy\.queue\.description/)
  assert.doesNotMatch(source, /cycleTriageCopy\.detail\.whatIsHappening/)
})

test('CycleTriageWorkspace places suggested investigation before the graph section', () => {
  const source = readWorkspaceSource()
  const suggestedIndex = source.indexOf('{startHereSummary}')
  const graphIndex = source.indexOf('cycleTriageCopy.detail.cycleGraph')

  assert.notEqual(suggestedIndex, -1)
  assert.notEqual(graphIndex, -1)
  assert.ok(suggestedIndex < graphIndex)
})

test('CycleTriageWorkspace avoids repeating first-step labels in the action card', () => {
  const source = readWorkspaceSource()

  assert.doesNotMatch(source, /cycleTriageCopy\.detail\.startHere/)
  assert.doesNotMatch(source, /cycleTriageCopy\.detail\.recommendedEdgeHint/)
  assert.equal(
    countOccurrences(source, /item\.suggestedInvestigation\.summary/g),
    1
  )
})

test('CycleTriageWorkspace normalizes the primary surface with shared priority and disclosure primitives', () => {
  const source = readWorkspaceSource()

  assert.match(source, /<ReviewPriorityBadge priority=\{fixPriorityLabel\} \/>/)
  assert.match(source, /<DetailPanelDisclosure/)
  assert.doesNotMatch(source, /border-amber-500\/25 bg-amber-500/)
})

test('CycleGraph tucks nearby route lists behind progressive disclosure', () => {
  const source = readGraphSource()

  assert.match(source, /<details/)
  assert.match(source, /cycleTriageCopy\.detail\.nearbyRoutes/)
})
