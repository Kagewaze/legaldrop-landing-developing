import { getOperationalMetrics } from '@/lib/operational-metrics'

// Operational proof — the evidence layer directly under the hero's claim.
//
// SERVER COMPONENT, ZERO CLIENT JAVASCRIPT. The values are resolved on the
// server and baked into the HTML. There is no count-up, no interval, no poll and
// no island: a viewer with JavaScript disabled and a viewer with
// prefers-reduced-motion both receive the identical final numbers, because there
// is no other state to receive.
//
// Two of the three figures are now fetched rather than hardcoded (see
// PROVENANCE below), and that changed nothing about the sentence above — the
// fetch runs server-side through src/lib/operational-metrics.js.
//
// WHY NO COUNT-UP. It was considered and rejected. Animating 50 up from 0 makes
// a modest true number perform as if it were a large one, which is the opposite
// of what this section is for, and it would have cost a second client island to
// do it. A static proof section is preferable to unnecessary JavaScript.
//
// ── PROVENANCE ──────────────────────────────────────────────────────────────
//
// Do not change a value, a label, or a definition without a new confirmation.
//
//   Approver      Abdul, Founder of Druppr/LegalDrop
//   Approved      2026-08-11
//   Next review   2026-11-11, or before the next public homepage release,
//                 whichever comes first — and immediately if a definition
//                 changes. The two live figures no longer need a review to stay
//                 current; their DEFINITIONS still do.
//
// Deliveries and drivers come from GET /api/public/metrics and refresh on their
// own. Business partners is a hand-maintained literal — see METRIC 2. That split
// is why the "accurate as of" line names its subject.
//
// ⚠️ Wiring the live figures moved deliveries 50+ -> 44+ and drivers 5 -> 2. The
// smaller numbers are the true ones. Do not "restore" the previous figures.
//
// METRIC 1 — Completed deliveries  (LIVE)
//   Value       deliveriesCompleted from GET /api/public/metrics.
//               Rendered with a trailing "+" — see DELIVERIES_SUFFIX below.
//   Predicate   status = 'delivered'
//               AND orderCategory = 'delivery'
//               AND deletedAt IS NULL
//   Source      The endpoint above. NO LONGER manual reconciliation — the
//               previous "Druppr/LegalDrop delivery records ... and manual
//               operational reconciliation" wording is retired with this change.
//   MUST NOT be described as current delivery volume, monthly volume, or
//   citywide network density. The predicate is lifetime-to-date, not a rate.
//
// METRIC 2 — Business partners  (MANUAL, DELIBERATELY)
//   Value       A hardcoded literal. NOT wired, and not wireable today.
//   Why manual  THE BACKEND HAS NO FIRST-CLASS PARTNER CONCEPT. There is no
//               tier, no contract status and no approval step. Any
//               authenticated user can create a Business row, and `isActive`
//               defaults to true and is never set false anywhere in the
//               codebase — so a naive COUNT(*) would report signups, not
//               partnerships, and would only ever go up.
//               See the backend's docs/PUBLIC_OPERATIONAL_METRICS.md.
//   Definition  Businesses with which Druppr has an established working
//               relationship through completed deliveries, an active pilot, an
//               ongoing service arrangement, or an approved logistics
//               collaboration. May include early customers and pilots.
//               Does NOT mean all five are recurring enterprise accounts or
//               signed long-term contracts.
//   Source      Business correspondence, delivery records, pilot arrangements,
//               partnership records, founder-maintained customer records.
//   MUST NOT be relabelled "enterprise clients", "recurring accounts",
//   "trusted by five companies", or "contracted customers". No company names or
//   logos here without written permission — none exists today.
//   ⚠️ This figure carries a real as-of date. The other two no longer do.
//
// METRIC 3 — Drivers registered  (LIVE)
//   Value       driversRegistered from GET /api/public/metrics.
//   Predicate   vehicle IS NOT NULL
//               AND kyc IS NOT NULL
//               AND deletedAt IS NULL
//   Label       "Drivers registered" — NOT "onboarded", and NOT "GTA".
//
//   ⚠️ NOT "onboarded": activated = 0 across every driver row in production, so
//   no approval step has ever run and the word would assert one that has not.
//   ⚠️ NOT "GTA": only 2 of 9 rows carry a province and the field is free text,
//   so GTA operation cannot be established from stored data.
//
//   Does NOT imply  daily activity, availability on any given day, approval,
//               that a delivery has been completed, or employment by Druppr.
//   MUST NOT be relabelled "active drivers", "drivers on the road",
//   "full-time drivers", "onboarded drivers", or "fleet drivers".
//
// Only `value` and `label` are rendered. Everything else in this comment is the
// audit trail and stays in the repository — this is a server component, so none
// of it reaches the browser bundle either way.

// Presentation only — the API returns a bare integer. Honest because the
// predicate is lifetime-to-date and only grows. Deliveries ONLY: "2+" drivers
// would imply a larger roster than the registered/approved distinction allows.
const DELIVERIES_SUFFIX = '+'

// The one hand-maintained figure. See METRIC 2 for why it is not wired.
const BUSINESS_PARTNERS = { value: '5', label: 'Business partners' }

