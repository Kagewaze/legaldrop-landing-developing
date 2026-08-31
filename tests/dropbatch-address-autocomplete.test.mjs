import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const flow = read('../src/components/dropbatch/DropBatchRequestFlow.jsx')
const address = read('../src/components/send/AddressAutocomplete.jsx')
const field = read('../src/components/send/MobileAddressField.jsx')
const predictions = read('../src/lib/use-place-predictions.js')
const send = read('../src/app/send/page.jsx')

test('DropBatch connects independent pickup and dropoff fields to the Druppr autocomplete', () => {
  assert.match(flow, /label="Pickup address"[\s\S]*selected=\{pickup\}[\s\S]*setPickup\(place\)[\s\S]*forceDrupprInput/)
  assert.match(flow, /label="Drop-off address"[\s\S]*selected=\{dropoff\}[\s\S]*setDropoff\(place\)[\s\S]*forceDrupprInput/)
  assert.match(flow, /<SendMap pickup=\{pickup\} dropoff=\{dropoff\}/)
})

test('typed text reaches the existing debounced Google prediction authority', () => {
  assert.match(field, /onQueryChange\(next\)[\s\S]*search\(next\)/)
  assert.match(predictions, /MIN_QUERY_LENGTH = 3/)
  assert.match(predictions, /DEBOUNCE_MS = 250/)
  assert.match(predictions, /AutocompleteSuggestion\.fetchAutocompleteSuggestions/)
  assert.match(predictions, /includedRegionCodes: REGION_CODES/)
})

test('only a selected prediction commits address and coordinates', () => {
  assert.match(field, /onClick=\{\(\) => choose\(prediction\)\}/)
  assert.match(address, /prediction\.toPlace\(\)/)
  assert.match(address, /fetchFields\(\{ fields: \['location', 'formattedAddress'\] \}\)/)
  assert.match(address, /address: place\.formattedAddress \?\? ''[\s\S]*lat,[\s\S]*lng,/)
  assert.doesNotMatch(field, /onQueryChange\([^)]*\)[\s\S]{0,120}onCommit/)
})

test('DropBatch suggestions float visibly without clipping or layout shift', () => {
  assert.match(address, /overlaySuggestions=\{forceDrupprInput\}/)
  assert.match(field, /absolute left-0 right-0 top-full z-30/)
  assert.match(field, /role="listbox"/)
  assert.match(field, /onPointerDown=\{\(event\) => event\.preventDefault\(\)\}/)
})

test('DropBatch uses the canonical two-row frame and accessible neutral focus treatment', () => {
  const canonicalFrame = /rounded-2xl bg-white shadow-\[0_1px_2px_rgba\(23,19,28,0\.04\),0_6px_20px_rgba\(23,19,28,0\.06\)\] ring-1 ring-\[#efecf2\]/
  assert.match(send, canonicalFrame)
  assert.match(flow, canonicalFrame)
  assert.match(field, /embedded[\s\S]*border-0 bg-transparent[\s\S]*focus:outline-none/)
  assert.match(address, /focus-within:bg-\[#faf8fc\]/)
  assert.doesNotMatch(flow, /focus:border-blue|focus:ring-blue|outline-blue/)
})

test('normal send keeps its existing responsive presentation and quote safety is untouched', () => {
  assert.doesNotMatch(send, /forceDrupprInput/)
  assert.match(flow, /setQuoteInput\(null\)/)
  assert.doesNotMatch(`${flow}\n${address}\n${field}`, /drop-batch\/book|POST \/order|PaymentIntent|Stripe/i)
})
