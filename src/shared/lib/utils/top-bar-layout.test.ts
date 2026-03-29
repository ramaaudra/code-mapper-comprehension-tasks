import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveTopBarLayoutClasses } from './top-bar-layout'

test('resolveTopBarLayoutClasses stacks the top bar on mobile while keeping desktop grid layout', () => {
  const classes = resolveTopBarLayoutClasses()

  assert.match(classes.header, /\bflex\b/)
  assert.match(classes.header, /\bflex-col\b/)
  assert.match(classes.header, /\bmd:grid\b/)
  assert.match(classes.header, /\bmd:h-14\b/)
})

test('resolveTopBarLayoutClasses makes navigation full width on mobile and actions wrap', () => {
  const classes = resolveTopBarLayoutClasses()

  assert.match(classes.navigation, /\bw-full\b/)
  assert.match(classes.navigation, /\bmd:w-auto\b/)
  assert.match(classes.navigationGroup, /\bw-full\b/)
  assert.match(classes.navigationItem, /\bflex-1\b/)
  assert.match(classes.navigationItem, /\bmd:flex-none\b/)
  assert.match(classes.actions, /\bflex-wrap\b/)
  assert.match(classes.actions, /\bmd:justify-end\b/)
})
