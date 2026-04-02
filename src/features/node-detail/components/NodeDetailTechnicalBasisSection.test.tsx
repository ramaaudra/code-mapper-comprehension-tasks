import assert from 'node:assert/strict'
import test from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import { NodeDetailTechnicalBasisSection } from './NodeDetailTechnicalBasisSection'

import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { FileEvolutionMetrics } from '@/shared/types/analysis'

function createArchMetrics(): FileArchitectureMetrics {
  return {
    filePath: 'next.config.js',
    moduleKey: 'sample-project',
    ca: 3,
    ce: 1,
    instability: 0.25,
    hasCycle: false
  }
}

function createEvolution(): FileEvolutionMetrics {
  return {
    filePath: 'next.config.js',
    effectiveLoc: 32,
    churn30d: {
      windowDays: 30,
      churnLoc: 2,
      commitCount: 1,
      relativeChurn: 0.06
    },
    churn90d: {
      windowDays: 90,
      churnLoc: 3,
      commitCount: 2,
      relativeChurn: 0.09
    },
    relativeChurnPercentile: 0.15,
    structuralRiskPercentile: 0.05,
    hotspotScore: 0.05,
    hotspotPercentile: 0.05,
    hotspotStatus: 'stable'
  }
}

test('NodeDetailTechnicalBasisSection promotes the disclosure title above inner metric subheadings', () => {
  const markup = renderToStaticMarkup(
    <NodeDetailTechnicalBasisSection
      showArchitectureMetrics
      showEvolutionMetrics
      changeHistoryAvailable
      archMetrics={createArchMetrics()}
      fileEvolution={createEvolution()}
    />
  )

  assert.match(
    markup,
    /<div class="[^"]*text-base[^"]*font-semibold[^"]*text-foreground[^"]*">Technical basis<\/div>/
  )
  assert.match(
    markup,
    /<p class="[^"]*text-xs[^"]*leading-relaxed[^"]*text-muted-foreground[^"]*">Raw metrics and structural evidence for this file\.<\/p>/
  )
})
