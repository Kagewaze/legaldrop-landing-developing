import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// A1 — THE LANDING /send FLOW STATES ITS BOOKING DIRECTION.
//
// Two claims, different in kind:
//
//   1. TRANSPORT. The durable POST /order body carries bookingDirection: 'send', as a literal,
//      on every path that can create an order — including the two post-payment recovery paths.
//
//   2. CONTAINMENT. Nothing else about the request changed. The sender and receiver blocks are
//      identical, no quote/fee request gained the field, and no landing code path emits
//      'receive' or 'third_party'.
//
// The payload assertions are BEHAVIOURAL: they call the real buildOrderPayload and read the
// object it returns. The call-site assertions are necessarily static — pay/page.jsx is a React
// client component node --test cannot execute — and are bounded to the exact region they
// describe. That mirrors scripts/check-dropbatch-containment.mjs, which guards containment the
// same way in this repository.
register(new URL('./helpers/module-alias-hooks.mjs', import.meta.url).href, import.meta.url)

const { buildOrderPayload } = await import('../src/components/send/buildOrderPayload.js')
const { WEIGHT_SENTINEL, weightKgForCalls } = await import('./helpers/send-flow-stub.mjs')

const readSource = (relativePath) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8')

const PAY_PAGE = readSource('../src/app/send/pay/page.jsx')
const BUILDER_SOURCE = readSource('../src/components/send/buildOrderPayload.js')

// --- fixtures --------------------------------------------------------------

function flowFixture(over = {}) {
  return {
    pickup: { lat: 43.65, lng: -79.38, address: '100 Pickup St' },
    dropoff: { lat: 43.7, lng: -79.4, address: '200 Dropoff Ave' },
    pickupTiming: 'instant',
    scheduledPickupAt: null,
    vehicle: 'car',
    packageCount: 3,
    weight: 'mid',
    section: null,
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
  }
}

const QUOTE = { distanceKm: 7.5 }

const build = (over = {}) =>
  buildOrderPayload({
    flow: flowFixture(over),
    quote: QUOTE,
    paymentIntentId: 'pi_test_a1',
  })

// --- 1. transport ----------------------------------------------------------

test('the durable order payload states bookingDirection send', () => {
  assert.equal(build().bookingDirection, 'send')
})

// Case-sensitivity is the server's contract (@IsIn, no normalising transform), and this payload
// is only ever sent AFTER the card is charged — a rejected value means paid with no order.
test('the value is the exact canonical lowercase literal', () => {
  const value = build().bookingDirection

  assert.equal(typeof value, 'string')
  assert.equal(value, 'send')
  assert.notEqual(value, 'SEND')
  assert.notEqual(value, 'Send')
})

test('a scheduled order states it too', () => {
  const payload = build({
    pickupTiming: 'scheduled',
    scheduledPickupAt: '2026-09-01T15:00:00.000Z',
  })

  assert.equal(payload.type, 'scheduled_pickup')
  assert.equal(payload.bookingDirection, 'send')
})

// The optional contact fields are omitted when blank. The direction must not ride along with
// any of them.
test('it does not depend on the optional contact fields being present', () => {
  const payload = build({
    contact: { receiverPhone: '  ', receiverEmail: '', receiverNote: '   ' },
  })

  const receiver = payload.receivers[0]

  assert.equal(payload.bookingDirection, 'send')
  assert.equal('receiverPhone' in receiver, false)
  assert.equal('receiverEmail' in receiver, false)
  assert.equal('receiverNote' in receiver, false)
})

// NULL is the SERVER's spelling of "not stated"; the client's spelling is omission. An explicit
// null is rejected by the DTO, so the key must always carry a real value here.
test('it is never null or undefined', () => {
  for (const payload of [build(), build({ section: 'medical' })]) {
    assert.ok('bookingDirection' in payload)
    assert.notEqual(payload.bookingDirection, null)
    assert.notEqual(payload.bookingDirection, undefined)
  }
})

// --- 2. containment: the rest of the payload -------------------------------

test('the sender block is unchanged', () => {
  const payload = build()

  assert.deepEqual(payload.senderLocation, { latitude: 43.65, longitude: -79.38 })
  assert.equal(payload.senderAddress, '100 Pickup St')
  assert.equal(payload.senderName, 'Sam Sender')
  assert.equal(payload.senderPhone, '+14160000001')
})

test('the receiver block is unchanged', () => {
  weightKgForCalls.length = 0

  const receiver = build().receivers[0]

  assert.equal(receiver.receiverName, 'Riley Receiver')
  assert.equal(receiver.receiverAddress, '200 Dropoff Ave')
  assert.deepEqual(receiver.receiverLocation, { latitude: 43.7, longitude: -79.4 })
  assert.equal(receiver.receiverPhone, '+14160000002')
  assert.equal(receiver.receiverEmail, 'riley@example.test')
  assert.equal(receiver.receiverNote, 'Buzz 4B')
  // The BACKEND's distance, not Google's — the value the fare was priced from.
  assert.equal(receiver.distance, 7.5)
  // Threaded through from weightKgFor(flow.weight), not hardcoded: the stub returns a sentinel
  // and records its argument, so this proves the priced input is still wired to the flow.
  assert.equal(receiver.weight, WEIGHT_SENTINEL)
  assert.deepEqual(weightKgForCalls, ['mid'])
})

test('the priced inputs and the paymentIntent rename are unchanged', () => {
  const payload = build()

  assert.equal(payload.packageCount, 3)
  assert.equal(payload.vehicle, 'car')
  assert.equal(payload.section, 'other')
  // get-fee returns paymentIntentId; POST /order expects paymentIntent.
  assert.equal(payload.paymentIntent, 'pi_test_a1')
  assert.equal('paymentIntentId' in payload, false)
})

