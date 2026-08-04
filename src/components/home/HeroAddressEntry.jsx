'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { importMapsLibrary } from '@/lib/maps-loader'
import { ROUTES } from '@/lib/navigation'
import {
  SEND_FLOW_STORAGE_KEY,
  isPlace,
} from '@/lib/send-flow-contract'

// The homepage's pickup / drop-off entry. ONE client island; the hero around it
// stays a server component and NetworkDemo keeps its own separate boundary.
//
// ── WHAT THIS DOES AND DOES NOT DO ──────────────────────────────────────────
//
// It captures two GEOCODED addresses and hands them to the existing send flow
// through its existing sessionStorage contract, then navigates to /send. It
// does NOT price anything, does not call the quote endpoint, and does not
// create an order. Everything after the two addresses is /send's job, unchanged.
//
// ── WHY NOT REUSE send/AddressAutocomplete.jsx ──────────────────────────────
//
// That component wraps Google's PlaceAutocompleteElement — a web component whose
// suggestion dropdown lives in ITS OWN SHADOW DOM. It is the right choice on
// /send, and its 588 lines encode hard-won rules about that element (the
// gmp-select-only commit path, the one-write hydration latch, the in-shadow
// clear button). But Phase 7 requires a Druppr-styled suggestion list, and you
// cannot restyle a list you cannot reach.
//
// So this uses the PROGRAMMATIC Places API instead —
// AutocompleteSuggestion.fetchAutocompleteSuggestions — which returns
// predictions as data and lets us render them ourselves. Verified present at
// the pinned version: google.maps.version 3.64.14a exposes both
// AutocompleteSuggestion.fetchAutocompleteSuggestions and Place.
//
// ⚠️ THE COMMIT PATH IS COPIED DELIBERATELY, NOT REINVENTED. Converting a
// prediction to coordinates follows exactly what AddressAutocomplete.jsx does,
// including the trap it documents at :314 — on a LatLng, lat and lng are
// FUNCTIONS, not properties. Reading them as properties yields undefined and
// produces a booking with no coordinates. If that file's commit path is ever
// corrected, correct this one with it.
//
// ── LAZY LOADING ────────────────────────────────────────────────────────────
//
// The homepage makes ZERO Maps and ZERO Places requests until someone focuses
// an address field. maps-loader.js installs Google's inline bootstrap, which
// DEFINES importLibrary synchronously but does not fetch the API until the
// first importLibrary() call — and Google memoises that fetch internally, so
// concurrent calls from both fields share one network request and one script
// tag. Nothing here runs at module scope, on mount, on idle, on intersection or
// on hover.

const MIN_QUERY_LENGTH = 3
const DEBOUNCE_MS = 250

// Canada only, matching send/AddressAutocomplete.jsx:363. This is the existing
// product's own restriction, not a new service-boundary rule invented here — no
// approved GTA-only boundary exists, and hard-restricting further would reject
// legitimate supported deliveries.
const REGION_CODES = ['ca']

const FIELD_BASE =
  'w-full rounded-control border-[1.5px] bg-white px-4 py-3 text-base text-[#17131c] placeholder:text-[#8d8695] transition-colors focus:outline-none focus:ring-0'

// A prediction rendered as two lines: the place name and the rest of the
// address. Google returns exactly this split, so no parsing is invented.
function splitPrediction(prediction) {
  const text = prediction?.text?.toString?.() ?? ''
  const main = prediction?.mainText?.toString?.() ?? text
  const secondary = prediction?.secondaryText?.toString?.() ?? ''
  return { main: main || text, secondary }
}

