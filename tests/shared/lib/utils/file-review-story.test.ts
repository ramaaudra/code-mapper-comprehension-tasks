import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildFileReviewStoryMap,
  createFileReviewStory
} from '../../../../src/shared/lib/utils/file-review-story'

import type { AnalysisData } from '../../../../src/shared/types/analysis'
import type { FileRiskProfile } from '../../../../src/shared/types/risk'

function createRiskProfile(
  file: string,
  ca: number,
  ce: number,
  score: number
): FileRiskProfile {
  return {
    file,
    score,
    category: 'Sedang',
    factors: {
      indegree: ca,
      outdegree: ce,
      inCycle: false,
      ca,
      ce,
      instability: ca + ce === 0 ? 0 : ce / (ca + ce)
    }
  }
}

function createAnalysisDataFixture(): AnalysisData {
  const filePaths = [
    'src/a.ts',
    'src/b.ts',
    'src/c.ts',
    'src/d.ts',
    'src/e.ts',
    'src/f.ts'
  ]

  return {
    nodes: filePaths.map((path) => ({ id: path, label: path })),
    edges: [],
    fileTree: [],
    dependencyMap: Object.fromEntries(filePaths.map((path) => [path, []])),
    riskAnalysis: [
      createRiskProfile('src/a.ts', 1, 1, 0.5),
      createRiskProfile('src/b.ts', 2, 1, 0.67),
      createRiskProfile('src/c.ts', 4, 1, 0.8),
      createRiskProfile('src/d.ts', 8, 2, 1.6),
      createRiskProfile('src/e.ts', 12, 2, 1.71),
      createRiskProfile('src/f.ts', 0, 0, 0)
    ],
    evolutionaryMetrics: {
      summary: {
        availability: 'available',
        unavailableReason: null,
        averageRelativeChurn30d: 0.07,
        averageRelativeChurn90d: 0.1,
        filesWithChurn30d: 5,
        filesWithCriticalHotspots: 1,
        filesWithHighHotspots: 1,
        defaultWindowDays: 30
      },
      files: {
        'src/a.ts': {
          filePath: 'src/a.ts',
          effectiveLoc: 100,
          churn30d: {
            windowDays: 30,
            churnLoc: 2,
            commitCount: 1,
            relativeChurn: 0.02
          },
          churn90d: {
            windowDays: 90,
            churnLoc: 5,
            commitCount: 2,
            relativeChurn: 0.05
          },
          relativeChurnPercentile: 0.1,
          structuralRiskPercentile: 0.1,
          hotspotScore: 0.1,
          hotspotPercentile: 0.1,
          hotspotStatus: 'stable'
        },
        'src/b.ts': {
          filePath: 'src/b.ts',
          effectiveLoc: 100,
          churn30d: {
            windowDays: 30,
            churnLoc: 4,
            commitCount: 1,
            relativeChurn: 0.04
          },
          churn90d: {
            windowDays: 90,
            churnLoc: 8,
            commitCount: 2,
            relativeChurn: 0.08
          },
          relativeChurnPercentile: 0.2,
          structuralRiskPercentile: 0.2,
          hotspotScore: 0.2,
          hotspotPercentile: 0.2,
          hotspotStatus: 'stable'
        },
        'src/c.ts': {
          filePath: 'src/c.ts',
          effectiveLoc: 100,
          churn30d: {
            windowDays: 30,
            churnLoc: 8,
            commitCount: 2,
            relativeChurn: 0.08
          },
          churn90d: {
            windowDays: 90,
            churnLoc: 12,
            commitCount: 3,
            relativeChurn: 0.12
          },
          relativeChurnPercentile: 0.5,
          structuralRiskPercentile: 0.4,
          hotspotScore: 0.4,
          hotspotPercentile: 0.4,
          hotspotStatus: 'active'
        },
        'src/d.ts': {
          filePath: 'src/d.ts',
          effectiveLoc: 100,
          churn30d: {
            windowDays: 30,
            churnLoc: 12,
            commitCount: 3,
            relativeChurn: 0.12
          },
          churn90d: {
            windowDays: 90,
            churnLoc: 16,
            commitCount: 4,
            relativeChurn: 0.16
          },
          relativeChurnPercentile: 0.7,
          structuralRiskPercentile: 0.6,
          hotspotScore: 0.6,
          hotspotPercentile: 0.6,
          hotspotStatus: 'high-review-needed'
        },
        'src/e.ts': {
          filePath: 'src/e.ts',
          effectiveLoc: 100,
          churn30d: {
            windowDays: 30,
            churnLoc: 18,
            commitCount: 4,
            relativeChurn: 0.18
          },
          churn90d: {
            windowDays: 90,
            churnLoc: 24,
            commitCount: 5,
            relativeChurn: 0.24
          },
          relativeChurnPercentile: 0.9,
          structuralRiskPercentile: 0.8,
          hotspotScore: 0.85,
          hotspotPercentile: 0.85,
          hotspotStatus: 'critical-hotspot'
        },
        'src/f.ts': {
          filePath: 'src/f.ts',
          effectiveLoc: 100,
          churn30d: {
            windowDays: 30,
            churnLoc: 0,
            commitCount: 0,
            relativeChurn: 0
          },
          churn90d: {
            windowDays: 90,
            churnLoc: 0,
            commitCount: 0,
            relativeChurn: 0
          },
          relativeChurnPercentile: 0,
          structuralRiskPercentile: 0,
          hotspotScore: 0,
          hotspotPercentile: 0,
          hotspotStatus: 'stable'
        }
      }
    },
    issues: {
      circularDependencies: [],
      orphans: ['src/f.ts'],
      summary: ''
    },
    metrics: {
      fileCount: 6,
      edgeCount: 0,
      avgDegree: 0
    }
  }
}

test('buildFileReviewStoryMap uses diagnosis-first labels instead of legacy propagation-risk wording', () => {
  const storyMap = buildFileReviewStoryMap(createAnalysisDataFixture())
  const hotspotStory = storyMap.get('src/e.ts')

  assert.ok(hotspotStory)
  assert.equal(hotspotStory.assessment.title, 'Critical Hotspot')
  assert.equal(hotspotStory.graphBadgeLabel, 'Critical Hotspot')
  assert.equal(hotspotStory.badgeTone, 'danger')
  assert.equal(hotspotStory.showGraphBadge, true)
  assert.equal(hotspotStory.alwaysShowTreeIndicator, true)
  assert.doesNotMatch(hotspotStory.graphBadgeLabel ?? '', /Propagation Risk/i)
})

test('createFileReviewStory suppresses duplicate graph and tree indicators for orphan files', () => {
  const story = createFileReviewStory({
    filePath: 'src/orphan.ts',
    riskProfile: createRiskProfile('src/orphan.ts', 0, 0, 0),
    isOrphan: true
  })

  assert.equal(story.assessment.title, 'Possibly Unused File')
  assert.equal(story.graphBadgeLabel, null)
  assert.equal(story.showGraphBadge, false)
  assert.equal(story.showTreeIndicator, false)
})
