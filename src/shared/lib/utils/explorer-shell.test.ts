import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildMetricsGuideHash,
  isMetricsGuideHash,
  parseMetricsGuideHash
} from './explorer-shell'

const buildGuideHash = buildMetricsGuideHash as unknown as (
  section?: string
) => string

const parseGuideHash = parseMetricsGuideHash as unknown as (
  hash: string
) => { section?: string } | null

test('buildMetricsGuideHash uses canonical metrics guide hashes', () => {
  assert.equal(buildGuideHash(), '#metrics-guide')
  assert.equal(buildGuideHash('which-screen'), '#metrics-guide/which-screen')
})

test('parseMetricsGuideHash maps legacy quick and reference sections to new sections', () => {
  assert.deepEqual(parseGuideHash('#metrics-guide/quick/visual-primer'), {
    section: 'how-to-read'
  })
  assert.deepEqual(parseGuideHash('#metrics-guide/reference/how-to-read'), {
    section: 'which-screen'
  })
})

test('parseMetricsGuideHash accepts bare section hashes from the narrative guide', () => {
  assert.deepEqual(parseGuideHash('#which-screen'), {
    section: 'which-screen'
  })
})

test('isMetricsGuideHash recognizes legacy and canonical guide hashes', () => {
  assert.equal(isMetricsGuideHash('#metrics-guide/reference/how-to-read'), true)
  assert.equal(isMetricsGuideHash('#which-screen'), true)
  assert.equal(isMetricsGuideHash('#graph'), false)
})
