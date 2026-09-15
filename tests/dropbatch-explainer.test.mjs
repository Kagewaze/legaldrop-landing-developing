import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const page = read('../src/app/(main)/drop-batch/page.jsx')
const config = read('../src/lib/config.js')
const navigation = read('../src/lib/navigation.js')
const services = read('../src/components/home/Services.jsx')

// Strips source comments so banned-phrase assertions judge rendered copy.
const prose = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

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
  assert.match(page, /dropbatch-hero\.webp/)
  assert.match(page, /dropbatch-handoff\.webp/)
  assert.doesNotMatch(page, /medical-pharma|legal-document/)
  assert.match(page, /Get my DropBatch price/)
  assert.match(page, /href="\/drop-batch\/request"/)
  assert.doesNotMatch(page, /80 km|long-distance/i)
  assert.match(page, /Book through Send a package/)
  assert.doesNotMatch(page, /once booking is available|booking is being prepared/i)
})

test('contains no marketplace board or unavailable app-booking promise', () => {
  assert.doesNotMatch(page, /TripBoard|fetchPublicTrips|booking happen in the app|request space in the app/i)
  assert.doesNotMatch(page, />\s*(Book|Pay|Checkout|Reserve)\s*</i)
})

// ⚠️ THE ASSERTION BELOW USED TO BE ITS OWN OPPOSITE.
//
// Until 2026-09-08 this file asserted that the explainer did NOT say "compatible
// trip" or "already travelling", and that it DID describe the delivery joining the
// normal driver job board. That matched the build of the day. It stopped matching
// the product when the backend was consolidated: DropBatch is now excluded from the
// jobs-board query and refused generic dispatch, and is matched against trips
// drivers have already posted. The old assertions were pinning a false description
// of how Druppr fulfils the order, so they are inverted here on purpose.
test('the explainer describes route matching, not a job board', () => {
  assert.match(page, /DROPBATCH_EXPLANATION/)
  assert.match(page, /already posted/i)
  assert.match(page, /joins a trip already being made/i)
  // Judge what the page renders, not the comment that explains why the phrase is
  // banned in the first place.
  assert.doesNotMatch(prose(page), /job board/i)
})

test('driver copy keeps the wait and the absence of a guarantee', () => {
  assert.match(page, /still has to accept/i)
  assert.match(page, /take longer than Standard Delivery/)
  assert.match(page, /not guaranteed/i)
  assert.doesNotMatch(page, /driver only becomes available|wait until close to pickup/i)
})

test('the explainer states the dedicated alternative it is being compared against', () => {
  assert.match(page, /STANDARD_EXPLANATION/)
})

test('homepage discovery copy names the route match', () => {
  assert.match(services, /already heading your way/)
  assert.doesNotMatch(services, /Many stops on one optimised route/)
})
