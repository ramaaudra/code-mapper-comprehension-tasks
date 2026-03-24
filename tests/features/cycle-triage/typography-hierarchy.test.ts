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
    /max-w-\[30ch\] font-mono text-\[1\.5rem\] font-semibold leading-\[1\.28\] tracking-\[-0\.02em\] text-foreground/
  )
  assert.match(source, /text-sm font-medium leading-6 text-foreground/)
  assert.match(source, /text-sm leading-6 text-muted-foreground/)
})

test('CycleQueue and CycleGraph use a cleaner mono type scale without repeating the primary action', () => {
  const queueSource = readQueueSource()
  const graphSource = readGraphSource()

  assert.match(
    queueSource,
    /font-mono text-\[0\.95rem\] font-semibold leading-6 text-foreground/
  )
  assert.match(queueSource, /text-\[11px\] leading-5 text-muted-foreground/)
  assert.match(graphSource, /font-mono text-base leading-6 text-foreground/)
  assert.match(graphSource, /mt-2 text-sm leading-6 text-muted-foreground/)
  assert.doesNotMatch(graphSource, /recommendedEdgeHint/)
})
