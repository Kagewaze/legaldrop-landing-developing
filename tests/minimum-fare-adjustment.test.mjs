// The delivery minimum fare, as the website is allowed to know it.
//
// The backend is the only pricing authority. When it holds a delivery to its minimum it reports
// what it added as `lineItems.minimumAdjustment`, and the website's whole job is to (1) let that
// quote through the referral proxy, which reconciles every quote it forwards, and (2) show the
// amount as its own row. Nothing here computes a minimum: every figure below is a server figure.
//
// Fixtures are the shapes POST /order/quote-itemized returns for a car, one package, 2 km:
//   $8.00 base + $1.70 distance = $9.70, held to $20.00 by a $10.30 minimum adjustment.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import { transform } from 'sucrase'

import { normalizeCustomerQuote } from '../src/lib/customer-quote.mjs'
import { customerReferralQuote } from '../src/lib/referral-quote.mjs'

register(new URL('./helpers/module-alias-hooks.mjs', import.meta.url).href, import.meta.url)
register(new URL('./helpers/next-headers-hooks.mjs', import.meta.url).href, import.meta.url)

const { setCookies } = await import('./helpers/next-headers-stub.mjs')
const { POST } = await import('../src/app/api/referral/quote/route.js')

const source = (path) => readFileSync(path, 'utf8')
const proxy = source('src/app/api/referral/quote/route.js')
const reconciler = source('src/lib/referral-quote.mjs')
const normalizer = source('src/lib/customer-quote.mjs')
const breakdown = source('src/components/send/PriceBreakdown.jsx')

// THE REAL COMPONENT, RENDERED — not its source text. PriceBreakdown is a plain function
// component (no hooks, no context, no imports), so its JSX compiles with the transform already
// in the tree (sucrase, which Tailwind ships) against a one-line element factory and runs under
// node. What comes back is the tree it renders, and the rows below are read out of that tree:
// what a customer is actually shown.
const factory =
  'const h = (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) })\n'
const compiled = transform(breakdown, { transforms: ['jsx'], jsxPragma: 'h', production: true }).code
const { PriceBreakdown } = await import(
  `data:text/javascript;base64,${Buffer.from(factory + compiled, 'utf8').toString('base64')}`
)

// ── backend fixtures ────────────────────────────────────────────────────────────────────────────
const lines = (over = {}) => ({
  base: 8,
  distance: 1.7,
  extraPackage: 0,
  labour: 0,
  heavyFee: 0,
  ...over,
})
/** An ordinary quote, minimum fare off: $9.70. */
const plain = { lineItems: lines(), platformFee: 2.42, total: 9.7, distanceKm: 2, vehicle: 'car' }
/** The same booking held to the minimum: $9.70 + $10.30 = $20.00. */
const floored = {
  lineItems: lines({ minimumAdjustment: 10.3 }),
  platformFee: 5,
  total: 20,
  distanceKm: 2,
  vehicle: 'car',
}
/** A referral quote from before the minimum fare existed: $9.70 + $0.29 service fee. */
const referred = {
  lineItems: lines({ serviceFee: 0.29 }),
  platformFee: 2.42,
  total: 9.99,
  currency: 'CAD',
  finalCustomerTotalMinor: 999,
  distanceKm: 2,
  vehicle: 'car',
}
/** THE KNOWN BLOCKER: a referral quote on the floored fare. $20.00 + $0.60 service fee. */
const referredFloored = {
  lineItems: lines({ minimumAdjustment: 10.3, serviceFee: 0.6 }),
  platformFee: 5,
  total: 20.6,
  currency: 'CAD',
  finalCustomerTotalMinor: 2060,
  distanceKm: 2,
  vehicle: 'car',
}
const SIX = { base: 8, distance: 1.7, extraPackage: 0, labour: 0, heavyFee: 0 }

// ── the referral proxy's reconciliation ──────────────────────────────────────────────────────────
test('A: a referral quote without minimumAdjustment is accepted exactly as before', () => {
  assert.deepEqual(customerReferralQuote(referred), {
    lineItems: { ...SIX, serviceFee: 0.29 },
    total: 9.99,
    finalCustomerTotalMinor: 999,
    currency: 'CAD',
    distanceKm: 2,
    vehicle: 'car',
  })
})

test('B: minimumAdjustment = 0 behaves exactly like an absent one', () => {
  const zero = { ...referred, lineItems: { ...referred.lineItems, minimumAdjustment: 0 } }
  assert.deepEqual(customerReferralQuote(zero), customerReferralQuote(referred))
  assert.equal('minimumAdjustment' in customerReferralQuote(zero).lineItems, false)
})

