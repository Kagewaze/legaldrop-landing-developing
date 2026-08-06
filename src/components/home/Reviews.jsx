// Google Business Profile reviews. SERVER COMPONENT — the Google data never
// crosses into the client bundle. Phase 8 added motion around this content, not
// inside it.
//
// ⚠️ PHASE 10 MOVED THE MOTION WRAPPER OUT OF THIS FILE. It used to render
// <ReviewMotion> around its own track. The wrapper is now SocialProofMotion,
// mounted ONCE at page level around both this section and the partner strip,
// because the approved island ceiling is 3 (or 4 with that wrapper) and a
// second, partner-only island would have been a fifth.
//
// The consequence for this file: it renders the track and the `data-review-
// track` hook, and nothing about pausing. The <noscript> suppression moved to
// page level too, since one block now covers both tracks and the shared
// control. This section no longer knows whether it is moving — the band decides
// that from the review count, using the same MOTION_MIN_REVIEWS below.
//
// Everything here renders from the API response. The design's "4.9",
// "Sarah A.", "Michael K." and their quotes were placeholders and are not in
// this file — inventing a rating or a testimonial is fabricating a customer.
//
// The caller renders this only when data is non-null and totalCount > 0, so
// there is no empty state below by design.
//
// ── MOTION THRESHOLD ────────────────────────────────────────────────────────
//
// A seamless loop needs the source set to be WIDER THAN THE VIEWPORT, otherwise
// the duplicate that makes the loop seamless is on screen at the same time as
// the original and a visitor simply sees the same reviews twice, side by side.
//
// Measured against the widest layout this page has, a 1200px content column:
//
//   3 cards × 380px (card + gap) = 1,140px  <  1,200px   duplicate visible
//   4 cards × 380px              = 1,520px  >  1,200px   loop reads as one strip
//
// So FOUR is the floor, and below it the original static grid renders unchanged.
// Google's Places API returns at most five reviews, so in practice this is the
// difference between a four/five-review track and a one-to-three-review grid.
// It is not a preference — with three the repetition is simply visible.
const MOTION_MIN_REVIEWS = 4

// Exported so the band can decide whether to mount the shared motion wrapper
// and render a pause control, WITHOUT duplicating the threshold at the call
// site. One definition, two readers — the section and the band can never
// disagree about whether this section is moving.
export function reviewsWillMove(data) {
  return Boolean(data) && Array.isArray(data.reviews) && data.reviews.length >= MOTION_MIN_REVIEWS
}

// Track geometry. The card width is fixed in the track (the grid keeps its
// fluid columns) because a seamless loop needs a predictable total width.
const CARD_W = 340
const GAP = 20

// Reading speed, in pixels per second. 34px/s moves a 340px card past a fixed
// point in ten seconds — slow enough to read a sentence of a review without
// tracking it, which is the whole point of the movement being subordinate to
// the content. The duration below is DERIVED from this and the card count, so
// four reviews and five reviews travel at the same speed rather than the same
// duration.
const PIXELS_PER_SECOND = 34

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

// One review card. `clamp` bounds the body inside the track; the grid leaves it
// unbounded exactly as it has always been.
//
// ⚠️ TRUNCATION RULE, AND WHY IT IS CSS. src/lib/google-reviews.js records that
// reviews pass through verbatim — no filtering, no reordering, NO EDITING OR
// TRUNCATING THE TEXT — because a hand-picked or trimmed presentation
// misrepresents the rating and breaks Google's terms.
//
// So the string is never cut. `line-clamp` bounds the VISUAL box only: the full
// verbatim text stays in the DOM, is read in full by a screen reader, and is
// selectable and copyable. The clamp adds the ellipsis that signals there is
// more, and the "See all reviews" link above goes to the source. Nothing here
// shortens a review; it bounds a box.
function ReviewCard({ review, clamp = false }) {
  return (
    <article
      className={`flex flex-col rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised p-6 shadow-card ${
        clamp ? 'h-full' : ''
      }`}
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

      {/* Verbatim in the DOM. See the truncation note above. */}
      {review.text && (
        <p
          className={`mt-4 text-base text-[#433d4b] ${
            clamp ? 'line-clamp-5' : ''
          }`}
        >
          {review.text}
        </p>
      )}

      {review.relativeTime && (
        <p className="mt-3 text-sm text-[#5f5868]">{review.relativeTime}</p>
      )}
    </article>
  )
}

