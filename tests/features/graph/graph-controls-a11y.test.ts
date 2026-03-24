import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const viewModeTogglePath = path.resolve(
  process.cwd(),
  'src/features/graph/components/ViewModeToggle.tsx'
)
const zoomControlsPath = path.resolve(
  process.cwd(),
  'src/features/graph/components/ZoomControls.tsx'
)
const detailPanelHeaderPath = path.resolve(
  process.cwd(),
  'src/shared/components/ui/detail-panel-header.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('graph mode and utility controls expose explicit state and touch-friendly hit areas', () => {
  const viewModeToggleSource = readSource(viewModeTogglePath)
  const zoomControlsSource = readSource(zoomControlsPath)
  const detailPanelHeaderSource = readSource(detailPanelHeaderPath)

  assert.match(viewModeToggleSource, /role='group'/)
  assert.match(viewModeToggleSource, /aria-label='Graph view mode'/)
  assert.match(viewModeToggleSource, /aria-pressed=\{mode === value\}/)

  assert.match(
    zoomControlsSource,
    /aria-label='Switch graph layout to left-to-right'/
  )
  assert.match(
    zoomControlsSource,
    /aria-label='Switch graph layout to top-to-bottom'/
  )
  assert.match(zoomControlsSource, /aria-label='Zoom in graph'/)
  assert.match(zoomControlsSource, /aria-label='Zoom out graph'/)
  assert.match(zoomControlsSource, /aria-label='Fit graph to screen'/)
  assert.match(zoomControlsSource, /aria-label='Reset graph viewport'/)
  assert.match(zoomControlsSource, /aria-label='Toggle graph minimap'/)
  assert.doesNotMatch(zoomControlsSource, /h-8 w-8/)

  assert.match(
    detailPanelHeaderSource,
    /className='-mr-2 -mt-2 h-10 w-10 shrink-0'/
  )
  assert.doesNotMatch(detailPanelHeaderSource, /h-8 w-8/)
})