test('C: minimumAdjustment = 1030 minor units is reconciled and passed on', () => {
  const quote = customerReferralQuote(referredFloored)
  assert.deepEqual(quote, {
    lineItems: { ...SIX, serviceFee: 0.6, minimumAdjustment: 10.3 },
    total: 20.6,
    finalCustomerTotalMinor: 2060,
    currency: 'CAD',
    distanceKm: 2,
    vehicle: 'car',
  })
  assert.equal(Math.round(quote.lineItems.minimumAdjustment * 100), 1030)
})

test('D: the referral fee the backend applied AFTER the floored fare is forwarded untouched', () => {
  // 3% of the floored $20.00, not of the $9.70 underneath it — and never recomputed here.
  assert.equal(customerReferralQuote(referredFloored).lineItems.serviceFee, 0.6)
  // With a heavy package on top of the floor: $9.70 + $10.30 + $20.00 = $40.00, + $1.20 fee.
  const heavy = customerReferralQuote({
    ...referredFloored,
    lineItems: lines({ heavyFee: 20, minimumAdjustment: 10.3, serviceFee: 1.2 }),
    total: 41.2,
    finalCustomerTotalMinor: 4120,
  })
  assert.equal(heavy.finalCustomerTotalMinor, 4120)
  assert.deepEqual(heavy.lineItems, {
    ...SIX,
    heavyFee: 20,
    serviceFee: 1.2,
    minimumAdjustment: 10.3,
  })
})

test('a one-cent adjustment: $19.99 + $0.01 = $20.00, + the referral fee', () => {
  const quote = customerReferralQuote({
    ...referredFloored,
    lineItems: lines({ distance: 11.99, minimumAdjustment: 0.01, serviceFee: 0.6 }),
  })
  assert.equal(quote.finalCustomerTotalMinor, 2060)
  assert.equal(quote.lineItems.minimumAdjustment, 0.01)
})

test('E: a malformed or inconsistent quote is still rejected', () => {
  const withLines = (over) => ({ ...referredFloored, lineItems: { ...referredFloored.lineItems, ...over } })
  const rejected = {
    'the total includes an adjustment the lines do not carry (an old contract)': {
      ...referredFloored,
      lineItems: lines({ serviceFee: 0.6 }),
    },
    'the lines carry an adjustment the total does not include': { ...referredFloored, finalCustomerTotalMinor: 1030 },
    'one cent too many': { ...referredFloored, finalCustomerTotalMinor: 2061 },
    'one cent too few': { ...referredFloored, finalCustomerTotalMinor: 2059 },
    'a different adjustment than the total implies': withLines({ minimumAdjustment: 10.29 }),
    'a negative adjustment': withLines({ minimumAdjustment: -10.3 }),
    'an adjustment that is a string': withLines({ minimumAdjustment: '10.3' }),
    'an adjustment that is NaN': withLines({ minimumAdjustment: Number.NaN }),
    'an adjustment that is Infinity': withLines({ minimumAdjustment: Number.POSITIVE_INFINITY }),
    'an adjustment that is null': withLines({ minimumAdjustment: null }),
    'a negative fare line': withLines({ base: -8 }),
    'a total that is not an integer of minor units': { ...referredFloored, finalCustomerTotalMinor: 20.6 },
    'a negative total': { ...referredFloored, finalCustomerTotalMinor: -2060 },
    'a missing total': { ...referredFloored, finalCustomerTotalMinor: undefined },
    'another currency': { ...referredFloored, currency: 'USD' },
    'no distance': { ...referredFloored, distanceKm: undefined },
    'no line items': { ...referredFloored, lineItems: undefined },
  }
  for (const [label, quote] of Object.entries(rejected)) {
    assert.equal(customerReferralQuote(quote), null, label)
  }
  assert.equal(customerReferralQuote(null), null)
  assert.equal(customerReferralQuote(undefined), null)
})

test('validation is not loosened: a component this site does not know still fails the sum', () => {
  // Only minimumAdjustment was admitted. Any other new line leaves the known lines short of the
  // total, and the quote is refused exactly as an old-contract quote always was.
  const unknown = {
    ...referredFloored,
    lineItems: { ...referredFloored.lineItems, doorstep: 5 },
    finalCustomerTotalMinor: 2560,
  }
  assert.equal(customerReferralQuote(unknown), null)
  assert.match(reconciler, /sumMinor !== minor/)
  assert.match(reconciler, /finalCustomerTotalMinor/)
})

