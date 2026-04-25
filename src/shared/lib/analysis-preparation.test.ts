import assert from 'node:assert/strict'
import test from 'node:test'

import {
  normalizeAnalysisData,
  type AnalysisDataWithLegacyRisk
} from './analysis-normalization'
import { prepareAnalysisSnapshot } from './analysis-preparation'

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
      },
      {
        file: 'src/lib/util.ts',
        score: 4,
        category: 'Rendah',
        factors: {
          indegree: 1,
          outdegree: 0,
          inCycle: true,
          ca: 1,
          ce: 0,
          instability: 0
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
      summary: 'Test fixture'
    },
    metrics: {
      fileCount: 3,
      edgeCount: 2,
      avgDegree: 0.67
    },
    detailedMetrics: {
      totalFiles: 3,
      totalDependencies: 2,
      averageDependenciesPerFile: 0.67,
      topImporters: [],
      mostDependedOn: [],
      codebaseHealth: {
        orphanCount: 1,
        circularCount: 1
      }
    },
    warnings: {
      hasPathMappings: true,
      unresolvedImports: [],
      totalUnresolvedCount: 0,
      unsupportedFiles: {
        total: 0,
        byExtension: {},
        examples: [],
        supportedExtensions: ['.js', '.jsx', '.ts', '.tsx'],
        message:
          'Tauta skipped files outside the JavaScript and TypeScript analysis scope.',
        suggestion:
          'Keep the default include pattern for code analysis, or narrow custom include patterns to JS/TS source files.'
      }
    }
  } satisfies AnalysisDataWithLegacyRisk)

  assert.ok(normalizedAnalysisData)
  return normalizedAnalysisData
}

test('prepareAnalysisSnapshot aliases derived file status lookups from a single snapshot', () => {
  const prepared = prepareAnalysisSnapshot(createAnalysisData())

  assert.equal(prepared.filesInCycle.has('/workspace/src/app.ts'), true)
  assert.equal(prepared.filesInCycle.has('src/app.ts'), true)
  assert.equal(prepared.filesInCycle.has('src/lib/util.ts'), true)

  assert.equal(prepared.orphanFilesSet.has('/workspace/src/index.ts'), true)
  assert.equal(prepared.orphanFilesSet.has('src/index.ts'), true)

  assert.equal(
    prepared.riskProfileMap.get('src/app.ts')?.score,
    16,
    'risk profile should be reachable by alias'
  )
  assert.equal(
    prepared.fileReviewStoryMap.get('src/app.ts')?.assessment.title,
    prepared.fileReviewStoryMap.get('/workspace/src/app.ts')?.assessment.title
  )
})

test('prepareAnalysisSnapshot builds node lookup and reverse dependencies once per snapshot', () => {
  const prepared = prepareAnalysisSnapshot(createAnalysisData())

  assert.equal(
    prepared.nodeLookup.get('src/app.ts')?.id,
    '/workspace/src/app.ts'
  )
  assert.equal(
    prepared.nodeLookup.get('/workspace/src/lib/util.ts')?.label,
    'src/lib/util.ts'
  )

  const appIncoming = prepared.reverseDependencyMap.get('src/app.ts') ?? []
  const utilIncoming =
    prepared.reverseDependencyMap.get('/workspace/src/lib/util.ts') ?? []

  assert.deepEqual(
    appIncoming.map((entry) => entry.source),
    ['/workspace/src/index.ts']
  )
  assert.equal(appIncoming[0]?.dependency.target, '/workspace/src/app.ts')

  assert.deepEqual(
    utilIncoming.map((entry) => entry.source),
    ['/workspace/src/app.ts']
  )
  assert.equal(utilIncoming[0]?.dependency.target, 'src/lib/util.ts')
})

test('prepareAnalysisSnapshot returns empty prepared state without analysis data', () => {
  const prepared = prepareAnalysisSnapshot(null)

  assert.equal(prepared.filesInCycle.size, 0)
  assert.equal(prepared.orphanFilesSet.size, 0)
  assert.equal(prepared.riskProfileMap.size, 0)
  assert.equal(prepared.fileReviewStoryMap.size, 0)
  assert.equal(prepared.nodeLookup.size, 0)
  assert.equal(prepared.reverseDependencyMap.size, 0)
})
