import assert from 'node:assert/strict'
import test from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import { createDecisionAssessment } from '@/shared/lib/utils'

import { NodeDetailDiagnosisSection } from './NodeDetailDiagnosisSection'

import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { FileEvolutionMetrics } from '@/shared/types/analysis'

function createArchMetrics(): FileArchitectureMetrics {
  return {
    filePath: 'next.config.js',
    moduleKey: 'sample-project',
    ca: 0,
    ce: 0,
    instability: 0,
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
      churnLoc: 2,
      commitCount: 1,
      relativeChurn: 0.06
    },
    relativeChurnPercentile: 0.15,
    structuralRiskPercentile: 0.05,
    hotspotScore: 0.05,
    hotspotPercentile: 0.05,
    hotspotStatus: 'stable'
  }
}

test('NodeDetailDiagnosisSection renders supporting evidence as a compact list instead of metric cards', () => {
  const markup = renderToStaticMarkup(
    <NodeDetailDiagnosisSection
      decisionAssessment={createDecisionAssessment({
        kind: 'file',
        hasCycle: false,
        ca: 0,
        ce: 0,
        instability: 0,
        relativeChurn30d: 0.06
      })}
      decisionIcon={<span>!</span>}
      changeHistoryAvailable
      fileEvolution={createEvolution()}
      archMetrics={createArchMetrics()}
      relatedCycleSummary={null}
      resolvedNodeId='next.config.js'
    />
  )

  assert.match(markup, /Supporting evidence/)
  assert.match(markup, /Files Affected if Changed/)
  assert.match(markup, /How Often This Changes/)
  assert.doesNotMatch(markup, /font-data/)
})
