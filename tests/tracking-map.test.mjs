import assert from 'node:assert/strict'
import test from 'node:test'

import {
  collectBoundsCoordinates,
  computeMovementHeading,
  normalizeCoordinate,
  normalizeHeading,
  resolveDriverHeading,
} from '../src/lib/tracking-map.mjs'

test('normalizes supported coordinate shapes', () => {
  assert.deepEqual(normalizeCoordinate({ latitude: 43.65, longitude: -79.38 }), {
    lat: 43.65,
    lng: -79.38,
  })
  assert.deepEqual(normalizeCoordinate({ lat: 43.65, lng: -79.38 }), {
    lat: 43.65,
    lng: -79.38,
  })
  assert.deepEqual(normalizeCoordinate([-79.38, 43.65]), {
    lat: 43.65,
    lng: -79.38,
  })
})

test('rejects missing, non-finite, and out-of-range coordinates', () => {
  for (const coordinate of [
    null,
    {},
    [null, null],
    { latitude: 'invalid', longitude: -79 },
    { lat: 91, lng: 0 },
    { lat: 0, lng: -181 },
  ]) {
    assert.equal(normalizeCoordinate(coordinate), null)
  }
})

test('computes cardinal movement headings clockwise from north', () => {
  const origin = { lat: 0, lng: 0 }
  assert.ok(Math.abs(computeMovementHeading(origin, { lat: 1, lng: 0 }) - 0) < 0.001)
  assert.ok(Math.abs(computeMovementHeading(origin, { lat: 0, lng: 1 }) - 90) < 0.001)
  assert.ok(Math.abs(computeMovementHeading(origin, { lat: -1, lng: 0 }) - 180) < 0.001)
  assert.ok(Math.abs(computeMovementHeading(origin, { lat: 0, lng: -1 }) - 270) < 0.001)
})

test('does not derive heading from invalid, unchanged, or negligible movement', () => {
  const origin = { lat: 43.65, lng: -79.38 }
  assert.equal(computeMovementHeading(origin, origin), null)
  assert.equal(
    computeMovementHeading(origin, { lat: 43.650001, lng: -79.38 }),
    null,
  )
  assert.equal(computeMovementHeading(null, origin), null)
})

test('prefers valid backend heading and otherwise derives it from movement', () => {
  const westward = {
    previous: { lat: 0, lng: 1 },
    current: { lat: 0, lng: 0 },
  }
  assert.equal(resolveDriverHeading({ backendHeading: 45, ...westward }), 45)
  assert.equal(resolveDriverHeading({ backendHeading: 'invalid', ...westward }), 270)
  assert.equal(normalizeHeading(360), 0)
  assert.equal(normalizeHeading(-1), null)
  assert.equal(normalizeHeading(361), null)
})

test('collects a consumer driver-only bounds input', () => {
  assert.deepEqual(
    collectBoundsCoordinates({
      driver: { latitude: 43.65, longitude: -79.38 },
    }),
    [{ lat: 43.65, lng: -79.38 }],
  )
})

test('collects partner pickup, destinations, route, and driver in order', () => {
  assert.deepEqual(
    collectBoundsCoordinates({
      pickup: { lat: 1, lng: 2 },
      destinations: [
        { latitude: 3, longitude: 4 },
        [6, 5],
        null,
      ],
      route: [
        [8, 7],
        { lat: 9, lng: 10 },
      ],
      driver: { lat: 11, lng: 12 },
    }),
    [
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
      { lat: 7, lng: 8 },
      { lat: 9, lng: 10 },
      { lat: 11, lng: 12 },
    ],
  )
})

test('ignores missing optional bounds values', () => {
  assert.deepEqual(collectBoundsCoordinates(), [])
  assert.deepEqual(
    collectBoundsCoordinates({ destinations: [null, { lat: 1, lng: 2 }] }),
    [{ lat: 1, lng: 2 }],
  )
})
