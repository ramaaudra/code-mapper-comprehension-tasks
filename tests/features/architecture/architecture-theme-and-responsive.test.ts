import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architecturePagePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitecturePage.tsx'
)
const architectureTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTable.tsx'
)
const couplingBreakdownPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/CouplingBreakdown.tsx'
)
const instabilityBadgePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/InstabilityBadge.tsx'
)
const cycleBadgePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/CycleBadge.tsx'
)
const metricCardPath = path.resolve(
  process.cwd(),
  'src/shared/components/ui/metric-card.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('Architecture surfaces use theme tokens and responsive breakdown layouts instead of one-off colors and rigid table animations', () => {
  const pageSource = readSource(architecturePagePath)
  const tableSource = readSource(architectureTablePath)
  const couplingBreakdownSource = readSource(couplingBreakdownPath)
  const instabilityBadgeSource = readSource(instabilityBadgePath)
  const cycleBadgeSource = readSource(cycleBadgePath)
  const metricCardSource = readSource(metricCardPath)

  assert.match(
    couplingBreakdownSource,
    /grid grid-cols-1 gap-4 text-xs sm:grid-cols-2/
  )
  assert.match(
    instabilityBadgeSource,
    /border-border\/60 bg-muted\/30 text-muted-foreground/
  )
  assert.match(
    cycleBadgeSource,
    /border-status-critical-border[\s\S]*bg-status-critical-surface[\s\S]*text-status-critical-foreground/
  )
  assert.match(metricCardSource, /text-status-warning-foreground/)

  assert.doesNotMatch(pageSource, /blue-\d{3}/)
  assert.doesNotMatch(pageSource, /cyan-\d{3}/)
  assert.doesNotMatch(pageSource, /emerald-\d{3}/)
  assert.doesNotMatch(pageSource, /slate-\d{3}/)
  assert.doesNotMatch(tableSource, /slate-\d{3}/)
  assert.doesNotMatch(tableSource, /transition-all/)
  assert.doesNotMatch(instabilityBadgeSource, /slate-\d{3}/)
  assert.doesNotMatch(cycleBadgeSource, /red-\d{3}/)
  assert.doesNotMatch(metricCardSource, /orange-500/)
})
