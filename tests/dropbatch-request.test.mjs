import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const flow = read('../src/components/dropbatch/DropBatchRequestFlow.jsx')
const hook = read('../src/components/send/useDropBatchQuote.js')
const vehiclesSource = read('../src/components/send/vehicles.js')
const vehicles = await import(`data:text/javascript;base64,${Buffer.from(vehiclesSource).toString('base64')}`)

test('offers only backend-supported DropBatch vehicles while standard delivery keeps Bike', () => {
  assert.deepEqual(
    vehicles.DROPBATCH_VEHICLES.map((vehicle) => vehicle.name),
    ['Car', 'SUV', 'Minivan', 'Cargo van', 'Box truck'],
  )
  assert.ok(vehicles.VEHICLES.some((vehicle) => vehicle.name === 'Bike'))
  assert.equal(vehicles.isDropBatchSupportedVehicle('bike'), false)
  assert.equal(vehicles.isDropBatchSupportedVehicle('car'), true)
  assert.match(flow, /DROPBATCH_VEHICLES\.map/)
})

test('collects route, future schedule, package count and vehicle with package mode fixed', () => {
  assert.match(flow, /AddressAutocomplete[\s\S]*Pickup location/)
  assert.match(flow, /AddressAutocomplete[\s\S]*Drop-off location/)
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
  assert.match(hook, /if \(!isDropBatchSupportedVehicle\(vehicle\)\) return null/)
  assert.ok(
    hook.indexOf('if (!isDropBatchSupportedVehicle(vehicle)) return null') <
      hook.indexOf('await fetch('),
  )
})

test('renders below-minimum, eligible price and retry states without match concepts', () => {
  assert.match(flow, /quote\?\.eligible === false/)
  assert.match(flow, /Your DropBatch price/)
  assert.match(flow, /result\.senderPays/)
  assert.match(flow, /We could not check DropBatch right now/)
  assert.match(flow, />Retry</)
  assert.doesNotMatch(flow, /matches|compatible trip|departure window|over-capacity|overCapacity|remaining capacity/i)
})

test('stops at quote and contains no transactional or payment call', () => {
  assert.match(flow, /online booking is being prepared/)
  assert.doesNotMatch(flow, /drop-batch\/book|POST \/order|PaymentIntent|Stripe|confirm order|checkout/i)
  assert.doesNotMatch(flow, /senderPays\s*[+*\-/]/)
})

test('ties outward state to the current request identity and preserves retry sequencing', () => {
  assert.match(hook, /currentRequest && state\.signature === signature \? state : IDLE/)
  assert.match(hook, /status: 'loading', quote: null, signature/)
  assert.match(hook, /status: 'ready', quote: data, signature/)
  assert.match(hook, /status: 'unavailable', quote: null, signature/)
  assert.match(flow, /setQuoteInput\(null\)/)
  assert.match(flow, /setRequestKey\(\(value\) => value \+ 1\)/)
  assert.match(hook, /input\.requestKey/)
})
