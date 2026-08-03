import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'
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
  `inline-flex items-center justify-center rounded-control border border-white/25 px-[30px] py-4 text-base font-semibold text-white transition-colors duration-base motion-reduce:transition-none hover:bg-white/10 ${FOCUS}`

// The kinds of movement the platform coordinates. A restrained signal, not a
// service menu: plain text, no links, nothing implying each is separately
// bookable from here. Only /send, /medical and /legal are live routes, and the
// two that have destinations are already reachable from the nav and from their
// own sections further down the page.
const CATEGORIES = ['Medical', 'Legal', 'Business', 'Parcel']

export function HeroNetwork() {
  return (
    <section className="bg-surface-ink text-white">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-20 lg:py-24">
        {/* The visual is capped rather than given a free 1fr: the proposition
            has to stay the larger thing on the screen. A 520px ceiling holds
            the demo at roughly 45% of the column at 1440 and stops it growing
            into a billboard on wide displays. */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
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
            <p className="mt-5 max-w-[560px] text-lg text-white/85">
              Specimens, filings, business deliveries and parcels — dispatched,
              tracked and recorded on one platform.
            </p>

            {/* Full width while stacked, so the two buttons form one tidy
                column instead of two ragged widths; auto from sm up. */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap">
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

            {/* Separator dots are decorative and are hidden rather than read as
                punctuation between every item. */}
            <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold tracking-label text-white/70">
              {CATEGORIES.map((category, index) => (
                <li key={category} className="flex items-center gap-3">
                  {index > 0 && (
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
                  )}
                  {category}
                </li>
              ))}
            </ul>
          </div>

          <NetworkDemo />
        </div>
      </div>
    </section>
  )
}
