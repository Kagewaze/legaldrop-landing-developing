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
  assert.match(page, /Get my DropBatch price/)
  assert.match(page, /href="\/drop-batch\/request"/)
  assert.match(page, /80 km minimum/)
})

test('contains no marketplace board or unavailable app-booking promise', () => {
  assert.doesNotMatch(page, /TripBoard|fetchPublicTrips|booking happen in the app|request space in the app/i)
  assert.doesNotMatch(page, />\s*(Book|Pay|Checkout|Reserve)\s*</i)
  assert.doesNotMatch(page, /compatible trip|matching trip|active trip|already travelling|heading that way|unused vehicle capacity/i)
})

test('driver copy allows immediate acceptance without making supply a price prerequisite', () => {
  assert.match(page, /price does not depend on a driver already being assigned/)
  assert.match(page, /may accept quickly when the route fits/)
  assert.match(page, /may take longer while drivers look for deliveries heading in the same direction/)
  assert.doesNotMatch(page, /driver only becomes available|wait until close to pickup|pre-existing driver|pre-existing trip/i)
})

test('homepage discovery copy describes the current scheduled long-distance product', () => {
  assert.match(services, /Scheduled long-distance delivery for routes of 80 km or more/)
  assert.doesNotMatch(services, /Many stops on one optimised route/)
})
