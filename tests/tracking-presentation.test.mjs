import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatTrackingEta,
  getDriverPresentation,
  getTrackingProgress,
  getTrackingStatusPresentation,
} from '../src/lib/tracking-presentation.mjs'

const expectedStatuses = {
  pending: ['Delivery booked', 'We’re preparing your delivery.'],
  assigned: [
    'Driver assigned',
    'A driver has been assigned to your delivery.',
  ],
  ongoing: ['Delivery in progress', 'Your delivery is in progress.'],
  delivered: ['Delivery completed', 'Your delivery has been completed.'],
  cancelled: ['Delivery cancelled', 'This delivery has been cancelled.'],
  failed: [
    'Delivery could not be completed',
    'This delivery could not be completed.',
  ],
  refunded: ['Delivery refunded', 'This delivery has been refunded.'],
}

test('uses conservative presentation for supported tracking statuses', () => {
  for (const [status, [headline, instruction]] of Object.entries(
    expectedStatuses,
  )) {
    const presentation = getTrackingStatusPresentation({ status })
    assert.equal(presentation.headline, headline)
    assert.equal(presentation.instruction, instruction)
  }
})

test('uses a neutral fallback for an unknown status', () => {
  assert.deepEqual(
    getTrackingStatusPresentation({ status: 'waiting_for_update' }),
    {
      statusLabel: 'Waiting For Update',
      headline: 'Order status',
      instruction: 'We’ll keep this page updated as your order progresses.',
      progress: {
        kind: 'unknown',
        label: 'Progress unavailable',
        currentIndex: -1,
      },
    },
  )
})

test('prefers meaningful backend message text and ignores blank text', () => {
  const withMessage = getTrackingStatusPresentation({
    status: 'assigned',
    message: { header: '  Driver update  ', description: '  Ready soon.  ' },
  })
  assert.equal(withMessage.headline, 'Driver update')
  assert.equal(withMessage.instruction, 'Ready soon.')

  const withoutMessage = getTrackingStatusPresentation({
    status: 'assigned',
    message: { header: ' ', description: '' },
  })
  assert.equal(withoutMessage.headline, 'Driver assigned')
  assert.equal(
    withoutMessage.instruction,
    'A driver has been assigned to your delivery.',
  )
})

test('formats all valid ETA field combinations without dangling separators', () => {
  assert.equal(
    formatTrackingEta({ durationText: '12 min', distanceText: '4 km' }),
    '12 min away · 4 km',
  )
  assert.equal(formatTrackingEta({ durationText: '12 min' }), '12 min away')
  assert.equal(formatTrackingEta({ distanceText: '4 km' }), '4 km')
  assert.equal(formatTrackingEta(), '')
  assert.equal(formatTrackingEta({ durationText: ' ', distanceText: '' }), '')
})

test('maps the happy path to coarse progress positions', () => {
  for (const [index, status] of [
    'pending',
    'assigned',
    'ongoing',
    'delivered',
  ].entries()) {
    assert.deepEqual(getTrackingProgress(status), {
      kind: 'normal',
      label: null,
      currentIndex: index,
    })
  }
})

test('does not present negative terminal states as completed progress', () => {
  for (const status of ['cancelled', 'failed', 'refunded']) {
    const progress = getTrackingProgress(status)
    assert.equal(progress.kind, 'negative')
    assert.equal(progress.currentIndex, -1)
  }
})

test('normalizes only allowlisted driver presentation fields', () => {
  assert.equal(getDriverPresentation(null), null)

  assert.deepEqual(getDriverPresentation({ firstName: 'Ayo' }), {
    name: 'Ayo',
    initial: 'A',
    photoUrl: null,
    vehicleLabel: null,
    ratingLabel: null,
  })

  assert.deepEqual(
    getDriverPresentation({
      firstName: 'Ayo',
      photoUrl: 'https://example.test/driver.jpg',
      vehicleType: 'cargo_bike',
      rating: 4.75,
      phone: 'not-exposed',
    }),
    {
      name: 'Ayo',
      initial: 'A',
      photoUrl: 'https://example.test/driver.jpg',
      vehicleLabel: 'Cargo Bike',
      ratingLabel: '4.8',
    },
  )
})

test('hides absent and invalid driver ratings', () => {
  for (const rating of [undefined, null, '', 0, -1, 'invalid']) {
    assert.equal(getDriverPresentation({ rating }).ratingLabel, null)
  }
})
