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
// ⚠️ THE SOURCE OF TWO OF THESE THREE FIGURES CHANGED ON 2026-08-11.
//
// Deliveries and drivers now come from GET /api/public/metrics and refresh on
// their own. Business partners is still a hand-maintained literal. That split
// is not an oversight — see METRIC 2 — and it is the reason the "accurate as
// of" line below is worded the way it is.
//
// BOTH LIVE FIGURES WENT DOWN when they were wired up, and that was accepted
// deliberately rather than worked around:
//
//   deliveries   50+  ->  44+
//   drivers      5    ->  2
//
// The old numbers were not fabricated; they were reconciled by hand against a
// definition the data could not actually support. The new ones are smaller and
// true. Do not "restore" the previous figures.
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
//   ⚠️ WHY "ONBOARDED" WAS REMOVED, AND WHY IT MATTERS. The previous label read
//   "Onboarded GTA drivers" and its definition claimed the driver "was reviewed
//   or approved by Druppr". Production shows activated = 0 across ALL NINE
//   driver rows: no driver has ever been admin-approved. The old label was
//   therefore not merely imprecise, it asserted an approval step that has never
//   run. "Registered" is what the predicate above actually measures — signup
//   completed with both vehicle and kyc present, which is 2 of the 9 rows. The
//   other 7 are abandoned signups carrying neither.
//
//   ⚠️ WHY "GTA" WAS REMOVED. Only 2 of the 9 driver rows carry a province at
//   all, and the field is free text. GTA operation cannot be established from
//   stored data, so the qualifier was a geographic claim with nothing behind it.
//   DO NOT REINTRODUCE IT anywhere in this file.
//
//   Does NOT imply  daily activity, availability on any given day, approval,
//               that a delivery has been completed, or employment by Druppr.
//   MUST NOT be relabelled "active drivers", "drivers on the road",
//   "full-time drivers", "onboarded drivers", or "fleet drivers".
//
// Only `value` and `label` are rendered. Everything else in this comment is the
// audit trail and stays in the repository — this is a server component, so none
// of it reaches the browser bundle either way.

// THE "+" IS A FRONTEND CHOICE. The API returns a bare integer (44); the
// suffix is presentation, and it is honest because the predicate is a
// lifetime-to-date count that only grows — "44+" cannot become false between
// two revalidations. Applied to deliveries only: "2+" drivers would imply a
// roster that is larger than stated, which is the opposite of what the
// registered/approved distinction above is trying to be careful about.
const DELIVERIES_SUFFIX = '+'

// The one hand-maintained figure. See METRIC 2 for why it is not wired.
const BUSINESS_PARTNERS = { value: '5', label: 'Business partners' }

// ⚠️ SCOPED TO THE MANUAL FIGURE ONLY — this is no longer the whole band's
// as-of date, and it must not be presented as one.
//
// Two of the three figures now refresh every 120s, so a hardcoded month is
// simply wrong for them: it would claim a staleness they do not have, and it
// would go stale itself while the numbers beside it stayed current. The third
// is hand-maintained and does need a window, because HOMEPAGE.md requires a
// published metric to carry one.
//
// The honest handling chosen: ONE line that names which figure the date applies
// to, and says the other two update on their own. The alternatives were worse —
// a per-metric annotation is three dates in a three-column band, and the API's
// `updatedAt` is a request timestamp rather than a data-freshness marker, so
// rendering it would assert a precision that does not exist on a page cached
// for 120s.
//
// Month precision, not the day: a date that ages by the day invites a reader to
// notice staleness that a month does not.
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

// SENTENCE CASE, not Title Case. The founder's brief wrote these labels
// headline-style, but its own Copy principles list them in sentence case, and
// VISION.md's design philosophy is sentence case throughout. Same words.
//
// ⚠️ ASYNC SERVER COMPONENT — AND STILL ZERO CLIENT JAVASCRIPT.
//
// `async` does not make this an island. There is no 'use client', no hook, no
// state and no effect; the fetch runs on the server, the numbers are baked into
// the HTML, and a viewer with JavaScript disabled receives exactly what everyone
// else receives. The zero-JS property recorded at the top of this file is
// unchanged by wiring the data — that is the whole reason the fetch lives in
// src/lib/operational-metrics.js behind `server-only` rather than in a
// client-side poll.
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
    <section aria-labelledby="operational-proof" className="text-white">
      <div className="mx-auto max-w-[1200px] border-t border-white/10 px-8 py-10 sm:py-12">
        {/* white/80 — see the contrast note below. */}
        <h2
          id="operational-proof"
          className="text-sm font-semibold uppercase tracking-label text-white/80"
        >
          Operational record
        </h2>
        {/* ⚠️ THE THREE OPACITIES IN THIS SECTION ARE CONTRAST-TUNED AGAINST
            THE BLOOM, not picked for hierarchy alone. DO NOT LOWER THEM TO
            RESTORE A VISUAL HIERARCHY — the hierarchy here is carried by size
            and weight, and these were measured.

            Phase 13B.1 put the strongest part of the purple under this band,
            so the ground is far lighter than the flat #1a1421 these tones were
            originally set against. Measured at 768 — the worst case, where the
            stacked hero is tallest and this band sits deepest in the bloom —
            against each element's ACTUAL composited colour:

              h2  'Operational record'   70 -> 6.48:1     80 -> 8.01:1
              p   'Accurate as of'       75 -> 6.89:1     80 -> 7.61:1
              dt  metric labels          80 -> 6.22:1     90 -> 7.44:1

            The dt labels are the floor for the whole surface: the third one
            sits furthest into the bloom, on #672a9c.

            THE BLOOM WAS NOT DIMMED TO ACHIEVE THIS, and must not be. Its
            0.82 peak is the design; the text was raised to meet it.

            THE VALUES ARE DELIBERATELY ABOVE THE MINIMUM. The computed floors
            were 74 / 76 / 87, which clear 7:1 by hundredths — any future bloom
            adjustment would push them straight back under without anyone
            noticing. 80 / 80 / 90 leaves real headroom. If the bloom is
            retuned, re-measure these three rather than assuming they hold. */}
        {/* See PARTNERS_AS_OF for why this line names its subject instead of
            covering the whole band. When the live figures are absent there is
            nothing that updates automatically, so the second sentence would be
            false and is dropped. */}
        <p className="mt-1 text-sm text-white/80">
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
              {/* white/90 — the lowest-contrast element on this surface, since
                  the third label sits directly in the bloom. See the note. */}
              <dt className="mt-2 text-sm text-white/90">{metric.label}</dt>
              <dd className="font-display text-4xl font-extrabold tabular-nums text-white sm:text-5xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