// ── the route itself, with the backend and the cookie jar stubbed ─────────────────────────────────
async function callProxy(backendBody, { cookie = 'ref_session', status = 200, body } = {}) {
  setCookies(cookie ? { druppr_referral: cookie } : {})
  const calls = []
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(backendBody), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    const response = await POST(
      new Request('https://druppr.test/api/referral/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer guest' },
        body: JSON.stringify(
          body ?? { vehicle: 'car', packageCount: 1, referralSessionReference: 'from-the-browser' },
        ),
      }),
    )
    return { response, calls, sent: JSON.parse(calls[0].init.body) }
  } finally {
    globalThis.fetch = realFetch
  }
}
const envelope = (data) => ({ success: true, message: 'ok', data })

test('THE KNOWN BLOCKER: the proxy accepts $9.70 + $10.30, + the backend referral fee — no 503', async () => {
  const { response, sent } = await callProxy(envelope(referredFloored))
  assert.equal(response.status, 200)
  const { data } = await response.json()
  assert.deepEqual(data, {
    lineItems: { ...SIX, serviceFee: 0.6, minimumAdjustment: 10.3 },
    total: 20.6,
    finalCustomerTotalMinor: 2060,
    currency: 'CAD',
    distanceKm: 2,
    vehicle: 'car',
  })
  // The delivery fare before the floor, the floor, the fee and the total are all the backend's.
  const { base, distance, minimumAdjustment, serviceFee } = data.lineItems
  assert.equal(Math.round((base + distance) * 100), 970)
  assert.equal(Math.round((base + distance + minimumAdjustment) * 100), 2000)
  assert.equal(Math.round((base + distance + minimumAdjustment + serviceFee) * 100), 2060)
  // The capability comes from the HttpOnly cookie, never from the browser's body.
  assert.equal(sent.referralSessionReference, 'ref_session')
})

test('the proxy answers an old referral quote exactly as it did, and still 503s an inconsistent one', async () => {
  const old = await callProxy(envelope(referred))
  assert.equal(old.response.status, 200)
  assert.deepEqual((await old.response.json()).data, {
    lineItems: { ...SIX, serviceFee: 0.29 },
    total: 9.99,
    finalCustomerTotalMinor: 999,
    currency: 'CAD',
    distanceKm: 2,
    vehicle: 'car',
  })

  const stale = await callProxy(envelope({ ...referredFloored, lineItems: lines({ serviceFee: 0.6 }) }))
  assert.equal(stale.response.status, 503)
  assert.deepEqual(await stale.response.json(), { message: 'Quote temporarily unavailable' })

  const down = await callProxy({ message: 'boom' }, { status: 500 })
  assert.equal(down.response.status, 503)
})

test('a negative amount is refused even when the lines add up to the backend total', async () => {
  // Every quote here reconciles to the cent IF a negative line is allowed to count, so the sum
  // check alone would forward it. Only the "amounts must not be negative" rule refuses them:
  // take that rule away and this test, and no other, goes red.
  const quote = (lineItems, minor) => ({
    ...referred,
    lineItems,
    total: minor / 100,
    finalCustomerTotalMinor: minor,
  })
  const reconciling = {
    'a negative fare line': quote(lines({ distance: -1.7, serviceFee: 0.29 }), 659),
    'a negative service fee': quote(lines({ serviceFee: -0.29 }), 941),
    'a negative minimum adjustment': quote(lines({ minimumAdjustment: -10.3, serviceFee: 0.6 }), 0),
  }
  for (const [label, candidate] of Object.entries(reconciling)) {
    // The premise, checked: in minor units these lines DO sum to the total the backend sent.
    const sumMinor = Object.values(candidate.lineItems).reduce(
      (sum, value) => sum + Math.round(value * 100),
      0,
    )
    assert.equal(sumMinor, candidate.finalCustomerTotalMinor, `${label}: the fixture reconciles`)

    assert.equal(customerReferralQuote(candidate), null, label)

    const { response } = await callProxy(envelope(candidate))
    assert.equal(response.status, 503, label)
    assert.deepEqual(await response.json(), { message: 'Quote temporarily unavailable' }, label)
  }
})

test('without a referral cookie the backend answer is passed through untouched', async () => {
  const { response, sent } = await callProxy(envelope(floored), { cookie: null })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), envelope(floored))
  assert.equal('referralSessionReference' in sent, false)
})

