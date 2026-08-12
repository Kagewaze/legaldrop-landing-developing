'use client'

import { useEffect, useRef, useState } from 'react'

// The hero's network demonstration.
//
// WHAT THIS IS, AND WHAT IT IS NOT. This is a PRODUCT DEMONSTRATION, not a feed
// of live customer activity. Nothing here is fetched, no order is real, no
// address is real, and no metric is displayed. The panel says so on its face —
// see DEMO_LABEL below, which is visible, not a footnote. Phase 0 (D4) approved
// a simulated network on exactly that condition.
//
// NO GOOGLE MAPS. Deliberately. A real map would put the Maps SDK on the
// homepage's critical path, which the performance budget forbids, and it would
// be a heavier, slower way to say the same thing. This is a schematic network
// drawn in SVG — a diagram, which is honest about being a diagram. It does not
// imitate a map of real streets.
//
// SERVER-RENDERED COMPLETE, THEN ANIMATED. The initial state is the LAST step of
// the sequence, so the server sends a finished, meaningful network state in the
// HTML. Motion is an enhancement layered on top. That single decision is what
// makes both fallbacks work for free:
//
//   JavaScript disabled  -> the complete state stays on screen
//   prefers-reduced-motion -> the complete state stays on screen, no interval
//
// There is no empty panel in any failure mode.

// STATUS MODEL — REAL, NOT INVENTED.
//
// These are the backend's own values, taken from the authoritative
// TaskStatusType documented in src/app/track/[trackingCode]/LiveTracking.jsx
// (lines 14-23). The full set is: pending, assigned, ongoing,
// awaiting_seller_confirmation, awaiting_handoff, delivered, cancelled, failed,
// refunded.
//
// The demo walks the happy path only — the four states an ordinary job passes
// through. The terminal failure states (cancelled/failed/refunded) and the two
// conditional ones are real but are not part of a representative journey.
//
// Labels are title-cased exactly as the product renders them, so a viewer who
// later sees a real tracking page meets the same words.
const SEQUENCE = [
  { status: 'pending', label: 'Pending', caption: 'Request received' },
  { status: 'assigned', label: 'Assigned', caption: 'Driver assigned' },
  { status: 'ongoing', label: 'Ongoing', caption: 'In transit' },
  { status: 'delivered', label: 'Delivered', caption: 'Completed' },
]

// The four kinds of movement the platform coordinates.
//
// SPECIFIC, NOT CATEGORICAL. These were 'Medical / Legal / Business / Parcel' —
// taxonomy labels rather than things. 'Business' in particular said nothing next
// to three concrete nouns. Each now names an actual job.
//
// Wording is held to what the current service model supports: a business booking
// a delivery is plainly true, where 'Scheduled business route' would assert a
// scheduling product this repository cannot evidence.
const CATEGORIES = [
  'Medical specimen',
  'Legal filing',
  'Business delivery',
  'Same-day parcel',
]

// Statuses for the two secondary rows. Fixed per slot, so they read as other
// work in the system rather than as a second animation competing with the
// primary journey. Both are real values from the model above.
const SECONDARY_STATUSES = ['Assigned', 'Pending']

// Synthetic endpoints. Deliberately generic place names, not addresses: no
// street, no number, nothing that could be mistaken for a real pickup.
const ROUTE_LABELS = { from: 'Downtown', to: 'North York' }

const DEMO_LABEL = 'Product demonstration'

// Cubic bezier for the route, in viewBox units. The marker position is computed
// from these same control points rather than measured off the DOM, so there is
// no layout read and no dependency on the SVG having been laid out yet.
const P0 = [58, 188]
const P1 = [140, 188]
const P2 = [186, 88]
const P3 = [342, 68]

function pointAt(t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0],
    a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1],
  ]
}

const PATH_D = `M ${P0[0]} ${P0[1]} C ${P1[0]} ${P1[1]}, ${P2[0]} ${P2[1]}, ${P3[0]} ${P3[1]}`

// Slow enough to read a status before it changes. The whole cycle runs ~9s.
const STEP_MS = 2200

