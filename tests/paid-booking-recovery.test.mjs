import assert from 'node:assert/strict'
import test from 'node:test'

// D7 — A PAID BOOKING IS RECOVERED FROM ITS ORIGINAL CHECKOUT, NEVER FROM A NEW PRICE.
//
// inspectStoredPayment decides what a stored payment record means BEFORE anything is priced.
// Its only capability is reading the provider's state of the stored intent (retrieveIntent), so
// it structurally cannot quote, create a PaymentIntent or change a channel. The order body it
// hands back for recovery is the one stored immediately before the card was confirmed —
// byte-for-byte, never rebuilt from the current form or a fresh quote.

const {
  STORED_PAYMENT,
  classifyStoredPayment,
  inspectStoredPayment,
  recoveryOrderBody,
} = await import('../src/lib/paid-booking-recovery.mjs')

const PI = 'pi_test_original'
const orderPayload = Object.freeze({
  pricingMode: 'standard',
  senderLocation: { latitude: 43.65, longitude: -79.38 },
  senderAddress: '1 Synthetic Pickup St',
  senderName: 'Sam Sender',
  senderPhone: '+15550000001',
  bookingDirection: 'send',
  type: 'instant_pickup',
  vehicle: 'car',
  packageCount: 1,
  section: 'other',
  receivers: [
    {
      receiverName: 'Dana Dropoff',
      receiverAddress: '4 Synthetic Dropoff Ave',
      receiverLocation: { latitude: 43.7, longitude: -79.41 },
      distance: 5.2,
      weight: 2,
      receiverPhone: '+15550000002',
    },
  ],
  paymentIntent: PI,
})
const storedRecord = (over = {}) => ({
  inputsHash: 'h-1',
  paymentIntentId: PI,
  clientSecret: `${PI}_secret_x`,
  fee: 25.37,
  referralAdjustment: 0.37,
  orderPayload,
  ...over,
})
const intent = (status, over = {}) => ({ id: PI, status, ...over })
const classify = (stored, intentState, over = {}) =>
  classifyStoredPayment({
    stored,
    intent: intentState,
    retrieveFailed: false,
    pricingMode: 'standard',
    inputsHash: 'h-1',
    ...over,
  })

// ── classification ──────────────────────────────────────────────────────────────────────────

test('no stored record: nothing to recover, a new booking proceeds normally', () => {
  assert.equal(classify(null, null).action, STORED_PAYMENT.NONE)
})

test('a succeeded intent is RECOVERED with the stored original order body, whatever the current inputs or mode', () => {
  for (const pricingMode of ['standard', 'dropbatch']) {
    for (const inputsHash of ['h-1', 'h-changed']) {
      const decision = classify(storedRecord(), intent('succeeded'), { pricingMode, inputsHash })
      assert.equal(decision.action, STORED_PAYMENT.RECOVER, `${pricingMode}/${inputsHash}`)
      assert.deepEqual(decision.body, orderPayload)
    }
  }
})

test('a succeeded intent without a usable original body is never rebuilt: support is required', () => {
  for (const stored of [
    storedRecord({ orderPayload: undefined }),
    storedRecord({ orderPayload: { ...orderPayload, paymentIntent: 'pi_someone_else' } }),
    storedRecord({ orderPayload: { ...orderPayload, receivers: [] } }),
    storedRecord({ orderPayload: 'not-an-object' }),
  ]) {
    assert.equal(classify(stored, intent('succeeded')).action, STORED_PAYMENT.PAID_NEEDS_SUPPORT)
  }
})

test('processing or held funds are PENDING: no form, no new price, no order yet', () => {
  assert.equal(classify(storedRecord(), intent('processing')).action, STORED_PAYMENT.PENDING)
  assert.equal(classify(storedRecord(), intent('requires_capture')).action, STORED_PAYMENT.PENDING)
})

