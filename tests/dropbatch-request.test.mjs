import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const flow = read('../src/components/dropbatch/DropBatchRequestFlow.jsx')
const hook = read('../src/components/send/useDropBatchQuote.js')

test('collects route, future schedule, package count and vehicle with package mode fixed', () => {
  assert.match(flow, /AddressAutocomplete[\s\S]*Pickup address/)
  assert.match(flow, /AddressAutocomplete[\s\S]*Drop-off address/)
  assert.match(flow, /type="date"/)
  assert.match(flow, /type="time"/)
  assert.match(flow, /type="number"[\s\S]*min="1"/)
  assert.match(flow, /name="mode" value="package"/)
  assert.match(flow, /isFutureInstant/)
  assert.doesNotMatch(flow, /As soon as possible|passenger/)
})

test('uses only the authoritative public quote contract', () => {
  for (const field of ['pickupLatitude', 'pickupLongitude', 'dropoffLatitude', 'dropoffLongitude', 'pickupTime', "mode: 'package'", 'vehicle:', 'packageCount']) {
    assert.ok(hook.includes(field), `missing ${field}`)
  }
  assert.match(hook, /drop-batch\/public\/quote/)
  assert.match(hook, /AbortController/)
  assert.match(hook, /id !== seq\.current/)
  assert.doesNotMatch(`${hook}\n${flow}`, /driverEarns|platformFee|trackingToken|internal breakdown/i)
})

test('renders below-minimum, no-match, match, over-capacity and retry states', () => {
  assert.match(flow, /quote\?\.eligible === false/)
  assert.match(flow, /quote\?\.eligible === true && matches\.length === 0/)
  assert.match(flow, /Your DropBatch price/)
  assert.match(flow, /result\.senderPays/)
  assert.match(flow, /result\.allOverCapacity/)
  assert.match(flow, /We could not check DropBatch right now/)
  assert.match(flow, />Retry</)
})

test('stops at quote and contains no transactional or payment call', () => {
  assert.match(flow, /online booking is being prepared/)
  assert.doesNotMatch(flow, /drop-batch\/book|POST \/order|PaymentIntent|Stripe|confirm order|checkout/i)
  assert.doesNotMatch(flow, /senderPays\s*[+*\-/]/)
})