export function Reviews({ data }) {
  const { rating, totalCount, reviews, sourceUrl } = data
  const animated = reviews.length >= MOTION_MIN_REVIEWS

  // One set's width, then the seconds needed to travel it at the reading speed
  // above. The animation moves by exactly one set per cycle, so this is the
  // cycle length.
  const setWidth = reviews.length * (CARD_W + GAP)
  const duration = Math.round(setWidth / PIXELS_PER_SECOND)

  const header = (
    <div className="flex flex-wrap items-baseline justify-between gap-6">
      <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
        Rated {rating.toFixed(1)} on Google
      </h2>
      {/* RENDERED ONLY WHEN THE RESPONSE YIELDED A VERIFIED DESTINATION.
          src/lib/google-reviews.js returns sourceUrl: null rather than guessing
          a URL, and this is the half of that contract that matters — the
          reviews stay on the page and simply lose their outbound link. The
          header is a flex row, so its absence leaves the heading in place with
          no gap and no layout change.

          "View reviews on Google", not "See all reviews". Every documented
          Maps URL lands on the place, and which tab is foregrounded varies by
          platform and by whether the app takes the hand-off — so promising the
          reviews tab was a promise the link could not keep. The new label
          names the destination instead of the tab.

          aria-label OPENS WITH THE VISIBLE STRING. WCAG 2.5.3 (Label in Name)
          requires the accessible name to contain the visible text, so voice
          control can still act on what is on screen; the suffix only adds the
          new-tab warning that target="_blank" otherwise gives with no notice.

          rel="noopener noreferrer" — noopener severs window.opener on the
          destination, noreferrer withholds the referrer. It was previously
          noreferrer alone. */}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View reviews on Google (opens in a new tab)"
          className="rounded-control text-base font-semibold text-brand-600 transition-colors hover:text-[#5d1f96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
        >
          View reviews on Google
        </a>
      )}
    </div>
  )

  // Attribution is required and must stay visible. It also sets an honest
  // expectation: this is not a curated wall of the best reviews — the API
  // returns up to five and Google decides which, with no way to configure the
  // selection.
  const attribution = (
    <p className="mt-3.5 text-sm text-[#5f5868]">
      Reviews from Google, based on {totalCount}{' '}
      {totalCount === 1 ? 'review' : 'reviews'}. Google selects which reviews are
      shown.
    </p>
  )

  // ── UNDER THE THRESHOLD: the original static grid, unchanged ──────────────
  if (!animated) {
    return (
      <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
        {header}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {reviews.map((review, index) => (
            <ReviewCard key={`${review.authorName}-${index}`} review={review} />
          ))}
        </div>
        {attribution}
      </section>
    )
  }

  const cards = reviews.map((review, index) => (
    <li
      key={`${review.authorName}-${index}`}
      className="w-[340px] flex-none"
      style={{ width: CARD_W }}
    >
      <ReviewCard review={review} clamp />
    </li>
  ))

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-8">{header}</div>

      {/* Full-bleed so the track runs to the viewport edges rather than
          stopping inside the 1200px column, which is what makes it read as a
          continuous strip rather than a box of sliding cards. overflow-hidden
          is what keeps the off-screen half from widening the page. */}
      <div className="overflow-hidden">
        <ul
          data-review-track
          style={{
            '--review-duration': `${duration}s`,
            gap: GAP,
          }}
          className="flex w-max list-none px-8"
        >
          {cards}

          {/* THE SEAMLESS HALF.
              aria-hidden, so assistive technology reads each review exactly
              once. Every descendant is inert to the keyboard too — the cards
              contain no links, so there is nothing to remove from the tab
              order, and `inert` is not needed to achieve it. Keys are
              namespaced so no React key or DOM id is duplicated. */}
          <li aria-hidden="true" data-review-duplicate className="contents">
            <ul className="flex list-none" style={{ gap: GAP }}>
              {reviews.map((review, index) => (
                <li
                  key={`dup-${review.authorName}-${index}`}
                  className="flex-none"
                  style={{ width: CARD_W }}
                >
                  <ReviewCard review={review} clamp />
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

      <div className="mx-auto max-w-[1200px] px-8">{attribution}</div>
    </section>
  )
}