export function NetworkDemo() {
  // Initial state is the FINAL step — see the note at the top. This is what the
  // server renders and what a no-JS or reduced-motion viewer keeps.
  const [step, setStep] = useState(SEQUENCE.length - 1)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const rootRef = useRef(null)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) {
      return undefined
    }

    let timer = null
    let visible = true

    const tick = () => {
      // Skip advancing while the tab is hidden or the hero has scrolled away.
      // The interval is cheap; repainting an off-screen animation is not.
      if (document.hidden || !visible) {
        return
      }
      setStep((previous) => {
        const next = (previous + 1) % SEQUENCE.length
        if (next === 0) {
          setCategoryIndex((c) => (c + 1) % CATEGORIES.length)
        }
        return next
      })
    }

    // Start from the beginning of the journey rather than continuing from the
    // finished state the server rendered.
    setStep(0)
    timer = setInterval(tick, STEP_MS)

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0 },
    )
    if (rootRef.current) {
      observer.observe(rootRef.current)
    }

    return () => {
      clearInterval(timer)
      observer.disconnect()
    }
  }, [])

  const current = SEQUENCE[step]
  const category = CATEGORIES[categoryIndex]

  // TWO SEPARATE PROGRESSIONS, because they mean different things.
  //
  //   routeDrawn  — the assignment. No route exists until a driver is assigned;
  //                 from that moment the whole planned route is known.
  //   markerAt    — the vehicle. It sits at pickup once assigned, moves while
  //                 the job is ongoing, and arrives on delivery.
  //
  // Collapsing these into one value was the first attempt and it read wrongly:
  // it drew 12% of a route at 'Assigned', which implies the driver is 12% of
  // the way through a trip that has not started.
  const routeDrawn = step === 0 ? 0 : 1
  const markerAt = step === 0 ? 0 : step === 1 ? 0 : step === 2 ? 0.62 : 1
  const [markerX, markerY] = pointAt(markerAt)

  return (
    <div
      ref={rootRef}
      className="rounded-card border border-[#eeebf1] bg-surface-raised p-3 shadow-card sm:p-6"
    >
      {/* THE HONESTY LABEL. Visible, adjacent to the visual, not a footnote.
          Phase 0 D4 makes this a condition of shipping a simulated network. */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
          {DEMO_LABEL}
        </span>
        <span className="whitespace-nowrap rounded-full bg-surface-tint px-2.5 py-1 text-xs font-semibold text-[#5f5868]">
          Sample data
        </span>
      </div>

      {/* Decorative: the whole diagram is hidden from assistive technology and
          its meaning is supplied as text below instead. A screen reader gets a
          stable sentence, not a stream of changing coordinates. */}
      {/* PHASE 7.1 — MOBILE CROP OF THE DIAGRAM'S DEAD BAND.
          The route occupies viewBox Y 68–188 (P3 to P0) and the marker sits at
          Y 120; above Y 45 there is nothing but one grid line. On a phone that
          empty top band cost ~42px of the first viewport while showing nothing,
          so the wrapper clips it and the negative margin pulls the drawing up
          into the clip. Below sm only: from sm the margin resets and the
          diagram is untouched, which is why 1024 and 1440 are unaffected.

          A wrapper crop rather than a second viewBox because viewBox is an
          attribute, not a class — changing it responsively would need
          JavaScript, and this phase adds none. NOTHING OF THE ROUTE IS LOST:
          the crop stops well above P3. */}
      <div className="mt-2.5 overflow-hidden sm:mt-3">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 400 210"
          className="-mt-[42px] block w-full sm:mt-0"
        >
        {/* Faint grid — a control-surface texture, not a street map. */}
        <g stroke="currentColor" className="text-[#17131c]/[0.07]" strokeWidth="1">
          {[45, 95, 145].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} />
          ))}
          {[80, 160, 240, 320].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="205" />
          ))}
        </g>

        {/* The full route, always present at low opacity so the geometry reads
            even at step 0. */}
        <path
          d={PATH_D}
          fill="none"
          stroke="currentColor"
          className="text-[#17131c]/[0.14]"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* The assigned route, drawn with dashoffset. Only opacity and the dash
            offset change — no layout, no reflow. */}
        <path
          d={PATH_D}
          fill="none"
          stroke="currentColor"
          className="text-brand-500 transition-[stroke-dashoffset,opacity] duration-slow ease-out motion-reduce:transition-none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - routeDrawn}
          opacity={step === 0 ? 0 : 1}
        />

        {/* Pickup */}
        <circle cx={P0[0]} cy={P0[1]} r="7" className="fill-[#17131c]" />
        <circle cx={P0[0]} cy={P0[1]} r="3" className="fill-surface-raised" />

        {/* Destination */}
        <rect
          x={P3[0] - 6}
          y={P3[1] - 6}
          width="12"
          height="12"
          rx="2"
          className={
            step === SEQUENCE.length - 1 ? 'fill-brand-500' : 'fill-[#17131c]/25'
          }
        />

        {/* The job marker. transform only. */}
        <g
          className="transition-transform duration-slow ease-out motion-reduce:transition-none"
          style={{ transform: `translate(${markerX - 200}px, ${markerY - 120}px)` }}
          opacity={step === 0 ? 0 : 1}
        >
          <circle cx="200" cy="120" r="11" className="fill-brand-600" />
          <circle cx="200" cy="120" r="4" className="fill-white" />
        </g>
        </svg>
      </div>

      {/* THE DISPATCH LIST — one active job above two others in the queue.
          This is what turns the panel from a tracking view into a coordination
          view: a single animated journey says "we track a delivery", a journey
          alongside other pending work says "several kinds of job run on one
          system". The secondary rows are deliberately inert and muted so the
          primary sequence remains the page's single orchestrated motion.

          PLACE NAMES LIVE HERE, IN HTML, NOT IN THE SVG. In-SVG <text> scales
          with the viewBox, so a size that read on desktop shrank to about 9px
          inside the 390px panel — under the 12px floor, and exactly the
          "cramped map label" the brief rules out.

          aria-hidden for the same reason as the diagram: the equivalent text
          follows once, below. */}
      <div aria-hidden="true" className="mt-3 border-t border-[#eeebf1] pt-2.5 sm:mt-4 sm:pt-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <span className="text-sm font-semibold text-[#17131c]">{category}</span>
          <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
            {current.label}
          </span>
        </div>

        {/* The route stands alone. It previously carried the step caption too
            ('Downtown → North York · Driver assigned'), which wrapped badly at
            390 and restated the chip beside it — 'Driver assigned' next to a
            chip reading 'Assigned'. The chip is the product's own vocabulary
            and is the one that should survive; the captions are kept in the
            data and surface in the screen-reader description below, where the
            plain-English gloss is actually useful. */}
        <div className="mt-1 flex items-center gap-1.5 text-sm text-[#5f5868]">
          <span>{ROUTE_LABELS.from}</span>
          {/* #5f5868, 6.81:1 — the panel's secondary tone. Keep every element
              in this row above the AA floor. */}
          <span aria-hidden="true" className="text-[#5f5868]">
            →
          </span>
          <span>{ROUTE_LABELS.to}</span>
        </div>

        <div className="mt-2 flex gap-1.5 sm:mt-2.5">
          {SEQUENCE.map((s, i) => (
            <span
              key={s.status}
              className={`h-1 flex-1 rounded-full transition-colors duration-base motion-reduce:transition-none ${
                i <= step ? 'bg-brand-500' : 'bg-[#17131c]/12'
              }`}
            />
          ))}
        </div>

        {/* The queue. Categories are taken from the rotation after the active
            one, so no job is ever listed twice and the set on screen changes as
            the primary cycles — breadth without a second animation. */}
        {/* PHASE 7.1: below sm only the FIRST queue row renders. The point of
            this list is that other jobs exist in the system alongside the
            active one — one row carries that, two only repeat it, and on a
            phone the second row costs ~26px of the first viewport. From sm the
            full queue returns. The row set still rotates with the primary, so
            the queue is never stale. */}
        <ul className="mt-2.5 space-y-1.5 border-t border-[#eeebf1] pt-2.5 sm:mt-3 sm:pt-3">
          {SECONDARY_STATUSES.map((status, i) => (
            <li
              key={status}
              className={`items-center justify-between gap-3 text-sm text-[#5f5868] ${
                i === 0 ? 'flex' : 'hidden sm:flex'
              }`}
            >
              <span>{CATEGORIES[(categoryIndex + i + 1) % CATEGORIES.length]}</span>
              {/* Must clear AA at 12px. */}
              <span className="text-xs font-semibold text-[#5f5868]">{status}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* THE ACCESSIBLE EQUIVALENT. Static, complete, and announced once. No
          aria-live: a status that changes every 2.2s would talk over the user
          for as long as the page is open. */}
      <p className="sr-only">
        {DEMO_LABEL}, using sample data. It shows how a job moves through the
        Druppr platform:{' '}
        {SEQUENCE.map((s) => `${s.label} — ${s.caption.toLowerCase()}`).join(
          ', then ',
        )}
        . Other jobs wait in the queue alongside it: {CATEGORIES.join(', ')} are
        all coordinated on the same system. This is an illustration, not live
        customer activity.
      </p>
    </div>
  )
}
