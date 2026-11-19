// Runtime scenarios for the pay page's paid-booking recovery (R-M1, R-M2), on the REAL page under
// real React 18 — see harness.mjs (adopted from the fresh-context review). Stripe and every network
// response are synthetic; any other request fails the test. These are component-runtime tests, NOT a
// browser or Stripe test-mode E2E.
import assert from 'node:assert/strict'
import test from 'node:test'
import * as H from './harness.mjs'

const PAY = 'Pay $'
const CONFIRM = 'Confirm & continue to payment'
const FINISH_EARLIER = 'Finish my earlier booking'
const CONTINUE_NEW = 'Continue with your new booking'
const BOOKING_B = { dropoff: { address: '9 Second Booking Rd', lat: 43.8, lng: -79.5 } }
const succeeded = (id = 'pi_synth_A') => ({ paymentIntent: { id, status: 'succeeded' } })
const retrieveAs = (status, id = 'pi_synth_A') => async () => ({ paymentIntent: { id, status } })

async function payFromScratch(T, confirmResult, flowOver = {}) {
  H.seedGuest()
  const state = H.seedFlow(flowOver)
  const tab = await H.mountTab()
  await tab.click(CONFIRM)
  T.confirm = typeof confirmResult === 'function' ? confirmResult : async () => confirmResult
  await tab.click(PAY)
  return { tab, state }
}

// Booking A is paid but its order failed; the customer then enters booking B and returns to pay.
async function paidAThenEnterB(T, failStatus = 503) {
  T.order = () => H.json(failStatus, { message: 'refused' })
  const { tab } = await payFromScratch(T, succeeded())
  const before = {
    checkout: H.checkoutCalls(),
    confirm: T.confirmCalls.length,
    posts: H.orderPosts().length,
    firstBody: H.orderPosts()[0]?.body,
  }
  H.seedFlow(BOOKING_B)
  T.retrieve = retrieveAs('succeeded')
  const quotes = H.quoteCalls()
  const tab2 = await H.reload(tab)
  return { tab2, before, quotes }
}

const flowNow = () => JSON.parse(H.store.get(H.KEYS.flow))

test.afterEach(() => {
  assert.deepEqual(H.violations, [], 'a request left the synthetic network')
})

// ── R-M1: an earlier paid booking while the customer is entering a different one ─────────────

test('Z01 earlier paid booking + different new booking: explicit screen, nothing submitted, priced or paid without the customer', async () => {
  const T = H.resetScenario()
  const { tab2, before, quotes } = await paidAThenEnterB(T)
  const text = tab2.text()
  assert.match(text, /earlier booking/i)
  assert.match(text, /1 Synthetic Origin St/)
  assert.match(text, /2 Synthetic Dest Ave/)
  assert.match(text, /pi_synth_A/)
  assert.match(text, /doesn.t start another payment/)
  assert.equal(H.orderPosts().length, before.posts, 'no automatic submission')
  assert.equal(H.quoteCalls(), quotes, 'the new booking is not priced')
  assert.equal(tab2.button(CONFIRM), null)
  assert.equal(tab2.button(PAY), null)
  assert.ok(tab2.button(FINISH_EARLIER), text)
  assert.equal(flowNow().dropoff.address, '9 Second Booking Rd', 'new details untouched')
  await tab2.unmount()
})

test('Z02 finishing the earlier booking submits its original body, names it, and keeps the new booking details', async () => {
  const T = H.resetScenario()
  const { tab2, before } = await paidAThenEnterB(T)
  T.order = () => H.json(201, { data: { trackingCode: 'TRKEARLIER' } })
  await tab2.click(FINISH_EARLIER)
  const last = H.orderPosts().at(-1)
  assert.deepEqual(last.body, before.firstBody, 'the original stored body, unchanged')
  assert.equal(last.body.receivers[0].receiverAddress, '2 Synthetic Dest Ave')
  const text = tab2.text()
  assert.match(text, /Your earlier booking is booked/)
  assert.match(text, /TRKEARLIER/)
  assert.match(text, /1 Synthetic Origin St/)
  assert.match(text, /2 Synthetic Dest Ave/)
  assert.equal(H.readPayment(), null, 'record resolved')
  assert.equal(flowNow().dropoff.address, '9 Second Booking Rd', 'new booking details kept')
  assert.equal(H.checkoutCalls(), before.checkout, 'no new checkout')
  assert.equal(T.confirmCalls.length, before.confirm, 'no new payment')
  assert.ok(tab2.button(CONTINUE_NEW))
  await tab2.click(CONTINUE_NEW)
  assert.equal(H.window.location.reloads, 1)
  const quotes = H.quoteCalls()
  const tab3 = await H.reload(tab2)
  assert.ok(tab3.button(CONFIRM), 'the new booking can now be priced and paid')
  assert.equal(H.quoteCalls(), quotes + 1)
  const quoteBody = H.requests.filter((r) => r.url === '/api/referral/quote').at(-1).body
  assert.equal(quoteBody.receivers[0].receiverLocation.latitude, 43.8, 'priced for booking B')
  await tab3.unmount()
})

