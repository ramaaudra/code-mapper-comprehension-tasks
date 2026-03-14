import assert from 'node:assert/strict'
import test from 'node:test'

import { describeStructuralPositionStory } from '../../../src/features/architecture/lib/structural-position-story'

test('describeStructuralPositionStory follows the shared structural-position bands', () => {
  const balanced = describeStructuralPositionStory(0.65)
  const outward = describeStructuralPositionStory(0.8)

  assert.equal(balanced.band, 'Balanced')
  assert.equal(balanced.summaryLabel, 'Balanced overall')
  assert.match(balanced.description, /mix of shared and outward-facing/i)

  assert.equal(outward.band, 'Outward-Dependent')
  assert.equal(outward.summaryLabel, 'More outward-facing overall')
  assert.match(outward.description, /ui-heavy areas/i)
})
