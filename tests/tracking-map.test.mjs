import assert from 'node:assert/strict'
import test from 'node:test'

import {
  collectBoundsCoordinates,
  computeMovementHeading,
  getConsumerRouteGeography,
  getConsumerRouteGeographySignature,
  getPartnerGeography,
  getPartnerGeographySignature,
  easeInOutCubic,
  interpolateCoordinate,
  normalizeCoordinate,
  normalizeHeading,
  resolveDriverHeading,
} from '../src/lib/tracking-map.mjs'

function consumerRouteSignature(input) {
  return getConsumerRouteGeographySignature(getConsumerRouteGeography(input))
}

test('normalizes consumer destination and an authoritative route', () => {
  assert.deepEqual(
    getConsumerRouteGeography({
      destinationLocation: { latitude: 43.67, longitude: -79.36 },
      route: {
        coordinates: [
          { latitude: 43.65, longitude: -79.38 },
          { lat: 43.67, lng: -79.36 },
        ],
      },
    }),
    {
      destination: { lat: 43.67, lng: -79.36 },
      route: [
        { lat: 43.65, lng: -79.38 },
        { lat: 43.67, lng: -79.36 },
      ],
    },
  )
})

test('rejects malformed consumer routes without inventing geometry', () => {
  assert.deepEqual(
    getConsumerRouteGeography({
      destinationLocation: { lat: 43.67, lng: -79.36 },
      route: { coordinates: [null, { lat: 91, lng: 0 }] },
    }),
    { destination: { lat: 43.67, lng: -79.36 }, route: [] },
  )
  assert.deepEqual(
    getConsumerRouteGeography({
      route: {
        coordinates: [
          { lat: 43.65, lng: -79.38 },
          { lat: 43.67, lng: -79.36 },
        ],
      },
    }),
    { destination: null, route: [] },
  )
})

test('equivalent fresh consumer route payloads have the same signature', () => {
  assert.equal(
    consumerRouteSignature({
      destinationLocation: { latitude: 43.67, longitude: -79.36 },
      route: {
        coordinates: [
          { latitude: 43.65, longitude: -79.38 },
          { latitude: 43.67, longitude: -79.36 },
        ],
      },
    }),
    consumerRouteSignature({
      destinationLocation: { lat: 43.67, lng: -79.36 },
      route: {
        coordinates: [
          [-79.38, 43.65],
          [-79.36, 43.67],
        ],
      },
    }),
  )
})

test('consumer route signature changes with destination or route geometry', () => {
  const base = {
    destinationLocation: { lat: 43.67, lng: -79.36 },
    route: {
      coordinates: [
        { lat: 43.65, lng: -79.38 },
        { lat: 43.67, lng: -79.36 },
      ],
    },
  }
  assert.notEqual(
    consumerRouteSignature(base),
    consumerRouteSignature({
      ...base,
      destinationLocation: { lat: 43.68, lng: -79.35 },
    }),
  )
  assert.notEqual(
    consumerRouteSignature(base),
    consumerRouteSignature({
      ...base,
      route: {
        coordinates: [
          { lat: 43.65, lng: -79.38 },
          { lat: 43.66, lng: -79.37 },
          { lat: 43.67, lng: -79.36 },
        ],
      },
    }),
  )
})

