import assert from 'node:assert/strict'
import test from 'node:test'

import { getOverviewHealthStory } from './overview-health-story'

test('summarizes unsafe refactor conditions in developer language', () => {
  const story = getOverviewHealthStory({
    cycleCount: 3,
    criticalRiskCount: 1,
    warningRiskCount: 2,
    orphanCount: 33,
    stabilityScore: 0.52
  })

  assert.equal(story.tone, 'critical')
  assert.equal(story.headline, 'Unsafe to refactor broadly right now')
  assert.equal(
    story.summary,
    'Cycles are still active and shared modules can spread changes farther than a local edit.'
  )
  assert.deepEqual(story.drivers, [
    '3 dependency cycles still block safer refactors.',
    '1 shared area sits in the critical spread-risk band.',
    '33 cleanup candidates can wait until the blockers are gone.'
  ])
})

test('describes calm baseline conditions without formula language', () => {
  const story = getOverviewHealthStory({
    cycleCount: 0,
    criticalRiskCount: 0,
    warningRiskCount: 1,
    orphanCount: 2,
    stabilityScore: 0.31
  })

  assert.equal(story.tone, 'warning')
  assert.equal(story.headline, 'Mostly safe for focused changes')
  assert.match(story.summary, /one shared area still deserves broader review/i)
  assert.ok(
    story.drivers.every((driver) => !/pfatal|prisk|phygiene/i.test(driver))
  )
})
