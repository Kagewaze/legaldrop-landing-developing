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
const hero = read('../src/components/home/HeroAddressEntry.jsx')
const presentation = read('../src/components/address/homepage-address-field.js')

test('DropBatch connects independent pickup and dropoff fields to the Druppr autocomplete', () => {
  assert.match(flow, /label="Pickup location"[\s\S]*selected=\{pickup\}[\s\S]*setPickup\(place\)[\s\S]*homepageStyle/)
  assert.match(flow, /label="Drop-off location"[\s\S]*selected=\{dropoff\}[\s\S]*setDropoff\(place\)[\s\S]*homepageStyle/)
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

test('DropBatch suggestions use the exact homepage overlay and option treatment', () => {
  assert.match(address, /homepageStyle=\{homepageStyle\}/)
  assert.match(presentation, /absolute left-0 right-0 top-full z-30/)
  assert.match(presentation, /rounded-control border-\[1\.5px\] border-\[#e3dfe8\]/)
  assert.match(field, /border-brand-600 bg-surface-tint/)
  assert.match(field, /block text-sm font-semibold text-\[#17131c\]/)
  assert.match(field, /mt-0\.5 block text-sm text-\[#5f5868\]/)
  assert.match(field, /role="listbox"/)
  assert.match(field, /onPointerDown=\{\(event\) => \{[\s\S]*event\.preventDefault\(\)[\s\S]*choose\(prediction\)/)
})

test('DropBatch uses standalone homepage fields and removes the send rail', () => {
  const canonicalFrame = /rounded-2xl bg-white shadow-\[0_1px_2px_rgba\(23,19,28,0\.04\),0_6px_20px_rgba\(23,19,28,0\.06\)\] ring-1 ring-\[#efecf2\]/
  assert.match(send, canonicalFrame)
  assert.doesNotMatch(flow, canonicalFrame)
  assert.match(flow, /grid grid-cols-1 gap-5/)
  assert.match(address, /!homepageStyle \? <RailGlyph/)
  assert.match(address, /!homepageStyle \? <span className="sr-only">/)
})

test('homepage and DropBatch share the exact accessible focus presentation', () => {
  assert.match(hero, /HOMEPAGE_ADDRESS_FIELD_BASE/)
  assert.match(hero, /HOMEPAGE_ADDRESS_LABEL/)
  assert.match(hero, /HOMEPAGE_ADDRESS_LIST/)
  assert.match(field, /HOMEPAGE_ADDRESS_FIELD_BASE/)
  assert.match(field, /homepageAddressBorderClass\(selected\)/)
  assert.match(presentation, /border-\[#e3dfe8\] focus:border-brand-600/)
  assert.match(presentation, /focus:outline-none focus:ring-0/)
  assert.doesNotMatch(`${flow}\n${presentation}`, /focus:border-blue|focus:ring-blue|outline-blue/)
})

test('DropBatch never constructs the closed-shadow Google element', () => {
  assert.match(address, /if \(homepageStyle \|\| isCompact !== false\) \{[\s\S]*return/)
  assert.ok(
    address.indexOf('if (homepageStyle || isCompact !== false)') <
      address.indexOf('new PlaceAutocompleteElement'),
  )
})

test('normal send keeps its existing responsive presentation and quote safety is untouched', () => {
  assert.doesNotMatch(send, /homepageStyle/)
  assert.match(flow, /setQuoteInput\(null\)/)
  assert.doesNotMatch(`${flow}\n${address}\n${field}`, /drop-batch\/book|POST \/order|PaymentIntent|Stripe/i)
})
