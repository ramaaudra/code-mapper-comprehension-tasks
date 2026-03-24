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

test('body typography uses Geist Sans as the primary interface font', () => {
  const css = readIndexCss()

  assert.match(css, /font-family:\s*'Geist Sans',\s*system-ui,\s*sans-serif;/)
  assert.doesNotMatch(css, /font-family:\s*'JetBrains Mono',\s*monospace;/)
})

test('tailwind font families use Geist Sans for app copy and JetBrains Mono for code', () => {
  const config = readTailwindConfig()

  assert.match(
    config,
    /sans:\s*\['Geist Sans',\s*'system-ui',\s*'sans-serif'\]/
  )
  assert.match(config, /mono:\s*\['JetBrains Mono',\s*'monospace'\]/)
  assert.match(config, /data:\s*\['JetBrains Mono',\s*'monospace'\]/)
})
