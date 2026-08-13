import { canLinkPartner } from '@/data/partners'

// Approved partner logos. SERVER COMPONENT — the records and the artwork never
// cross into the client bundle. Phase 10 added motion AROUND this content, not
// inside it: the strip is a plain server section with no client wrapper at all
// strip as `children`.
//
// ⚠️ THIS COMPONENT RENDERS WHAT IT IS GIVEN AND GATES NOTHING ITSELF. The
// caller passes APPROVED_PARTNERS, which src/data/partners.js has already
// filtered on a complete permission record. Do not import PARTNER_LOGOS here,
// and do not add a status check here as "defence in depth" — two gates in two
// files is how they drift, and the one in the data module is the one the
// register mirrors.
//
// ── THE THREE STATES ────────────────────────────────────────────────────────
//
//   0 approved     the caller renders nothing at all. This component is never
//                  reached, so there is no heading, no empty band and no gap.
//   1-2 approved   a compact static row. NO animation, NO duplicate, NO pause
//                  control. Two logos duplicated into a loop would manufacture
//                  the appearance of a larger network out of the same two
//                  companies, which is the specific dishonesty this threshold
//                  exists to prevent.
//   3+ approved    the moving strip.
//
// ── THE MOTION THRESHOLD IS MEASURED, NOT CHOSEN ────────────────────────────
//
// A seamless loop needs the source set to be WIDER THAN THE VIEWPORT, otherwise
// the duplicate that makes the loop seamless is on screen at the same time as
// the original and a visitor simply sees the same logos twice, side by side.
//
// Against this page's widest layout, a 1200px content column, at the tile
// geometry below:
//
//   2 logos x 216px (tile + gap) =   432px  <  1200px   duplicate visible
//   3 logos x 216px              =   648px  <  1200px   duplicate visible
//
// So three does NOT clear the viewport the way four reviews do. Three is used
// anyway, because it is the threshold Phase 0 (D8) set on a different and
// stronger basis: fewer than three approved logos is too small a set to present
// as a network at all. The visual consequence is handled by the track being
// FULL-BLEED and centred — at 1200px+ the strip simply does not fill the width
// and is centred, which reads as a deliberate short row rather than a broken

// Tile geometry. Every logo is letterboxed onto the same 600x240 transparent
// canvas, so a fixed tile height renders every mark at a consistent optical
// size WITHOUT scaling any of them differently or distorting their aspect
// ratios. The 2.5:1 canvas at 80px tall is 200px wide.
const TILE_W = 200
const TILE_H = 80

// Reading speed in pixels per second. Slower than the review track's 34px/s
// because a logo needs recognising rather than reading, and a slow strip is
// less likely to pull attention away from the evidence above it. The duration
// is DERIVED from this and the logo count, so three partners and six partners
// travel at the same speed rather than in the same time.

// ⚠️ WORDING IS CONSTRAINED BY THE PERMISSION RECORDS, NOT BY AMBITION.
//
// Phase 10 forbids "Trusted by", "Leading companies", "Enterprise customers",
// "Powering these businesses" and "Our client network" unless the completed
// relationship records explicitly support them. None of those is supportable
// from a logo and a permission date: each asserts something about the nature or
// currency of the relationship.
//
// "Business relationships" is the narrowest true statement available — it says
// a relationship exists and claims nothing about who pays whom, whether it is
// current, or whether the company endorses Druppr. If the completed records
// later support something more specific, change it HERE and record why in
// docs/PARTNER_LOGO_PERMISSIONS.md; do not widen it because the section looks
// modest.
const HEADING = 'Business relationships'

// ⚠️ A PLAIN <img>, DELIBERATELY, AND NOT next/image.
//
// This is the one place on the site where next/image is the wrong tool, so the
// lint rule is disabled narrowly rather than the decision being hidden.
//
// MEASURED: importing next/image into the homepage's module graph costs
// **5 kB of First Load JS** — 101 kB -> 106 kB — and it is charged whether or
// not the component renders. Partner records are permission-gated and today
// APPROVED_PARTNERS is EMPTY, so that 5 kB would have been shipped to every
// visitor for a section none of them can see, possibly for months. Verified by
// building with and without the import.
//
// What next/image would have bought is already bought at build time instead:
// each logo is a 400x160 WebP, exactly 2x its 200x80 rendered tile, so there is
// no responsive ladder to generate and no format to negotiate. All six total
// **55 kB**, down from 264 kB for the supplied 600x240 PNG set.
//
// The two properties that actually matter are kept without any runtime:
//   width/height   reserve the box before the bytes arrive -> no layout shift
//   loading="lazy" native, no observer, no JavaScript
//
// If these ever become responsive, or gain a srcset, revisit this — at that
// point next/image earns its 5 kB.
//
// One tile. Linked only when the partner has BOTH link permission and a URL —
// linking a mark is a further use beyond displaying it, so it is gated
// separately in the data module.
function PartnerLogo({ partner }) {
  const linked = canLinkPartner(partner)

  const content = (
    <div
      className="flex items-center justify-center rounded-card border border-[#eeebf1] bg-surface-raised px-6 py-5"
      style={{ width: TILE_W + 48, height: TILE_H + 40 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.src}
        alt={partner.alt}
        width={400}
        height={160}
        loading="lazy"
        decoding="async"
        // `object-contain` is what guarantees no mark is ever stretched: the
        // canvas fits inside the tile, letterboxing if the ratios ever disagree
        // rather than distorting. Every supplied canvas is already 2.5:1, the
        // same ratio as the tile, so today it letterboxes nothing.
        className="h-full w-full object-contain"
      />
    </div>
  )

  if (!linked) {
    // NOT interactive. No tabindex, no role, no hover affordance — an
    // unlinked logo that looks clickable is a control that does nothing.
    return content
  }

  return (
    <a
      href={partner.website}
      target="_blank"
      rel="noreferrer"
      // The accessible name comes from the image's alt; adding a title or
      // aria-label as well would announce the company twice.
      className="rounded-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      {content}
    </a>
  )
}

export function PartnerStrip({ partners }) {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
          {HEADING}
        </h2>
      </div>

      {/* ⚠️ THIS RAIL DOES NOT MOVE ON ITS OWN, AND THAT IS THE ARCHITECTURE.
          It replaced a duplicated-set marquee. Because nothing animates there
          is nothing to pause, so the band carries no motion control at all —
          the control was removed by deleting the autoplay, not by hiding a
          button. Do not reintroduce an animation here.

          Native scrolling only: touch drag, trackpad, shift+wheel and keyboard
          all work without JavaScript, which is also why this needs no client
          island. `overscroll-behavior-inline: contain` stops a horizontal
          flick at the rail's end from turning into a browser back-navigation,
          and the overflow is contained to this element so the body never gains
          a horizontal scrollbar. */}
      <ul
        data-partner-rail
        tabIndex={0}
        aria-label={HEADING}
        className="mx-auto mt-6 flex max-w-[1200px] snap-x snap-mandatory list-none gap-4 overflow-x-auto scroll-smooth px-8 pb-4 [-webkit-overflow-scrolling:touch] [overscroll-behavior-inline:contain] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:gap-5"
      >
        {partners.map((partner) => (
          // snap-start rather than centre: the first tile then rests flush with
          // the page's 32px gutter, in line with every other section, instead of
          // floating in the middle of the viewport.
          <li key={partner.slug} className="flex-none snap-start">
            <PartnerLogo partner={partner} />
          </li>
        ))}
      </ul>
    </section>
  )
}
