// What a stored payment record means, decided BEFORE anything is priced (D7).
//
// A stored record is written when get-fee hands this tab a PaymentIntent, and completed with the
// original order body immediately before the card is confirmed (see persistBeforeConfirm). It
// means "a PaymentIntent exists and no order has been created for it yet".
//
// THE RULE: a paid booking is recovered from its ORIGINAL checkout — the stored order body, sent
// to POST /order, where the backend verifies the intent with Stripe, its owner, its amount and the
// checkout frozen when it was created, and returns an existing order idempotently. It is never
// re-priced, never rebuilt from the current form or a fresh quote, and never given a new
// PaymentIntent. That is what lets a customer who paid before a Partner was suspended still get
// the order they paid for, while a NEW booking for that Partner is refused.
//
// This module can only READ the provider's state of the stored intent (retrieveIntent). It
// cannot quote, create an intent, or change a channel, by construction.

export const STORED_PAYMENT = Object.freeze({
  // No record: a new booking proceeds normally.
  NONE: 'none',
  // Paid, with its original order body: submit that body, unchanged.
  RECOVER: 'recover',
  // Unpaid, same inputs, Standard: may be reused after the fresh quote confirms its amount.
  REUSE_UNPAID: 'reuse-unpaid',
  // Charged nobody (canceled, or an unpaid DropBatch intent): drop it, then book normally.
  DISCARD: 'discard',
  // Processing, or funds held: not an order yet, not a failure. No form, no new price.
  PENDING: 'pending',
  // The provider state could not be read, or the record does not describe its own intent.
  // Fail closed: never "not charged", never a new payment form.
  UNVERIFIABLE: 'unverifiable',
  // Paid, but the original order body is missing or inconsistent. It is NEVER rebuilt from the
  // current form or a new quote: support completes it from the payment reference.
  PAID_NEEDS_SUPPORT: 'paid-needs-support',
})

const UNPAID = new Set(['requires_payment_method', 'requires_confirmation', 'requires_action'])
const IN_FLIGHT = new Set(['processing', 'requires_capture'])

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * The stored original order body for this record's intent, as an unshared copy — or null when
 * there is none or it does not belong to this intent. Never assembled from anything else.
 */
export function recoveryOrderBody(stored) {
  const body = stored?.orderPayload
  if (
    !isObject(body) ||
    typeof stored.paymentIntentId !== 'string' ||
    body.paymentIntent !== stored.paymentIntentId ||
    !isObject(body.senderLocation) ||
    !Array.isArray(body.receivers) ||
    body.receivers.length === 0
  ) {
    return null
  }
  return JSON.parse(JSON.stringify(body))
}

/**
 * What a customer needs to recognise WHICH booking an order body is (R-M1): its pickup and drop-off
 * addresses, its pricing mode and any scheduled pickup time. Never names, phone numbers, emails, notes
 * or payment data, and never anything from the current form. Null when the value is not an order body.
 */
export function bookingSummary(body) {
  const dropoff = Array.isArray(body?.receivers) ? body.receivers[0] : undefined
  if (
    !isObject(body) ||
    typeof body.senderAddress !== 'string' ||
    !isObject(dropoff) ||
    typeof dropoff.receiverAddress !== 'string'
  ) {
    return null
  }
  return {
    pickupAddress: body.senderAddress,
    dropoffAddress: dropoff.receiverAddress,
    pricingMode: body.pricingMode === 'dropbatch' ? 'dropbatch' : 'standard',
    scheduledPickupAt:
      body.type === 'scheduled_pickup' && typeof body.pickUpTime === 'string' ? body.pickUpTime : null,
  }
}

/** Pure decision from the stored record and the provider's view of its intent. */
export function classifyStoredPayment({ stored, intent, retrieveFailed, pricingMode, inputsHash }) {
  if (!stored) return { action: STORED_PAYMENT.NONE }
  if (retrieveFailed || !isObject(intent) || intent.id !== stored.paymentIntentId) {
    return { action: STORED_PAYMENT.UNVERIFIABLE }
  }
  if (intent.status === 'succeeded') {
    const body = recoveryOrderBody(stored)
    return body
      ? { action: STORED_PAYMENT.RECOVER, body }
      : { action: STORED_PAYMENT.PAID_NEEDS_SUPPORT }
  }
  if (IN_FLIGHT.has(intent.status)) return { action: STORED_PAYMENT.PENDING }
  if (intent.status === 'canceled') return { action: STORED_PAYMENT.DISCARD }
  if (UNPAID.has(intent.status)) {
    // Today's rules for an UNPAID record, unchanged: an intent for other inputs is ignored, a
    // DropBatch intent is never payment authority on a later load, a Standard one may be reused.
    if (stored.inputsHash !== inputsHash) return { action: STORED_PAYMENT.NONE }
    return pricingMode === 'dropbatch'
      ? { action: STORED_PAYMENT.DISCARD }
      : { action: STORED_PAYMENT.REUSE_UNPAID }
  }
  return { action: STORED_PAYMENT.UNVERIFIABLE }
}

/**
 * Reads the provider's state of the stored intent (once, by its own client secret) and
 * classifies it. Any failure to read is UNVERIFIABLE.
 */
export async function inspectStoredPayment({ stored, pricingMode, inputsHash, retrieveIntent }) {
  if (!stored) return { action: STORED_PAYMENT.NONE }
  let intent = null
  let retrieveFailed = false
  try {
    intent = await retrieveIntent(stored.clientSecret)
  } catch {
    retrieveFailed = true
  }
  return classifyStoredPayment({ stored, intent, retrieveFailed, pricingMode, inputsHash })
}

// What a POST /order response means for a payment Stripe has ALREADY confirmed (D7c). Only a
// confirmed payment is ever submitted, so a refusal never means "not charged". A transient failure
// may be retried with the same stored body; an identity, validation or checkout refusal cannot be
// fixed by sending that body again, so the customer is sent to support with the payment reference
// instead of a retry loop.
export const ORDER_SUBMISSION = Object.freeze({
  CREATED: 'created',
  RETRY: 'retry',
  NEEDS_SUPPORT: 'needs-support',
})

const RETRYABLE_4XX = new Set([408, 425, 429])

export function orderSubmissionOutcome(status) {
  if (typeof status !== 'number' || status === 0) return ORDER_SUBMISSION.RETRY
  if (status >= 200 && status < 300) return ORDER_SUBMISSION.CREATED
  if (status >= 500 || RETRYABLE_4XX.has(status)) return ORDER_SUBMISSION.RETRY
  return ORDER_SUBMISSION.NEEDS_SUPPORT
}

export class OrderRefusedError extends Error {
  constructor(status) {
    super(`Order creation failed (${status})`)
    this.name = 'OrderRefusedError'
    this.status = status
    this.outcome = orderSubmissionOutcome(status)
  }
}
