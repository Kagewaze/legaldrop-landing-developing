import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { customerDropBatchQuote } from '../src/lib/dropbatch-referral-quote.mjs'
import { bookingHrefWithVia } from '../src/lib/via-navigation.mjs'

const read = path => readFileSync(path, 'utf8')
const proxy = read('src/app/api/referral/dropbatch-quote/route.js')
const hook = read('src/components/send/useDropBatchQuote.js')
const guest = read('src/lib/guest-session.js')
const capture = read('src/app/r/[slug]/route.js')
const details = read('src/app/send/details/page.jsx')
const pay = read('src/app/send/pay/page.jsx')
const card = read('src/components/send/DropBatchQuoteCard.jsx')
const dedicated = read('src/components/dropbatch/DropBatchRequestFlow.jsx')

const ordinary = { eligible: true, routeDistanceKm: 100, senderPays: 35 }
const referred = { ...ordinary, senderPays: 36.05, currency: 'CAD',
  finalCustomerTotalMinor: 3605, lineItems: { deliveryFare: 35, serviceFee: 1.05 },
  beneficiaryId: 'private', commissionRateBasisPoints: 500 }

test('ordinary DropBatch stays unchanged and referral output is an exact customer-safe allowlist', () => {
  assert.deepEqual(customerDropBatchQuote(ordinary, false), ordinary)
  assert.deepEqual(customerDropBatchQuote(referred, true), {
    eligible: true, routeDistanceKm: 100, senderPays: 36.05,
    finalCustomerTotalMinor: 3605, currency: 'CAD',
    lineItems: { deliveryFare: 35, serviceFee: 1.05 },
  })
  assert.equal(customerDropBatchQuote({ eligible: false, reason: 'unsupported_vehicle' }, true).eligible, false)
})

test('referral preview fails closed on an old backend response or inconsistent amount', () => {
  assert.equal(customerDropBatchQuote(ordinary, true), null)
  assert.equal(customerDropBatchQuote({ ...referred, finalCustomerTotalMinor: 3604 }, true), null)
  assert.equal(customerDropBatchQuote({ ...referred, lineItems: { deliveryFare: 35, serviceFee: 1.04 } }, true), null)
})

test('all DropBatch quote surfaces use server-side cookie authority and no browser percentage', () => {
  assert.match(proxy, /cookies\(\)\.get\(REFERRAL_COOKIE\)/)
  assert.match(proxy, /referralSessionReference: _ignored/)
  assert.match(proxy, /referralSessionReference: reference/)
  assert.match(proxy, /customerDropBatchQuote\(payload\?\.data \?\? payload, Boolean\(reference\)\)/)
  assert.match(proxy, /status: 503/)
  assert.match(guest, /fetch\('\/api\/referral\/dropbatch-quote'/)
  assert.match(hook, /referralDropBatchQuoteFetch\(request/)
  assert.match(pay, /fetchDropBatchQuote\(request\)/)
  assert.match(dedicated, /useDropBatchQuote\(quoteInput/)
  assert.doesNotMatch(hook + details + pay + card + dedicated, /druppr_referral|referralSessionReference|\*\s*0\.03|3%|Partner commission|Partner tier/)
})

test('selected DropBatch fare and payment preview use the same backend amount', () => {
  assert.match(details, /pricingMode === 'dropbatch' && dropBatchSelectionValid[\s\S]*dropBatch\.senderPays/)
  assert.match(pay, /finalCustomerTotalMinor: quoteData\.finalCustomerTotalMinor/)
  assert.match(pay, /paymentMinor !== previewMinor/)
  assert.match(pay, /lineItems\.serviceFee/)
})

test('successful capture exposes the accepted friendly slug; failed capture clears cookie without via', () => {
  assert.match(capture, /destination\.searchParams\.set\('via', params\.slug\)/)
  assert.match(capture, /publicCapture\(\(await response\.json\(\)\)\.data\)/)
  const failure = capture.slice(capture.indexOf('} catch {'))
  assert.match(failure, /referral', 'unavailable'/)
  assert.match(failure, /result\.cookies\.set\(REFERRAL_COOKIE, ''/)
  assert.doesNotMatch(failure, /searchParams\.set\('via'/)
})

test('via survives Send and DropBatch navigation without becoming pricing authority', () => {
  const search = '?via=delight-cargo'
  assert.equal(bookingHrefWithVia('/send/details', search), '/send/details?via=delight-cargo')
  assert.equal(bookingHrefWithVia('/send/pay', search), '/send/pay?via=delight-cargo')
  assert.equal(bookingHrefWithVia('/send', search), '/send?via=delight-cargo')
  assert.equal(bookingHrefWithVia('/drop-batch/request', search), '/drop-batch/request?via=delight-cargo')
  assert.equal(bookingHrefWithVia('/send/pay?other=1', search), '/send/pay?other=1&via=delight-cargo')
  assert.equal(bookingHrefWithVia('/send/pay', '?via=fake-company'), '/send/pay?via=fake-company')
  assert.equal(bookingHrefWithVia('/send/pay', '?referral=unavailable'), '/send/pay')
  assert.match(proxy, /cookies\(\)\.get\(REFERRAL_COOKIE\)/)
  assert.doesNotMatch(proxy + guest + hook, /searchParams\.get\('via'\)/)
})
