import { BRAND } from '@/lib/config'
import { getGoogleReviews } from '@/lib/google-reviews'
import { BecomeADriver } from '@/components/home/BecomeADriver'
import { Coverage } from '@/components/home/Coverage'
import { HeroNetwork } from '@/components/home/HeroNetwork'
import { OperationalProof } from '@/components/home/OperationalProof'
import { PlatformShowcase } from '@/components/home/PlatformShowcase'
import { Reviews } from '@/components/home/Reviews'
import {
  LEGAL_VERTICAL,
  MEDICAL_VERTICAL,
  VerticalSection,
} from '@/components/home/VerticalSection'
import { HOME_REASONS, WhyBrand } from '@/components/home/WhyBrand'
import baystreet from '@/images/home-coverage-baystreet.jpg'

// Coverage is shared with /medical and /legal, which show the band without a
// photograph. Importing the image here rather than inside the component keeps
// it out of those two pages entirely.
const COVERAGE_IMAGE = {
  src: baystreet,
  alt: 'Bay Street in downtown Toronto at night, with traffic stopped at the lights and pedestrians crossing.',
}

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
          social proof, and this keeps the narrative claim → proof → product. */}
      {showReviews && <Reviews data={reviews} />}
      {/* The two account-based verticals. Medical carries the tint band and
          leads with its photograph; Legal reverses both. Copy for each is
          constrained — see the block in VerticalSection.jsx. */}
      <VerticalSection {...MEDICAL_VERTICAL} imageSide="left" tinted />
      <VerticalSection {...LEGAL_VERTICAL} imageSide="right" />
      {/* Content passed explicitly — WhyBrand is shared with /medical and
          /legal and holds no copy of its own. */}
      <WhyBrand heading={`Why ${BRAND.name}`} reasons={HOME_REASONS} />
      <Coverage image={COVERAGE_IMAGE} />
      <BecomeADriver />
    </div>
  )
}
