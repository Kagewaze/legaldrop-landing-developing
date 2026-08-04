// Platform showcase — the product, shown rather than described.
//
// SERVER COMPONENT, ZERO CLIENT JAVASCRIPT. Three static frames. No tabs, no
// carousel, no slides, no hover dependency, no Maps SDK.
//
// ── WHAT IS REAL HERE ───────────────────────────────────────────────────────
//
// Every field, status and value below was verified against this repository
// before it was drawn. Nothing is invented. Sources:
//
//   Status model      src/app/track/[trackingCode]/LiveTracking.jsx:14-23
//                     (backend TaskStatusType: pending, assigned, ongoing,
//                     awaiting_seller_confirmation, awaiting_handoff,
//                     delivered, cancelled, failed, refunded)
//   Order categories  src/app/send/page.jsx:143 SECTION_PRESETS
//                     ('medical_supply', 'legal_document', 'other')
//   Vehicles          src/components/send/vehicles.js
//                     (bike, car, suv, minivan, cargovan, boxtruck)
//   Tracking fields   src/app/track/[trackingCode]/page.jsx:149-163 and
//                     src/app/track-partner/[trackingToken]/page.jsx:157-188
//                     (Tracking Code, Category, Vehicle, Order Placed, Route
//                     Distance, On Route To Pickup, Package Picked Up, Sender,
//                     Pickup Address, Destinations)
//   Driver display    track-partner page.jsx:154,287 — FIRST INITIAL ONLY plus
//                     vehicleType. The product never shows a driver's full name,
//                     so neither does this.
//   ETA shape         LiveTracking.jsx:50-62 (durationText + distanceText)
//   Booking capture   src/lib/send-flow.js:21-36, buildOrderPayload.js
//
// ── WHAT IS DELIBERATELY ABSENT ─────────────────────────────────────────────
//
//   No drop-off confirmation code   — not rendered anywhere in this repository;
//                                     excluded by Phase 0 pending verification.
//   No chain-of-custody framing     — the Phase 0 gate is unmet. These are
//                                     timestamps, and they are called timestamps.
//   No evidentiary or legal claim   — no seals, signatures, affidavits, sworn
//                                     service, or proof-of-delivery weight.
//   No partner portal               — /track-partner is a TRACKING page, not a
//                                     dashboard. There is no order list, no
//                                     login, no filters in this product. Frame 3
//                                     is therefore a delivery record, not a
//                                     portal, because a portal does not exist.
//   No integrations, analytics, route optimisation, AI dispatch, fleet metrics.
//   No App Store / Google Play      — no reference exists in the repository and
//                                     the founder has not supplied listings.
//
// ── FALSE AFFORDANCES ───────────────────────────────────────────────────────
//
// Nothing in these frames is a <button> or an <a>. They are presentational
// only, so there is nothing focusable that does not act. Status chips are
// <span>. The frames carry no controls the product does not have.

// Synthetic throughout. Obviously-fake order id, area names rather than street
// addresses, a driver initial rather than a name — matching what the product
// itself displays.
const DEMO = {
  orderId: 'DRP-2048',
  category: 'Medical specimen',
  pickup: 'Downtown Toronto',
  dropoff: 'North York',
  vehicle: 'Car',
  distanceKm: '14.2 km',
  driverInitial: 'A',
  driverVehicle: 'Car',
  eta: '18 min away · 6.4 km',
}

// Real statuses, title-cased exactly as the product renders them, so a visitor
// who later opens a tracking page meets the same words.
const FRAMES = [
  { step: '01', eyebrow: 'Request & dispatch', status: 'Assigned' },
  { step: '02', eyebrow: 'Tracking', status: 'Ongoing' },
  { step: '03', eyebrow: 'Delivery record', status: 'Delivered' },
]

const CARD =
  'flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised shadow-card'

// STATUS IS NEVER COLOUR ALONE. Every chip carries its status as text; the tint
// is redundant reinforcement, not the signal.
const CHIP_ACTIVE =
  'inline-flex items-center rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white'
const CHIP_DONE =
  'inline-flex items-center rounded-full bg-surface-tint px-2.5 py-1 text-xs font-semibold text-[#17131c]'

