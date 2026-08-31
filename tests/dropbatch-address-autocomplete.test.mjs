import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const flow = read('../src/components/dropbatch/DropBatchRequestFlow.jsx')
const address = read('../src/components/send/AddressAutocomplete.jsx')
const field = read('../src/components/send/MobileAddressField.jsx')
const send = read('../src/app/send/page.jsx')
const hero = read('../src/components/home/HeroAddressEntry.jsx')
const presentation = read('../src/components/address/homepage-address-field.js')

test('DropBatch connects independent pickup and dropoff fields to the Druppr autocomplete', () => {
  assert.match(flow, /label="Pickup location"[\s\S]*selected=\{pickup\}[\s\S]*setPickup\(place\)[\s\S]*homepageStyle/)
  assert.match(flow, /label="Drop-off location"[\s\S]*selected=\{dropoff\}[\s\S]*setDropoff\(place\)[\s\S]*homepageStyle/)
  assert.match(flow, /<SendMap pickup=\{pickup\} dropoff=\{dropoff\}/)
})

test('homepage and DropBatch execute the same debounced Google prediction authority', () => {
  assert.match(hero, /export function DrupprAddressAutocomplete/)
  assert.match(hero, /MIN_QUERY_LENGTH = 3/)
  assert.match(hero, /DEBOUNCE_MS = 250/)
  assert.match(hero, /setTimeout\(\(\) => runSearch\(next\), DEBOUNCE_MS\)/)
  assert.match(hero, /AutocompleteSuggestion\.fetchAutocompleteSuggestions/)
  assert.match(hero, /includedRegionCodes: REGION_CODES/)
  assert.doesNotMatch(hero, /AutocompleteSessionToken/)
  assert.match(address, /import \{ DrupprAddressAutocomplete \} from '@\/components\/home\/HeroAddressEntry'/)
  assert.match(address, /if \(homepageStyle\)[\s\S]*<DrupprAddressAutocomplete/)
})

test('only a selected prediction commits address and coordinates', () => {
  assert.match(hero, /onMouseDown=\{\(event\) => \{[\s\S]*commit\(prediction\)/)
  assert.match(hero, /prediction\.toPlace\(\)/)
  assert.match(hero, /fetchFields\(\{ fields: \['location', 'formattedAddress'\] \}\)/)
  assert.match(hero, /const candidate = \{ address, lat, lng \}/)
  assert.match(hero, /if \(!isPlace\(candidate\)\)/)
  assert.match(address, /onSelect=\{\(place\) => onSelectRef\.current\(place\)\}/)
})

test('DropBatch suggestions use the exact homepage overlay and option treatment', () => {
  assert.match(address, /<DrupprAddressAutocomplete/)
  assert.match(presentation, /absolute left-0 right-0 top-full z-30/)
  assert.match(presentation, /rounded-control border-\[1\.5px\] border-\[#e3dfe8\]/)
  assert.match(hero, /border-brand-600 bg-surface-tint/)
  assert.match(hero, /block text-sm font-semibold text-\[#17131c\]/)
  assert.match(hero, /block text-sm text-\[#5f5868\]/)
  assert.match(hero, /role="listbox"/)
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
  assert.match(address, /<DrupprAddressAutocomplete/)
  assert.match(presentation, /border-\[#e3dfe8\] focus:border-brand-600/)
  assert.match(presentation, /focus:outline-none focus:ring-0/)
  assert.doesNotMatch(`${flow}\n${presentation}`, /focus:border-blue|focus:ring-blue|outline-blue/)
})

test('DropBatch never constructs the closed-shadow Google element', () => {
  assert.match(address, /if \(homepageStyle\)[\s\S]*return \([\s\S]*<DrupprAddressAutocomplete/)
  assert.match(address, /if \(homepageStyle \|\| isCompact !== false\) \{[\s\S]*return/)
  assert.ok(
    address.indexOf('if (homepageStyle || isCompact !== false)') <
      address.indexOf('new PlaceAutocompleteElement'),
  )
})

test('prediction results render and selected places remain independent geocoded state', () => {
  assert.match(hero, /setSuggestions\(predictions\)[\s\S]*setOpen\(predictions\.length > 0\)/)
  assert.match(hero, /open && suggestions\.length > 0/)
  assert.match(flow, /setPickup\(place\)/)
  assert.match(flow, /setDropoff\(place\)/)
  assert.match(flow, /<SendMap pickup=\{pickup\} dropoff=\{dropoff\}/)
  assert.doesNotMatch(hero, /onTextChange\([^)]*\)[\s\S]{0,100}latitude|onTextChange\([^)]*\)[\s\S]{0,100}longitude/)
})

test('normal send keeps its existing responsive presentation and quote safety is untouched', () => {
  assert.doesNotMatch(send, /homepageStyle/)
  assert.match(flow, /setQuoteInput\(null\)/)
  assert.doesNotMatch(`${flow}\n${address}\n${field}`, /drop-batch\/book|POST \/order|PaymentIntent|Stripe/i)
})
