import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ArchitectureHealthScore } from '../../../src/features/dashboard/components/ArchitectureHealthScore'

function toVisibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

test('ArchitectureHealthScore keeps supporting context story-first and removes duplicate metric tiles', () => {
  const html = renderToStaticMarkup(
    <ArchitectureHealthScore
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
    />
  )

  const text = toVisibleText(html)

  assert.match(text, /Unsafe to refactor broadly right now/)
  assert.match(
    text,
    /Cycles are still active and shared modules can spread changes farther than a local edit\./
  )
  assert.doesNotMatch(text, /Supporting score/i)
  assert.doesNotMatch(text, /Change Profile:/)
  assert.doesNotMatch(text, /Critical Risks:/)
})
