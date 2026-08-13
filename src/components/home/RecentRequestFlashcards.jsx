'use client'

import { useEffect, useRef, useState } from 'react'

// The hero's recent-request flashcards.
//
// ⚠️ DEMONSTRATION DATA ONLY. Nothing is fetched and no event is real. Each card
// names a KIND of request the platform carries, never an occurrence, so it
// cannot be read as "someone just booked this" — and the field states
// "Product demonstration" on its face. No live dot, no timestamp, no count, no
// name, no address, no price. Wiring this to real activity is a separate backend
// phase; until that lands nothing here may imply otherwise.
//
// ⚠️ REPLACES home/NetworkDemo.jsx, retained on disk and unimported as the
// rollback target — restoring it is a two-line change in HeroNetwork.jsx. This
// takes over NetworkDemo's client-island slot, so the homepage still has four.
//
// ONE CARD AT A TIME, AND OFTEN NONE. The empty gap is the design, not a loading
// state: the old panel was a permanent dashboard competing with the booking
// surface, and the hero should read as an open field with an occasional object
// in it. Do not fill the gap.

// Labels are verbatim from the set NetworkDemo shipped, which tracks the order
// categories in app/send/page.jsx SECTION_PRESETS and the hero's own sentence.
// Do not invent new ones: this is the least appropriate surface on which to
// introduce a service the product does not sell.
//
// Geography stays at city scale — lib/navigation.js SERVICE_AREA is "Now serving
// Toronto and the GTA". Never a street, postal code or coordinate.
//
// Position is fixed per event rather than random so the sequence is reproducible
// in review and testing. Three positions, four events: the repeat on 'a' is
// deliberate, giving the loop a resting rhythm instead of a rotation the eye can
// count.
const DEMO_EVENTS = [
  { id: 'parcel', label: 'Same-day parcel', area: 'Toronto', position: 'a' },
  { id: 'medical', label: 'Medical specimen', area: 'Toronto', position: 'b' },
  { id: 'legal', label: 'Legal filing', area: 'Toronto', position: 'c' },
  { id: 'business', label: 'Business delivery', area: 'Toronto', position: 'a' },
]

// Deterministic placements inside the hero's right-hand field. Percentages and
// window measurements were both rejected: these are the three spots that clear
// the caption, stay inside the 456px column at every desktop width, and never
// reach the booking surface — which lives in the other grid column entirely, so
// no card can overlap it by construction.
const POSITIONS = {
  a: 'lg:left-auto lg:right-0 lg:top-[24px]',
  b: 'lg:right-auto lg:left-0 lg:top-[164px]',
  c: 'lg:left-auto lg:right-8 lg:top-[292px]',
}

// Enter, rest, leave, then a genuine pause. The gap is long on purpose: shorten
// it and the field reads as a ticker.
const INITIAL_DELAY_MS = 2200
const ENTER_MS = 240
const VISIBLE_MS = 6000
const EXIT_MS = 200
const GAP_MS = 5200

// ●───→○ — the route motif, at caption scale. Decorative, so it is hidden from
// assistive technology along with the rest of the card.
function RouteMotif() {
  return (
    <svg
      viewBox="0 0 46 10"
      aria-hidden="true"
      focusable="false"
      className="h-2.5 w-[46px] flex-none"
    >
      <circle cx="4" cy="5" r="3" fill="#7B2FBE" />
      <path
        d="M 9 5 H 34"
        fill="none"
        stroke="#7B2FBE"
        strokeOpacity="0.32"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 31 2.6 L 34 5 L 31 7.4"
        fill="none"
        stroke="#7B2FBE"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="41" cy="5" r="3" fill="none" stroke="#7B2FBE" strokeWidth="1.5" />
    </svg>
  )
}

