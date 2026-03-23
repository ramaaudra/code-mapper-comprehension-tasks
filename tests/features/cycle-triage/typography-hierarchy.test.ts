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
  assert.match(source, /mt-2 max-w-\[64ch\]/)
})

test('CycleTriageWorkspace makes the start-here card the strongest text block on first scan', () => {
  const source = readWorkspaceSource()

  assert.match(
    source,
    /max-w-\[30ch\] font-mono text-\[1\.375rem\] font-semibold leading-\[1\.35\] tracking-\[-0\.02em\] text-foreground/
  )
  assert.match(
    source,
    /max-w-\[34ch\] font-mono text-\[1\.625rem\] leading-\[1\.2\] tracking-\[-0\.02em\] text-foreground/
  )
  assert.match(source, /text-sm leading-6 text-muted-foreground/)
})

test('CycleQueue and CycleGraph use a cleaner mono type scale without a second sidebar paragraph', () => {
  const queueSource = readQueueSource()
  const graphSource = readGraphSource()

  assert.match(
    queueSource,
    /font-mono text-\[0\.975rem\] font-semibold leading-6 text-foreground/
  )
  assert.doesNotMatch(queueSource, /line-clamp-2/)
  assert.match(graphSource, /font-mono text-base leading-6 text-foreground/)
  assert.match(graphSource, /mt-2 text-sm leading-6 text-muted-foreground/)
})
