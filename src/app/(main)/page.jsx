import { getGoogleReviews } from '@/lib/google-reviews'
import { APPROVED_PARTNERS } from '@/data/partners'
import { HeroNetwork } from '@/components/home/HeroNetwork'
import { OperationalProof } from '@/components/home/OperationalProof'
import { PartnerStrip } from '@/components/home/PartnerStrip'
import { PlatformShowcase } from '@/components/home/PlatformShowcase'
import { Reviews, reviewsWillMove } from '@/components/home/Reviews'
import { SocialProofMotion } from '@/components/home/SocialProofMotion'
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

  // ── THE SOCIAL-PROOF BAND ───────────────────────────────────────────────────
  //
  // Reviews and partner logos are composed together because ONE client wrapper
  // governs both. Phase 9.1 fixed the approved ceiling at three client islands,
  // or four while that wrapper renders; a separate partner island would have
  // been a fifth. So SocialProofMotion is mounted at most ONCE, here, and owns
  // the single pause boolean for both tracks.
  //
  // ⚠️ PARTNERS ARE PERMISSION-GATED, NOT FEATURE-FLAGGED. APPROVED_PARTNERS is
  // filtered in src/data/partners.js on a COMPLETE permission record — every one
  // of eight fields, not just a status string. It is currently EMPTY, because
  // all six supplied records arrived blank, so no partner section renders and
  // there is no gap where one would be. Nothing here needs changing when
  // permissions land: fill in the register, mirror it into the data module, and
  // the section appears at the right size on its own.
  const partners = APPROVED_PARTNERS
  const showPartners = partners.length > 0

  // Whether each band actually MOVES, which is a different question from
  // whether it renders. Reviews move at 4+, partners at 3+; below those counts
  // each renders a static layout.
  const reviewsMove = showReviews && reviewsWillMove(reviews)
  const partnersMove = showPartners && partners.length >= 3
  const anyMotion = reviewsMove || partnersMove

  // The accessible name of the shared control names only what is actually
  // moving, so it never offers to pause something static.
  const motionLabel = [
    reviewsMove ? 'customer reviews' : null,
    partnersMove ? 'partner logos' : null,
  ]
    .filter(Boolean)
    .join(' and ')

  const reviewsSection = showReviews ? <Reviews data={reviews} /> : null
  const partnersSection = showPartners ? <PartnerStrip partners={partners} /> : null

  const socialProof = anyMotion ? (
    <>
      {/* ── NO-JAVASCRIPT SUPPRESSION ────────────────────────────────────────
          Identical declarations to the prefers-reduced-motion block in
          src/styles/tailwind.css, applied by a mechanism that needs no
          scripting. Without it the CSS animations would keep running with no
          way to stop them — the pause button is the only control and it is
          inert without JavaScript — which would leave moving content a visitor
          cannot pause. CHANGE BOTH COPIES TOGETHER.

          It lives here rather than inside either section because one block now
          covers both tracks and the one shared control.

          The width releases are not cosmetic: `flex-wrap` alone never fires,
          because `w-max` sizes each track to max-content and a max-content flex
          container always fits its items on one line. Phase 9 measured the
          consequence on the review track — 1 of 5 reviews readable at 390 with
          no scroll and no motion to reach the rest. The partner track has the
          same construction and therefore the same failure mode. */}
      <noscript>
        <style>{`[data-review-track]{animation:none!important;transform:none!important;flex-wrap:wrap!important;width:auto!important;max-width:1200px!important;margin-left:auto!important;margin-right:auto!important}[data-review-track]>li{width:auto!important;flex:1 1 300px!important;max-width:100%!important}[data-partner-track]{animation:none!important;transform:none!important;flex-wrap:wrap!important;justify-content:center!important;width:auto!important;max-width:1200px!important;margin-left:auto!important;margin-right:auto!important}[data-review-duplicate],[data-partner-duplicate]{display:none!important}[data-social-motion-control]{display:none!important}`}</style>
      </noscript>

      <SocialProofMotion label={motionLabel}>
        {reviewsSection}
        {partnersSection}
      </SocialProofMotion>
    </>
  ) : (
    // Nothing moves, so no client island is mounted at all and no pause control
    // is rendered. Whatever exists renders as plain static server HTML.
    <>
      {reviewsSection}
      {partnersSection}
    </>
  )

  return (
    // surface.page — a warm off-white, not #fff. Cards on this page are pure
    // white, so they sit ON the ground rather than dissolving into it.
    <div className="bg-surface-page">
      {/* Phase 2 replaced home/Hero.jsx with HeroNetwork. The old component is
          retained on disk, unimported, as the rollback target: restoring the
          previous hero is a two-line change here. It is removed in a later
          phase once this one has settled. */}
      <HeroNetwork />
      {/* Immediately after the hero: the claim, then the evidence for it. All
          three figures are founder-confirmed — see the provenance block in
          OperationalProof.jsx. Nothing else on the page moved. */}
      <OperationalProof />
      {/* Phase 4: the claim, the evidence, then the product itself.
          PlatformShowcase REPLACES home/Services.jsx and home/HowItWorks.jsx.
          Both are retained on disk, unimported, as rollback targets — restoring
          them is a two-line change here. They are removed in a later phase once
          this one has settled.

          Services was a catalogue in which 8 of 11 entries were not bookable
          (Phase 0, D7). HowItWorks was the generic courier funnel — enter
          addresses, see price, pay, track — which `HOMEPAGE.md` rules out
          because every competitor prints it. The showcase replaces both with
          the actual product.

          CONSEQUENCE WORTH KNOWING: HowItWorks was the page's only brand-600
          band. Purple now appears only on CTAs and status chips, which is
          closer to what VISION.md asks for, but the page has lost a strong
          colour beat. Reassess when the remaining sections are rebuilt. */}
      <PlatformShowcase />
      {/* Reviews moved below the showcase: product evidence outranks consumer
          social proof, and this keeps the narrative claim → proof → product.

          PHASE 10 placed approved partner logos immediately after the reviews,
          as one social-proof band: both are third-party corroboration, and
          keeping them adjacent is what lets a single motion wrapper govern the
          pair. Either, both or neither may be absent — when both are, this
          renders nothing at all and the medical vertical follows the showcase
          directly, with no gap. */}
      {socialProof}
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
      <VerticalSection {...MEDICAL_VERTICAL} frameSide="left" />
      <VerticalSection {...LEGAL_VERTICAL} frameSide="right" tinted />
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
    </div>
  )
}
