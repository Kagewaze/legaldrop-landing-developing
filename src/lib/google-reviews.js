import 'server-only'

// Google Business Profile reviews for the home page.
//
// SERVER ONLY. The 'server-only' import above is a build-time guard: if this
// module is ever pulled into a Client Component, the build fails loudly instead
// of quietly shipping something that reads an API key. GOOGLE_PLACES_API_KEY is
// deliberately NOT prefixed NEXT_PUBLIC_, so Next replaces it with undefined in
// any browser bundle — the guard exists so that mistake surfaces at build time
// rather than as a silently empty section in production.

// The business's Google Place ID.
const PLACE_ID = 'ChIJ6bQwlukxK4gRFaB2nvrNqWw'

// Public Google Maps listing for this place — the "See all reviews" target.
// Built from the Place ID so it cannot drift from the reviews being shown.
export const GOOGLE_PLACE_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`

const PLACE_DETAILS_ENDPOINT =
  'https://maps.googleapis.com/maps/api/place/details/json'

// 24 hours.
//
// CACHE BEHAVIOUR: Place Details is billed per call, so this must never run per
// page view. With `next: { revalidate: SECONDS }` the response is cached by
// Next's Data Cache and shared across all visitors. The home page is statically
// generated, so the fetch runs at build time and then at most once per 24h —
// the first request after the window expires triggers a background regeneration
// while still serving the cached page. Steady-state cost is ~1 call/day
// regardless of traffic. Do not lower this without checking the billing impact.
const REVALIDATE_SECONDS = 86400

// Returns { rating, totalCount, reviews[] } or null.
//
// null on EVERY failure path — missing key, network error, non-200, non-OK
// Google status, malformed body, no reviews. The caller renders nothing at all
// when this is null; a reviews section is not important enough to break a page
// over, and a broken/empty one is worse than none.
export async function getGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  // Not configured — expected in any environment without the key set. Not an
  // error, and deliberately silent.
  if (!apiKey) {
    return null
  }

  const url = new URL(PLACE_DETAILS_ENDPOINT)
  url.searchParams.set('place_id', PLACE_ID)
  url.searchParams.set('fields', 'rating,user_ratings_total,reviews')
  url.searchParams.set('key', apiKey)

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()

    // Google signals application-level failures in the body with HTTP 200,
    // so response.ok alone is not enough.
    if (payload?.status !== 'OK' || !payload?.result) {
      return null
    }

    const { rating, user_ratings_total: userRatingsTotal, reviews } =
      payload.result

    const numericRating = Number(rating)
    const numericTotal = Number(userRatingsTotal)

    if (!Number.isFinite(numericRating) || !Number.isFinite(numericTotal)) {
      return null
    }

    const rawReviews = Array.isArray(reviews) ? reviews : []

    // GOOGLE TERMS OF SERVICE — do not change this without reading them.
    //
    // Reviews are passed through exactly as Google returns them: no filtering
    // to 5-star, no reordering, no editing or truncating the text. Displaying a
    // hand-picked subset misrepresents the rating and is a terms violation.
    // The only transform is a defensive shape-normalisation, plus a slice to
    // the documented maximum of 5 (the API already returns at most 5; the slice
    // is belt-and-braces, not a filter).
    //
    // Reviews with no text are KEPT, not dropped — removing them would be
    // filtering. The card renders the quote only when text is present.
    const normalized = rawReviews.slice(0, 5).map((review) => ({
      authorName:
        typeof review?.author_name === 'string' ? review.author_name : null,
      rating: Number(review?.rating),
      text: typeof review?.text === 'string' ? review.text : '',
      relativeTime:
        typeof review?.relative_time_description === 'string'
          ? review.relative_time_description
          : null,
    }))

    // Drop only entries that are structurally unusable (no author, no rating) —
    // these cannot be rendered or attributed at all. This is a malformed-data
    // guard, not editorial selection.
    const usable = normalized.filter(
      (review) => review.authorName && Number.isFinite(review.rating),
    )

    if (usable.length === 0) {
      return null
    }

    return {
      rating: numericRating,
      totalCount: numericTotal,
      reviews: usable,
    }
  } catch (error) {
    // Network failure, DNS, timeout, invalid JSON — all handled identically.
    return null
  }
}