// ── what the browser keeps of a quote ────────────────────────────────────────────────────────────
test('the customer quote carries a positive minimumAdjustment and nothing when absent or zero', () => {
  const kept = normalizeCustomerQuote(floored)
  assert.equal(kept.lineItems.minimumAdjustment, 10.3)
  assert.equal(kept.total, 20)
  assert.equal(kept.finalCustomerTotalMinor, 2000)

  const before = normalizeCustomerQuote(plain)
  assert.deepEqual(before.lineItems, { ...SIX, serviceFee: 0 })
  for (const value of [0, undefined, null, -10.3, 'abc', Number.NaN]) {
    const quote = normalizeCustomerQuote({ ...plain, lineItems: { ...plain.lineItems, minimumAdjustment: value } })
    assert.deepEqual(quote, before, `minimumAdjustment ${String(value)}`)
  }

  // The total is the server's, with or without the row: nothing is added to it here.
  const referral = normalizeCustomerQuote(customerReferralQuote(referredFloored))
  assert.equal(referral.finalCustomerTotalMinor, 2060)
  assert.equal(referral.total, 20.6)
  assert.equal(referral.lineItems.minimumAdjustment, 10.3)
  assert.equal(referral.lineItems.serviceFee, 0.6)
})

// ── the price breakdown ──────────────────────────────────────────────────────────────────────────
const text = (node) =>
  node == null || typeof node === 'boolean'
    ? ''
    : typeof node === 'object'
      ? node.children.map(text).join('')
      : String(node)
const every = (node, out = []) => {
  if (node && typeof node === 'object') {
    out.push(node)
    node.children.forEach((child) => every(child, out))
  }
  return out
}
/** What the fare panel shows for a backend quote: the price, each row, the Total, the fallback. */
const shown = (quote, packageCount = 1) => {
  const nodes = every(
    PriceBreakdown({
      quote: normalizeCustomerQuote(quote),
      vehicleName: 'Car',
      packageCount,
      weightLabel: 'Light',
    }),
  )
  // Every "label, amount" pair in the panel: the itemised rows, then the Total beneath them.
  const pairs = nodes
    .filter(
      (node) =>
        node.type === 'div' &&
        node.children.length === 2 &&
        node.children.every((child) => child?.type === 'span'),
    )
    .map((node) => node.children.map(text))
  return {
    price: text(nodes.find((node) => 'data-booking-price' in node.props)),
    rows: pairs.slice(0, -1),
    total: pairs.at(-1),
    unavailable: nodes.some(
      (node) => node.type === 'p' && text(node).includes('Itemised breakdown unavailable'),
    ),
  }
}

test('$9.70 of delivery charges + a $10.30 Minimum fare adjustment = the $20.00 server total', () => {
  assert.deepEqual(shown(floored), {
    price: '$20.00',
    rows: [
      ['Base fare', '$8.00'],
      ['Distance · 2.0 km', '$1.70'],
      ['Minimum fare adjustment', '$10.30'],
    ],
    total: ['Total', '$20.00'],
    unavailable: false,
  })
  // The delivery charges above the adjustment are the backend's $9.70; the Total is its $20.00.
  const { base, distance } = normalizeCustomerQuote(floored).lineItems
  assert.equal(Math.round((base + distance) * 100), 970)
  assert.equal(normalizeCustomerQuote(floored).finalCustomerTotalMinor, 2000)
})

test('a one-cent adjustment is shown: $19.99 + $0.01 = $20.00', () => {
  const quote = { ...floored, lineItems: lines({ distance: 11.99, minimumAdjustment: 0.01 }), distanceKm: 14.1 }
  assert.deepEqual(shown(quote), {
    price: '$20.00',
    rows: [
      ['Base fare', '$8.00'],
      ['Distance · 14.1 km', '$11.99'],
      ['Minimum fare adjustment', '$0.01'],
    ],
    total: ['Total', '$20.00'],
    unavailable: false,
  })
})

test('no minimum row when the adjustment is absent or zero, or the fare is already $20 or more', () => {
  const before = {
    price: '$9.70',
    rows: [
      ['Base fare', '$8.00'],
      ['Distance · 2.0 km', '$1.70'],
    ],
    total: ['Total', '$9.70'],
    unavailable: false,
  }
  assert.deepEqual(shown(plain), before)
  assert.deepEqual(shown({ ...plain, lineItems: lines({ minimumAdjustment: 0 }) }), before)
  // 25 km by car: $8.00 + $21.25 = $29.25 — above the minimum, so the backend sends no adjustment.
  assert.deepEqual(shown({ ...plain, lineItems: lines({ distance: 21.25 }), total: 29.25, distanceKm: 25 }), {
    price: '$29.25',
    rows: [
      ['Base fare', '$8.00'],
      ['Distance · 25.0 km', '$21.25'],
    ],
    total: ['Total', '$29.25'],
    unavailable: false,
  })
})

