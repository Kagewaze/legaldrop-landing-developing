import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'
import { HeroAddressEntry } from '@/components/home/HeroAddressEntry'
import { RecentRequestFlashcards } from '@/components/home/RecentRequestFlashcards'

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
//   ground here is a controlled light surface, so text contrast is fixed rather
//   than dependent on a photograph crop.
//
// WHAT DID NOT CHANGE: the section is still server-rendered and still ships no
// Maps SDK.

// The standard site focus recipe: brand-600 ring on a surface.page offset.
const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page'

const CTA_PRIMARY = `inline-flex items-center justify-center rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white shadow-[0_10px_24px_-14px_rgba(82,28,130,0.75)] transition-colors duration-base motion-reduce:transition-none hover:bg-brand-700 ${FOCUS}`

// Secondary is a white bordered button, not a second brand-filled button: two
// solid CTAs of equal weight is how a page fails to have a primary action.
const CTA_SECONDARY = `inline-flex min-h-11 items-center justify-center rounded-control border border-[#d9c7e6] bg-white px-[30px] py-3 text-base font-semibold text-[#281632] shadow-card transition-colors duration-base motion-reduce:transition-none hover:bg-[#f4eafb] sm:py-4 ${FOCUS}`

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
  // ⚠️ NO HERO PHOTOGRAPH, DEFERRED RATHER THAN OVERLOOKED. Hero photography
  // awaits a suitable authentic DAYTIME Toronto asset.
  //
  // Two repo images were prototyped on the rendered page and rejected:
  // hero-cyclist.jpg (thermal food-delivery bag, non-Toronto street) and
  // home-coverage-baystreet.jpg (night scene; too dark for this light hero and
  // its Bay St cue too small to read at hero scale). Do not reintroduce either.
  return (
    // A local tint connects the hero to the tracking product without changing
    // the shared [data-hero-light] wrapper or OperationalProof below it. It
    // resolves to surface.page at the bottom so the existing transition holds.
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f6eefb_0%,#faf6fc_62%,#fbf9f8_100%)] text-[#281632]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-brand-500/[0.09] blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 left-[18%] -z-10 h-[420px] w-[420px] rounded-full bg-brand-600/[0.055] blur-3xl"
      />
      {/* Padding is deliberately asymmetric: the hero is measured against the
          first viewport, so mobile padding is proposition pushed below the
          fold. Keep mobile tight; spend the room on desktop. */}
      <div className="relative mx-auto max-w-[1200px] px-8 py-8 sm:py-24 lg:py-32">
        {/* items-start, not items-center: with a tall booking surface on the
            left, vertical centring drops the visual into dead space. */}
        <div className="grid grid-cols-1 items-start gap-6 sm:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <h1 data-motion-hero="heading" className="text-balance font-display text-3xl font-extrabold text-[#281632] sm:text-5xl lg:text-6xl 2xl:text-7xl">
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
            {/* #5f5868 is 6.81:1 on surface.page. NOT #8d8695 — 3.51:1, fails
                AA for normal text. */}
            <p data-motion-hero="copy" className="mt-4 max-w-[560px] text-base text-[#62566a] sm:mt-5 sm:text-lg">
              Specimens, filings, business deliveries and parcels — dispatched,
              tracked and recorded on one platform.
            </p>

            {/* PHASE 7. The primary "Book a delivery" button became a working
                pickup / drop-off entry; "Talk to our team" moved inside the
                form so the two actions still sit on one row. HeroNetwork stays
                a SERVER component — HeroAddressEntry is the only client island
                added, and the flashcard field keeps its own separate boundary.

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
            {/* THE BOOKING SURFACE. Visual wrapper only — HeroAddressEntry owns
                every part of the booking behaviour and is untouched by it.

                shadow-hero is used ONLY here; reusing it elsewhere flattens the
                elevation hierarchy. The hairline ring terminates the white
                against surface.page, which the shadow alone cannot do.

                ⚠️ data-hero-entry MUST STAY ON THIS ELEMENT, not on an inner
                div. The noscript rule below hides this hook; if it sat inside,
                the form would hide and an empty white card would remain. */}
            <div
              data-hero-entry
              className="mt-6 rounded-[28px] border border-[#ddcbea] bg-surface-raised p-5 shadow-[0_2px_4px_rgba(82,28,130,0.06),0_22px_54px_-24px_rgba(82,28,130,0.34)] sm:mt-10 sm:p-8"
            >
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

          {/* THE OPEN FIELD. This column holds no panel of its own — no border,
              no surface, no container. A single demonstration card drifts
              through it and is absent as often as it is present, which is the
              point: the booking surface opposite is the hero's one piece of
              furniture.

              The width cap stays from the panel this replaced. Between sm and lg
              the hero stacks and this column would otherwise take the full
              1200px; 520/560 keeps the field proportionate to the card inside
              it. lg:mt-2 aligns it against the headline's cap height, since
              items-start aligns the two columns on their box tops. */}
          <div className="relative max-w-[520px] rounded-[28px] border border-[#ddcbea] bg-white/55 p-3 shadow-[0_2px_4px_rgba(82,28,130,0.04),0_20px_48px_-28px_rgba(82,28,130,0.3)] sm:p-5 lg:mt-2 lg:max-w-[560px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 -top-8 h-20 rounded-full bg-brand-500/10 blur-2xl"
            />
            <RecentRequestFlashcards />
          </div>
        </div>
      </div>
    </section>
  )
}