// ⚠️ SCOPED TO THE MANUAL FIGURE ONLY. The other two refresh every 120s, so a
// hardcoded date is wrong for them; HOMEPAGE.md requires the hand-maintained one
// to carry a window. Month precision, not the day.
const PARTNERS_AS_OF = 'August 2026'

// Column count follows the number of figures actually rendered, so the failure
// state below is a full-width single column rather than one figure sitting in
// the left third with two empty cells beside it. Both class strings are written
// out in full because Tailwind scans source text — a template literal like
// `grid-cols-${n}` would not be generated.
const GRID_COLS = {
  1: 'grid-cols-1',
  3: 'grid-cols-3',
}

// SENTENCE CASE, not Title Case — VISION.md's design philosophy throughout.
//
// ⚠️ ASYNC SERVER COMPONENT, STILL ZERO CLIENT JS. `async` does not make this an
// island: no 'use client', no hook, no state, no effect. The fetch runs on the
// server behind `server-only`; do not move it to a client-side poll.
//
// docs/HOMEPAGE.md gate E5 caps the home route at 4 interactive islands and the
// page is at 4. This section contributes ZERO, before and after.
export async function OperationalProof() {
  // null on any failure — see the note in operational-metrics.js. Never 0,
  // never a partial object.
  const metrics = await getOperationalMetrics()

  // THE FAILURE STATE IS AN ABSENCE, NOT A PLACEHOLDER. When the fetch fails the
  // two live figures are simply not in this array, so nothing renders for them:
  // no 0, no "—", no skeleton, no error text. A dash in a proof band reads as a
  // real figure to a skimming reader, and 0 reads as a catastrophe.
  //
  // The band keeps its heading, its rule, its padding and its one manual figure,
  // so it remains a coherent section rather than a gap. Nothing shifts: this is
  // server-rendered, so whichever variant is produced arrives complete in the
  // HTML — there is no client transition between them and no CLS.
  const liveMetrics = metrics
    ? [
        {
          value: `${metrics.deliveriesCompleted}${DELIVERIES_SUFFIX}`,
          label: 'Completed deliveries',
        },
        {
          // No suffix — see DELIVERIES_SUFFIX.
          value: String(metrics.driversRegistered),
          label: 'Drivers registered',
        },
      ]
    : []

  // Partners sits between deliveries and drivers, preserving the existing
  // left-to-right order of the band. With the live figures absent it is the only
  // entry and the grid collapses to one column.
  const rendered = metrics
    ? [liveMetrics[0], BUSINESS_PARTNERS, liveMetrics[1]]
    : [BUSINESS_PARTNERS]

  return (
    // Continues the hero's ground rather than introducing a third surface in
    // four sections. Hero and evidence read as one console: the claim, then
    // what backs it. The hairline is on the content column, not full-bleed, so
    // it reads as a dashboard divider rather than a page seam.
    //
    // ⚠️ PHASE 13B.1 REMOVED bg-surface-ink FROM HERE, and that is what makes
    // the sentence above literally true rather than merely intended. This
    // section and the hero now sit on ONE painted surface — the glossy wrapper
    // in src/app/(main)/page.jsx. While this element carried its own #1a1421 it
    // was roughly 17 points lighter than where the hero's ramp ended, so the
    // "continuation" was a visible step across the full width of the page.
    //
    // Do not give this section a background again. The hairline below is the
    // only divider that belongs between the two, and it is deliberately inset
    // to the content column so it reads as a dashboard rule, not a page seam.
    <section aria-labelledby="operational-proof" className="text-[#17131c]">
      <div className="mx-auto max-w-[1200px] border-t border-[#eeebf1] px-8 py-16 sm:py-20">
        <h2
          id="operational-proof"
          className="text-sm font-semibold uppercase tracking-label text-[#5f5868]"
        >
          Operational record
        </h2>
        {/* Two tones only: #17131c (15.9:1) for numerals, #5f5868 (6.5:1) for
            everything else. DO NOT use #8d8695 here — 3.51:1, fails AA.
            Hierarchy is carried by size and weight, not colour. */}
        {/* See PARTNERS_AS_OF for why this line names its subject instead of
            covering the whole band. When the live figures are absent there is
            nothing that updates automatically, so the second sentence would be
            false and is dropped. */}
        <p className="mt-1 text-sm text-[#5f5868]">
          {metrics
            ? `Partner count accurate as of ${PARTNERS_AS_OF}. Delivery and driver counts update automatically.`
            : `Partner count accurate as of ${PARTNERS_AS_OF}.`}
        </p>

        {/* A description list, because that is what this is: three terms and
            their values. Three columns at every width — the values are two or
            three characters and never wrap, and the labels wrap to two lines at
            390 without crowding, which is cheaper vertically than stacking. */}
        <dl
          className={`mt-7 grid ${GRID_COLS[rendered.length]} gap-x-4 gap-y-6 sm:mt-8 sm:gap-x-8`}
        >
          {rendered.map((metric) => (
            // DOM order is term then value, so a screen reader reads
            // "Completed deliveries, 50+" — a sentence. flex-col-reverse puts
            // the numeral on top visually without disturbing that order.
            <div key={metric.label} className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-[#5f5868]">{metric.label}</dt>
              <dd className="font-display text-4xl font-extrabold tabular-nums text-[#17131c] sm:text-5xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
