import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'
import { HeroAddressEntry } from '@/components/home/HeroAddressEntry'
import { NetworkDemo } from '@/components/home/NetworkDemo'

// Home hero: the proposition beside a demonstration of the platform working.
//
// This replaces home/Hero.jsx, which is retained on disk (unimported) as the
// Phase 2 rollback target. What changed and why:
//
//   THE CYCLIST PHOTOGRAPH IS GONE. It was a stock courier on a bike carrying a
//   food-delivery thermal backpack — the visual vocabulary of the lowest-margin,
//   least-regulated corner of logistics, in the first impression of a regulated
//   logistics platform. Phase 0 (D4) retired it.
//
//   THE ADDRESS CARD IS GONE. It rendered two fields and a price button and none
//   of it worked: no <input>, nothing focusable, the whole card one link to
//   /send. Phase 0 (D5) ruled that a control which looks interactive and is not
//   must not ship. A REAL address form is Phase 7's job, not this one — so the
//   hero converts on buttons until that exists.
//
//   THE $8.00 FIGURE IS GONE. It was a hardcoded literal, not a value from the
//   pricing engine, and anchoring on the cheapest possible job caps the
//   category. Phase 0 (OQ-5) removed it from the hero; base-fee wording is
//   permitted later, in a pricing context, once the structure is confirmed.
//
//   THE FOUR-STOP SCRIM IS GONE WITH THE PHOTOGRAPH. Its stops were measured
//   against that specific image's paving and are meaningless without it. The
//   ground here is a flat surface-ink, so text contrast is a fixed, trivially
//   verified number instead of a gradient that had to be re-measured whenever
//   the crop moved.
//
// WHAT DID NOT CHANGE: the section is still server-rendered, still ships no
// Maps SDK, and still opens the page on a dark ground.

// Ring inverted for the dark ground — brand-600 on surface-ink is too close in
// value to read. Same shape and weight as the site recipe.
const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-surface-ink'

const CTA_PRIMARY =
  `inline-flex items-center justify-center rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors duration-base motion-reduce:transition-none hover:bg-brand-700 ${FOCUS}`

// Secondary is a bordered ghost, not a second filled button: two solid CTAs of
// equal weight is how a page fails to have a primary action at all.
const CTA_SECONDARY =
  `inline-flex min-h-11 items-center justify-center rounded-control px-0 py-2 text-base font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors duration-base motion-reduce:transition-none hover:decoration-white sm:border sm:border-white/25 sm:px-[30px] sm:py-4 sm:no-underline sm:hover:bg-white/10 ${FOCUS}`

// THE CATEGORY ROW WAS REMOVED IN PHASE 2.1, and its removal is the single
// largest saving in the mobile hero.
//
// It read 'Medical · Legal · Business · Parcel' directly under a sentence that
// already reads 'Specimens, filings, business deliveries and parcels' — the same
// list, twice, four lines apart. Phase 2.1 then put the same categories a third
// time inside the demonstration's dispatch queue, where they are attached to
// actual jobs rather than floating as a taxonomy.
//
// Saying it once, in the place where it means something, cost ~52px of mobile
// height and improved the desktop composition too. Do not reinstate it.

