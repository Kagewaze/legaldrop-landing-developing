import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const payment = fs.readFileSync(new URL('../src/app/send/pay/page.jsx', import.meta.url), 'utf8')
const tracking = fs.readFileSync(new URL('../src/app/track/[trackingCode]/LiveTracking.jsx', import.meta.url), 'utf8')

test('paid DropBatch confirmation describes waiting matching without promising a Standard switch', () => {
  assert.match(payment, /Finding a DropBatch driver/)
  assert.match(payment, /already travelling in your direction/)
  assert.match(payment, /No driver is assigned yet/)
  // Converting a paid DropBatch order to Standard is not implemented — pricingMode is never
  // mutated after creation and there is no top-up charge primitive. Until it is, offering it here
  // is a promise the backend cannot keep.
  assert.doesNotMatch(payment, /Need it sooner\? Use Standard Delivery/)
})

test('tracking continues polling while a DropBatch match is non-terminal', () => {
  assert.match(tracking, /if \(isTerminalStatus\(status\)\)/)
  assert.match(tracking, /setMessage\(data\.message\)/)
})
