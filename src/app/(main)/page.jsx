import { getGoogleReviews } from '@/lib/google-reviews'
import { APPROVED_PARTNERS } from '@/data/partners'
import { HeroNetwork } from '@/components/home/HeroNetwork'
import { OperationalProof } from '@/components/home/OperationalProof'
import { PartnerStrip } from '@/components/home/PartnerStrip'
import { ProductStory } from '@/components/home/ProductStory'
import { Reviews, reviewsWillMove } from '@/components/home/Reviews'
import { TrustAndAccountability } from '@/components/home/TrustAndAccountability'
import {
  LEGAL_VERTICAL,
  MEDICAL_VERTICAL,
  VerticalSection,
} from '@/components/home/VerticalSection'

// PHASE 6 removed four imports from this file: Coverage, WhyBrand,
// HOME_REASONS, BRAND, and the Bay Street photograph with its COVERAGE_IMAGE
// wrapper. Only the homepage's CALL SITES went.
//
// ⚠️ home/WhyBrand.jsx AND home/Coverage.jsx ARE STILL LIVE COMPONENTS. Both
// /medical and /legal render each of them, so neither file was touched and
// neither may be deleted:
//
//   WhyBrand   /medical passes CLINIC_REASONS, /legal passes RECORD_REASONS.
//              It holds no copy of its own, which is why removing the home
//              page's HOME_REASONS does not affect either page.
//   Coverage   both call it with NO image, taking its early-return branch.
//              That branch exists precisely so those two pages ship one child
//              on the section rather than an array — read Coverage.jsx:48
//              before touching it. The image branch is now unused, and it is
//              left in place rather than pruned because removing it would mean
//              restructuring the component both B2B pages depend on.
//
// HOME_REASONS itself is now unused. It is retained in WhyBrand.jsx as the
// rollback content, alongside the claim history recorded against each card
// across Phases 4.1-4.2 — deleting it would delete that record.

// Home page, rebuilt from the Druppr landing design.
//
// The previous Pocket-template composition (Hero, PrimaryFeatures,
// SecondaryFeatures, CallToAction, Faqs) is gone. Those components are still on
// disk and now unimported — removing them is a separate cleanup commit.
//
// Server component throughout; nothing on this page needs client JS.

