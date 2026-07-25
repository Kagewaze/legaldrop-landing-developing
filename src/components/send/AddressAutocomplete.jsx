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
//     never writes .value at all. The committed address is displayed in the
//     confirmation row below the input instead, so there is nothing to sync.
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

export function AddressAutocomplete({
  label,
  placeholder,
  selected,
  onSelect,
  tone = 'default',
}) {
  const containerRef = useRef(null)

  // Latest callback without re-running the init effect. See rule 4.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

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

        element.style.width = '100%'

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

  const captionClass =
    tone === 'accent'
      ? 'text-[11px] font-bold tracking-[0.08em] text-brand-600'
      : 'text-[11px] font-bold tracking-[0.08em] text-[#8d8695]'

  const borderClass =
    tone === 'accent'
      ? 'border-brand-600'
      : 'border-[#e3dfe8] focus-within:border-brand-600'

  return (
    <div>
      <div className={`rounded-xl border-[1.5px] px-3.5 py-3 ${borderClass}`}>
        <span className={`block ${captionClass}`}>{label}</span>

        <div ref={containerRef} className="mt-1" />

        {status === 'loading' && (
          <p className="mt-1 text-[13px] text-[#8d8695]">Loading addresses…</p>
        )}

        {status === 'error' && (
          <p className="mt-1 text-[13px] text-rose-600">
            Address search is unavailable right now. Please try again shortly.
          </p>
        )}
      </div>

      {/* The committed selection, shown as text rather than written back into
          the input — see rule 2. This is also what makes a refresh legible:
          state is restored from sessionStorage and displayed here, with no
          attempt to repopulate the uncontrolled element. */}
      {selected ? (
        <p className="mt-1.5 flex items-start gap-1.5 px-1 text-[13px] text-[#5f5868]">
          <span aria-hidden className="mt-[2px] text-brand-600">
            ✓
          </span>
          <span>{selected.address}</span>
        </p>
      ) : (
        <p className="mt-1.5 px-1 text-[13px] text-[#8d8695]">
          {placeholder}
        </p>
      )}
    </div>
  )
}
