import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const payment = fs.readFileSync(new URL('../src/app/send/pay/page.jsx', import.meta.url), 'utf8')
const tracking = fs.readFileSync(new URL('../src/app/track/[trackingCode]/LiveTracking.jsx', import.meta.url), 'utf8')

test('paid DropBatch confirmation describes waiting matching and Standard alternative', () => {
  assert.match(payment, /Finding a DropBatch driver/)
  assert.match(payment, /already travelling in your direction/)
  assert.match(payment, /Need it sooner\? Use Standard Delivery/)
})

test('tracking continues polling while a DropBatch match is non-terminal', () => {
  assert.match(tracking, /if \(isTerminalStatus\(status\)\)/)
  assert.match(tracking, /setMessage\(data\.message\)/)
})