test('an unreadable provider state or a foreign intent is UNVERIFIABLE: fail closed, never "not charged"', () => {
  assert.equal(
    classifyStoredPayment({ stored: storedRecord(), intent: null, retrieveFailed: true }).action,
    STORED_PAYMENT.UNVERIFIABLE,
  )
  assert.equal(classify(storedRecord(), null).action, STORED_PAYMENT.UNVERIFIABLE)
  assert.equal(
    classify(storedRecord(), intent('succeeded', { id: 'pi_foreign' })).action,
    STORED_PAYMENT.UNVERIFIABLE,
  )
  assert.equal(classify(storedRecord(), intent('some_future_status')).action, STORED_PAYMENT.UNVERIFIABLE)
})

test('an unpaid intent keeps today\'s rules: Standard may reuse it for the same inputs, DropBatch discards it', () => {
  for (const status of ['requires_payment_method', 'requires_confirmation', 'requires_action']) {
    assert.equal(classify(storedRecord(), intent(status)).action, STORED_PAYMENT.REUSE_UNPAID)
    assert.equal(
      classify(storedRecord(), intent(status), { pricingMode: 'dropbatch' }).action,
      STORED_PAYMENT.DISCARD,
    )
    assert.equal(
      classify(storedRecord(), intent(status), { inputsHash: 'h-changed' }).action,
      STORED_PAYMENT.NONE,
    )
  }
})

test('a canceled intent charged nobody: the record is discarded and a new booking may start', () => {
  assert.equal(classify(storedRecord(), intent('canceled')).action, STORED_PAYMENT.DISCARD)
})

// ── the recovery body ───────────────────────────────────────────────────────────────────────

test('the recovery body is a copy of the stored original: unchanged, unshared, no referral reference added', () => {
  const body = recoveryOrderBody(storedRecord())
  assert.deepEqual(body, orderPayload)
  assert.notEqual(body, orderPayload)
  assert.notEqual(body.receivers, orderPayload.receivers)
  assert.equal('referralSessionReference' in body, false)
  assert.equal(recoveryOrderBody(null), null)
})

// ── inspection: its only capability is reading the provider state ───────────────────────────

const recordingRetrieve = (result) => {
  const calls = []
  const retrieveIntent = async (clientSecret) => {
    calls.push(clientSecret)
    if (result instanceof Error) throw result
    return result
  }
  return { calls, retrieveIntent }
}

test('inspection reads the stored intent exactly once, by its own client secret, and nothing else', async () => {
  const { calls, retrieveIntent } = recordingRetrieve(intent('succeeded'))
  const decision = await inspectStoredPayment({
    stored: storedRecord(),
    pricingMode: 'standard',
    inputsHash: 'h-changed',
    retrieveIntent,
  })
  assert.deepEqual(calls, [`${PI}_secret_x`])
  assert.equal(decision.action, STORED_PAYMENT.RECOVER)
  assert.deepEqual(decision.body, orderPayload)
})

test('inspection without a stored record touches nothing', async () => {
  const { calls, retrieveIntent } = recordingRetrieve(intent('succeeded'))
  const decision = await inspectStoredPayment({ stored: null, retrieveIntent })
  assert.equal(decision.action, STORED_PAYMENT.NONE)
  assert.deepEqual(calls, [])
})

test('a provider error or an error result during inspection fails closed as UNVERIFIABLE', async () => {
  for (const result of [new Error('network down'), undefined, { error: { code: 'resource_missing' } }]) {
    const { retrieveIntent } = recordingRetrieve(result)
    const decision = await inspectStoredPayment({ stored: storedRecord(), retrieveIntent })
    assert.equal(decision.action, STORED_PAYMENT.UNVERIFIABLE)
    assert.equal(decision.body, undefined)
  }
})

test('repeated inspections of the same paid record hand back the same original body every time', async () => {
  const { retrieveIntent } = recordingRetrieve(intent('succeeded'))
  const first = await inspectStoredPayment({ stored: storedRecord(), retrieveIntent })
  const second = await inspectStoredPayment({ stored: storedRecord(), retrieveIntent })
  assert.deepEqual(first.body, second.body)
  assert.deepEqual(second.body, orderPayload)
})