test('the referral case: the floored fare, then the backend service fee, then the backend total', () => {
  assert.deepEqual(shown(customerReferralQuote(referredFloored)), {
    price: '$20.60',
    rows: [
      ['Base fare', '$8.00'],
      ['Distance · 2.0 km', '$1.70'],
      ['Minimum fare adjustment', '$10.30'],
      ['Service fee', '$0.60'],
    ],
    total: ['Total', '$20.60'],
    unavailable: false,
  })
})

test('the adjustment sits after the delivery charges and before handling and the service fee', () => {
  const heavy = shown(
    {
      ...referredFloored,
      lineItems: lines({ extraPackage: 8, heavyFee: 20, minimumAdjustment: 2.3, serviceFee: 1.2 }),
      total: 41.2,
      finalCustomerTotalMinor: 4120,
    },
    2,
  )
  assert.deepEqual(heavy.rows, [
    ['Base fare', '$8.00'],
    ['Distance · 2.0 km', '$1.70'],
    ['Extra packages · 1', '$8.00'],
    ['Minimum fare adjustment', '$2.30'],
    ['Handling / labour', '$20.00'],
    ['Service fee', '$1.20'],
  ])
  assert.deepEqual(heavy.total, ['Total', '$41.20'])
  assert.equal(heavy.unavailable, false)
})

test('every existing row is unchanged: the live quotes still itemise and reconcile', () => {
  const quote = (lineItems, total) => ({ lineItems, total, distanceKm: 2.682, vehicle: 'car' })
  assert.deepEqual(shown(quote({ base: 8, distance: 2.28 }, 10.28)).rows, [
    ['Base fare', '$8.00'],
    ['Distance · 2.7 km', '$2.28'],
  ])
  assert.deepEqual(shown(quote({ base: 8, distance: 2.28, extraPackage: 16, heavyFee: 20 }, 46.28), 3).rows, [
    ['Base fare', '$8.00'],
    ['Distance · 2.7 km', '$2.28'],
    ['Extra packages · 2', '$16.00'],
    ['Handling / labour', '$20.00'],
  ])
  assert.deepEqual(shown(quote({ base: 90, distance: 3.35, labour: 20, heavyFee: 20 }, 133.35)), {
    price: '$133.35',
    rows: [
      ['Base fare', '$90.00'],
      ['Distance · 2.7 km', '$3.35'],
      ['Handling / labour', '$40.00'],
    ],
    total: ['Total', '$133.35'],
    unavailable: false,
  })
  assert.deepEqual(shown(referred).rows, [
    ['Base fare', '$8.00'],
    ['Distance · 2.0 km', '$1.70'],
    ['Service fee', '$0.29'],
  ])
})

test('a breakdown that cannot explain the server total still falls back to the total alone', () => {
  // A component this site does not know: the rows fall short, so no itemisation is shown — and
  // the price and the Total are still the server's.
  assert.deepEqual(shown({ ...plain, total: 14.7 }), {
    price: '$14.70',
    rows: [],
    total: ['Total', '$14.70'],
    unavailable: true,
  })
})

// ── the server stays the pricing authority ───────────────────────────────────────────────────────
test('no client code computes a minimum: the amount and the total are only ever the backend’s', () => {
  const client = proxy + reconciler + normalizer + breakdown
  // No floor, no "max(0, floor − subtotal)", no $20 in price logic or as a line amount.
  assert.doesNotMatch(client, /\b2000\b|\b20\.00\b|\$\s?20\b|Math\.max\(\s*0\s*,|minimumFareMinor|deliveryMinimumFare/)
  assert.doesNotMatch(breakdown + normalizer, /total\s*[-+]=|total\s*=\s*[^=].*minimumAdjustment/)
  // The row is the backend's figure, and the price and the Total are the quote's own total.
  assert.match(breakdown, /label: 'Minimum fare adjustment'/)
  assert.match(breakdown, /lineItems\.minimumAdjustment/)
  assert.equal(breakdown.match(/formatMoney\(total\)/g).length, 2)
  assert.match(breakdown, /const \{ lineItems, total, distanceKm \} = quote/)
  // The proxy reconciles through the one allowlist and fails closed on anything else.
  assert.match(proxy, /customerReferralQuote\(payload\?\.data \?\? payload\)/)
  assert.match(proxy, /status: 503/)
  assert.match(proxy, /cookies\(\)\.get\(REFERRAL_COOKIE\)/)
})
