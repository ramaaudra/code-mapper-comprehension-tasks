import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

function readProjectFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

function resolveProjectPath(relativePath) {
  return resolve(process.cwd(), relativePath)
}

test('app shell exposes branded favicon assets from the public directory', () => {
  const faviconVersion = 'tauta-20260423'
  const indexHtml = readProjectFile('index.html')
  const manifestRaw = readProjectFile('public/site.webmanifest')
  const manifest = JSON.parse(manifestRaw)

  const publicAssets = [
    'public/favicon.ico',
    'public/favicon-16x16.png',
    'public/favicon-32x32.png',
    'public/apple-touch-icon.png',
    'public/android-chrome-192x192.png',
    'public/android-chrome-512x512.png'
  ]

  for (const assetPath of publicAssets) {
    assert.equal(
      existsSync(resolveProjectPath(assetPath)),
      true,
      `expected ${assetPath} to exist`
    )
  }

  assert.match(indexHtml, new RegExp(`href="/favicon\\.ico\\?v=${faviconVersion}"`))
  assert.match(
    indexHtml,
    new RegExp(`href="/favicon-32x32\\.png\\?v=${faviconVersion}"`)
  )
  assert.match(
    indexHtml,
    new RegExp(`href="/favicon-16x16\\.png\\?v=${faviconVersion}"`)
  )
  assert.match(
    indexHtml,
    new RegExp(`href="/apple-touch-icon\\.png\\?v=${faviconVersion}"`)
  )
  assert.match(
    indexHtml,
    new RegExp(`rel="manifest"\\s+href="/site\\.webmanifest\\?v=${faviconVersion}"`)
  )
  assert.match(indexHtml, /meta name="theme-color" content="#111111"/)

  assert.equal(manifest.name, 'Tauta')
  assert.equal(manifest.short_name, 'Tauta')
  assert.equal(manifest.theme_color, '#111111')
  assert.equal(manifest.background_color, '#111111')
  assert.deepEqual(
    manifest.icons?.map((icon) => icon.src),
    [
      `/android-chrome-192x192.png?v=${faviconVersion}`,
      `/android-chrome-512x512.png?v=${faviconVersion}`
    ]
  )
})
