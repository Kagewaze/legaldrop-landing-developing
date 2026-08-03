// Operational proof — the evidence layer directly under the hero's claim.
//
// SERVER COMPONENT, ZERO CLIENT JAVASCRIPT. The values are literals in the
// server-rendered HTML. There is no count-up, no interval, no island: a viewer
// with JavaScript disabled and a viewer with prefers-reduced-motion both receive
// the identical final numbers, because there is no other state to receive.
//
// WHY NO COUNT-UP. It was considered and rejected. Animating 50 up from 0 makes
// a modest true number perform as if it were a large one, which is the opposite
// of what this section is for, and it would have cost a second client island to
// do it. A static proof section is preferable to unnecessary JavaScript.
//
// ── PROVENANCE ──────────────────────────────────────────────────────────────
//
// Every figure below was confirmed by the founder before publication. Do not
// change a value, a label, or a definition without a new confirmation.
//
//   Approver      Abdul, Founder of Druppr/LegalDrop
//   Approved      2026-08-03
//   Accurate as of 2026-08-03
//   Next review   2026-11-03, or before the next public homepage release,
//                 whichever comes first — and immediately if a figure changes.
//
// METRIC 1 — "50+" / Completed deliveries
//   Definition  A delivery request that was accepted, physically carried out,
//               delivered to its intended destination, and recorded as
//               completed in operational records.
//   Excludes    Cancelled, test, internal demonstration, and duplicate records.
//               A refunded job MAY still count if it was physically completed —
//               a refund does not reverse operational completion — but a
//               refunded job that was cancelled or never completed is excluded.
//   Source      Druppr/LegalDrop delivery records, completed-order history, and
//               manual operational reconciliation.
//   MUST NOT be described as current delivery volume, monthly volume, or
//   citywide network density.
//
// METRIC 2 — "5" / Business partners
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
//
// METRIC 3 — "5" / Onboarded GTA drivers
//   Definition  A driver who completed onboarding, submitted the required
//               driver and vehicle information, was reviewed or approved by
//               Druppr, and became eligible to receive delivery requests in
//               the GTA.
//   Does NOT imply  daily activity, availability on any given day, that a
//               delivery has been completed, or employment by Druppr.
//   Source      Driver onboarding records, submitted documentation, approval
//               records, founder-maintained driver roster.
//   MUST NOT be relabelled "active drivers", "drivers on the road",
//   "full-time drivers", or "fleet drivers".
//
// Only `value` and `label` below are rendered. Everything else in this comment
// is the audit trail and stays in the repository — this is a server component,
// so none of it reaches the browser bundle either way.

const METRICS = [
  { value: '50+', label: 'Completed deliveries' },
  { value: '5', label: 'Business partners' },
  { value: '5', label: 'Onboarded GTA drivers' },
]

// Month precision, not the day. The figures are not recomputed daily, and a
// date that ages by the day invites a reader to notice staleness that a month
// does not. HOMEPAGE.md requires a published metric to carry its window; this
// is that window.
const AS_OF = 'August 2026'

// SENTENCE CASE, not Title Case. The founder's brief wrote these labels
// headline-style, but its own Copy principles list them in sentence case, and
// VISION.md's design philosophy is sentence case throughout. Same words.
export function OperationalProof() {
  return (
    // Continues the hero's ground rather than introducing a third surface in
    // four sections. Hero and evidence read as one console: the claim, then
    // what backs it. The hairline is on the content column, not full-bleed, so
    // it reads as a dashboard divider rather than a page seam.
    <section aria-labelledby="operational-proof" className="bg-surface-ink text-white">
      <div className="mx-auto max-w-[1200px] border-t border-white/10 px-8 py-10 sm:py-12">
        <h2
          id="operational-proof"
          className="text-sm font-semibold uppercase tracking-label text-white/70"
        >
          Operational record
        </h2>
        <p className="mt-1 text-sm text-white/60">Accurate as of {AS_OF}.</p>

        {/* A description list, because that is what this is: three terms and
            their values. Three columns at every width — the values are two or
            three characters and never wrap, and the labels wrap to two lines at
            390 without crowding, which is cheaper vertically than stacking. */}
        <dl className="mt-7 grid grid-cols-3 gap-x-4 gap-y-6 sm:mt-8 sm:gap-x-8">
          {METRICS.map((metric) => (
            // DOM order is term then value, so a screen reader reads
            // "Completed deliveries, 50+" — a sentence. flex-col-reverse puts
            // the numeral on top visually without disturbing that order.
            <div key={metric.label} className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-white/70">{metric.label}</dt>
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