function FrameHeader({ step, eyebrow, status, done }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eeebf1] bg-surface-tint px-5 py-3.5">
      {/* #5f5868, NOT #8d8695. At 12px the lighter tone measures 3.21:1 on the
          tint header — the same failure Phase 1 removed from this codebase, and
          it was reintroduced here on first draft. The step index is quieter than
          its label by weight, not by a colour that fails AA. */}
      <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-[#5f5868]">
        <span className="font-normal text-[#5f5868]">{step}</span>
        {eyebrow}
      </span>
      <span className={done ? CHIP_DONE : CHIP_ACTIVE}>{status}</span>
    </div>
  )
}

// A row of label/value, the shape every tracking surface in the product uses.
function Field({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="flex-none text-sm text-[#5f5868]">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-semibold text-[#17131c]">
        {value}
      </dd>
    </div>
  )
}

export function PlatformShowcase() {
  return (
    // Tinted band, so the white product frames sit ON a ground rather than
    // dissolving into it — the same reason home/Services.jsx documented for its
    // own band. It also breaks the two dark sections above it.
    <section aria-labelledby="platform-showcase" className="bg-surface-tint">
      {/* py-12 while stacked rather than the site's py-16: three product frames
          already run about two phone screens on their own, and that height is
          content, not padding. The full rhythm returns from sm. */}
      <div className="mx-auto max-w-[1200px] px-8 py-12 sm:py-24">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold uppercase tracking-label text-[#5f5868]">
          Product demonstration
          <span className="rounded-full bg-[#17131c]/[0.06] px-2.5 py-1 normal-case tracking-normal">
            Sample data
          </span>
        </span>

        <h2
          id="platform-showcase"
          className="mt-3 font-display text-3xl font-extrabold text-[#17131c] sm:text-4xl"
        >
          From request to recorded delivery
        </h2>
        <p className="mt-2.5 max-w-[620px] text-lg text-[#5f5868]">
          Requests, dispatch, tracking and the record that remains afterwards all
          run in one system. These are the surfaces that do it.
        </p>

        {/* Frame 1 is the widest at lg — it is the entry point and stays the
            dominant frame. Frame 3 takes the full row beneath because a
            timestamp trail reads horizontally. Everything stacks in order below
            lg; nothing overlaps, so no product detail is ever obscured. */}
        <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* ── FRAME 1 — Request & dispatch ─────────────────────────── */}
          <div className={`${CARD} lg:col-span-7`}>
            <FrameHeader {...FRAMES[0]} />
            <dl className="flex flex-col px-5 py-3">
              <Field label="Order" value={DEMO.orderId} />
              <Field label="Category" value={DEMO.category} />
              <Field label="Pickup" value={DEMO.pickup} />
              <Field label="Destination" value={DEMO.dropoff} />
              <Field label="Vehicle" value={DEMO.vehicle} />
              <Field
                label="Driver"
                value={`${DEMO.driverInitial}. · ${DEMO.driverVehicle}`}
              />
            </dl>
            {/* mt-auto pins the caption to the card's bottom edge. Without it
                this frame — the shorter of the two on row one — stretches to
                match its neighbour and leaves the caption floating with dead
                space beneath it. */}
            <p className="mt-auto border-t border-[#eeebf1] px-5 py-3 text-sm text-[#5f5868]">
              A request captures both addresses, the vehicle it needs and who is
              receiving it, then goes out to drivers for assignment.
            </p>
          </div>

          {/* ── FRAME 2 — Tracking ───────────────────────────────────── */}
          <div className={`${CARD} lg:col-span-5`}>
            <FrameHeader {...FRAMES[1]} />
            <div className="px-5 py-4">
              {/* Static SVG. No Maps SDK — a real map would put the Google
                  bundle on the homepage critical path and say no more than
                  this does. Decorative: the fields below carry the meaning. */}
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 320 120"
                className="block w-full"
              >
                <path
                  d="M 28 96 C 96 96, 128 36, 292 26"
                  fill="none"
                  className="stroke-[#e5e1e8]"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 28 96 C 96 96, 128 36, 292 26"
                  fill="none"
                  className="stroke-brand-500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="0.38"
                />
                <circle cx="28" cy="96" r="6" className="fill-[#17131c]" />
                <circle cx="185" cy="49" r="9" className="fill-brand-600" />
                <circle cx="185" cy="49" r="3.5" className="fill-white" />
                <rect
                  x="286"
                  y="20"
                  width="12"
                  height="12"
                  rx="2"
                  className="fill-[#8d8695]"
                />
              </svg>

              <dl className="mt-2 flex flex-col">
                <Field label="Route" value={`${DEMO.pickup} → ${DEMO.dropoff}`} />
                <Field label="Distance" value={DEMO.distanceKm} />
                {/* "Sample ETA", not "Estimated arrival". The field is a real
                    product capability (LiveTracking.jsx:50-62 renders
                    durationText + distanceText), so it stays — but an unlabelled
                    time next to a route reads as a normal Druppr delivery time,
                    and this is one synthetic trip. The section-level "Sample
                    data" chip is not enough at the point of the number itself. */}
                <Field label="Sample ETA" value={DEMO.eta} />
              </dl>
            </div>
            {/* PHASE 6.1. Was: "The sender, the business and the recipient
                follow the same job on one shared tracking link."

                That sentence was wrong twice, and the Phase 6 report flagged it
                before this pass corrected it:

                  "one shared tracking link"  THERE ARE TWO LINKS, not one, and
                    they are not interchangeable. /track/[trackingCode] hits
                    /public/track/{code}; /track-partner/[trackingToken] hits
                    /public/track-partner/{token}. Different routes, different
                    identifiers, different payloads — the partner view also
                    renders Route Distance, the sender's name, the pickup
                    address and a numbered receivers list, none of which the
                    code-based view shows.
                  "the recipient"            NOTHING IN THIS REPOSITORY SENDS A
                    LINK TO ANYONE. There is no email, SMS, notification or
                    webhook code here at all. The sender is shown the code on
                    the payment step (send/pay/page.jsx) and can share it; the
                    recipient receiving it is not evidenced. Do not infer a
                    notification from the fact that a recipient phone or email
                    is collected — that is a backend requirement on POST /order.

                What is verified is that BOTH routes are public — no session, no
                cookie, no Authorization header, no middleware — so status is
                reachable by whoever holds the relevant link. That, and only
                that, is what this now says. */}
            <p className="mt-auto border-t border-[#eeebf1] px-5 py-3 text-sm text-[#5f5868]">
              Tracking views keep the delivery status accessible to the people
              who have the relevant link.
            </p>
          </div>

          {/* ── FRAME 3 — Delivery record ────────────────────────────── */}
          <div className={`${CARD} lg:col-span-12`}>
            <FrameHeader {...FRAMES[2]} done />
            <div className="px-5 py-4">
              {/* Timestamps only, and named as timestamps. This is NOT a
                  chain-of-custody artifact and must not be labelled as one —
                  that gate is unmet. Every entry below is a field the tracking
                  surfaces genuinely render. */}
              <ol className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Order placed', value: '9:02' },
                  { label: 'On route to pickup', value: '9:18' },
                  { label: 'Package picked up', value: '9:34' },
                  { label: 'Delivered', value: '10:07' },
                ].map((entry, index) => (
                  <li
                    key={entry.label}
                    className="flex items-center gap-3 border-t-2 border-[#e5e1e8] pt-3 first:border-[#17131c]"
                  >
                    {/* #5f5868 for the same reason as the frame headers —
                        #8d8695 measures 3.51:1 at 12px on white. */}
                    <span
                      aria-hidden="true"
                      className="text-xs font-semibold tabular-nums text-[#5f5868]"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-[#17131c]">
                        {entry.label}
                      </span>
                      <span className="text-sm tabular-nums text-[#5f5868]">
                        {entry.value}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <p className="border-t border-[#eeebf1] px-5 py-3 text-sm text-[#5f5868]">
              Every job leaves a timestamped record — order {DEMO.orderId},{' '}
              {DEMO.category}, {DEMO.distanceKm} — retrievable from its tracking
              code after delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
