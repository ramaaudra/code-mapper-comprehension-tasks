import assert from 'node:assert/strict'
import test from 'node:test'

import { Target } from '@phosphor-icons/react'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { DecisionStorySection } from '../../../../src/shared/components/ui/decision-story-section'

import type { DecisionAssessment } from '../../../../src/shared/lib/utils'

test('DecisionStorySection renders the shared diagnosis story and evidence labels', () => {
  const assessment: DecisionAssessment = {
    headline: 'Frequent changes, broad impact',
    title: 'Critical Hotspot',
    summary:
      'This file changes frequently and affects many other parts of the system.',
    basisSummary:
      'Based on repository signals: change pressure, downstream impact, external reliance, and structural position.',
    whyItMatters:
      'Recent change pressure combines with broad downstream impact, so review and verification scope can spread quickly.',
    actions: [
      'Keep the change small and focused.',
      'Review dependents before merging.',
      'Run broader regression checks.'
    ],
    topDrivers: [
      'Recent change pressure is high.',
      'Many other parts depend on this area.',
      'Review and testing scope can grow quickly.'
    ],
    reviewPriority: 'Critical Review Priority',
    impactScope: 'Broad',
    changePressure: 'High',
    externalReliance: 'Moderate',
    structuralPosition: 'Foundation-like',
    tone: 'danger'
  }

  const html = renderToStaticMarkup(
    <DecisionStorySection
      assessment={assessment}
      icon={<Target weight='fill' />}
      evidenceHelpers={{
        impactScope: <span>12 files depend on this</span>,
        changeActivity: (
          <span>Relative churn (30d): 42.0% of current size</span>
        ),
        dependencies: <span>Depends on 4 internal files</span>,
        architectureRole: <span>Instability: 0.18</span>
      }}
    />
  )

  assert.match(html, /Frequent changes, broad impact/)
  assert.match(html, /Critical Hotspot/)
  assert.match(html, /What to do next/)
  assert.match(html, /Keep the change small and focused\./)
  assert.match(html, /Review dependents before merging\./)
  assert.match(html, /Top drivers/)
  assert.match(html, /Impact Scope/)
  assert.match(html, /Change Activity/)
  assert.match(html, /Dependencies/)
  assert.match(html, /Architecture Role/)
  assert.match(html, /12 files depend on this/)
  assert.match(html, /Relative churn \(30d\): 42.0% of current size/)
})
