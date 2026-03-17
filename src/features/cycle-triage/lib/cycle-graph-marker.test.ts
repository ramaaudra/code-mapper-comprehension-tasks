import assert from 'node:assert/strict'
import test from 'node:test'

import { CYCLE_GRAPH_CHEVRON_MARKER } from './cycle-graph-marker'

test('uses a simple chevron marker path for cycle graph arrows', () => {
  assert.equal(CYCLE_GRAPH_CHEVRON_MARKER.path, 'M 2 2 L 10 7 L 2 12')
  assert.equal(CYCLE_GRAPH_CHEVRON_MARKER.width, 12)
  assert.equal(CYCLE_GRAPH_CHEVRON_MARKER.height, 14)
  assert.equal(CYCLE_GRAPH_CHEVRON_MARKER.refX, 10)
  assert.equal(CYCLE_GRAPH_CHEVRON_MARKER.refY, 7)
})
