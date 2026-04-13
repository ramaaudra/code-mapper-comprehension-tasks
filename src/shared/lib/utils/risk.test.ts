import assert from 'node:assert/strict'
import test from 'node:test'

import { getRiskBadgeTone, getRiskColor } from './risk'

test('legacy compatibility helpers accept canonical risk levels', () => {
  assert.equal(getRiskColor('high'), 'bg-status-warning-solid')
  assert.equal(getRiskColor('critical'), 'bg-status-critical-solid')

  assert.equal(getRiskBadgeTone('high'), 'warning')
  assert.equal(getRiskBadgeTone('critical'), 'danger')
})
