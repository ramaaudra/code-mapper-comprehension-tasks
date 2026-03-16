import assert from 'node:assert/strict'
import test from 'node:test'

import { buildCycleTriageItems } from './cycle-triage'

test('prioritizes shared active cycles and explains the reason', () => {
  const items = buildCycleTriageItems({
    cycles: [
      {
        cycle: [
          'src/services/payment-service.ts',
          'src/services/user-service.ts',
          'src/services/payment-service.ts'
        ],
        length: 3,
        files: [
          'src/services/payment-service.ts',
          'src/services/user-service.ts'
        ],
        severity: 'medium'
      }
    ],
    dependencyMap: {
      'src/services/payment-service.ts': [
        { target: 'src/services/user-service.ts', strength: 1, line: 8 }
      ],
      'src/services/user-service.ts': [
        { target: 'src/services/payment-service.ts', strength: 1, line: 14 },
        { target: 'src/contracts/user-contract.ts', strength: 1, line: 4 }
      ],
      'src/features/checkout.ts': [
        { target: 'src/services/payment-service.ts', strength: 1, line: 3 }
      ]
    },
    fileMetrics: [
      {
        filePath: 'src/services/payment-service.ts',
        moduleKey: 'src/services',
        ca: 18,
        ce: 6,
        instability: 0.25,
        evolution: {
          hotspotStatus: 'critical-hotspot',
          churn30d: { relativeChurn: 0.82 }
        }
      },
      {
        filePath: 'src/services/user-service.ts',
        moduleKey: 'src/services',
        ca: 12,
        ce: 5,
        instability: 0.29,
        evolution: {
          hotspotStatus: 'active',
          churn30d: { relativeChurn: 0.54 }
        }
      },
      {
        filePath: 'src/contracts/user-contract.ts',
        moduleKey: 'src/contracts',
        ca: 4,
        ce: 0,
        instability: 0,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.04 }
        }
      }
    ]
  })

  assert.equal(items.length, 1)
  const [item] = items
  assert.equal(item.fixPriority, 'high')
  assert.match(item.priorityReason, /broad downstream usage/i)
  assert.match(item.priorityReason, /recent change activity/i)
  assert.equal(item.suggestedInvestigation.confidence, 'medium')
})

test('prefers entry-like investigation copy when the cycle touches an index file', () => {
  const [item] = buildCycleTriageItems({
    cycles: [
      {
        cycle: ['src/core.ts', 'src/index.ts', 'src/core.ts'],
        length: 3,
        files: ['src/core.ts', 'src/index.ts'],
        severity: 'high'
      }
    ],
    dependencyMap: {
      'src/core.ts': [{ target: 'src/index.ts', strength: 1, line: 2 }],
      'src/index.ts': [{ target: 'src/core.ts', strength: 1, line: 1 }]
    },
    fileMetrics: [
      {
        filePath: 'src/core.ts',
        moduleKey: 'src',
        ca: 6,
        ce: 3,
        instability: 0.33,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.12 }
        }
      },
      {
        filePath: 'src/index.ts',
        moduleKey: 'src',
        ca: 8,
        ce: 2,
        instability: 0.2,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.08 }
        }
      }
    ]
  })

  assert.match(item.suggestedInvestigation.summary, /barrel|entry import/i)
  assert.equal(item.suggestedInvestigation.confidence, 'high')
})

test('keeps isolated local loops in the low-priority bucket with a contained explanation', () => {
  const [item] = buildCycleTriageItems({
    cycles: [
      {
        cycle: [
          'src/features/cart/cart-view.tsx',
          'src/features/cart/use-cart.ts',
          'src/features/cart/cart-view.tsx'
        ],
        length: 3,
        files: [
          'src/features/cart/cart-view.tsx',
          'src/features/cart/use-cart.ts'
        ],
        severity: 'medium'
      }
    ],
    dependencyMap: {
      'src/features/cart/cart-view.tsx': [
        { target: 'src/features/cart/use-cart.ts', strength: 1, line: 7 }
      ],
      'src/features/cart/use-cart.ts': [
        { target: 'src/features/cart/cart-view.tsx', strength: 1, line: 18 }
      ]
    },
    fileMetrics: [
      {
        filePath: 'src/features/cart/cart-view.tsx',
        moduleKey: 'src/features/cart',
        ca: 1,
        ce: 2,
        instability: 0.67,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.01 }
        }
      },
      {
        filePath: 'src/features/cart/use-cart.ts',
        moduleKey: 'src/features/cart',
        ca: 1,
        ce: 1,
        instability: 0.5,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.02 }
        }
      }
    ]
  })

  assert.equal(item.fixPriority, 'low')
  assert.match(item.priorityReason, /small local loop/i)
  assert.match(item.suggestedInvestigation.summary, /shared contract/i)
})

test('normalizes malformed cycle paths into a closed readable route', () => {
  const [item] = buildCycleTriageItems({
    cycles: [
      {
        cycle: [
          'src/services/payment-service.ts',
          'src/services/user-service.ts',
          'src/services/user-service.ts'
        ],
        length: 3,
        files: [
          'src/services/payment-service.ts',
          'src/services/user-service.ts'
        ],
        severity: 'medium'
      }
    ],
    dependencyMap: {
      'src/services/payment-service.ts': [
        { target: 'src/services/user-service.ts', strength: 1, line: 8 }
      ],
      'src/services/user-service.ts': [
        { target: 'src/services/payment-service.ts', strength: 1, line: 14 }
      ]
    },
    fileMetrics: [
      {
        filePath: 'src/services/payment-service.ts',
        moduleKey: 'src/services',
        ca: 6,
        ce: 3,
        instability: 0.33,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.12 }
        }
      },
      {
        filePath: 'src/services/user-service.ts',
        moduleKey: 'src/services',
        ca: 5,
        ce: 2,
        instability: 0.29,
        evolution: {
          hotspotStatus: 'stable',
          churn30d: { relativeChurn: 0.08 }
        }
      }
    ]
  })

  assert.deepEqual(item.cyclePath, [
    'src/services/payment-service.ts',
    'src/services/user-service.ts',
    'src/services/payment-service.ts'
  ])
  assert.equal(
    item.routeLabel,
    'payment-service.ts -> user-service.ts -> payment-service.ts'
  )
})
