import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const page = read('../src/app/(main)/drop-batch/page.jsx')
const config = read('../src/lib/config.js')
const navigation = read('../src/lib/navigation.js')
const services = read('../src/components/home/Services.jsx')

test('uses independent safe exposure flags', () => {
  assert.match(config, /DROPBATCH_EXPLAINER_ENABLED = true/)
  assert.match(config, /DROPBATCH_PUBLIC_QUOTE_ENABLED = true/)
  assert.match(config, /DROPBATCH_SEND_COMPARISON_ENABLED = true/)
  assert.match(config, /DROPBATCH_MARKETPLACE_ENABLED = false/)
  assert.match(config, /DROPBATCH_BOOKING_ENABLED = false/)
  assert.match(navigation, /DROPBATCH_EXPLAINER_ENABLED/)
})

test('renders the customer explainer with human imagery and request CTA', () => {
  assert.match(page, /Deliver farther for less with DropBatch/)
  assert.match(page, /dropbatch-hero\.png/)
  assert.match(page, /dropbatch-handoff\.png/)
  assert.doesNotMatch(page, /medical-pharma|legal-document/)
  assert.match(page, /Check DropBatch availability/)
  assert.match(page, /href="\/drop-batch\/request"/)
  assert.match(page, /80 km minimum/)
})

test('contains no marketplace board or unavailable app-booking promise', () => {
  assert.doesNotMatch(page, /TripBoard|fetchPublicTrips|booking happen in the app|request space in the app/i)
  assert.doesNotMatch(page, />\s*(Book|Pay|Checkout|Reserve)\s*</i)
})

test('homepage discovery copy describes the current scheduled long-distance product', () => {
  assert.match(services, /Scheduled long-distance delivery on trips heading your way/)
  assert.doesNotMatch(services, /Many stops on one optimised route/)
})
