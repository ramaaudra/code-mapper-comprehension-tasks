import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCycleGraphModel } from './cycle-graph-model'

test('builds a readable two-node loop as a literal oval with explicit directions', () => {
  const model = buildCycleGraphModel({
    item: {
      id: 'order-service->payment-service->order-service',
      title: 'order-service.ts <-> payment-service.ts loop',
      routeLabel: 'order-service.ts -> payment-service.ts -> order-service.ts',
      fixPriority: 'high',
      priorityReason: 'High priority because broad downstream usage.',
      priorityDrivers: ['broad downstream usage'],
      whatIsHappening: '',
      whyItMatters: '',
      cyclePath: [
        'src/order-service.ts',
        'src/payment-service.ts',
        'src/order-service.ts'
      ],
      files: ['src/order-service.ts', 'src/payment-service.ts'],
      uniqueFileCount: 2,
      entryLikeFiles: [],
      moduleKeys: ['src'],
      cycleEdges: [
        { source: 'src/order-service.ts', target: 'src/payment-service.ts' },
        { source: 'src/payment-service.ts', target: 'src/order-service.ts' }
      ],
      neighborEdges: [],
      nearbyFiles: [],
      suggestedInvestigation: {
        summary: '',
        detail: '',
        confidence: 'medium',
        candidateEdge: {
          source: 'src/order-service.ts',
          target: 'src/payment-service.ts'
        }
      },
      verificationChecks: []
    },
    showNearbyDependents: false
  })

  assert.equal(model.nodes.length, 2)
  assert.equal(model.cycleEdges.length, 2)

  const [leftNode, rightNode] = [...model.nodes].sort(
    (nodeA, nodeB) => nodeA.x - nodeB.x
  )
  assert.ok(leftNode.x < rightNode.x)
  assert.equal(Math.round(leftNode.y), Math.round(rightNode.y))

  const [upperEdge, lowerEdge] = [...model.cycleEdges].sort(
    (edgeA, edgeB) => edgeA.labelY - edgeB.labelY
  )
  assert.match(upperEdge.path, /A/)
  assert.match(lowerEdge.path, /A/)
  assert.doesNotMatch(upperEdge.path, /C/)
  assert.doesNotMatch(lowerEdge.path, /C/)
  assert.ok(upperEdge.labelY < lowerEdge.labelY)
  assert.deepEqual(
    model.cycleRouteLabels.map((route) => route.label),
    [
      'order-service.ts -> payment-service.ts',
      'payment-service.ts -> order-service.ts'
    ]
  )
  assert.equal(
    model.recommendedRouteLabel,
    'order-service.ts -> payment-service.ts'
  )
})

test('limits nearby nodes so the graph stays readable', () => {
  const model = buildCycleGraphModel({
    item: {
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
        { source: 'src/logger.ts', target: 'src/payment-service.ts' },
        { source: 'src/order-service.ts', target: 'src/payment-service.ts' },
        { source: 'src/api-aggregator.ts', target: 'src/user-service.ts' },
        { source: 'src/user-store.ts', target: 'src/user-service.ts' },
        { source: 'src/master-service.ts', target: 'src/payment-service.ts' },
        { source: 'src/event-emitter.ts', target: 'src/user-service.ts' }
      ],
      nearbyFiles: [
        'src/logger.ts',
        'src/order-service.ts',
        'src/api-aggregator.ts',
        'src/user-store.ts',
        'src/master-service.ts',
        'src/event-emitter.ts'
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
    },
    showNearbyDependents: true
  })

  assert.equal(model.visibleNearbyCount, 4)
  assert.equal(model.hiddenNearbyCount, 2)
  assert.equal(model.nodes.length, 2)
  assert.equal(model.nearbyEdges.length, 0)
  assert.deepEqual(
    model.nearbyRouteLabels.map((route) => route.label),
    [
      'api-aggregator.ts -> user-service.ts',
      'event-emitter.ts -> user-service.ts',
      'logger.ts -> payment-service.ts',
      'master-service.ts -> payment-service.ts'
    ]
  )
})