export default async function Home() {
  // Cached for 24h — see src/lib/google-reviews.js. Returns null when the API
  // key is absent or anything at all goes wrong.
  const reviews = await getGoogleReviews()

  // Render the reviews section only with real data behind it. When there is
  // none, the page simply does not have that section — no skeleton, no
  // "reviews coming soon", no placeholder rating. A silent absence is honest;
  // an empty state advertises that something is broken or unfinished.
  const showReviews = reviews !== null && reviews.totalCount > 0

  // ── SOCIAL PROOF ────────────────────────────────────────────────────────────
  //
  // Reviews and partner logos are now SEPARATE sections with separate motion
  // semantics, and both render at the END of the page — reviews first, then the
  // partner rail, which is the last thing before the shared-layout Footer.
  //
  // ⚠️ PARTNERS ARE PERMISSION-GATED, NOT FEATURE-FLAGGED. APPROVED_PARTNERS is
  // filtered in src/data/partners.js on a COMPLETE permission record — every one
  // of eight fields, not just a status string.
  //
  // It currently holds SIX approved relationships and the section renders. (An
  // earlier note here said the register was empty and no partner section
  // rendered; that stopped being true once the permission records were
  // completed.) The gate still does its job: an incomplete record is filtered
  // out, and if the list ever empties the section disappears rather than
  // leaving a gap.
  const partners = APPROVED_PARTNERS
  const showPartners = partners.length > 0

  // Whether each band actually MOVES, which is a different question from
  // whether it renders. Reviews move at 4+, partners at 3+; below those counts
  // each renders a static layout.
  const reviewsMove = showReviews && reviewsWillMove(reviews)

  const reviewsSection = showReviews ? <Reviews data={reviews} /> : null
  const partnersSection = showPartners ? <PartnerStrip partners={partners} /> : null

  // ⚠️ REVIEWS AND PARTNERS BOTH AUTOPLAY AND BOTH SWIPE, BUT THEY ARE STILL
  // NOT ONE BAND.
  //
  // They share a motion PRIMITIVE (home/useAutoScrollRail.js) and nothing else:
  // separate sections, separate speeds, opposite directions, and separate
  // controls. Reviews keep an explicit pause button because that band moves
  // under a reader; the partner rail has none by direction, and yields to touch
  // instead. Do not re-couple them behind one shared pause boolean again.
  //
  // The motion wrapper is no longer HERE. It moved inside Reviews.jsx, because
  // the pause button and the scroll container have to agree about one scroll
  // position — an outer wrapper could only toggle an attribute.
  const reviewsBlock = reviewsMove ? (
    <>
      {/* ── NO-JAVASCRIPT SUPPRESSION ────────────────────────────────────────
          Far smaller than it used to be, and for a good reason: the review
          track is now a REAL scroll container rather than a transformed
          `w-max` strip. Without JavaScript it simply does not autoplay, and it
          is already readable and scrollable by hand — so the width releases and
          wrap rules that Phase 9 needed are gone with the marquee that required
          them.

          What remains: hide the duplicate half of BOTH rails — each exists only
          to make an autoplay loop seamless, and with nothing moving they are
          just the same reviews and the same six logos printed twice — and hide
          the pause button, which is inert without scripting.

          ⚠️ THE PARTNER SELECTOR BELONGS HERE EVEN THOUGH THIS BLOCK RENDERS
          WITH THE REVIEWS. Without JavaScript neither rail autoplays, so the
          partner loop copy is duplicated content on a band this <noscript>
          happens to be adjacent to rather than part of. It is declared here
          because this is the page's only <noscript>; if reviews are ever absent
          while partners render, move it rather than dropping it. */}
      <noscript>
        <style>{`[data-review-duplicate],[data-partner-loop-copy]{display:none!important}[data-reviews-motion-control]{display:none!important}`}</style>
      </noscript>

      {reviewsSection}
    </>
  ) : (
    // Too few reviews to loop: Reviews renders its static grid and mounts no
    // rail at all.
    reviewsSection
  )

  return (
    // surface.page — a warm off-white, not #fff. Cards on this page are pure
    // white, so they sit ON the ground rather than dissolving into it.
    <div className="bg-surface-page">
      {/* Keeps the hero and the metrics band on ONE continuous surface. Both
          sections carry no background of their own; giving either one back a
          background reintroduces the seam this removes.

          Paint only — a plain block box, no layout effect, no client JS. The
          gradient lives in src/styles/tailwind.css under [data-hero-light], and
          its hazes are composed against the height of THIS element, so adding
          or removing a section from the wrapper moves where the light falls. */}
      <div data-hero-light>
        {/* Phase 2 replaced home/Hero.jsx with HeroNetwork. The old component is
            retained on disk, unimported, as the rollback target: restoring the
            previous hero is a two-line change here. It is removed in a later
            phase once this one has settled. */}
        <HeroNetwork />
        {/* Immediately after the hero: the claim, then the evidence for it. All
            three figures are founder-confirmed — see the provenance block in
            OperationalProof.jsx. Nothing else on the page moved. */}
        <OperationalProof />
      </div>
      {/* The claim, the evidence, then the product itself — shown as three real
          screens rather than as a diagram of one.

          ProductStory REPLACES home/ConnectedSystem.jsx, which joins
          home/PlatformShowcase.jsx, home/Services.jsx and home/HowItWorks.jsx
          as retained, unimported rollback targets. Restoring any of them is a
          two-line change here.

          Each replaced the last for the same reason: the section kept
          DESCRIBING the product instead of showing it. Services was a
          catalogue in which 8 of 11 entries were not bookable (Phase 0, D7);
          HowItWorks was the generic courier funnel `HOMEPAGE.md` rules out by
          name; PlatformShowcase was three frames of label/value rows; and
          ConnectedSystem was a hexagonal network diagram — hand-drawn product
          fragments standing in for the product. This one uses screenshots of
          the real thing. */}
      <ProductStory />
      {/* The two account-based verticals. Copy for each is constrained — see
          the block in VerticalSection.jsx.

          PHASE 5: the tint moved from medical to legal.

          Medical carried it before, which was fine while it led with a
          photograph. Now that both verticals lead with a white product frame,
          a tinted medical section sat directly under the tinted PlatformShowcase
          and the two bands merged into one long tint containing four white
          cards — no seam, no rhythm. Reviews sits between them only when the
          Places API returns data, so that separation cannot be relied on.

          Alternating from here down: tint (showcase) → page (medical) → tint
          (legal) → page (trust). */}
      <VerticalSection {...MEDICAL_VERTICAL} frameSide="left" tinted />
      <VerticalSection {...LEGAL_VERTICAL} frameSide="right" />
      {/* PHASE 6: this replaces BOTH the homepage's `Why Druppr` grid and its
          Coverage band.

          Why Druppr was four table-stakes cards — same-day, live tracking,
          vehicle options, recorded delivery — which `HOMEPAGE.md` rules out by
          name, and which by Phase 5 were largely restating what the Platform
          Showcase and the two vertical frames now show directly. Coverage
          carried a service-area line, an eight-neighbourhood list that
          `HOMEPAGE.md` calls "the single strongest small-business signal
          available", and a 377 kB photograph.

          What replaces them is smaller and says more: three pillars that each
          name a capability the tracking surfaces render, and one service-area
          line. The closing dual CTA lives inside it, so the page ends on an
          action rather than on a photograph. */}
      <TrustAndAccountability />
      {/* PHASE 4.2: BecomeADriver removed from the homepage.

          Phase 0 (D9) already approved taking driver recruitment off the
          customer-facing page. Phase 4.2 executes it now because the section
          carried two unconfirmed claims — "get paid weekly" and "once you are
          certified" — and removing the section removes them without needing a
          driver-programme redesign.

          The component FILE IS RETAINED, unimported, as the rollback target
          and as the starting asset for a future driver page.

          NO FOOTER OR NAV LINK WAS ADDED. `ROUTES.becomeADriver` is still
          live: false and no driver page exists; linking to it would be a dead
          route (content gate C5). Driver recruitment is separate future work.
          Restore a link only once that page ships. */}

      {/* ── THE PAGE ENDING ────────────────────────────────────────────────
          Reviews, then the partner rail, then the Footer that
          src/components/Layout.jsx renders after {children}. Nothing may be
          inserted between these two or after the rail: the decrescendo is the
          point — human testimony, then a quiet logo rail, then the footer.

          When the Google key is absent the reviews section is null and
          collapses completely, leaving the rail directly after the trust
          section with no gap where reviews would have been. */}
      {reviewsBlock}
      {partnersSection}
    </div>
  )
}