export function HeroNetwork() {
  return (
    // PHASE 13B — GLOSSY GROUND. The flat surface-ink fill is replaced by a
    // layered charcoal-to-purple treatment defined in src/styles/tailwind.css
    // under [data-hero-glossy]; read the block at the top of that file before
    // changing any of it.
    //
    // WHY AN ATTRIBUTE AND NOT CLASSES: the treatment is four gradient layers,
    // a vignette, grain and a keyframe. As arbitrary values that is a ~900
    // character class attribute that cannot be read or tuned. The stylesheet
    // already owns the page's other keyframes for the same reason.
    //
    // `isolate` gives the section its own stacking context, which is what lets
    // the two pseudo-elements sit at z-index:-1 — behind the content, but
    // trapped inside this section rather than sliding under the whole page. No
    // wrapper was added and no child needed a z-index.
    //
    // `overflow-hidden` is what contains the glow: the bloom layer is
    // deliberately oversized so the drift never exposes an edge, and this is
    // what stops that overflow painting past the section boundary.
    //
    // `rounded-b-card` is the existing 20px radius token, bottom corners only —
    // the top edge meets the header and has nothing to round against. The glow
    // is clipped by the radius rather than crossing it.
    //
    // bg-surface-ink is GONE from here, not merely overridden: the stylesheet
    // sets its own background-color fallback, and leaving the utility on would
    // mean two rules fighting over the same property.
    <section
      data-hero-glossy
      className="relative isolate overflow-hidden rounded-b-card text-white"
    >
      {/* py-10 while stacked, not py-16. The section rhythm elsewhere on the
          page is py-16 sm:py-24, but the hero is the one section whose height
          is measured against the first viewport rather than against its
          neighbours — 48px of symmetric padding is 48px of proposition pushed
          below the fold. Full rhythm returns from sm. */}
      <div className="mx-auto max-w-[1200px] px-8 py-7 sm:py-20 lg:py-24">
        {/* The visual is capped rather than given a free 1fr: the proposition
            has to stay the larger thing on the screen. A 520px ceiling holds
            the demo at roughly 45% of the column at 1440 and stops it growing
            into a billboard on wide displays. */}
        <div className="grid grid-cols-1 items-center gap-5 sm:gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
          <div>
            <h1 className="text-balance font-display text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Same-day logistics infrastructure for the GTA
            </h1>

            {/* "recorded", NOT "evidenced" — a deliberate one-word deviation
                from the brief, flagged in the Phase 2 report. Every job does
                produce a timestamped record: the tracking surfaces render a
                tracking code, Order Placed, On Route To Pickup and Package
                Picked Up. That is verifiable in this repository today, so
                "recorded" is a fact. "Evidenced" implies evidentiary weight,
                which Phase 0's D10 table lists as blocked pending legal review.
                Reverting this word is a one-line change once that clears. */}
            {/* text-base while stacked, text-lg from sm. The scale reserves
                text-lg for lead paragraphs, which this is — but at 390 the
                18px setting runs to four lines and costs ~35px of the first
                viewport. 16px holds it to three lines and stays a full step
                above body minimum. The measure is unchanged. */}
            <p className="mt-3.5 max-w-[560px] text-base text-white/85 sm:mt-5 sm:text-lg">
              Specimens, filings, business deliveries and parcels — dispatched,
              tracked and recorded on one platform.
            </p>

            {/* PHASE 7. The primary "Book a delivery" button became a working
                pickup / drop-off entry; "Talk to our team" moved inside the
                form so the two actions still sit on one row. HeroNetwork stays
                a SERVER component — HeroAddressEntry is the only client island
                added, and NetworkDemo keeps its own separate boundary.

                ⚠️ NO-JAVASCRIPT FALLBACK, AND WHY IT IS BUILT THIS WAY.

                A client component still server-renders, so without this the
                page would ship two address inputs that look usable and do
                nothing. The <noscript> block below carries a <style> that hides
                the form and reveals the plain link pair instead — CSS the
                browser applies only when scripting is off, so it costs nothing
                and needs no JavaScript to take effect.

                The alternative — rendering a button on the server and swapping
                to the form on mount — was rejected: the swap is a ~150px height
                change at hydration, i.e. a CLS regression on the largest
                element of the first screen. */}
            <div data-hero-entry>
              <HeroAddressEntry />
            </div>

            <noscript>
              <style>{`[data-hero-entry]{display:none!important}[data-hero-nojs]{display:flex!important}`}</style>
            </noscript>

            <div
              data-hero-nojs
              className="mt-6 hidden flex-col items-start gap-1 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5"
            >
              <Link
                href={ROUTES.send.href}
                className={`${CTA_PRIMARY} w-full sm:w-auto`}
              >
                Book a delivery
              </Link>
              <Link
                href={ROUTES.contact.href}
                className={`${CTA_SECONDARY} w-full sm:w-auto`}
              >
                Talk to our team
              </Link>
            </div>
          </div>

          {/* PHASE 7.1 — WIDTH CAP IN THE SINGLE-COLUMN RANGE.
              Between sm and lg the hero stacks, so the demo took the full 1200px
              column: at 768 that made the panel 656px wide, and since the route
              diagram keeps a 400x210 ratio its height followed to ~344px. The
              hero ran 1194px, 1.41 viewports, and the panel read as a billboard
              under the proposition rather than as its companion.

              520px is not a new number — it is exactly the ceiling the lg grid
              already gives this column (minmax(0,520px)), so capping below lg
              makes the two ranges agree instead of introducing a second rule.
              At lg and above nothing changes. */}
          <div className="max-w-[520px] lg:max-w-none">
            <NetworkDemo />
          </div>
        </div>
      </div>
    </section>
  )
}