test('Z03 the same booking reloaded after paid+failed is recovered automatically and the done screen names it', async () => {
  const T = H.resetScenario()
  T.order = () => H.json(503, {})
  const { tab } = await payFromScratch(T, succeeded())
  T.order = () => H.json(201, { data: { trackingCode: 'TRKSAME' } })
  T.retrieve = retrieveAs('succeeded')
  const tab2 = await H.reload(tab)
  const text = tab2.text()
  assert.match(text, /Your delivery is booked/)
  assert.match(text, /TRKSAME/)
  assert.match(text, /1 Synthetic Origin St/)
  assert.match(text, /2 Synthetic Dest Ave/)
  assert.equal(/earlier booking/i.test(text), false)
  await tab2.unmount()
})

test('Z04 a recovered DropBatch order shows DropBatch copy (from the completed order, not the reset form)', async () => {
  const T = H.resetScenario()
  const state = H.seedFlow({ pricingMode: 'dropbatch', dropBatchSelectionKey: 'synthetic-key' })
  H.seedPayment(H.paidRecord(state))
  H.seedGuest()
  T.retrieve = retrieveAs('succeeded')
  const tab = await H.mountTab()
  assert.match(tab.text(), /Your delivery is booked/)
  assert.match(tab.text(), /DropBatch/)
  await tab.unmount()
})

test('Z05 the earlier booking fails to finish: labelled as the earlier booking, new details still kept, retry resends the same body', async () => {
  const T = H.resetScenario()
  const { tab2, before } = await paidAThenEnterB(T)
  T.order = () => H.json(503, {})
  await tab2.click(FINISH_EARLIER)
  let text = tab2.text()
  assert.match(text, /earlier booking/i)
  assert.match(text, /2 Synthetic Dest Ave/)
  assert.equal(flowNow().dropoff.address, '9 Second Booking Rd')
  T.order = () => H.json(503, {})
  await tab2.click('Retry my order')
  T.order = () => H.json(201, { data: { trackingCode: 'TRKRETRY' } })
  await tab2.click('Retry my order')
  text = tab2.text()
  assert.match(text, /Your earlier booking is booked/)
  const bodies = H.orderPosts().map((p) => JSON.stringify(p.body))
  assert.equal(new Set(bodies).size, 1, 'every attempt sent the identical original body')
  assert.equal(H.checkoutCalls(), before.checkout)
  assert.equal(T.confirmCalls.length, before.confirm)
  assert.equal(flowNow().dropoff.address, '9 Second Booking Rd')
  await tab2.unmount()
})

test('Z06 finishing the earlier booking acts once even on a same-tick double click', async () => {
  const T = H.resetScenario()
  const { tab2, before } = await paidAThenEnterB(T)
  let release
  T.order = () => new Promise((r) => { release = () => r(H.json(201, { data: { trackingCode: 'TRKONCE' } })) })
  await tab2.doubleClick(FINISH_EARLIER)
  assert.equal(H.orderPosts().length, before.posts + 1)
  release()
  await H.settle()
  assert.match(tab2.text(), /TRKONCE/)
  await tab2.unmount()
})

test('Z07 stored guest is not the recorded owner: earlier booking details are not shown, and nothing is submitted', async () => {
  const T = H.resetScenario()
  const state = H.seedFlow()
  H.seedPayment(H.paidRecord(state, { ownerUserId: 'user-owner' }))
  H.seedGuest({ token: 'tok-other', userId: 'user-other' })
  H.seedFlow(BOOKING_B)
  T.retrieve = retrieveAs('succeeded')
  const tab = await H.mountTab()
  let text = tab.text()
  assert.match(text, /earlier booking/i)
  assert.match(text, /pi_synth_A/)
  assert.equal(text.includes('Synthetic Origin'), false, 'no booking details for a stranger')
  assert.equal(text.includes('Synthetic Dest'), false)
  await tab.click(FINISH_EARLIER)
  text = tab.text()
  assert.match(text, /we need to finish your order/)
  assert.equal(H.orderPosts().length, 0)
  assert.equal(H.mints(), 0)
  await tab.unmount()
})

