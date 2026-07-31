import { GOOGLE_PLACE_URL } from '@/lib/google-reviews'

// Google Business Profile reviews.
//
// Everything here renders from the API response. The design's "4.9",
// "Sarah A.", "Michael K." and their quotes were placeholders and are not in
// this file — inventing a rating or a testimonial is fabricating a customer.
//
// The caller renders this only when data is non-null and totalCount > 0, so
// there is no empty state below by design.

// Initials fallback rather than the author's Google photo.
//
// The API does return profile_photo_url, but rendering it means either
// next/image with a new remotePatterns entry in next.config.js (out of scope —
// that file carries the live payment rewrite) or a plain <img>, which trips
// next/core-web-vitals' no-img-element and would add a build warning. An
// initials circle matches the design, needs no configuration, and cannot break
// when Google rotates its avatar CDN hostnames.
function initialsFrom(name) {
  const parts = String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  const initials = parts.map((part) => part.charAt(0).toUpperCase()).join('')

  return initials || '?'
}

function Stars({ rating }) {
  // Round to the nearest whole star, matching how Google itself renders a
  // single review. Filled count reflects the ACTUAL rating — never hardcoded to
  // five, which would misrepresent a three-star review as perfect.
  const filled = Math.max(0, Math.min(5, Math.round(rating)))

  return (
    // tracking-[2px] is NOT letter-spacing on text and must not be folded into
    // tracking-label. It is the gap between ★ glyphs — 2px at 14px is 0.143em,
    // where the label token is 0.08em, so the token would visibly tighten the
    // star row. Optical spacing of a glyph run, not typographic tracking.
    <div
      className="text-sm tracking-[2px] text-[#17131c]"
      aria-label={`${rating} out of 5`}
    >
      <span aria-hidden="true">
        <span>{'★'.repeat(filled)}</span>
        <span className="text-[#d9d2e2]">{'★'.repeat(5 - filled)}</span>
      </span>
    </div>
  )
}

export function Reviews({ data }) {
  const { rating, totalCount, reviews } = data

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
          Rated {rating.toFixed(1)} on Google
        </h2>
        <a
          href={GOOGLE_PLACE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-base font-semibold text-brand-600 transition-colors hover:text-[#5d1f96]"
        >
          See all reviews
        </a>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {reviews.map((review, index) => (
          <article
            key={`${review.authorName}-${index}`}
            className="rounded-card border-[1.5px] border-[#eeebf1] p-6 shadow-card"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-tint text-base font-bold text-[#17131c]">
                {initialsFrom(review.authorName)}
              </div>
              <div>
                <div className="text-base font-bold text-[#17131c]">
                  {review.authorName}
                </div>
                <Stars rating={review.rating} />
              </div>
            </div>

            {/* Verbatim. Not truncated — see the terms note in
                src/lib/google-reviews.js. */}
            {review.text && (
              <p className="mt-4 text-base text-[#433d4b]">{review.text}</p>
            )}

            {review.relativeTime && (
              <p className="mt-3 text-sm text-[#8d8695]">
                {review.relativeTime}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Attribution is required and must stay visible. It also sets an honest
          expectation: this is not a curated wall of the best reviews — the API
          returns up to five and Google decides which, with no way to configure
          the selection. */}
      <p className="mt-3.5 text-sm text-[#8d8695]">
        Reviews from Google, based on {totalCount}{' '}
        {totalCount === 1 ? 'review' : 'reviews'}. Google selects which reviews
        are shown.
      </p>
    </section>
  )
}
