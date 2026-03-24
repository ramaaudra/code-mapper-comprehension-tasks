import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readWorkspaceSource(): string {
  return readFileSync(
    new URL(
      '../../../src/features/cycle-triage/components/CycleTriageWorkspace.tsx',
      import.meta.url
    ),
    'utf8'
  )
}

function readQueueSource(): string {
  return readFileSync(
    new URL(
      '../../../src/features/cycle-triage/components/CycleQueue.tsx',
      import.meta.url
    ),
    'utf8'
  )
}

function readGraphSource(): string {
  return readFileSync(
    new URL(
      '../../../src/features/cycle-triage/components/CycleGraph.tsx',
      import.meta.url
    ),
    'utf8'
  )
}

test('CycleTriageWorkspace keeps the top summary and action explanation on a controlled reading measure', () => {
  const source = readWorkspaceSource()

  assert.match(
    source,
    /max-w-\[48ch\] text-base font-medium leading-7 text-foreground/
  )
  assert.match(source, /max-w-\[64ch\] text-sm leading-6 text-muted-foreground/)
})

test('CycleTriageWorkspace makes the first action the strongest text block on first scan', () => {
  const source = readWorkspaceSource()

  assert.match(
    source,
    /max-w-\[30ch\] font-sans text-\[1\.5rem\] font-semibold leading-\[1\.28\] tracking-\[-0\.02em\] text-foreground/
  )
  assert.match(source, /text-sm font-medium leading-6 text-foreground/)
  assert.match(source, /text-sm leading-6 text-muted-foreground/)
})

test('CycleQueue and CycleGraph keep narrative guidance in Atkinson Hyperlegible Next while preserving code-like evidence', () => {
  const queueSource = readQueueSource()
  const graphSource = readGraphSource()
  const workspaceSource = readWorkspaceSource()

  assert.match(
    queueSource,
    /text-\[0\.95rem\] font-semibold leading-6 text-foreground/
  )
  assert.match(queueSource, /text-xs leading-5 text-muted-foreground/)
  assert.match(graphSource, /text-base font-medium leading-6 text-foreground/)
  assert.match(graphSource, /mt-2 text-sm leading-6 text-muted-foreground/)
  assert.match(
    graphSource,
    /rounded-md border border-border\/60 bg-muted\/20 px-3 py-2 font-mono text-xs text-muted-foreground/
  )
  assert.match(
    workspaceSource,
    /rounded-lg border border-border\/70 bg-background\/70 px-3 py-2 font-mono text-sm leading-6 text-muted-foreground/
  )
  assert.match(
    graphSource,
    /fontFamily='Atkinson Hyperlegible Next, sans-serif'/
  )
  assert.doesNotMatch(
    graphSource,
    /fontFamily='Recursive, system-ui, sans-serif'/
  )
  assert.doesNotMatch(graphSource, /recommendedEdgeHint/)
})
