import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SupportingContextSection } from '../../../src/features/dashboard/components/SupportingContextSection'
import { buildCouplingDistribution } from '../../../src/features/dashboard/lib/couplingBuckets'

function toVisibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

test('SupportingContextSection keeps overview evidence focused on two primary cards', () => {
  const distribution = buildCouplingDistribution([
    { path: 'src/zero.ts', count: 0 },
    { path: 'src/four.ts', count: 4 },
    { path: 'src/eight.ts', count: 8 },
    { path: 'src/twelve.ts', count: 12 }
  ])

  const html = renderToStaticMarkup(
    <SupportingContextSection
      breakdown={{
        stabilityScore: 0.52,
        cycleCount: 10,
        orphanCount: 33
      }}
      riskMetrics={{
        criticalCount: 0,
        warningCount: 4,
        godObjectCount: 1
      }}
      couplingDistribution={{
        avgDependencies: 6,
        distribution,
        mostCoupledFile: { path: 'src/twelve.ts', count: 12 }
      }}
    />
  )

  const text = toVisibleText(html)

  assert.match(html, /xl:items-start/)
  assert.match(text, /Change Safety Summary/)
  assert.match(text, /Coupling Snapshot/)
  assert.doesNotMatch(text, /Supporting signals behind the queue/)
  assert.doesNotMatch(text, /Shared areas that can spread change/)
  assert.doesNotMatch(text, /Recently active areas to review first/)
})