test('interpolates only between normalized successive coordinates', () => {
  assert.deepEqual(
    interpolateCoordinate(
      { lat: 43.65, lng: -79.4 },
      { lat: 43.67, lng: -79.36 },
      0.5,
    ),
    { lat: 43.66, lng: -79.38 },
  )
  assert.deepEqual(
    interpolateCoordinate({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, -1),
    { lat: 1, lng: 2 },
  )
  assert.deepEqual(
    interpolateCoordinate({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, 2),
    { lat: 3, lng: 4 },
  )
  assert.equal(interpolateCoordinate(null, { lat: 3, lng: 4 }, 0.5), null)
})

test('uses a clamped ease that starts and ends at actual coordinates', () => {
  assert.equal(easeInOutCubic(-1), 0)
  assert.equal(easeInOutCubic(0), 0)
  assert.equal(easeInOutCubic(0.5), 0.5)
  assert.equal(easeInOutCubic(1), 1)
  assert.equal(easeInOutCubic(2), 1)
})

test('normalizes supported coordinate shapes', () => {
  assert.deepEqual(
    normalizeCoordinate({ latitude: 43.65, longitude: -79.38 }),
    {
      lat: 43.65,
      lng: -79.38,
    },
  )
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
  assert.ok(
    Math.abs(computeMovementHeading(origin, { lat: 1, lng: 0 }) - 0) < 0.001,
  )
  assert.ok(
    Math.abs(computeMovementHeading(origin, { lat: 0, lng: 1 }) - 90) < 0.001,
  )
  assert.ok(
    Math.abs(computeMovementHeading(origin, { lat: -1, lng: 0 }) - 180) < 0.001,
  )
  assert.ok(
    Math.abs(computeMovementHeading(origin, { lat: 0, lng: -1 }) - 270) < 0.001,
  )
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
  assert.equal(
    resolveDriverHeading({ backendHeading: 'invalid', ...westward }),
    270,
  )
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
      destinations: [{ latitude: 3, longitude: 4 }, [6, 5], null],
      route: [[8, 7], { lat: 9, lng: 10 }],
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

function geographySignature(input) {
  return getPartnerGeographySignature(getPartnerGeography(input))
}

test('equivalent fresh partner geography objects have the same signature', () => {
  const first = geographySignature({
    senderLocation: { latitude: 43.65, longitude: -79.38 },
    receivers: [
      {
        receiverName: 'First stop',
        receiverLocation: { latitude: 43.66, longitude: -79.37 },
      },
    ],
    route: {
      coordinates: [
        [-79.38, 43.65],
        [-79.37, 43.66],
      ],
    },
  })
  const second = geographySignature({
    senderLocation: { lat: 43.65, lng: -79.38 },
    receivers: [
      {
        receiverName: 'First stop',
        receiverLocation: { lat: 43.66, lng: -79.37 },
      },
    ],
    route: {
      coordinates: [
        { lat: 43.65, lng: -79.38 },
        { lat: 43.66, lng: -79.37 },
      ],
    },
  })
  assert.equal(first, second)
})

test('partner geography signature changes for pickup corrections', () => {
  const base = { senderLocation: { lat: 1, lng: 2 } }
  assert.notEqual(
    geographySignature(base),
    geographySignature({ senderLocation: { lat: 1.1, lng: 2 } }),
  )
})

test('partner geography signature changes for destination corrections', () => {
  const base = {
    receivers: [{ receiverLocation: { lat: 1, lng: 2 } }],
  }
  assert.notEqual(
    geographySignature(base),
    geographySignature({
      receivers: [{ receiverLocation: { lat: 1, lng: 2.1 } }],
    }),
  )
})

test('destination additions, removals, and order change the signature', () => {
  const first = { receiverLocation: { lat: 1, lng: 2 } }
  const second = { receiverLocation: { lat: 3, lng: 4 } }
  const one = geographySignature({ receivers: [first] })
  const two = geographySignature({ receivers: [first, second] })
  const reversed = geographySignature({ receivers: [second, first] })

  assert.notEqual(one, two)
  assert.notEqual(two, reversed)
  assert.equal(one, geographySignature({ receivers: [first, null] }))
})

test('partner geography signature changes for backend route corrections', () => {
  assert.notEqual(
    geographySignature({
      route: {
        coordinates: [
          [2, 1],
          [4, 3],
        ],
      },
    }),
    geographySignature({
      route: {
        coordinates: [
          [2, 1],
          [5, 3],
        ],
      },
    }),
  )
})

test('invalid partner geography points normalize safely', () => {
  assert.deepEqual(
    getPartnerGeography({
      senderLocation: { lat: 100, lng: 0 },
      receivers: [null, { receiverLocation: { lat: 1, lng: 2 } }],
      route: { coordinates: [null, ['invalid', 3], [4, 5]] },
    }),
    {
      pickup: null,
      destinations: [
        {
          position: { lat: 1, lng: 2 },
          stopNumber: 2,
          title: 'Stop 2',
        },
      ],
      route: [{ lat: 5, lng: 4 }],
    },
  )
})

test('driver coordinates are excluded from static partner geography signature', () => {
  const geography = getPartnerGeography({
    senderLocation: { lat: 1, lng: 2 },
    driverLocation: { lat: 3, lng: 4 },
  })
  assert.equal(
    getPartnerGeographySignature(geography),
    geographySignature({ senderLocation: { lat: 1, lng: 2 } }),
  )
})