export function RecentRequestFlashcards() {
  const [index, setIndex] = useState(0)
  // idle = nothing on screen. The server renders this state, so the field starts
  // empty and the first card arrives deliberately rather than being present at
  // first paint.
  const [phase, setPhase] = useState('idle')
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const firstIdleRef = useRef(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (query.matches) {
      // One representative card, held still forever: no cycling, no transitions,
      // no drift. The area must still carry its meaning, so it is not left blank.
      setReduced(true)
      setPhase('in')
      return undefined
    }

    // Pausing on hide is what prevents catch-up. The pending timeout is cleared
    // by the effect below when `paused` flips, and on return that effect
    // schedules the CURRENT phase again from full duration — so a tab left in
    // the background for an hour resumes with one card, not a burst of them.
    const onVisibility = () => setPaused(document.visibilityState === 'hidden')
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (reduced || paused) {
      return undefined
    }

    const duration =
      phase === 'idle'
        ? firstIdleRef.current
          ? INITIAL_DELAY_MS
          : GAP_MS
        : phase === 'in'
          ? ENTER_MS + VISIBLE_MS
          : EXIT_MS

    const timer = setTimeout(() => {
      if (phase === 'idle') {
        firstIdleRef.current = false
        setPhase('in')
      } else if (phase === 'in') {
        setPhase('out')
      } else {
        // The next card is a DIFFERENT request, not this one advancing a stage.
        // Swapping the index while invisible is also what lets the position
        // change without an animated jump across the field.
        setIndex((i) => (i + 1) % DEMO_EVENTS.length)
        setPhase('idle')
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [phase, index, paused, reduced])

  const event = DEMO_EVENTS[index]
  const visible = phase === 'in'

  return (
    // The reserved field. Its height is fixed at both breakpoints so a card
    // arriving or leaving moves nothing around it — the cards are out of flow,
    // and downstream content never shifts. This is why CLS stays at zero.
    <div className="relative h-[136px] lg:h-[420px]">
      {/* Decorative. A screen reader gets the one sentence below instead of a
          card that appears and disappears every eleven seconds. */}
      <div
        aria-hidden="true"
        data-flashcard-fallback
        className={`absolute left-0 top-0 w-full transition-[opacity,transform] ease-out motion-reduce:transition-none sm:max-w-[340px] lg:w-[280px] lg:max-w-none ${
          POSITIONS[event.position]
        } ${
          visible
            ? 'translate-y-0 opacity-100 duration-[240ms]'
            : phase === 'out'
              ? '-translate-y-2 opacity-0 duration-200'
              : 'translate-y-3 opacity-0 duration-200'
        }`}
      >
        {/* Lifecycle lives on the wrapper and ambient drift on this element, so
            the two transforms never fight. Drift is desktop-only and is removed
            wholesale under reduced motion — both in src/styles/tailwind.css. */}
        <div
          data-flashcard-drift
          className="rounded-[14px] border border-[#eeebf1] bg-surface-raised p-4 shadow-card"
        >
          {/* THE DISCLOSURE RIDES ON THE CARD, not on the field. A standing
              caption above an empty field reads as a heading whose content
              failed to load, which is the one thing the empty gap must never
              look like. Here it travels with the object it describes and the
              field goes properly empty between cards. */}
          <span className="text-[10px] font-semibold uppercase tracking-label text-[#5f5868]">
            Product demonstration
          </span>
          <p className="mt-1.5 font-display text-[17px] font-bold text-[#17131c]">
            {event.label}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <RouteMotif />
            <span className="text-xs text-[#5f5868]">{event.area}</span>
          </div>
        </div>
      </div>

      {/* Without JavaScript the sequence never starts, so the field would stay
          empty. This reveals the first card in its resting state — the same
          mechanism the booking surface uses in HeroNetwork.jsx. */}
      <noscript>
        <style>{`[data-flashcard-fallback]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <p className="sr-only">
        Product demonstration. Druppr coordinates medical, legal, business and
        parcel delivery requests across Toronto and the GTA on one platform. This
        is an illustration, not live customer activity.
      </p>
    </div>
  )
}
