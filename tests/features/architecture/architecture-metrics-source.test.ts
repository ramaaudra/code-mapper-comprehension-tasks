import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldFetchFileArchitectureMetrics } from '../../../src/features/architecture/lib/architecture-metrics-source'

test('shouldFetchFileArchitectureMetrics never enables live fetch when static report architecture data exists', () => {
  assert.equal(
    shouldFetchFileArchitectureMetrics({
      hasFilePath: true,
      hasStaticArchitectureData: true
    }),
    false
  )
})

test('shouldFetchFileArchitectureMetrics only enables live fetch when a file path exists in live mode', () => {
  assert.equal(
    shouldFetchFileArchitectureMetrics({
      hasFilePath: false,
      hasStaticArchitectureData: false
    }),
    false
  )
  assert.equal(
    shouldFetchFileArchitectureMetrics({
      hasFilePath: true,
      hasStaticArchitectureData: false
    }),
    true
  )
})
