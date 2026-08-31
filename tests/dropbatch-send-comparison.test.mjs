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

test('send comparison uses exact scheduled-match show rule and backend first-match price', () => {
  assert.match(hook, /pickupTiming !== 'scheduled'/)
  assert.match(hook, /quote\?\.eligible === true && matches\.length > 0/)
  assert.match(hook, /matches\[0\]\.senderPays/)
  assert.doesNotMatch(hook, /Math\.min\([^\n]*senderPays|sort\([^\n]*senderPays|reduce\([^\n]*senderPays/)
  assert.match(details, /dropBatch\.show/)
  assert.match(details, /<DropBatchQuoteCard/)
})

test('comparison failure remains isolated from standard price, Continue, payment and order payload', () => {
  assert.match(hook, /status: 'unavailable', quote: null/)
  assert.match(details, /quote && timingReady/)
  assert.doesNotMatch(payment, /senderPays|useDropBatchQuote|DropBatchQuoteCard/)
  assert.doesNotMatch(payload, /senderPays|useDropBatchQuote|DropBatchQuoteCard/)
  assert.match(card, /Learn about DropBatch/)
})

test('comparison enablement does not expose marketplace or booking mutations', () => {
  assert.doesNotMatch(`${hook}\n${details}\n${card}`, /TripBoard|fetchPublicTrips|drop-batch\/book/)
  assert.doesNotMatch(card, />\s*(Book|Pay|Checkout|Reserve)\s*</i)
})

test('unsupported Bike is refused before DropBatch fetch without leaving standard catalogue', () => {
  assert.match(hook, /if \(!isDropBatchSupportedVehicle\(vehicle\)\) return null/)
  assert.ok(
    hook.indexOf('if (!isDropBatchSupportedVehicle(vehicle)) return null') <
      hook.indexOf('await fetch('),
  )
  assert.match(vehicles, /id: 'bike'/)
  assert.doesNotMatch(hook, /senderPays\s*[+*\-/]/)
})
