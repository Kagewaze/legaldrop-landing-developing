import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { normalizeCustomerQuote } from '../src/lib/customer-quote.mjs'

const source = path => readFileSync(path, 'utf8')
const proxy = source('src/app/api/referral/quote/route.js')
const capture = source('src/app/r/[slug]/route.js')
const cards = source('src/components/send/useVehicleQuotes.js')
const details = source('src/app/send/details/page.jsx')
const pay = source('src/app/send/pay/page.jsx')
const first = source('src/app/send/page.jsx')
const breakdown = source('src/components/send/PriceBreakdown.jsx')

test('10220 ordinary and 10527 referral minor units render as backend returned', () => {
  const ordinary = normalizeCustomerQuote({ total: 102.2, lineItems: { base: 8, distance: 94.2 } })
  const referred = normalizeCustomerQuote({ total: 105.27, finalCustomerTotalMinor: 10527,
    lineItems: { base: 8, distance: 94.2, serviceFee: 3.07 } })
  assert.equal(ordinary.finalCustomerTotalMinor, 10220)
  assert.equal(referred.finalCustomerTotalMinor, 10527)
  assert.equal(referred.total, 105.27)
  assert.equal(referred.lineItems.serviceFee, 3.07)
  assert.equal(normalizeCustomerQuote({ total: 102.2, finalCustomerTotalMinor: 10527 }).total, 105.27)
})

test('same-origin proxy alone reads HttpOnly referral and fails closed on an old quote contract', () => {
  assert.match(proxy, /cookies\(\)\.get\(REFERRAL_COOKIE\)/)
  assert.match(proxy, /referralSessionReference: reference/)
  assert.match(proxy, /finalCustomerTotalMinor/)
  assert.match(proxy, /sumMinor !== minor/)
  assert.match(proxy, /status: 503/)
  assert.doesNotMatch(cards + details + pay + first, /druppr_referral|referralSessionReference/)
})

test('vehicle cards, distance probe, and initial payment summary all use the pure proxy', () => {
  for (const part of [cards, pay, first]) assert.match(part, /referralQuoteFetch/)
  assert.match(cards, /VEHICLES\.map/)
  assert.match(cards, /normalizeCustomerQuote/)
  assert.match(details, /quote\.total/)
  assert.match(pay, /normalizeCustomerQuote/)
  assert.doesNotMatch(cards + first + pay, /guestFetch\('\/order\/quote-itemized'/)
})

test('checkout compares authoritative minor units before showing the card form', () => {
  assert.match(pay, /paymentMinor !== previewMinor/)
  assert.match(pay, /setPhase\('priceMismatch'\)/)
  assert.match(pay, /stored\.fee/)
  assert.doesNotMatch(pay, /Math\.abs\(feeAmount - quote\.total\)/)
})

test('customer itemization uses a neutral fee and exposes no partner economics', () => {
  assert.match(breakdown, /label: 'Service fee'/)
  assert.doesNotMatch(pay + breakdown + cards + details, /Referral channel adjustment \(3%\)|Partner commission|Partner tier/)
  assert.doesNotMatch(cards + pay, /\*\s*0\.03|\*\s*3\s*\/\s*100/)
})

test('unavailable referral clears a stale host-only cookie while normal send does not', () => {
  assert.match(capture, /catch\s*\{[\s\S]*result\.cookies\.set\(REFERRAL_COOKIE, ''/)
  assert.match(capture, /path: '\/'/)
  assert.match(capture, /maxAge: 0/)
  assert.match(capture, /referral', 'unavailable'/)
  assert.doesNotMatch(first + details + pay, /cookies\.delete\(REFERRAL_COOKIE\)/)
})
