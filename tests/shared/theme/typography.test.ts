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

test('body typography uses Recursive Sans as the primary interface font', () => {
  const css = readIndexCss()
  const bodyBlock =
    css.match(/body\s*\{[\s\S]*?background-color:[\s\S]*?\n  \}/)?.[0] ?? ''

  assert.match(
    bodyBlock,
    /font-family:\s*'Recursive',\s*system-ui,\s*sans-serif;/
  )
  assert.match(bodyBlock, /font-kerning:\s*normal;/)
  assert.match(
    bodyBlock,
    /font-variation-settings:\s*'MONO'\s*0,\s*'CASL'\s*0\.5,\s*'slnt'\s*0;/
  )
  assert.doesNotMatch(
    bodyBlock,
    /font-family:\s*'JetBrains Mono',\s*monospace;/
  )
  assert.doesNotMatch(css, /font-family:\s*'Geist Sans'/)
})

test('tailwind font families use Recursive Sans for app copy and JetBrains Mono for code and data', () => {
  const config = readTailwindConfig()

  assert.match(config, /sans:\s*\['Recursive',\s*'system-ui',\s*'sans-serif'\]/)
  assert.match(config, /mono:\s*\['JetBrains Mono',\s*'monospace'\]/)
  assert.match(config, /data:\s*\['JetBrains Mono',\s*'monospace'\]/)
})

test('global code-like elements keep JetBrains Mono for evidence surfaces', () => {
  const css = readIndexCss()

  assert.match(
    css,
    /code,\s*kbd,\s*pre,\s*samp\s*\{[\s\S]*font-family:\s*'JetBrains Mono',\s*monospace;/
  )
  assert.match(css, /font-variant-ligatures:\s*none;/)
})
