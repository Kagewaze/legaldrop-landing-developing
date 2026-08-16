'use client'

import { useCallback, useRef, useState } from 'react'

import { TripCard } from '@/components/dropbatch/TripCard'
import { DEFAULT_ORIGIN, fetchPublicTrips } from '@/lib/drop-batch'

// The board's only interactive part.
//
// ⚠️ THE FIRST RENDER IS THE SERVER'S. `initialTrips` arrives already fetched
// from the default Toronto origin, so the board is populated on first paint with
// no client request and no permission prompt. This island exists only for the
// two things a visitor can change: destination, and searching from their own
// location.
//
// ⚠️ NEVER CALL navigator.geolocation ON MOUNT. It runs only inside the click
// handler below, so a visitor is never asked for their position by a page they
// just opened. There is no retry-on-deny and no second prompt.

// One press recipe, shared by all three buttons so they cannot drift apart.
//
// WHY IT EXISTS: pressing a control should confirm the interface heard you.
// Without it the only feedback is a hover colour, which touch users never see
// at all.
//
// WHY THESE VALUES:
//   properties  named explicitly, never `all` — `all` would also animate layout
//               properties and quietly cost frames.
//   150ms       the repo's `duration-fast`; press feedback belongs in the
//               100–160ms band, where it reads as instant rather than as an
//               effect being played at you.
//   this curve  the built-in CSS easings are too weak to feel deliberate. This
//               one front-loads the movement, so the press registers on the
//               first frame the eye is actually watching.
//   0.97        enough to feel, not enough to notice. Never scale(0) or below
//               0.95 — that reads as a bounce, not an acknowledgement.
//
// REDUCED MOTION drops the transform entirely rather than merely un-animating
// it: keeping the scale without the transition would swap a smooth press for an
// abrupt jump, which is worse than no press feedback at all. The colour change
// stays, because colour is not what causes motion sickness.
const PRESS =
  'transition-[background-color,border-color,transform] duration-fast ' +
  'ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ' +
  'motion-reduce:transition-none motion-reduce:active:scale-100'

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand-600'

