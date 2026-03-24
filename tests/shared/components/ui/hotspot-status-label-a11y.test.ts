import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const hotspotStatusLabelPath = path.resolve(
  process.cwd(),
  'src/shared/components/ui/hotspot-status-label.tsx'
)

function readHotspotStatusLabelSource(): string {
  return readFileSync(hotspotStatusLabelPath, 'utf8')
}

test('HotspotStatusLabel uses a focusable tooltip trigger with an explicit accessible name', () => {
  const source = readHotspotStatusLabelSource()

  assert.match(source, /TooltipTrigger asChild>\s*<button/s)
  assert.match(
    source,
    /aria-label=\{`Explain hotspot priority status: \$\{label\}`\}/
  )
  assert.doesNotMatch(source, /<span[\s\S]*cursor-help/)
})
