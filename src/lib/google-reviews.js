import 'server-only'

// Google Business Profile reviews for the home page.
//
// SERVER ONLY. The 'server-only' import above is a build-time guard: if this
// module is ever pulled into a Client Component, the build fails loudly instead
// of quietly shipping something that reads an API key. GOOGLE_PLACES_API_KEY is
// deliberately NOT prefixed NEXT_PUBLIC_, so Next replaces it with undefined in
// any browser bundle — the guard exists so that mistake surfaces at build time
// rather than as a silently empty section in production.
//
// Uses Places API (NEW) — places.googleapis.com/v1. This is the version the
// project standardises on; the send flow's address autocomplete will use the
// same API.
//
// OPERATIONAL NOTE: "Places API (New)" is a SEPARATE product from the legacy
// "Places API" in Google Cloud Console. Enabling one does not enable the other.
// If this starts returning 403 with SERVICE_DISABLED, that is the cause.

// The business's Google Place ID.
const PLACE_ID = 'ChIJ6bQwlukxK4gRFaB2nvrNqWw'

// ⚠️ THE OUTBOUND LINK IS NO LONGER BUILT FROM THE PLACE ID BY HAND.
//
// This module used to export:
//
//   GOOGLE_PLACE_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`
//
// and that URL landed on Google Maps' "No results found" screen in production.
// Two faults, either of which is sufficient on its own:
//
//   1. `/maps/place/?q=place_id:` is a LEGACY, UNDOCUMENTED form that predates
//      the Maps URLs API. It carries no `api=1`, so Google is under no
//      commitment to resolve it, and its handling differs across desktop, the
//      mobile web and the app hand-off. The documented cross-platform form is
//      `/maps/search/?api=1&query=…&query_place_id=…`.
//
//   2. A hand-built URL cannot follow a place ID that Google has superseded.
//      The Places API transparently forwards a retired ID to its replacement
//      when SERVING the details request — which is why the reviews kept
//      arriving while the link died. A string built locally gets no such
//      forwarding.
//
// The fix is to stop constructing the destination and take the canonical one
// from the SAME response that supplies the reviews, so the link and the content
// can never describe different places. `googleMapsUri` is Google's own current
// URL for the resolved place.
//
// Only used to disambiguate the FALLBACK search query below; the authoritative
// part of that URL is always `query_place_id`. Not used when `googleMapsUri` is
// present, which is the normal path.
const PLACE_CITY = 'Toronto'

// Places API (New): the place ID goes in the PATH, not a query parameter.
const PLACE_DETAILS_ENDPOINT = `https://places.googleapis.com/v1/places/${PLACE_ID}`

// Field mask is REQUIRED by the new API — an unmasked request is rejected, and
// the mask determines the billing SKU. Request only what is rendered, plus the
// two fields the outbound link needs.
//
// `displayName` never reaches the browser: it is read here to build the
// fallback query and is then discarded. Only the finished URL string crosses to
// the client.
const FIELD_MASK =
  'rating,userRatingCount,reviews,googleMapsUri,displayName'

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

// Places API (New) returns localised strings as { text, languageCode } objects
// rather than bare strings — review.text and review.originalText both use this
// shape. Reads the string out defensively, and tolerates a bare string in case
// the shape ever changes back or differs by field.
function readLocalizedText(value) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value?.text === 'string') {
    return value.text
  }

  return ''
}

// Author name lives under authorAttribution in the new API. Attribution is
// mandatory under Google's terms, so a review without a usable display name
// cannot be rendered at all.
function readAuthorName(review) {
  const displayName = review?.authorAttribution?.displayName

  if (typeof displayName === 'string' && displayName.trim().length > 0) {
    return displayName
  }

  return null
}

// The outbound "View reviews on Google" destination, derived from the response.
//
// Returns a URL string, or null — and null is a legitimate outcome, not an
// error. The caller renders no link at all in that case rather than shipping a
// guess: a link that lands on "No results found" is worse than no link, which
// is the entire defect this function exists to close.
//
// PREFERRED: googleMapsUri, Google's canonical URL for the place it actually
// resolved. Nothing is built, so nothing can drift.
//
// FALLBACK: the documented Maps URLs search form, assembled with
// URLSearchParams so every value is encoded exactly once and no separator is
// ever hand-written. It uses the API's own displayName — NOT 'Druppr' (the
// consumer brand) and NOT 'LegalDrop' (the legal entity), either of which may
// differ from the name on the Business Profile and would reproduce the same
// "No results found" failure. `query_place_id` is the same PLACE_ID that
// fetched the reviews, so the link and the content stay bound together.
function readSourceUrl(payload) {
  const canonical = payload?.googleMapsUri

  if (typeof canonical === 'string' && canonical.startsWith('https://')) {
    return canonical
  }

  // displayName is a localised { text, languageCode } object in this API.
  const name = readLocalizedText(payload?.displayName).trim()

  if (!name) {
    // Dev-only, and server-side only — this module is `server-only`. Silent in
    // production: a missing link is a degraded section, not a page failure, and
    // logging it per render would be noise on every ISR regeneration.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[google-reviews] Places response carried neither googleMapsUri nor displayName; rendering reviews without an outbound link.',
      )
    }
    return null
  }

  const params = new URLSearchParams({
    api: '1',
    query: `${name} ${PLACE_CITY}`,
    query_place_id: PLACE_ID,
  })

  return `https://www.google.com/maps/search/?${params.toString()}`
}

// Returns { rating, totalCount, reviews[], sourceUrl } or null.
//
// null on EVERY failure path — missing key, network error, non-200, error body,
// malformed body, no reviews. The caller renders nothing at all when this is
// null; a reviews section is not important enough to break a page over, and a
// broken/empty one is worse than none.
export async function getGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  // Not configured — expected in any environment without the key set. Not an
  // error, and deliberately silent.
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(PLACE_DETAILS_ENDPOINT, {
      headers: {
        // Key travels as a header, not a query param, in the new API.
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    })

    // Unlike the legacy API — which signalled application errors with HTTP 200
    // and a body status — the new API uses real HTTP status codes.
    if (!response.ok) {
      return null
    }

    const payload = await response.json()

    if (!payload || typeof payload !== 'object' || payload.error) {
      return null
    }

    // New API field names: userRatingCount, not user_ratings_total.
    const numericRating = Number(payload.rating)
    const numericTotal = Number(payload.userRatingCount)

    if (!Number.isFinite(numericRating) || !Number.isFinite(numericTotal)) {
      return null
    }

    const rawReviews = Array.isArray(payload.reviews) ? payload.reviews : []

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
    //
    // `text` is the (possibly Google-translated) display text; `originalText`
    // is the author's original. Prefer `text`, fall back to `originalText`, so
    // a review still shows if only one is present.
    const normalized = rawReviews.slice(0, 5).map((review) => ({
      authorName: readAuthorName(review),
      rating: Number(review?.rating),
      text:
        readLocalizedText(review?.text) ||
        readLocalizedText(review?.originalText),
      relativeTime:
        typeof review?.relativePublishTimeDescription === 'string'
          ? review.relativePublishTimeDescription
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
      // May be null. The section renders without an outbound link in that case.
      sourceUrl: readSourceUrl(payload),
    }
  } catch (error) {
    // Network failure, DNS, timeout, invalid JSON — all handled identically.
    return null
  }
}
