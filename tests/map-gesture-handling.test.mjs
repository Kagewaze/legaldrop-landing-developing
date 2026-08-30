import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const readSource = (relativePath) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')

const MAP_SURFACES = [
  {
    name: 'consumer tracking map',
    source: '../src/app/track/[trackingCode]/TrackingMap.jsx',
  },
  {
    name: 'partner tracking map',
    source: '../src/app/track-partner/[trackingToken]/PartnerTrackingMap.jsx',
  },
  {
    name: 'send booking map',
    source: '../src/components/send/SendMap.jsx',
  },
]

for (const surface of MAP_SURFACES) {
  test(`${surface.name} explicitly enables one-finger map pan`, () => {
    const source = readSource(surface.source)

    assert.match(source, /new Map\([\s\S]*?gestureHandling:\s*['"]greedy['"]/)
  })
}