export function TripBoard({ initialTrips }) {
  const [trips, setTrips] = useState(initialTrips)
  // 'idle' | 'loading' | 'error'
  const [status, setStatus] = useState('idle')
  const [destination, setDestination] = useState('')
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN)
  const [locationNote, setLocationNote] = useState('')

  // A slow earlier search must not overwrite a faster later one.
  const seq = useRef(0)

  const search = useCallback(async (next) => {
    const id = ++seq.current
    setStatus('loading')
    try {
      const result = await fetchPublicTrips(next)
      if (id !== seq.current) return
      setTrips(result)
      setStatus('idle')
    } catch {
      if (id !== seq.current) return
      // ⚠️ DO NOT fall back to an empty board here. "No trips" and "we could not
      // reach the server" are different statements and conflating them would
      // tell the visitor the marketplace is empty when it may be busy.
      setStatus('error')
    }
  }, [])

  const onSubmit = (event) => {
    event.preventDefault()
    search({ ...origin, destinationCity: destination })
  }

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationNote('This browser cannot share a location.')
      return
    }

    setLocationNote('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // ⚠️ The coordinates are used for the query and never rendered, never
        // put in the URL, and never stored.
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'your location',
        }
        setOrigin(next)
        setLocationNote('Showing trips near you.')
        search({ ...next, destinationCity: destination })
      },
      () => {
        // Denied or unavailable — say so once, calmly, and keep the board exactly
        // as it was. No re-prompt.
        //
        // The message must describe the board that is actually on screen. On the
        // ordinary path origin is still the default, so naming Toronto is true.
        // But if the visitor granted location earlier and then revoked it, the
        // listed trips are still theirs — claiming "near Toronto" would describe
        // a board that is not being shown.
        setLocationNote(
          origin.label === DEFAULT_ORIGIN.label
            ? `Location unavailable — showing trips near ${DEFAULT_ORIGIN.label}.`
            : 'Location unavailable — showing the trips already listed.',
        )
      },
      { timeout: 8000, maximumAge: 300000 },
    )
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <label
            htmlFor="dropbatch-destination"
            className="block text-sm font-semibold text-[#17131c]"
          >
            Destination city
          </label>
          <input
            id="dropbatch-destination"
            type="text"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            // The backend matches destinationCity case-insensitively but
            // EXACTLY, so the placeholder shows a whole city name rather than
            // implying partial or fuzzy search.
            placeholder="Ottawa"
            // `transition-colors duration-fast` matches ContactFields.jsx:12 —
            // the brand border arrives rather than snapping on. Colour only:
            // nothing here moves, so there is nothing for reduced motion to cut.
            className="mt-1.5 min-h-12 w-full rounded-control border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3 text-base text-[#17131c] transition-colors duration-fast placeholder:text-[#5f5868] focus:border-brand-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          // The transparent border is load-bearing, not decoration: the input and
          // "Use my location" both carry border-[1.5px], and Tailwind's default
          // border-box puts that inside the height. Without a matching border this
          // button measured 50px against their 52px, so `sm:items-end` aligned the
          // bottoms and left its top edge 2px low.
          className={`min-h-12 rounded-control border-[1.5px] border-transparent bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700 ${PRESS} ${FOCUS}`}
        >
          Search trips
        </button>

        <button
          type="button"
          onClick={useMyLocation}
          className={`min-h-12 rounded-control border-[1.5px] border-[#e3dfe8] px-6 py-3 text-base font-semibold text-[#17131c] hover:border-[#17131c] ${PRESS} ${FOCUS}`}
        >
          Use my location
        </button>
      </form>

      <p className="mt-3 text-sm text-[#5f5868]" aria-live="polite">
        {locationNote ||
          `Showing trips departing near ${origin.label}, within 50 km.`}
      </p>

      <div className="mt-8" aria-busy={status === 'loading'}>
        {status === 'loading' ? (
          // Restrained placeholder geometry rather than a spinner — the board
          // keeps its shape so the section does not collapse and reflow.
          //
          // ⚠️ DELIBERATELY STATIC, NOT `animate-pulse`.
          // Searching is a high-frequency action against a single indexed
          // query, so this is usually on screen for a few hundred milliseconds.
          // Tailwind's pulse is a 2s cycle: at that length it never completes
          // even one pass, so it communicates nothing and only adds motion to
          // the one moment the visitor is waiting. Holding the layout perfectly
          // still makes the results feel like they arrive sooner.
          //
          // The loading STATE is not lost by dropping the animation — aria-busy
          // on the wrapper carries it for assistive tech, and the placeholder
          // geometry carries it visually.
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-[188px] rounded-card border border-[#eeebf1] bg-white/60"
              />
            ))}
          </ul>
        ) : status === 'error' ? (
          <div className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 text-center">
            <p className="text-base font-semibold text-[#17131c]">
              Unable to load available trips right now.
            </p>
            <p className="mt-1.5 text-sm text-[#5f5868]">
              This is a problem reaching the trip board, not a sign that no trips
              exist.
            </p>
            <button
              type="button"
              onClick={() => search({ ...origin, destinationCity: destination })}
              // Same press and focus recipe as the two form buttons. It had
              // neither before — no transition at all — so the one control a
              // visitor reaches when something has already gone wrong was the
              // least responsive on the page.
              className={`mt-5 min-h-11 rounded-control border-[1.5px] border-[#e3dfe8] px-5 py-2.5 text-sm font-semibold text-[#17131c] hover:border-[#17131c] ${PRESS} ${FOCUS}`}
            >
              Try again
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 text-center">
            <p className="text-base font-semibold text-[#17131c]">
              No matching DropBatch trips right now.
            </p>
            <p className="mt-1.5 text-sm text-[#5f5868]">
              Trips are posted by people travelling, so the board changes through
              the week. Try another destination or a different starting point.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip, index) => (
              <TripCard
                // The public projection has no id by design, so position within
                // the server-ordered result is the only stable key available.
                key={`${trip.originCity}-${trip.destinationCity}-${trip.departureDate}-${index}`}
                trip={trip}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
