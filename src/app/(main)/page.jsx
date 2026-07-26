import { BRAND } from '@/lib/config'
import { getGoogleReviews } from '@/lib/google-reviews'
import { BecomeADriver } from '@/components/home/BecomeADriver'
import { Coverage } from '@/components/home/Coverage'
import { Hero } from '@/components/home/Hero'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Reviews } from '@/components/home/Reviews'
import { Services } from '@/components/home/Services'
import { HOME_REASONS, WhyBrand } from '@/components/home/WhyBrand'

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
    // The root layout sets bg-gray-50; the design's page surface is white.
    <div className="bg-white">
      <Hero />
      {showReviews && <Reviews data={reviews} />}
      <Services />
      <HowItWorks />
      {/* Content passed explicitly — WhyBrand is shared with /medical and
          /legal and holds no copy of its own. */}
      <WhyBrand heading={`Why ${BRAND.name}`} reasons={HOME_REASONS} />
      <Coverage />
      <BecomeADriver />
    </div>
  )
}
