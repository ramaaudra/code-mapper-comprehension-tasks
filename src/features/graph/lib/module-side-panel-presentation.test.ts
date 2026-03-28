import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getModuleFileCycleBadgeCopy,
  getModulePropagationDescription
} from './module-side-panel-presentation'

test('getModulePropagationDescription explains module cycles through cycle member files', () => {
  assert.equal(
    getModulePropagationDescription(true, 'Low propagation risk.'),
    'This module contains files involved in a circular dependency. Review the cycle member files first because changes can feed back through the same dependency chain.'
  )
})

test('getModulePropagationDescription keeps the fallback description when there is no cycle', () => {
  assert.equal(
    getModulePropagationDescription(false, 'Low propagation risk.'),
    'Low propagation risk.'
  )
})

test('getModuleFileCycleBadgeCopy returns cycle member guidance for files in a cycle', () => {
  assert.deepEqual(getModuleFileCycleBadgeCopy(true), {
    label: 'Cycle member',
    description:
      'This file is part of a detected dependency cycle. Review it before broader refactors in this module.'
  })
})

test('getModuleFileCycleBadgeCopy returns null for files outside cycles', () => {
  assert.equal(getModuleFileCycleBadgeCopy(false), null)
})
