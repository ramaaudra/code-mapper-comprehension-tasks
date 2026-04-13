import assert from 'node:assert/strict'
import test from 'node:test'

import {
  normalizeAnalysisData,
  type AnalysisDataWithLegacyRisk
} from '@/shared/lib/analysis-normalization'
import { prepareAnalysisSnapshot } from '@/shared/lib/analysis-preparation'

import {
  buildFileGraphModel,
  createFileGraphCacheKey,
  resolveGraphFileId
} from './file-graph-model'

import type { AnalysisData } from '@/shared/types/analysis'
function createAnalysisData(): AnalysisData {
  const normalizedAnalysisData = normalizeAnalysisData({
    nodes: [
      {
        id: '/workspace/src/index.ts',
        label: 'src/index.ts',
        basename: 'index.ts'
      },
      {
        id: '/workspace/src/app.ts',
        label: 'src/app.ts',
        basename: 'app.ts'
      },
      {
        id: '/workspace/src/lib/util.ts',
        label: 'src/lib/util.ts',
        basename: 'util.ts'
      }
    ],
    edges: [],
    fileTree: [],
    dependencyMap: {
      '/workspace/src/index.ts': [
        {
          target: '/workspace/src/app.ts',
          strength: 2,
          line: 1
        }
      ],
      '/workspace/src/app.ts': [
        {
          target: 'src/lib/util.ts',
          strength: 1,
          line: 7
        }
      ],
      '/workspace/src/lib/util.ts': []
    },
    riskAnalysis: [
      {
        file: '/workspace/src/app.ts',
        score: 16,
        category: 'Tinggi',
        factors: {
          indegree: 1,
          outdegree: 1,
          inCycle: true,
          ca: 4,
          ce: 4,
          instability: 0.5
        }
      }
    ],
    connascenceInsights: {
      summary: {
        availability: 'available',
        unavailableReason: null,
        fragilePositionalApiCount: 0,
        sharedTypeContractCount: 0
      },
      fileSignals: {},
      moduleSignals: {}
    },
    evolutionaryMetrics: {
      summary: {
        availability: 'available',
        unavailableReason: null,
        averageRelativeChurn30d: 0,
        averageRelativeChurn90d: 0,
        filesWithChurn30d: 0,
        filesWithCriticalHotspots: 0,
        filesWithHighHotspots: 0,
        defaultWindowDays: 30
      },
      files: {}
    },
    issues: {
      circularDependencies: [
        {
          cycle: ['/workspace/src/app.ts', 'src/lib/util.ts'],
          length: 2,
          files: ['/workspace/src/app.ts', 'src/lib/util.ts'],
          severity: 'high'
        }
      ],
      orphans: ['src/index.ts'],
      summary: 'fixture'
    },
    metrics: {
      fileCount: 3,
      edgeCount: 2,
      avgDegree: 0.67
    }
  } satisfies AnalysisDataWithLegacyRisk)

  assert.ok(normalizedAnalysisData)
  return normalizedAnalysisData
}

test('resolveGraphFileId maps aliases back to dependency map entries', () => {
  const analysisData = createAnalysisData()

  assert.equal(
    resolveGraphFileId(analysisData.dependencyMap, 'src/app.ts'),
    '/workspace/src/app.ts'
  )
  assert.equal(
    resolveGraphFileId(analysisData.dependencyMap, '/workspace/src/app.ts'),
    '/workspace/src/app.ts'
  )
})

test('buildFileGraphModel returns a connected graph around the resolved focus file', () => {
  const analysisData = createAnalysisData()
  const preparedAnalysis = prepareAnalysisSnapshot(analysisData)

  const model = buildFileGraphModel({
    analysisData,
    fileId: 'src/app.ts',
    filesInCycle: preparedAnalysis.filesInCycle,
    orphanFilesSet: preparedAnalysis.orphanFilesSet,
    brokenFilesSet: new Set(),
    newOrphansSet: new Set(),
    fileReviewStoryMap: preparedAnalysis.fileReviewStoryMap,
    reverseDependencyMap: preparedAnalysis.reverseDependencyMap
  })

  assert.ok(model)
  assert.equal(model?.resolvedFileId, '/workspace/src/app.ts')
  assert.equal(model?.focusNodeId, '/workspace/src/app.ts')
  assert.deepEqual(model?.edges.map((edge) => edge.id).sort(), [
    'in-/workspace/src/index.ts->/workspace/src/app.ts',
    'out-/workspace/src/app.ts->src/lib/util.ts'
  ])
  assert.equal(model?.nodes.length, 3)
  assert.equal(
    model?.nodes
      .find((node) => node.id === '/workspace/src/app.ts')
      ?.data.badges?.some((badge) => badge.label === 'Cycle'),
    true
  )
})

test('createFileGraphCacheKey invalidates cache entries when graph status changes', () => {
  const baseKey = createFileGraphCacheKey('/workspace/src/app.ts', 'cycle:a')
  const changedKey = createFileGraphCacheKey(
    '/workspace/src/app.ts',
    'cycle:a::broken:b'
  )

  assert.notEqual(baseKey, changedKey)
})
