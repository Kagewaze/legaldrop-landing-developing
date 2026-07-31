import { BRAND } from '@/lib/config'
import { getGoogleReviews } from '@/lib/google-reviews'
import { BecomeADriver } from '@/components/home/BecomeADriver'
import { Coverage } from '@/components/home/Coverage'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Reviews } from '@/components/home/Reviews'
import { Services } from '@/components/home/Services'
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
      <Hero />
      {showReviews && <Reviews data={reviews} />}
      <Services />
      <HowItWorks />
      {/* Content passed explicitly — WhyBrand is shared with /medical and
          /legal and holds no copy of its own. */}
      <WhyBrand heading={`Why ${BRAND.name}`} reasons={HOME_REASONS} />
      <Coverage image={COVERAGE_IMAGE} />
      <BecomeADriver />
    </div>
  )
}
