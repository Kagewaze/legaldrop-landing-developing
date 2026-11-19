import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// D7 — ON LOAD, A STORED PAYMENT IS RESOLVED BEFORE ANYTHING IS PRICED.
//
// pay/page.jsx is a React client component node --test cannot execute, so these assertions are
// static and bounded to the regions they describe (the same technique as booking-direction and
// check-dropbatch-containment). The decision itself is tested behaviourally in
// paid-booking-recovery.test.mjs and the submission identity in paid-order-identity.test.mjs.
//
// The defect being fixed: boot re-priced first (quote-itemized / DropBatch quote) and inspected
// the stored intent second. A paid customer whose re-price now fails — a suspended Partner (G2),
// a pricing outage, a DropBatch window that closed — was shown "You have not been charged" and
// never reached recovery; and a stored DropBatch record was discarded without asking whether it
// had been paid.

// Line endings normalized: checkouts may carry CRLF (core.autocrlf) and the markers below use \n.
const PAGE = readFileSync(
  fileURLToPath(new URL('../src/app/send/pay/page.jsx', import.meta.url)),
  'utf8',
).replace(/\r\n/g, '\n')

const region = (startMarker, endMarker) => {
  const start = PAGE.indexOf(startMarker)
  assert.ok(start >= 0, `missing ${startMarker}`)
  const end = PAGE.indexOf(endMarker, start + startMarker.length)
  assert.ok(end > start, `missing ${endMarker} after ${startMarker}`)
  return PAGE.slice(start, end)
}
const count = (text, needle) => text.split(needle).length - 1

const BOOT = region('async function boot()', '\n    boot()\n')
const firstIndex = (text, needle) => {
  const i = text.indexOf(needle)
  assert.ok(i >= 0, `missing ${needle}`)
  return i
}

test('boot inspects the stored payment BEFORE new-booking guards, routing or pricing', () => {
  const inspect = firstIndex(BOOT, 'inspectStoredPayment(')
  for (const later of [
    'hasBothAddresses(flow)',
    'packageCapacityRefusal(',
    'fetchDropBatchQuote(',
    'referralQuoteFetch(',
  ]) {
    assert.ok(inspect < firstIndex(BOOT, later), `${later} must come after the stored-payment inspection`)
  }
})

test('no stored record is cleared before the provider was asked about it', () => {
  const inspect = firstIndex(BOOT, 'inspectStoredPayment(')
  assert.equal(BOOT.slice(0, inspect).includes('clearPaymentSession()'), false)
})

test('the RECOVER branch submits the stored original body and never prices, sets up payment or rebuilds', () => {
  const branch = region('STORED_PAYMENT.RECOVER', 'return\n')
  assert.match(branch, /finishOrder\(decision\.body\)/)
  for (const forbidden of [
    'buildOrderPayload',
    'referralQuoteFetch',
    'referralCheckoutFetch',
    'fetchDropBatchQuote',
    'normalizedQuote',
  ]) {
    assert.equal(branch.includes(forbidden), false, `${forbidden} in the recovery branch`)
  }
})

test('the provider is asked only through the inspection adapter', () => {
  assert.equal(count(PAGE, 'retrievePaymentIntent('), 1)
  const inspect = BOOT.slice(firstIndex(BOOT, 'inspectStoredPayment('))
  assert.ok(inspect.indexOf('retrievePaymentIntent(') >= 0)
  assert.ok(inspect.indexOf('retrievePaymentIntent(') < inspect.indexOf('hasBothAddresses(flow)'))
})

test('every POST /order for a paid intent is sent as the checkout\'s own guest (no mint, no re-mint)', () => {
  const create = region('const createOrder = useCallback(', '\n  )\n')
  // D7c (M-1): the call now also names the checkout owner from the stored record
  // (submitPaidOrder(payload, { ownerUserId })); the guarantee asserted here is unchanged.
  assert.match(create, /submitPaidOrder\(payload, \{/)
  assert.equal(PAGE.includes("guestFetch('/order'"), false)
})

test('retry resubmits only the stored original body; it never rebuilds from the form or a quote', () => {
  const retry = region('const retryOrder = useCallback(', '\n  }, [')
  assert.match(retry, /recoveryOrderBody\(stored\)/)
  assert.equal(retry.includes('buildOrderPayload'), false)
  assert.equal(retry.includes('quote'), false)
})

test('a new booking still prices first and is the only path to get-fee', () => {
  assert.equal(count(PAGE, 'referralCheckoutFetch('), 1)
  const confirm = region('const confirmAndCreateIntent = useCallback(', '\n  }, [')
  assert.match(confirm, /referralCheckoutFetch\(/)
  assert.match(confirm, /paymentMinor !== previewMinor/)
  // buildOrderPayload is used only by the two paths that run while this page holds a fresh quote.
  assert.equal(count(PAGE, 'buildOrderPayload({'), 2)
})

test('pending, unconfirmed and paid-needs-support states never claim the customer was not charged', () => {
  for (const phase of ['paymentPending', 'paymentUnconfirmed', 'paidNeedsSupport']) {
    const screen = region(`if (phase === '${phase}')`, '\n  }\n')
    assert.equal(/not been charged|haven.t been charged|have not been charged/i.test(screen), false, phase)
    assert.match(screen, /paymentIntentIdRef\.current/, `${phase} shows the payment reference`)
    assert.match(screen, /contact-us/, `${phase} offers support`)
    assert.equal(screen.includes('PaymentForm'), false, `${phase} offers no way to pay again`)
  }
})

test('a boot failure while a stored payment is unresolved is reported as unconfirmed, not as "not charged"', () => {
  const failure = BOOT.slice(BOOT.lastIndexOf('} catch (error) {'))
  assert.match(failure, /'paymentUnconfirmed'/)
  assert.match(failure, /'error'/)
})
