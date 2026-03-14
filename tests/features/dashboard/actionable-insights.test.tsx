import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ActionableInsights } from '../../../src/features/dashboard/components/ActionableInsights'

import type { ComponentProps } from 'react'

test('ActionableInsights surfaces critical hotspot insight even when the raw hotspot score is numerically low', () => {
  const topHotspot = {
    modulePath: 'src/critical',
    relativeChurn30d: 0.08,
    hotspotScore: 0.18,
    hotspotStatus: 'critical-hotspot',
    hotspotPercentile: 0.9
  } as unknown as NonNullable<
    ComponentProps<typeof ActionableInsights>['topHotspot']
  >

  const html = renderToStaticMarkup(
    <ActionableInsights
      cycleCount={0}
      orphanCount={0}
      criticalRisks={[]}
      warningRisks={[]}
      godObjects={[]}
      topHotspot={topHotspot}
    />
  )

  assert.match(
    html,
    /Review src\/critical carefully before editing this active area/
  )
})
