import assert from 'node:assert/strict'
import test from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import { NodeDetailCycleTriageCallout } from './NodeDetailCycleTriageCallout'

test('NodeDetailCycleTriageCallout uses critical status tokens instead of generic destructive styles', () => {
  const markup = renderToStaticMarkup(
    <NodeDetailCycleTriageCallout
      summary={{
        relatedCycleCount: 3,
        selectedCycleId: null,
        title: '3 related dependency cycles',
        description:
          'This file appears in 3 detected dependency cycles. Open cycle triage to compare the loops and decide which one to inspect first.',
        actionLabel: 'Review related cycles (3)'
      }}
      resolvedNodeId='src/services/payment-service.ts'
      onShowCycleTriage={() => {}}
    />
  )

  assert.match(markup, /border-status-critical-border/)
  assert.match(markup, /bg-status-critical-surface/)
  assert.match(markup, /text-status-critical-foreground/)
  assert.doesNotMatch(markup, /text-destructive/)
})
