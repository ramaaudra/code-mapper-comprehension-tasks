import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CycleGraph } from '../../../src/features/cycle-triage/components/CycleGraph'

import type { ComponentProps } from 'react'

function createItem(): ComponentProps<typeof CycleGraph>['item'] {
  return {
    id: 'payment-service->user-service->payment-service',
    title: 'payment-service.ts <-> user-service.ts loop',
    routeLabel: 'payment-service.ts -> user-service.ts -> payment-service.ts',
    fixPriority: 'high',
    priorityReason: 'High priority because broad downstream usage.',
    priorityDrivers: ['broad downstream usage'],
    whatIsHappening: '',
    whyItMatters: '',
    cyclePath: [
      'src/payment-service.ts',
      'src/user-service.ts',
      'src/payment-service.ts'
    ],
    files: ['src/payment-service.ts', 'src/user-service.ts'],
    uniqueFileCount: 2,
    entryLikeFiles: [],
    moduleKeys: ['src'],
    cycleEdges: [
      { source: 'src/payment-service.ts', target: 'src/user-service.ts' },
      { source: 'src/user-service.ts', target: 'src/payment-service.ts' }
    ],
    neighborEdges: [
      { source: 'src/api-aggregator.ts', target: 'src/payment-service.ts' },
      { source: 'src/route.ts', target: 'src/user-service.ts' },
      {
        source: 'src/payment-service.ts',
        target: 'src/analytics-service.ts'
      },
      { source: 'src/user-service.ts', target: 'src/order-service.ts' }
    ],
    nearbyFiles: [
      'src/api-aggregator.ts',
      'src/route.ts',
      'src/analytics-service.ts',
      'src/order-service.ts'
    ],
    suggestedInvestigation: {
      summary: '',
      detail: '',
      confidence: 'medium',
      candidateEdge: {
        source: 'src/payment-service.ts',
        target: 'src/user-service.ts'
      }
    },
    verificationChecks: []
  }
}

test('CycleGraph uses a summary-first hierarchy for two-node loops', () => {
  const html = renderToStaticMarkup(
    <CycleGraph item={createItem()} showNearbyDependents={true} />
  )

  assert.match(
    html,
    /payment-service\.ts imports user-service\.ts, and user-service\.ts imports payment-service\.ts\./
  )
  assert.match(html, /Imports into this loop/)
  assert.match(html, /Imports from this loop/)
  assert.doesNotMatch(html, /Loop route/)
  assert.doesNotMatch(html, /Imports in this loop/)
})
