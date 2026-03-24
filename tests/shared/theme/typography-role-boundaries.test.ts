import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readSource(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

test('shared metric primitives reserve Atkinson Hyperlegible Next for metric values only', () => {
  const metricCardSource = readSource(
    '../../../src/shared/components/ui/metric-card.tsx'
  )
  const metricValueCardSource = readSource(
    '../../../src/shared/components/ui/metric-value-card.tsx'
  )
  const metricInsightCardSource = readSource(
    '../../../src/shared/components/ui/metric-insight-card.tsx'
  )

  assert.match(metricCardSource, /font-data text-metric font-semibold/)
  assert.match(metricCardSource, /font-data text-5xl font-semibold/)
  assert.match(
    metricValueCardSource,
    /font-data text-lg font-semibold tabular-nums leading-tight tracking-tight sm:text-xl/
  )
  assert.match(metricInsightCardSource, /font-data text-sm tabular-nums/)
})

test('detail and graph components use font-mono for file and module identifiers', () => {
  const detailHeaderSource = readSource(
    '../../../src/shared/components/ui/detail-panel-header.tsx'
  )
  const fileTreeViewSource = readSource(
    '../../../src/features/file-analysis/components/FileTreeView.tsx'
  )
  const dependencyGraphSource = readSource(
    '../../../src/features/graph/components/DependencyGraph.tsx'
  )
  const moduleNodeSource = readSource(
    '../../../src/features/graph/components/ModuleNode.tsx'
  )
  const moduleSidePanelSource = readSource(
    '../../../src/features/graph/components/ModuleSidePanel.tsx'
  )
  const architectureTableSource = readSource(
    '../../../src/features/architecture/components/ArchitectureTable.tsx'
  )
  const metricsPanelSource = readSource(
    '../../../src/features/dashboard/components/MetricsPanel.tsx'
  )
  const issuesPanelSource = readSource(
    '../../../src/features/dashboard/components/IssuesPanel.tsx'
  )

  assert.match(
    detailHeaderSource,
    /max-w-\[220px\] truncate font-mono text-xs text-muted-foreground/
  )
  assert.match(
    fileTreeViewSource,
    /className='flex-1 truncate font-mono text-sm text-foreground'/
  )
  assert.match(
    dependencyGraphSource,
    /className='truncate font-mono text-sm font-semibold text-\[hsl\(var\(--foreground\)\)\]'/
  )
  assert.match(
    dependencyGraphSource,
    /className='truncate font-mono text-xs text-\[hsl\(var\(--muted-foreground\)\)\]'/
  )
  assert.match(
    moduleNodeSource,
    /truncate font-mono text-sm font-semibold text-\[hsl\(var\(--foreground\)\)\]/
  )
  assert.match(
    moduleNodeSource,
    /truncate font-mono text-xs text-\[hsl\(var\(--muted-foreground\)\)\]/
  )
  assert.match(
    moduleSidePanelSource,
    /className='flex-1 truncate font-mono text-sm font-medium text-foreground'/
  )
  assert.match(
    moduleSidePanelSource,
    /className='truncate font-mono text-xs text-muted-foreground'/
  )
  assert.match(
    architectureTableSource,
    /className='max-w-xs truncate py-2 font-mono text-xs'/
  )
  assert.match(architectureTableSource, /className='truncate font-mono'/)
  assert.match(
    metricsPanelSource,
    /className='flex-1 truncate text-left font-mono font-medium text-foreground'/
  )
  assert.match(
    metricsPanelSource,
    /className='break-all text-left font-mono text-xs leading-tight text-muted-foreground'/
  )
  assert.match(
    issuesPanelSource,
    /className='font-mono text-sm font-medium text-foreground'/
  )
  assert.match(
    issuesPanelSource,
    /className='mt-1 truncate font-mono text-xs text-muted-foreground'/
  )
})

test('metric counts stay on the data typography channel', () => {
  const moduleNodeSource = readSource(
    '../../../src/features/graph/components/ModuleNode.tsx'
  )
  const architectureTableSource = readSource(
    '../../../src/features/architecture/components/ArchitectureTable.tsx'
  )
  const metricCardSource = readSource(
    '../../../src/shared/components/ui/metric-card.tsx'
  )

  assert.match(
    moduleNodeSource,
    /rounded-full bg-\[hsl\(var\(--muted\)\)\] font-data text-xs font-medium/
  )
  assert.match(
    architectureTableSource,
    /className='px-4 py-3 text-center font-data'/
  )
  assert.match(metricCardSource, /font-data text-metric font-semibold/)
  assert.match(metricCardSource, /font-data text-5xl font-semibold/)
})