// DropBatch checkout adds the server-owned pricing discriminator; no amount field is added.
test('bookingDirection and pricingMode are the only keys added to the order contract', () => {
  const PRE_A1_KEYS = [
    'senderLocation',
    'senderAddress',
    'senderName',
    'senderPhone',
    'type',
    'vehicle',
    'packageCount',
    'section',
    'receivers',
    'paymentIntent',
  ]

  assert.deepEqual(
    Object.keys(build()).sort(),
    [...PRE_A1_KEYS, 'bookingDirection', 'pricingMode'].sort(),
  )
})

test('order payload defaults to standard and carries an explicit DropBatch selection', () => {
  assert.equal(build().pricingMode, 'standard')
  assert.equal(build({ pricingMode: 'dropbatch' }).pricingMode, 'dropbatch')
  assert.equal('senderPays' in build({ pricingMode: 'dropbatch' }), false)
})

test('the receiver contract gained no key', () => {
  const PRE_A1_RECEIVER_KEYS = [
    'receiverName',
    'receiverAddress',
    'receiverLocation',
    'distance',
    'weight',
    'receiverPhone',
    'receiverEmail',
    'receiverNote',
  ]

  assert.deepEqual(
    Object.keys(build().receivers[0]).sort(),
    PRE_A1_RECEIVER_KEYS.sort(),
  )
})

// --- 3. containment: no inference, no other direction ----------------------

// A1 is a stated fact, not a derivation. Either of these appearing would mean an inference rule
// was introduced, which the accepted architecture forbids.
test('the landing app never emits receive or third_party', () => {
  for (const source of [BUILDER_SOURCE, PAY_PAGE]) {
    assert.equal(/bookingDirection\s*:\s*'receive'/.test(source), false)
    assert.equal(/bookingDirection\s*:\s*'third_party'/.test(source), false)
  }
})

test('the direction is written as a literal, not computed', () => {
  assert.match(BUILDER_SOURCE, /^\s*bookingDirection: 'send',$/m)
})

// Changing the flow's identity-ish fields must not change the direction — proof there is no
// inference from contact details, vehicle, section or guest identity.
test('unrelated flow state cannot change the direction', () => {
  const variants = [
    build({ contact: { senderName: 'Someone Else' } }),
    build({ contact: { receiverEmail: 'guest+landing@example.test' } }),
    build({ vehicle: 'van' }),
    build({ section: 'medical' }),
    build({ packageCount: 1 }),
  ]

  for (const payload of variants) {
    assert.equal(payload.bookingDirection, 'send')
  }
})

// --- 4. the request boundary: every order-creating path carries it ---------

// buildOrderPayload is the one and only POST /order body constructor. A second literal body
// reaching the request would bypass the direction entirely.
test('no order request is built from an inline object literal', () => {
  assert.equal(/createOrder\(\s*\{/.test(PAY_PAGE), false)
  assert.equal(/guestFetch\('\/order',[\s\S]{0,160}body:\s*\{/.test(PAY_PAGE), false)
})

test('the persisted recovery payload is built by buildOrderPayload', () => {
  // writePaymentSession stores orderPayload: buildOrderPayload({...}) immediately before
  // confirmPayment, so the snapshot a refresh recovers already carries the direction.
  assert.match(PAY_PAGE, /orderPayload:\s*buildOrderPayload\(/)
})

test('both recovery paths fall back to buildOrderPayload', () => {
  // `stored.orderPayload ?? buildOrderPayload({...})` appears twice: the boot "already paid"
  // recovery and retryOrder. Either branch yields a payload carrying the direction.
  const fallbacks = PAY_PAGE.match(/stored\.orderPayload\s*\?\?/g) ?? []

  assert.equal(fallbacks.length, 2)
})

// --- 5. quote / fee requests must NOT gain the field ----------------------

// The backend reads bookingDirection only on Order creation. Adding it to a pricing request
// would put an unpriced field on the fare path for no reason.
// Returns the text of the balanced { ... } that follows `needle`, so an assertion is bounded to
// exactly that call's options object rather than to a guessed number of lines or an indentation
// level that differs between call sites.
function optionsObjectAfter(source, needle) {
  const start = source.indexOf(needle)
  assert.notEqual(start, -1, `call site not found: ${needle}`)

  const open = source.indexOf('{', start + needle.length)
  assert.notEqual(open, -1, `no options object for: ${needle}`)

  let depth = 0

  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    if (source[i] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open, i + 1)
    }
  }

  throw new Error(`unbalanced options object for: ${needle}`)
}

test('the quote and fee requests do not send bookingDirection', () => {
  const pricingCallSites = [
    "guestFetch('/order/quote-itemized'",
    'referralCheckoutFetch(',
  ]

  for (const needle of pricingCallSites) {
    const body = optionsObjectAfter(PAY_PAGE, needle)

    // Sanity-check the extraction actually captured the request, so a silently empty slice
    // cannot make this assertion pass for the wrong reason.
    if (needle.startsWith('guestFetch')) assert.match(body, /method: 'POST'/)
    assert.equal(
      body.includes('bookingDirection'),
      false,
      `${needle} must not send bookingDirection`,
    )
  }
})

test('no other landing request mentions bookingDirection', () => {
  const OTHER_REQUEST_FILES = [
    '../src/app/send/page.jsx',
    '../src/components/send/useVehicleQuotes.js',
    '../src/components/send/useDropBatchQuote.js',
    '../src/lib/guest-session.js',
  ]

  for (const relativePath of OTHER_REQUEST_FILES) {
    assert.equal(
      readSource(relativePath).includes('bookingDirection'),
      false,
      `${relativePath} must not mention bookingDirection`,
    )
  }
})
