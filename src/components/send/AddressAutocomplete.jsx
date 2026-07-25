'use client'

import { useEffect, useRef, useState } from 'react'

import { importMapsLibrary } from '@/lib/maps-loader'

// Google Places autocomplete input (Places API New: PlaceAutocompleteElement).
//
// ─── THIS ELEMENT IS UNCONTROLLED. DO NOT MAKE IT CONTROLLED. ───────────────
//
// The partner platform regressed here once. The rules, and why:
//
//  1. The ONLY event that commits a selection is 'gmp-select'. Do not listen to
//     'input' or 'change' for commit purposes — they fire on every keystroke,
//     when nothing has been selected and there are no coordinates yet.
//
//  2. Never drive element.value from React state. This component deliberately
//     never writes .value at all.
//
//  3. NEVER write a guard that compares the input's value against React state
//     to detect a "programmatic echo". Assigning .value fires NO input event,
//     so such a guard never fires in the case it was written for — and it DOES
//     fire on legitimate typing that happens to match state, silently dropping
//     a real user selection. It is wrong in both directions.
//
//  4. The init effect has an empty dependency array on purpose. If it depended
//     on `value` or on the callback, the element would be torn down and rebuilt
//     mid-typing. The callback is reached through a ref instead.
//
// React 18 does not bind props or events to custom elements, so the element is
// constructed imperatively and wired with addEventListener + cleanup.
//
// ─── STYLING CONTRACT ───────────────────────────────────────────────────────
//
// The shadow root is CLOSED (verified on the pinned 3.64). Consequences:
//   - descendant selectors and > can never reach the internal input;
//   - ::part() only works if Google tagged internals with part attributes,
//     which could not be verified;
//   - inherited properties (font-family, color) and CSS CUSTOM PROPERTIES do
//     cross a closed boundary, so the --gmp-mat-* Material tokens below are the
//     only supported lever.
//
// Whether those tokens neutralise the internal input's own border could NOT be
// verified locally: the referrer-restricted key leaves the element degraded
// (it paints only the search icon, with no internal input at all).
//
// So this layout does not DEPEND on them. Our row draws no border of its own —
// the container around both rows is the only frame. If the tokens work, the
// field is chromeless inside our container. If they do not, Google's border is
// the ONLY border present, not a second one. Either way there is no box-in-box.
//
// Same reasoning for focus: the row's focus affordance is a background TINT,
// never a ring or border. A tint cannot stack with Google's own focus outline
// the way two borders would.

const THEME_STYLE_ID = 'dp-place-autocomplete-theme'

const THEME_CSS = `
.dp-place-field gmp-place-autocomplete {
  /* Material tokens — the only values that cross a closed shadow root.
     Transparent surface/outline is the attempt to neutralise the internal
     input's own chrome. Harmless if unsupported. */
  --gmp-mat-color-surface: transparent;
  --gmp-mat-color-surface-container-highest: transparent;
  --gmp-mat-color-surface-variant: transparent;
  --gmp-mat-color-outline: transparent;
  --gmp-mat-color-outline-variant: transparent;
  --gmp-mat-color-on-surface: #17131c;
  --gmp-mat-color-on-surface-variant: #8d8695;
  --gmp-mat-color-primary: #7b2fbe;
  --gmp-mat-font-family: var(--font-inter), system-ui, sans-serif;

  /* Applied to the host itself, which we can always style. */
  display: block;
  background: transparent;
  border: 0;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 16px;

  /* Google ships the host with an intrinsic width (~320px) that does not yield
     to flex shrinking, so the row overflowed its container and pushed the
     committed-address check outside the rounded box — badly at mobile widths.
     min-width:0 is the load-bearing declaration: without it, width/max-width
     are ignored because min-width wins over both. !important because these
     compete with Google's own injected stylesheet. */
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
}
`

