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
const vehicles = read('../src/components/send/vehicles.js')
const sendFlow = read('../src/lib/send-flow.js')

test('send comparison uses backend eligibility and senderPays without a trip prerequisite', () => {
  assert.match(hook, /pickupTiming !== 'scheduled'/)
  assert.match(hook, /quote\?\.eligible === true/)
  assert.match(hook, /typeof senderPays === 'number'/)
  assert.match(hook, /Number\.isFinite\(senderPays\)/)
  assert.match(hook, /const senderPays = quote\?\.senderPays/)
  assert.doesNotMatch(hook, /matches|departureWindow|overCapacity|remaining/)
  assert.doesNotMatch(hook, /Math\.min\([^\n]*senderPays|sort\([^\n]*senderPays|reduce\([^\n]*senderPays/)
  assert.match(details, /dropBatch\.show/)
  assert.match(details, /<DropBatchQuoteCard/)
  assert.match(card, /price does not depend on a driver already being assigned/)
  assert.match(card, /accept the scheduled job quickly[\s\S]*may take longer/)
  assert.doesNotMatch(card, /matching trip|pre-existing trip|driver only becomes available/i)
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
  assert.match(payment, /pickUpTime: flow\.scheduledPickupAt/)
  assert.match(payload, /pricingMode:[\s\S]*flow\.pricingMode === 'dropbatch'/)
  assert.doesNotMatch(payload, /senderPays|dropBatch\.senderPays/)
  assert.match(payment, /Math\.abs\(feeAmount - quote\.total\) >= 0\.01/)
})

test('DropBatch failure never silently falls back to standard at payment', () => {
  assert.match(payment, /Your DropBatch selection is no longer valid/)
  assert.match(payment, /DropBatch is no longer available/)
  assert.doesNotMatch(payment, /catch[\s\S]{0,300}pricingMode:\s*'standard'/)
})

test('DropBatch never restores a stored PaymentIntent while Standard recovery remains', () => {
  assert.match(
    payment,
    /if \(flow\.pricingMode === 'dropbatch'\) \{[\s\S]*?clearPaymentSession\(\)[\s\S]*?\} else if \(stored && stored\.inputsHash === inputsHash\)/,
  )

  const standardRecovery = payment.slice(
    payment.indexOf("} else if (stored && stored.inputsHash === inputsHash)"),
    payment.indexOf('// 4. No usable intent'),
  )
  assert.match(standardRecovery, /stripe\.retrievePaymentIntent\(/)
  assert.match(standardRecovery, /setClientSecret\(stored\.clientSecret\)/)
  assert.match(standardRecovery, /setFee\(Number\(stored\.fee\)\)/)

  const dropBatchBoot = payment.slice(
    payment.indexOf("if (flow.pricingMode === 'dropbatch') {", payment.indexOf('const stored = readPaymentSession()')),
    payment.indexOf("} else if (stored && stored.inputsHash === inputsHash)"),
  )
  assert.doesNotMatch(dropBatchBoot, /retrievePaymentIntent|setClientSecret|setFee/)
})

test('DropBatch persists and exposes a new intent only after fee equality succeeds', () => {
  const comparison = payment.indexOf('Math.abs(feeAmount - quote.total) >= 0.01')
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
  const getFee = payment.indexOf("guestFetch('/order/get-fee'")

  assert.ok(storedRead >= 0)
  assert.ok(getFee > storedRead)
  assert.match(payment, /const confirmAndCreateIntent = useCallback/)
  assert.match(payment, /pricingMode: 'dropbatch'/)
  assert.doesNotMatch(payload, /senderPays|clientSecret|fee:/)
})
