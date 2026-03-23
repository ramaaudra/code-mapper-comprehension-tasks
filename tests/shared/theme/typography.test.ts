import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readIndexCss(): string {
  return readFileSync(
    new URL('../../../src/index.css', import.meta.url),
    'utf8'
  )
}

function readTailwindConfig(): string {
  return readFileSync(
    new URL('../../../tailwind.config.js', import.meta.url),
    'utf8'
  )
}

test('body typography keeps JetBrains Mono as the primary interface font', () => {
  const css = readIndexCss()

  assert.match(css, /font-family:\s*'JetBrains Mono',\s*monospace;/)
  assert.doesNotMatch(css, /font-family:\s*'IBM Plex Sans',\s*sans-serif;/)
})

test('tailwind font families keep JetBrains Mono for both app copy and code surfaces', () => {
  const config = readTailwindConfig()

  assert.match(config, /sans:\s*\['JetBrains Mono', 'monospace'\]/)
  assert.match(config, /mono:\s*\['JetBrains Mono', 'monospace'\]/)
})