function AddressField({
  id,
  label,
  placeholder,
  value,
  onTextChange,
  onSelect,
  onInvalidate,
  selected,
  ensurePlaces,
  loaderState,
  onDegraded,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  // 'idle' | 'searching' | 'no-results' | 'failed' | 'resolving'
  const [status, setStatus] = useState('idle')

  // Monotonic request id. A slower earlier request must never overwrite the
  // results of a faster later one, so every response checks that it is still
  // the newest before touching state.
  const requestSeq = useRef(0)
  const mounted = useRef(true)
  const debounceTimer = useRef(null)
  const blurTimer = useRef(null)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      if (blurTimer.current) clearTimeout(blurTimer.current)
    }
  }, [])

  const listId = `${id}-listbox`
  const statusId = `${id}-status`

  const runSearch = useCallback(
    async (query) => {
      const seq = ++requestSeq.current

      if (query.trim().length < MIN_QUERY_LENGTH) {
        if (mounted.current && seq === requestSeq.current) {
          setSuggestions([])
          setOpen(false)
          setStatus('idle')
        }
        return
      }

      setStatus('searching')

      try {
        const places = await ensurePlaces()

        // The loader failed, or the component went away while it loaded.
        if (!places || !mounted.current || seq !== requestSeq.current) return

        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: REGION_CODES,
          })

        // Stale: a newer keystroke already fired. Drop this entirely.
        if (!mounted.current || seq !== requestSeq.current) return

        const predictions = (results ?? [])
          .map((entry) => entry.placePrediction)
          .filter(Boolean)
          .slice(0, 5)

        setSuggestions(predictions)
        setActiveIndex(-1)
        setOpen(predictions.length > 0)
        setStatus(predictions.length === 0 ? 'no-results' : 'idle')
      } catch (error) {
        if (!mounted.current || seq !== requestSeq.current) return
        // Never rethrown: an unhandled rejection here would surface as a
        // console error on the homepage. The typed text is left alone so the
        // customer does not lose what they wrote, and renewed typing retries.
        setSuggestions([])
        setOpen(false)
        setStatus('failed')
        onDegraded()
      }
    },
    [ensurePlaces, onDegraded],
  )

  const handleChange = (event) => {
    const next = event.target.value
    onTextChange(next)

    // EDITING INVALIDATES THE SELECTION. Typed text is not a geocoded address,
    // and silently keeping the old coordinates under new text is how a delivery
    // gets booked to the wrong place.
    if (selected) onInvalidate()

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => runSearch(next), DEBOUNCE_MS)
  }

  const commit = useCallback(
    async (prediction) => {
      if (!prediction) return

      setStatus('resolving')
      setOpen(false)

      try {
        // Places API (New) hands back a prediction, not a place; it has to be
        // converted and have its fields fetched explicitly. Details are
        // requested ONLY here — never while merely listing suggestions.
        const place = prediction.toPlace()
        await place.fetchFields({ fields: ['location', 'formattedAddress'] })

        if (!mounted.current) return

        const location = place.location
        // lat/lng are FUNCTIONS on a LatLng. See the header note.
        const lat = location?.lat?.()
        const lng = location?.lng?.()
        const address = place.formattedAddress ?? ''

        const candidate = { address, lat, lng }

        // The same predicate the send flow validates with on read. An
        // incomplete place details response fails here and is reported rather
        // than committed.
        if (!isPlace(candidate)) {
          setStatus('failed')
          return
        }

        onSelect(candidate)
        setStatus('idle')
        setSuggestions([])
        setActiveIndex(-1)
      } catch (error) {
        if (!mounted.current) return
        setStatus('failed')
        onDegraded()
      }
    },
    [onSelect, onDegraded],
  )

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open || suggestions.length === 0) return
      event.preventDefault()
      const delta = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((prev) => {
        const next = prev + delta
        if (next < 0) return suggestions.length - 1
        if (next >= suggestions.length) return 0
        return next
      })
      return
    }

    if (event.key === 'Enter') {
      // Enter selects the active suggestion when one is highlighted, and only
      // then. With nothing highlighted it falls through to the form, which is
      // what lets Enter submit once both addresses are valid.
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault()
        commit(suggestions[activeIndex])
      }
    }
  }

  const borderClass = selected
    ? 'border-brand-600'
    : 'border-[#e3dfe8] focus:border-brand-600'

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-semibold text-white sm:mb-1.5"
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        // The combobox pattern: the INPUT owns the role, and the listbox is
        // referenced rather than contained.
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-describedby={statusId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
        }
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        // First focus is the lazy-load trigger, and the only one.
        onFocus={() => {
          ensurePlaces()
          if (suggestions.length > 0) setOpen(true)
        }}
        // Deferred so a pointer selection lands before the list closes.
        onBlur={() => {
          blurTimer.current = setTimeout(() => {
            if (mounted.current) setOpen(false)
          }, 150)
        }}
        className={`${FIELD_BASE} ${borderClass}`}
      />

      {/* Status line. Deliberately NOT aria-live: suggestion counts changing on
          every keystroke would make a screen reader announce continuously.
          aria-describedby means it is read when the field is focused and when
          the user asks, which is the quiet behaviour the brief calls for. */}
      <p id={statusId} className="sr-only">
        {status === 'searching'
          ? 'Searching addresses'
          : status === 'resolving'
            ? 'Confirming address'
            : status === 'no-results'
              ? 'No matching addresses'
              : status === 'failed'
                ? 'Address suggestions are unavailable'
                : selected
                  ? 'Address selected'
                  : 'Type at least three characters, then choose a suggestion'}
      </p>

      {/* Visible messages, only for the states a sighted user must act on. */}
      {(status === 'no-results' ||
        status === 'failed' ||
        loaderState === 'failed') && (
        <p className="mt-1.5 text-sm text-[#ffd9d4]">
          {loaderState === 'failed' || status === 'failed'
            ? 'Address suggestions are unavailable right now.'
            : 'No matching addresses.'}
        </p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} suggestions`}
          // z-30 clears the network demonstration beside it at lg.
          className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-control border-[1.5px] border-[#e3dfe8] bg-white py-1 shadow-lift"
        >
          {suggestions.map((prediction, index) => {
            const { main, secondary } = splitPrediction(prediction)
            const active = index === activeIndex
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={`${main}-${index}`}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={active}
                // ACTIVE STATE IS NOT COLOUR ALONE: the tint is joined by a
                // brand-600 rule down the leading edge, so the highlight
                // survives a monochrome or high-contrast rendering.
                className={`cursor-pointer border-l-2 px-4 py-2.5 ${
                  active
                    ? 'border-brand-600 bg-surface-tint'
                    : 'border-transparent'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                // mousedown, not click: it fires before the input's blur, so
                // the list is still mounted when the selection is made.
                onMouseDown={(event) => {
                  event.preventDefault()
                  commit(prediction)
                }}
              >
                <span className="block text-sm font-semibold text-[#17131c]">
                  {main}
                </span>
                {secondary && (
                  <span className="block text-sm text-[#5f5868]">
                    {secondary}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function HeroAddressEntry() {
  const router = useRouter()
  const baseId = useId()

  const [pickupText, setPickupText] = useState('')
  const [dropoffText, setDropoffText] = useState('')
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  // 'idle' | 'loading' | 'ready' | 'failed'
  const [loaderState, setLoaderState] = useState('idle')

  const placesPromise = useRef(null)

  // ONE loader for both fields. The promise is cached on a ref, so a second
  // field focusing while the first is still loading joins the same promise
  // rather than starting a second import — and Google's bootstrap memoises the
  // underlying script fetch besides.
  const ensurePlaces = useCallback(() => {
    if (!placesPromise.current) {
      setLoaderState('loading')
      placesPromise.current = importMapsLibrary('places')
        .then((lib) => {
          setLoaderState('ready')
          return lib
        })
        .catch(() => {
          // A missing or referrer-rejected browser key lands here. The failure
          // is surfaced as "suggestions unavailable" plus the always-present
          // link to the full booking flow; the key name is never shown.
          setLoaderState('failed')
          return null
        })
    }
    return placesPromise.current
  }, [])

  // PREFILL FROM AN EXISTING BOOKING IN PROGRESS.
  //
  // Read once on mount, never during render — sessionStorage does not exist on
  // the server, and reading it during render would desynchronise hydration.
  // Only a pair that passes isPlace is adopted; a half-finished or corrupt
  // record is ignored rather than partially restored.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SEND_FLOW_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (isPlace(parsed?.pickup)) {
        setPickup(parsed.pickup)
        setPickupText(parsed.pickup.address)
      }
      if (isPlace(parsed?.dropoff)) {
        setDropoff(parsed.dropoff)
        setDropoffText(parsed.dropoff.address)
      }
    } catch (error) {
      // Malformed JSON, or storage disabled. Start empty.
    }
  }, [])

  // Set the moment either field cannot reach Google — a missing or
  // referrer-rejected key, a blocked network, a details call that fails. It only
  // ever adds an escape hatch; it never blocks anything the user can still do.
  const [degraded, setDegraded] = useState(false)
  const markDegraded = useCallback(() => setDegraded(true), [])

  const ready = isPlace(pickup) && isPlace(dropoff)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!ready) return

    // MERGE, NEVER REPLACE. Only pickup and dropoff are touched; packageCount,
    // weight, vehicle, section and contact survive, which is exactly what the
    // flow's own setPickup/setDropoff do.
    //
    // Nothing stale is left behind by this: the .v1 record holds NO price,
    // distance or quote — useVehicleQuotes derives those at runtime from the
    // coordinates, so new addresses produce a new quote. The PaymentIntent
    // recovery record lives under a SEPARATE key and is already invalidated by
    // paymentInputsHash, which includes all four coordinates.
    let existing = {}
    try {
      const raw = sessionStorage.getItem(SEND_FLOW_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        existing = parsed
      }
    } catch (error) {
      // Corrupt record. Overwriting it with a valid one is the repair.
    }

    try {
      sessionStorage.setItem(
        SEND_FLOW_STORAGE_KEY,
        JSON.stringify({ ...existing, pickup, dropoff }),
      )
    } catch (error) {
      // Private mode or quota. Fall through to /send, which will simply show
      // empty fields — the same state as arriving there directly.
    }

    // No query string. Addresses are customer data and must not reach referrer
    // headers, history or server logs.
    router.push(ROUTES.send.href)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 sm:mt-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <AddressField
          id={`${baseId}-pickup`}
          label="Pickup location"
          placeholder="Enter pickup address"
          value={pickupText}
          onTextChange={setPickupText}
          onSelect={(place) => {
            setPickup(place)
            setPickupText(place.address)
          }}
          onInvalidate={() => setPickup(null)}
          selected={pickup}
          ensurePlaces={ensurePlaces}
          loaderState={loaderState}
          onDegraded={markDegraded}
        />
        <AddressField
          id={`${baseId}-dropoff`}
          label="Drop-off location"
          placeholder="Enter drop-off address"
          value={dropoffText}
          onTextChange={setDropoffText}
          onSelect={(place) => {
            setDropoff(place)
            setDropoffText(place.address)
          }}
          onInvalidate={() => setDropoff(null)}
          selected={dropoff}
          ensurePlaces={ensurePlaces}
          loaderState={loaderState}
          onDegraded={markDegraded}
        />
      </div>

      <div className="mt-4 flex flex-col items-start gap-2 sm:mt-5 sm:flex-row sm:items-center sm:gap-3.5">
        {/* Disabled until BOTH fields hold a geocoded place. aria-disabled
            rather than the disabled attribute alone would leave it focusable
            with no action; the real attribute is used, and the reason is in the
            help text below rather than in a tooltip. */}
        <button
          type="submit"
          disabled={!ready}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand-600 px-[30px] py-3 text-base sm:py-4 font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/70 sm:w-auto"
        >
          Continue to booking
        </button>

        <Link
          href={ROUTES.contact.href}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-control px-2 text-base font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:px-0"
        >
          Talk to our team
        </Link>
      </div>

      <p className="mt-2 text-sm text-white/70 sm:mt-3">
        {ready
          // PHASE 7.1: both helper strings are kept to ONE line at 390. The
          // ready message previously wrapped to two, so selecting the second
          // address nudged the whole network panel down by ~21px — a layout
          // shift caused by the user succeeding, which is the worst moment to
          // move the page.
          ? 'Ready — continue to choose a vehicle.'
          : 'Choose a suggestion for each address.'}
      </p>

      {/* ESCAPE HATCH. Shown only when address lookup is degraded — a missing
          or rejected browser key, a blocked network, a failing details call.
          Without it a visitor who cannot get suggestions has no route into the
          product from here, since submission correctly refuses to accept typed
          text as an address.

          The full booking page runs its own autocomplete against the same
          service, so this is not a promise that it will work — it is a way out
          of a form that currently cannot complete. No configuration detail or
          key name is exposed. */}
      {(degraded || loaderState === 'failed') && (
        <p className="mt-2 text-sm text-white/70">
          <Link
            href={ROUTES.send.href}
            className="rounded-control font-semibold text-white underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Continue on the full booking page
          </Link>{' '}
          to enter your addresses there.
        </p>
      )}
    </form>
  )
}
