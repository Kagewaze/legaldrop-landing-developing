import assert from 'node:assert/strict'
import test from 'node:test'

// R-M1 — WHICH booking is being recovered or was completed.
//
// bookingSummary describes a stored or submitted order body for display: the pickup and drop-off
// addresses, the pricing mode and any scheduled time — what a customer needs to recognise their own
// booking. It never returns names, phone numbers, emails, notes or payment data, and it never builds
// anything from the current form.

const { bookingSummary } = await import('../src/lib/paid-booking-recovery.mjs')

const body = {
  pricingMode: 'standard',
  senderAddress: '1 Synthetic Origin St',
  senderName: 'Sam Sender',
  senderPhone: '+15550000001',
  type: 'instant_pickup',
  receivers: [
    {
      receiverName: 'Dana Dropoff',
      receiverPhone: '+15550000002',
      receiverEmail: 'dana@example.invalid',
      receiverNote: 'side door',
      receiverAddress: '2 Synthetic Dest Ave',
    },
  ],
  paymentIntent: 'pi_x',
}

test('summarises addresses, pricing mode and schedule only', () => {
  assert.deepEqual(bookingSummary(body), {
    pickupAddress: '1 Synthetic Origin St',
    dropoffAddress: '2 Synthetic Dest Ave',
    pricingMode: 'standard',
    scheduledPickupAt: null,
  })
})

test('carries a scheduled pickup time and DropBatch mode from the body', () => {
  const s = bookingSummary({
    ...body,
    pricingMode: 'dropbatch',
    type: 'scheduled_pickup',
    pickUpTime: '2026-11-20T15:00:00.000Z',
  })
  assert.equal(s.pricingMode, 'dropbatch')
  assert.equal(s.scheduledPickupAt, '2026-11-20T15:00:00.000Z')
})

test('never exposes contact or payment data', () => {
  const text = JSON.stringify(bookingSummary(body))
  for (const secret of ['Sam Sender', '+1555', 'Dana Dropoff', 'dana@', 'side door', 'pi_x']) {
    assert.equal(text.includes(secret), false, secret)
  }
})

test('returns null for anything that is not an order body', () => {
  for (const value of [null, undefined, 'x', {}, { senderAddress: 'a' }, { receivers: [] }]) {
    assert.equal(bookingSummary(value), null, JSON.stringify(value))
  }
})
