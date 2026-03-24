import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const dependencyGraphPath = path.resolve(
  process.cwd(),
  'src/features/graph/components/DependencyGraph.tsx'
)
const moduleSidePanelPath = path.resolve(
  process.cwd(),
  'src/features/graph/components/ModuleSidePanel.tsx'
)
const zoomControlsPath = path.resolve(
  process.cwd(),
  'src/features/graph/components/ZoomControls.tsx'
)
const metricValueCardPath = path.resolve(
  process.cwd(),
  'src/shared/components/ui/metric-value-card.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('Graph surfaces use design tokens instead of one-off status colors', () => {
  const dependencyGraphSource = readSource(dependencyGraphPath)
  const moduleSidePanelSource = readSource(moduleSidePanelPath)
  const zoomControlsSource = readSource(zoomControlsPath)
  const metricValueCardSource = readSource(metricValueCardPath)

  assert.match(dependencyGraphSource, /status-warning-/)
  assert.match(dependencyGraphSource, /status-critical-/)
  assert.match(moduleSidePanelSource, /status-critical-/)
  assert.match(moduleSidePanelSource, /status-warning-/)
  assert.match(moduleSidePanelSource, /status-success-/)
  assert.match(metricValueCardSource, /status-success-/)

  assert.doesNotMatch(dependencyGraphSource, /bg-black\/70/)
  assert.doesNotMatch(dependencyGraphSource, /text-white/)
  assert.doesNotMatch(dependencyGraphSource, /ring-yellow-500/)
  assert.doesNotMatch(dependencyGraphSource, /orange-500/)
  assert.doesNotMatch(dependencyGraphSource, /red-500/)
  assert.doesNotMatch(dependencyGraphSource, /emerald-500/)
  assert.doesNotMatch(dependencyGraphSource, /text-neutral-/)
  assert.doesNotMatch(moduleSidePanelSource, /text-red-500/)
  assert.doesNotMatch(moduleSidePanelSource, /text-orange-500/)
  assert.doesNotMatch(moduleSidePanelSource, /text-sky-500/)
  assert.doesNotMatch(moduleSidePanelSource, /text-green-500/)
  assert.doesNotMatch(moduleSidePanelSource, /border-sky-500/)
  assert.doesNotMatch(moduleSidePanelSource, /bg-sky-500/)
  assert.doesNotMatch(moduleSidePanelSource, /border-slate-500/)
  assert.doesNotMatch(moduleSidePanelSource, /bg-slate-500/)
  assert.doesNotMatch(moduleSidePanelSource, /border-indigo-500/)
  assert.doesNotMatch(moduleSidePanelSource, /bg-indigo-500/)
  assert.doesNotMatch(moduleSidePanelSource, /text-slate-500/)
  assert.doesNotMatch(zoomControlsSource, /slate-/)
  assert.doesNotMatch(zoomControlsSource, /bg-white/)
  assert.doesNotMatch(metricValueCardSource, /emerald-500/)
})