test('Z08 Partner suspended after the earlier payment: finishing it needs no pricing; the new booking is still refused', async () => {
  const T = H.resetScenario()
  const { tab2, before, quotes } = await paidAThenEnterB(T)
  T.quote = () => H.json(503, { message: 'Quote temporarily unavailable' })
  T.order = () => H.json(201, { data: { trackingCode: 'TRKPARTNER' } })
  await tab2.click(FINISH_EARLIER)
  assert.equal(H.quoteCalls(), quotes, 'no pricing to finish a paid booking')
  assert.equal('referralSessionReference' in H.orderPosts().at(-1).body, false)
  assert.equal(H.checkoutCalls(), before.checkout)
  await tab2.click(CONTINUE_NEW)
  const tab3 = await H.reload(tab2)
  assert.match(tab3.text(), /couldn.t set up payment/)
  assert.equal(tab3.button(CONFIRM), null)
  await tab3.unmount()
})

// ── R-M2: truthful, state-specific wording ───────────────────────────────────────────────────

test('Z09 paid then order failed: says the payment was confirmed and that retrying starts no payment; never "twice"', async () => {
  const T = H.resetScenario()
  T.order = () => H.json(503, {})
  const { tab } = await payFromScratch(T, succeeded())
  const text = tab.text()
  assert.match(text, /payment was confirmed/i)
  assert.match(text, /doesn.t start another payment/)
  assert.equal(/twice/i.test(text), false)
  assert.match(text, /pi_synth_A/)
  await tab.unmount()
})

test('Z10 unknown payment outcome: no claim that the card was or was not charged; reference shown', async () => {
  const T = H.resetScenario()
  const { tab } = await payFromScratch(T, { error: { type: 'api_connection_error', message: 'network' } })
  const text = tab.text()
  assert.equal(/charged/i.test(text), false)
  assert.match(text, /don.t know yet whether this payment went through/)
  assert.match(text, /pi_synth_A/)
  await tab.unmount()
})

test('Z11 two separate confirmed charges (first record lost): the failure screen makes no "not charged twice" claim', async () => {
  const T = H.resetScenario()
  T.order = () => H.json(503, {})
  const { tab } = await payFromScratch(T, succeeded('pi_synth_A'))
  await tab.unmount()
  H.store.clear()
  T.checkout = () =>
    H.json(200, { data: { fee: 25.75, amountMinor: 2575, referralAdjustmentMinor: 0, paymentIntentId: 'pi_synth_B', paymentIntentSecret: 'pi_synth_B_secret_y' } })
  H.seedGuest({ token: 'tok-second', userId: 'user-second' })
  H.seedFlow()
  const tab2 = await H.mountTab()
  await tab2.click(CONFIRM)
  T.confirm = async () => succeeded('pi_synth_B')
  await tab2.click(PAY)
  assert.equal(T.confirmCalls.length, 2)
  const text = tab2.text()
  assert.equal(/twice/i.test(text), false)
  assert.match(text, /pi_synth_B/)
  await tab2.unmount()
})

test('Z13 network failure on POST /order after a confirmed payment: truthful copy, Retry offered, same body resent', async () => {
  const T = H.resetScenario()
  T.order = () => { throw new TypeError('Failed to fetch') }
  const { tab } = await payFromScratch(T, succeeded())
  const text = tab.text()
  assert.match(text, /payment was confirmed/i)
  assert.equal(/twice/i.test(text), false)
  assert.ok(tab.button('Retry my order'))
  T.order = () => H.json(201, { data: { trackingCode: 'TRKNET' } })
  await tab.click('Retry my order')
  assert.match(tab.text(), /TRKNET/)
  assert.equal(H.checkoutCalls(), 1)
  await tab.unmount()
})

// ── R-L1 characterization (deliberately unchanged here) ──────────────────────────────────────

test('Z12 corrupt payment record: ignored by the page (no earlier-booking screen), never deleted at boot', async () => {
  const T = H.resetScenario()
  H.seedGuest()
  H.seedFlow(BOOKING_B)
  H.store.set(H.KEYS.payment, '{corrupt')
  const tab = await H.mountTab()
  assert.ok(tab.button(CONFIRM), tab.text())
  assert.equal(/earlier booking/i.test(tab.text()), false)
  assert.equal(H.store.get(H.KEYS.payment), '{corrupt', 'evidence kept')
  assert.equal(H.orderPosts().length, 0)
  await tab.unmount()
})
