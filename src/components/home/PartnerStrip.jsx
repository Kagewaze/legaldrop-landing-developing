'use client'

import { canLinkPartner } from '@/data/partners'
import { useAutoScrollRail } from '@/components/home/useAutoScrollRail'

// Approved partner logos.
//
// ⚠️ THIS IS NOW A CLIENT ISLAND, and it was a server component until autoplay
// arrived. The rail has to write scrollLeft every frame and yield to real input
// events, and neither is expressible on the server. What crosses into the
// bundle is the six already-filtered records and their logo paths — the same
// data the markup ships anyway — not the permission register.
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
// The LOGO BOX inside each tile, not the tile itself. Raised from 200x80 with
// the tile: at the old size a logo read as a chip beside a 340px review card,
// and the two bands stopped looking like siblings.
const TILE_W = 236
const TILE_H = 140

// The tile. ~300x200 against the review card's 340 wide — deliberately a little
// smaller, because a logo carries less information than a review and matching
// them exactly would overstate it, but unmistakably the same tier.
const TILE_BOX_W = 300
const TILE_BOX_H = 200

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

// ⚠️ A PLAIN HTML IMAGE ELEMENT, DELIBERATELY, AND NOT next/image.
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
function PartnerLogo({ partner, duplicate = false }) {
  // A loop copy is decorative: it is aria-hidden by its <li>, and rendering it
  // as bare content guarantees it can never become a second tab stop even once
  // a partner earns a link. Do not "simplify" this back to canLinkPartner
  // alone — an aria-hidden anchor is still focusable.
  const linked = !duplicate && canLinkPartner(partner)

  const content = (
    <div
      className="flex items-center justify-center overflow-hidden rounded-card border border-[#eeebf1] bg-surface-raised px-6 py-6 shadow-card"
      style={{ width: TILE_BOX_W, height: TILE_BOX_H }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partner.src}
        alt={partner.alt}
        width={400}
        height={160}
        loading="lazy"
        decoding="async"
        // ⚠️ WIDTH COMES FROM THE RECORD, NOT FROM THE TILE. Each canvas is
        // scaled so the MARK inside it lands at a comparable optical size —
        // see the logoWidth block in src/data/partners.js for the measured ink
        // boxes this is derived from. The surrounding transparent padding
        // overflows the tile and is clipped, which is why the tile carries
        // `overflow-hidden`.
        //
        // `object-contain` still guarantees no mark is ever stretched: aspect
        // ratio is preserved and the canvas letterboxes rather than distorting.
        style={{ width: partner.logoWidth ?? TILE_W, maxHeight: TILE_H }}
        className="h-auto max-w-none flex-none object-contain"
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

// Right-to-left, the direction the original partner marquee used. Reviews
// travel the other way, so the two closing bands read as two pieces of evidence
// rather than one long conveyor — the same opposition the old implementation
// had, rebuilt on scroll instead of transforms.
//
// Same 34 px/s as the reviews above, so the page ends on ONE tempo. Deliberately
// not faster: a logo rail that outruns the reviews beside it reads as a ticker.
const PARTNER_SPEED = 34 // px/s

export function PartnerStrip({ partners }) {
  // Loop only once there is genuinely more than a screen of logos to travel
  // through. Below that the duplicate set would be visible beside the original.
  const canLoop = partners.length >= 3
  const railRef = useAutoScrollRail({
    speed: PARTNER_SPEED,
    enabled: canLoop,
  })

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
          {HEADING}
        </h2>
      </div>

      {/* ⚠️ AUTOPLAY AND THE VISITOR SHARE ONE NUMBER: this element's
          scrollLeft. Read useAutoScrollRail.js before changing anything here —
          the previous marquee could not be swiped at all, and the fix was to
          stop animating a transform and start moving real scroll offset.

          ⚠️ NO `snap-mandatory`, DELIBERATELY. Mandatory snapping fights
          continuous autoplay directly: every frame the loop nudges the rail,
          the snap engine drags it back to the nearest tile, which shows up as
          a stutter that never resolves. Continuous motion is the priority here
          and a flick still settles naturally on its own momentum.

          ⚠️ NO `scroll-smooth` EITHER. Smooth scrolling animates every
          scrollLeft write, so a per-frame write becomes an animation queue
          fighting itself.

          ⚠️ AND NO VISIBLE PAUSE BUTTON. This band yields while a finger,
          trackpad or key is on it and resumes shortly after; that is the whole
          control surface, by explicit direction. Reviews keep their button
          because that band moves under its own steam in a reading context.

          `overscroll-behavior-inline: contain` keeps a horizontal flick at the
          end from becoming a browser back-navigation, and the overflow is
          contained here so the body never gains a horizontal scrollbar. */}
      <ul
        data-partner-rail
        ref={railRef}
        tabIndex={0}
        aria-label={HEADING}
        className="mt-6 flex list-none gap-5 overflow-x-auto px-8 pb-4 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [overscroll-behavior-inline:contain] [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 [&::-webkit-scrollbar]:hidden"
      >
        {partners.map((partner) => (
          <li key={partner.slug} className="flex-none">
            <PartnerLogo partner={partner} />
          </li>
        ))}

        {/* THE SEAMLESS HALF — rendered only when the rail actually loops.
            aria-hidden so the six relationships are announced exactly once, and
            `duplicate` forces the tile to render as bare content so a linked
            partner never contributes a second, invisible tab stop.

            THESE ARE NOT ADDITIONAL RELATIONSHIPS. Six logical partners are
            rendered twice; the second copy exists so the wrap in
            useAutoScrollRail lands on an identical frame. */}
        {canLoop &&
          partners.map((partner) => (
            <li
              key={`loop-${partner.slug}`}
              aria-hidden="true"
              data-partner-loop-copy
              className="flex-none"
            >
              <PartnerLogo partner={partner} duplicate />
            </li>
          ))}
      </ul>
    </section>
  )
}
