import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const hook = read('../src/components/send/useDropBatchQuote.js')
const details = read('../src/app/send/details/page.jsx')
const card = read('../src/components/send/DropBatchQuoteCard.jsx')
const payment = read('../src/app/send/pay/page.jsx')
const payload = read('../src/components/send/buildOrderPayload.js')
const copy = read('../src/lib/dropbatch-copy.js')
const vehicles = read('../src/components/send/vehicles.js')
const sendFlow = read('../src/lib/send-flow.js')

test('send comparison uses backend eligibility and senderPays without a trip prerequisite', () => {
  assert.match(hook, /pickupTiming !== 'instant' && pickupTiming !== 'scheduled'/)
  assert.match(hook, /type:[\s\S]*'scheduled_pickup' : 'instant_pickup'/)
  assert.match(hook, /quote\?\.eligible === true/)
  assert.match(hook, /typeof senderPays === 'number'/)
  assert.match(hook, /Number\.isFinite\(senderPays\)/)
  assert.match(hook, /const senderPays = quote\?\.senderPays/)
  assert.doesNotMatch(hook, /matches|departureWindow|overCapacity|remaining/)
  assert.doesNotMatch(hook, /Math\.min\([^\n]*senderPays|sort\([^\n]*senderPays|reduce\([^\n]*senderPays/)
  assert.match(details, /<DropBatchQuoteCard/)
  // The decision point must carry the product definition itself. A customer who
  // reads only this card still has to learn that the driver is already going their
  // way, that the wait is the trade, and that nothing is matched yet.
  assert.match(card, /from '@\/lib\/dropbatch-copy'/)
  assert.match(card, /DROPBATCH_HEADLINE/)
  assert.match(card, /DROPBATCH_EXPLANATION/)
  assert.match(card, /DROPBATCH_NO_PROMISE/)
  assert.doesNotMatch(card, /job board|driver only becomes available/i)
  assert.match(copy, /already heading along your route/)
  assert.match(copy, /pickup may take longer/)
  assert.match(copy, /does not mean a driver has been found/)
})

test('delivery options remain visible for ASAP and unavailable DropBatch states', () => {
  assert.match(details, /<fieldset className="mt-8">[\s\S]*DELIVERY OPTION/)
  assert.match(details, /pickupTiming=\{flow\.pickupTiming\}/)
  assert.doesNotMatch(card, /80 km|below_minimum_distance/)
  assert.match(card, /selected vehicle is not eligible for DropBatch/)
  assert.match(card, /pricing is unavailable right now[\s\S]*Standard delivery remains available/)
  assert.match(card, /disabled=\{!eligible\}/)
  assert.match(card, /SHARED ROUTE/)
})

test('standard remains available while selected DropBatch requires a current signed quote', () => {
  assert.match(hook, /status: 'unavailable', quote: null/)
  assert.match(details, /pricingMode === 'standard' \|\| dropBatchSelectionValid/)
  assert.match(details, /dropBatchSelectionKey === dropBatch\.requestKey/)
  assert.match(payment, /fetchDropBatchQuote\(request\)/)
  assert.match(payment, /pricingMode: 'dropbatch'/)
  assert.doesNotMatch(payload, /senderPays|DropBatchQuoteCard/)
  assert.match(card, /Learn about DropBatch/)
})

test('comparison enablement does not expose marketplace or booking mutations', () => {
  assert.doesNotMatch(`${hook}\n${details}\n${card}`, /TripBoard|fetchPublicTrips|drop-batch\/book/)
  assert.doesNotMatch(card, />\s*(Book|Pay|Checkout|Reserve)\s*</i)
  assert.doesNotMatch(card, /compatible trip|departure|capacity|overCapacity/i)
})

test('unsupported Bike is refused before DropBatch fetch without leaving standard catalogue', () => {
  assert.match(hook, /if \(!isDropBatchSupportedVehicle\(vehicle\)\) return null/)
  const requestBuilder = hook.slice(
    hook.indexOf('export function buildDropBatchQuoteRequest'),
    hook.indexOf('export function useDropBatchQuote'),
  )
  assert.ok(
    requestBuilder.indexOf('if (!isDropBatchSupportedVehicle(vehicle)) return null') <
      requestBuilder.indexOf('return {'),
  )
  assert.match(vehicles, /id: 'bike'/)
  assert.doesNotMatch(hook, /senderPays\s*[+*\-/]/)
})

test('pricing mode defaults to standard, persists, and invalidates atomically with quote inputs', () => {
  assert.match(sendFlow, /pricingMode: 'standard'/)
  assert.match(sendFlow, /dropBatchSelectionKey: null/)
  assert.match(sendFlow, /const setPricingMode/)
  for (const field of ['pickup', 'dropoff', 'packageCount', 'vehicle', 'pickupTiming', 'scheduledPickupAt']) {
    assert.ok(sendFlow.includes(field), `missing invalidation input ${field}`)
  }
  assert.match(sendFlow, /\[\.\.\.standardInputs, 'dropbatch', state\?\.dropBatchSelectionKey\]/)
  assert.match(details, /setPricingMode\('dropbatch', dropBatch\.requestKey\)/)
})

test('checkout sends mode to both money authorities and never sends the displayed amount', () => {
  assert.match(payment, /pricingMode: 'dropbatch'/)
  assert.match(payment, /'scheduled_pickup'[\s\S]*'instant_pickup'/)
  assert.match(payment, /pickUpTime: flow\.scheduledPickupAt/)
  assert.match(payload, /pricingMode:[\s\S]*flow\.pricingMode === 'dropbatch'/)
  assert.doesNotMatch(payload, /senderPays|dropBatch\.senderPays/)
  assert.match(payment, /paymentMinor !== previewMinor/)
})

test('DropBatch failure never silently falls back to standard at payment', () => {
  assert.match(payment, /Your DropBatch selection is no longer valid/)
  assert.match(payment, /DropBatch is no longer available/)
  assert.doesNotMatch(payment, /catch[\s\S]{0,300}pricingMode:\s*'standard'/)
})

test('DropBatch never restores a stored PaymentIntent while Standard recovery remains', async () => {
  // D7 restructured boot: every stored record is first classified from Stripe's state
  // (src/lib/paid-booking-recovery.mjs), and only an UNPAID one reaches the old rules. The
  // invariant is unchanged: an unpaid stored DropBatch intent is discarded and never becomes
  // payment authority (no restored client secret or fee), while an unpaid Standard intent for
  // the same inputs may still be reused after the fresh quote confirms its amount.
  //
  // Deliberate D7 change, stated here so it is not mistaken for a regression: a PAID DropBatch
  // record is no longer discarded. It is recovered — its stored original order body is submitted
  // to POST /order, which verifies it — instead of being thrown away with the customer charged.
  const { STORED_PAYMENT, classifyStoredPayment } = await import(
    '../src/lib/paid-booking-recovery.mjs'
  )
  const stored = { paymentIntentId: 'pi_x', clientSecret: 's', inputsHash: 'h' }
  for (const status of ['requires_payment_method', 'requires_confirmation', 'requires_action']) {
    const intent = { id: 'pi_x', status }
    assert.equal(
      classifyStoredPayment({ stored, intent, pricingMode: 'dropbatch', inputsHash: 'h' }).action,
      STORED_PAYMENT.DISCARD,
    )
    assert.equal(
      classifyStoredPayment({ stored, intent, pricingMode: 'standard', inputsHash: 'h' }).action,
      STORED_PAYMENT.REUSE_UNPAID,
    )
  }

  const boot = payment.slice(payment.indexOf('async function boot()'), payment.indexOf('// 3. NEW-BOOKING GUARDS'))
  assert.match(boot, /decision\.action === STORED_PAYMENT\.DISCARD\)\s*\{\s*clearPaymentSession\(\)/)
  assert.match(boot, /reuseUnpaid = decision\.action === STORED_PAYMENT\.REUSE_UNPAID/)
  assert.doesNotMatch(boot, /setClientSecret|setFee/)

  const standardRecovery = payment.slice(
    payment.indexOf('if (reuseUnpaid) {'),
    payment.indexOf('// 6. No usable intent'),
  )
  assert.match(standardRecovery, /setClientSecret\(stored\.clientSecret\)/)
  assert.match(standardRecovery, /setFee\(Number\(stored\.fee\)\)/)
  assert.match(boot, /stripe\.retrievePaymentIntent\(/)
})

test('DropBatch persists and exposes a new intent only after fee equality succeeds', () => {
  const comparison = payment.indexOf('paymentMinor !== previewMinor')
  const persistence = payment.indexOf('writePaymentSession({', comparison)
  const exposure = payment.indexOf('setClientSecret(secret)', comparison)

  assert.ok(comparison >= 0)
  assert.ok(persistence > comparison)
  assert.ok(exposure > persistence)

  const mismatchBranch = payment.slice(comparison, persistence)
  assert.match(mismatchBranch, /clearPaymentSession\(\)/)
  assert.doesNotMatch(mismatchBranch, /writePaymentSession|setClientSecret|pricingMode:\s*'standard'/)
})

test('DropBatch refresh and same-input price changes require a new get-fee intent', () => {
  const storedRead = payment.indexOf('const stored = readPaymentSession()')
  const getFee = payment.indexOf('referralCheckoutFetch(')

  assert.ok(storedRead >= 0)
  assert.ok(getFee > storedRead)
  assert.match(payment, /const confirmAndCreateIntent = useCallback/)
  assert.match(payment, /pricingMode: 'dropbatch'/)
  assert.doesNotMatch(payload, /senderPays|clientSecret|fee:/)
})
