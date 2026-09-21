import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// QUICK FIX — LANDING QUOTES THE WEIGHT THE BACKEND WILL PRICE.
//
// ⚠️ WHAT CAN GO WRONG HERE, AND WHY IT COSTS MONEY. POST /drop-batch/public/quote carries ONE
// scalar packageWeightKg, but the backend decides the $20 handling fee from the HEAVIEST package
// in the order (OrderService.calculateFee takes Math.max over every receiver). A client that
// sends any single receiver's weight while shipping several packages quotes low, mints the
// PaymentIntent low, and is then refused by POST /order's own recomputation — after the card has
// been charged. Partner had exactly that defect.
//
// ⚠️ LANDING IS SAFE TODAY FOR A STRUCTURAL REASON, NOT A CAREFUL ONE: its /send flow has ONE
// weight band and emits ONE receiver, so "the first receiver's weight" and "the maximum receiver
// weight" are the same number. That is a property of the flow's shape, and it is exactly the kind
// of property a later multi-stop feature would silently remove.
//
// So this file pins the shape itself. If someone adds a second receiver, the single-receiver
// assertion below fails and forces them to decide what packageWeightKg should now be — instead of
// the flow quietly acquiring Partner's bug.
register(new URL('./helpers/module-alias-hooks.mjs', import.meta.url).href, import.meta.url)

const { buildOrderPayload } = await import('../src/components/send/buildOrderPayload.js')
const { WEIGHT_SENTINEL } = await import('./helpers/send-flow-stub.mjs')

const readSource = (relativePath) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')

const QUOTE_HOOK = readSource('../src/components/send/useDropBatchQuote.js')
const SEND_FLOW = readSource('../src/lib/send-flow.js')

const flowFixture = (over = {}) => ({
  pickup: { lat: 43.65, lng: -79.38, address: '100 Pickup St' },
  dropoff: { lat: 43.7, lng: -79.4, address: '200 Dropoff Ave' },
  pickupTiming: 'instant',
  vehicle: 'car',
  packageCount: 3,
  weight: 'heavy',
  section: null,
  scheduledPickupAt: null,
  ...over,
  contact: {
    senderName: '  Sam Sender  ',
    senderPhone: '  +14160000001  ',
    receiverName: '  Riley Receiver  ',
    receiverPhone: '  +14160000002  ',
    receiverEmail: '  riley@example.test  ',
    receiverNote: '  Buzz 4B  ',
    ...(over.contact ?? {}),
  },
})

const build = (over = {}) =>
  buildOrderPayload({
    flow: flowFixture(over),
    quote: { distanceKm: 72.8, fee: 61.43 },
    paymentIntentId: 'pi_landing_test',
  })

// ── THE STRUCTURAL INVARIANT ───────────────────────────────────────────────────────────────────
test('the send flow emits exactly ONE receiver, which is why one weight is sufficient', () => {
  const payload = build()

  assert.equal(payload.receivers.length, 1)
  // If this ever becomes > 1, useDropBatchQuote must send the MAXIMUM receiver weight rather
  // than the flow's single band — see the Partner fix for what that looks like.
})

test('the receiver weight is threaded from weightKgFor, not hardcoded', () => {
  assert.equal(build().receivers[0].weight, WEIGHT_SENTINEL)
})

// ── ONE SOURCE OF TRUTH FOR THE WEIGHT ─────────────────────────────────────────────────────────
//
// The quote and the order must not be able to disagree. Both read weightKgFor(flow.weight), so
// there is no second derivation to drift.
test('quote and order payload derive the weight from the same call', () => {
  assert.match(QUOTE_HOOK, /packageWeightKg: weightKgFor\(weight\)/)
  assert.match(
    readSource('../src/components/send/buildOrderPayload.js'),
    /weight: weightKgFor\(flow\.weight\)/
  )
})

// ── THE BANDS ACTUALLY STRADDLE THE BACKEND THRESHOLD ──────────────────────────────────────────
//
// The backend charges handling strictly above 15 kg. A band table whose "heavy" option sat at or
// below 15 would show a surcharge the server never applies, or the reverse.
test('the weight bands sit on the correct side of the backend 15 kg threshold', () => {
  const kgFor = (id) => {
    const line = SEND_FLOW.split(/\r?\n/).find((entry) => entry.includes(`id: '${id}'`))
    assert.ok(line, `no weight band '${id}' found`)
    const match = /kg:\s*(\d+(?:\.\d+)?)/.exec(line)
    assert.ok(match, `band '${id}' declares no kg`)
    return Number(match[1])
  }

  // Strictly at or under 15 → no handling fee.
  assert.ok(kgFor('light') <= 15, 'the light band must not trigger the handling fee')
  // Strictly over 15 → handling fee.
  assert.ok(kgFor('mid') > 15, 'the mid band must trigger the handling fee')
  assert.ok(kgFor('heavy') > 15, 'the heavy band must trigger the handling fee')
})

// ── QF-01: NO CLIENT-SIDE DISTANCE GATE ────────────────────────────────────────────────────────
test('the quote hook re-derives no distance eligibility rule', () => {
  // Comments are stripped first: the file deliberately CONTAINS the string `>= 80` inside a
  // warning telling future authors not to write one, and matching that would be self-defeating.
  const code = QUOTE_HOOK.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

  assert.doesNotMatch(code, />=\s*80|<\s*80|below_minimum_distance|minimumKm/)
  // The hook still asks the backend, which is the only authority on eligibility.
  assert.match(code, /referralDropBatchQuoteFetch\(request/)
  assert.doesNotMatch(code, /fetch\([^)]*drop-batch\/public\/quote/)
})