// Injected once into <head> rather than rendered per instance, so two fields do
// not emit duplicate rules. Client-only, so there is no SSR/hydration concern.
function ensureThemeStyles() {
  if (typeof document === 'undefined') {
    return
  }

  if (document.getElementById(THEME_STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = THEME_STYLE_ID
  style.textContent = THEME_CSS
  document.head.append(style)
}

function RailGlyph({ variant }) {
  // The pickup dot and dropoff square, joined by a hairline that runs between
  // the two rows. Each row draws only its half of the line — from the glyph to
  // its own edge — so the join is height-agnostic and stays aligned however
  // tall the rows become.
  const isPickup = variant === 'pickup'

  return (
    <span
      aria-hidden
      className="relative flex w-3 flex-none items-center justify-center self-stretch"
    >
      <span
        className={`absolute left-1/2 w-px -translate-x-1/2 bg-[#e3dfe8] ${
          isPickup ? 'top-1/2 bottom-0' : 'top-0 bottom-1/2'
        }`}
      />
      <span
        className={
          isPickup
            ? 'relative z-10 h-[9px] w-[9px] rounded-full border-2 border-brand-600 bg-white'
            : 'relative z-10 h-[9px] w-[9px] bg-[#17131c]'
        }
      />
    </span>
  )
}

export function AddressAutocomplete({
  label,
  variant = 'pickup',
  selected,
  onSelect,
}) {
  const containerRef = useRef(null)

  // Latest callback without re-running the init effect. See rule 4.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  // Styling only — kept out of the init effect below so that effect stays
  // exactly what it was.
  useEffect(() => {
    ensureThemeStyles()
  }, [])

  useEffect(() => {
    let cancelled = false
    let element = null
    let handleSelect = null

    async function init() {
      try {
        const { PlaceAutocompleteElement } = await importMapsLibrary('places')

        if (cancelled || !containerRef.current) {
          return
        }

        element = new PlaceAutocompleteElement({
          // Canada only — the service area is Toronto and the GTA.
          includedRegionCodes: ['ca'],
        })

        // Visual only. The label is now visually hidden, so the placeholder is
        // what tells the customer which field this is. Support for this
        // property on 3.64 could not be verified locally (the element is
        // degraded without a valid referrer); assigning it is harmless if
        // unsupported, in which case Google's default placeholder shows.
        try {
          element.placeholder = label
        } catch (error) {
          // Read-only or unsupported — fall back to Google's default.
        }

        handleSelect = async (event) => {
          try {
            // Places API (New) hands back a prediction, not a place. It has to
            // be converted and then have its fields fetched explicitly.
            const prediction = event?.placePrediction

            if (!prediction) {
              return
            }

            const place = prediction.toPlace()
            await place.fetchFields({
              fields: ['location', 'formattedAddress'],
            })

            const location = place.location

            if (!location) {
              return
            }

            // lat/lng are FUNCTIONS on a LatLng, not properties. Reading them
            // as properties yields undefined and produces a quote request with
            // no coordinates.
            const lat = location.lat()
            const lng = location.lng()

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return
            }

            onSelectRef.current({
              address: place.formattedAddress ?? '',
              lat,
              lng,
            })
          } catch (error) {
            // A failed field fetch leaves the previous selection intact, which
            // is the right outcome — better than committing a place with no
            // coordinates.
          }
        }

        element.addEventListener('gmp-select', handleSelect)
        containerRef.current.appendChild(element)

        if (!cancelled) {
          setStatus('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    init()

    return () => {
      cancelled = true

      if (element && handleSelect) {
        element.removeEventListener('gmp-select', handleSelect)
      }

      element?.remove()
    }
    // Mount once. See rule 4 above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`dp-place-field flex min-h-[56px] items-stretch gap-3 px-4 transition-colors focus-within:bg-[#faf8fc] ${
        variant === 'pickup' ? 'rounded-t-2xl' : 'rounded-b-2xl'
      }`}
    >
      <RailGlyph variant={variant} />

      {/* min-w-0 is required on BOTH this flex item and the one below it.
          A flex item defaults to min-width:auto, i.e. it refuses to shrink
          below its content — so without it the Google element's intrinsic
          ~320px width pushes the committed-address check outside the rounded
          container (badly at mobile widths). */}
      <div
        className={`flex min-w-0 flex-1 items-center gap-3 ${
          variant === 'dropoff' ? 'border-t border-[#f0eef2]' : ''
        }`}
      >
        {/* Visually hidden, but still announced. The uppercase PICKUP/DROPOFF
            captions are gone; the placeholder carries that meaning visually. */}
        <span className="sr-only">{label}</span>

        <div ref={containerRef} className="min-w-0 flex-1" />

        {status === 'loading' && (
          <span className="flex-none text-[13px] text-[#8d8695]">…</span>
        )}

        {status === 'error' && (
          <span className="flex-none text-[13px] text-rose-600">
            Unavailable
          </span>
        )}

        {selected && status === 'ready' && (
          <span
            aria-hidden
            className="flex-none text-[15px] font-semibold text-brand-600"
          >
            ✓
          </span>
        )}
      </div>
    </div>
  )
}
