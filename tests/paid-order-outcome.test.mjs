import assert from 'node:assert/strict'
import test from 'node:test'

// D7c — WHAT A REFUSED POST /order MEANS FOR A PAYMENT STRIPE CONFIRMED.
//
// Only a confirmed payment ever reaches POST /order (PaymentForm calls onPaid on 'succeeded';
// recovery runs on a retrieved 'succeeded' intent). When the backend refuses that submission,
// the page must say what is true: the payment went through, and either a retry can help (a
// transient failure) or it cannot (identity, validation or checkout refusals) — in which case the
// customer is sent to support with the payment reference instead of a retry loop. Nothing here
// ever says "not charged", re-prices, or creates a payment.

const { ORDER_SUBMISSION, OrderRefusedError, orderSubmissionOutcome } = await import(
  '../src/lib/paid-booking-recovery.mjs'
)

test('2xx is a created order', () => {
  for (const status of [200, 201]) assert.equal(orderSubmissionOutcome(status), ORDER_SUBMISSION.CREATED)
})

test('transient failures may be retried with the same stored body', () => {
  for (const status of [0, undefined, 408, 425, 429, 500, 502, 503, 504]) {
    assert.equal(orderSubmissionOutcome(status), ORDER_SUBMISSION.RETRY, String(status))
  }
})

test('identity, validation and checkout refusals need support: a retry of the same body cannot succeed', () => {
  for (const status of [400, 401, 403, 404, 409, 410, 422]) {
    assert.equal(orderSubmissionOutcome(status), ORDER_SUBMISSION.NEEDS_SUPPORT, String(status))
  }
})

test('OrderRefusedError carries the HTTP status and its classified outcome', () => {
  const refused = new OrderRefusedError(401)
  assert.equal(refused.status, 401)
  assert.equal(refused.outcome, ORDER_SUBMISSION.NEEDS_SUPPORT)
  assert.equal(new OrderRefusedError(503).outcome, ORDER_SUBMISSION.RETRY)
  assert.ok(refused instanceof Error)
})
