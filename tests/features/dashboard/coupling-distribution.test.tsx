import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CouplingDistribution } from '../../../src/features/dashboard/components/CouplingDistribution'
import { buildCouplingDistribution } from '../../../src/features/dashboard/lib/couplingBuckets'

function toVisibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

test('buildCouplingDistribution keeps bucket ranges aligned with coupling boundary logic', () => {
  const distribution = buildCouplingDistribution([
    { path: 'src/zero.ts', count: 0 },
    { path: 'src/two.ts', count: 2 },
    { path: 'src/three.ts', count: 3 },
    { path: 'src/six.ts', count: 6 },
    { path: 'src/seven.ts', count: 7 },
    { path: 'src/ten.ts', count: 10 },
    { path: 'src/eleven.ts', count: 11 }
  ])

  assert.deepEqual(
    distribution.map((bucket) => ({
      label: bucket.label,
      range: bucket.range,
      count: bucket.count
    })),
    [
      { label: 'Loose', range: '0-2', count: 2 },
      { label: 'Medium', range: '3-6', count: 2 },
      { label: 'Tight', range: '7-10', count: 2 },
      { label: 'Heavy', range: '11+', count: 1 }
    ]
  )

  assert.deepEqual(
    distribution
      .find((bucket) => bucket.label === 'Loose')
      ?.files.map((file) => file.path),
    ['src/two.ts', 'src/zero.ts']
  )
  assert.deepEqual(
    distribution
      .find((bucket) => bucket.label === 'Medium')
      ?.files.map((file) => file.path),
    ['src/six.ts', 'src/three.ts']
  )
  assert.deepEqual(
    distribution
      .find((bucket) => bucket.label === 'Tight')
      ?.files.map((file) => file.path),
    ['src/ten.ts', 'src/seven.ts']
  )
  assert.deepEqual(
    distribution
      .find((bucket) => bucket.label === 'Heavy')
      ?.files.map((file) => file.path),
    ['src/eleven.ts']
  )
})

test('CouplingDistribution renders the corrected bucket ranges in the visible UI labels', () => {
  const distribution = buildCouplingDistribution([
    { path: 'src/zero.ts', count: 0 },
    { path: 'src/four.ts', count: 4 },
    { path: 'src/eight.ts', count: 8 },
    { path: 'src/twelve.ts', count: 12 }
  ])

  const html = renderToStaticMarkup(
    <CouplingDistribution
      avgDependencies={6}
      distribution={distribution}
      mostCoupledFile={{ path: 'src/twelve.ts', count: 12 }}
    />
  )
  const text = toVisibleText(html)

  assert.match(html, /Loose \(0-2\)/)
  assert.match(html, /Medium \(3-6\)/)
  assert.match(html, /Tight \(7-10\)/)
  assert.match(html, /Heavy \(11\+\)/)

  assert.doesNotMatch(html, /Medium \(3-5\)/)
  assert.doesNotMatch(html, /Tight \(6-10\)/)
  assert.doesNotMatch(html, /Heavy \(10\+\)/)
  assert.match(text, /Average 6\.00 outgoing dependencies per file\./)
  assert.match(text, /Highest: twelve\.ts \(12 outgoing dependencies\)\./)
  assert.match(text, /Select a bucket to inspect matching files\./)
  assert.doesNotMatch(text, /Highest outgoing dependency count:/)
  assert.doesNotMatch(text, /Click a bucket to inspect matching files\./)
})
