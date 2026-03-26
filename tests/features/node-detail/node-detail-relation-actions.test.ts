import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const nodeDetailPanelPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailPanel.tsx'
)
const nodeDetailRelationsSectionPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailRelationsSection.tsx'
)
const panelStatePath = path.resolve(
  process.cwd(),
  'src/features/node-detail/lib/panel-state.ts'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('NodeDetail relation actions stay visible and keep report-mode gating as a single source of truth', () => {
  const panelSource = readSource(nodeDetailPanelPath)
  const relationsSource = readSource(nodeDetailRelationsSectionPath)
  const stateSource = readSource(panelStatePath)

  assert.match(panelSource, /<NodeDetailRelationsSection/)
  assert.doesNotMatch(
    relationsSource,
    /opacity-0 transition-opacity group-hover:opacity-100/
  )
  assert.match(
    relationsSource,
    /<button[\s\S]*aria-label=\{`Trace path to \$\{item\.basename\}`\}[\s\S]*nodeDetailCopy\.dependencyList\.tracePath/
  )
  assert.match(
    stateSource,
    /export function shouldShowTracePathAction\(isReportMode: boolean\): boolean \{\s*return !isReportMode\s*\}/
  )
})
