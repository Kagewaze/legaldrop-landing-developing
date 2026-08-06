'use client'

import { useState } from 'react'

// The ONLY client code in the social-proof band, and the Phase 10 replacement
// for Phase 8's ReviewMotion.
//
// ⚠️ WHY ONE WRAPPER FOR TWO BANDS, RATHER THAN ONE PER BAND.
//
// Phase 9.1 fixed the approved homepage ceiling at THREE client islands, or
// FOUR while this wrapper renders. The other three are HeaderMobileNav,
// NetworkDemo and HeroAddressEntry. An independent PartnerMotion island would
// have been a fifth, and the ceiling is a count of approved islands rather than
// headroom to spend — so the reviews-only wrapper was widened into a
// social-proof wrapper instead of being copied.
//
// It therefore owns ONE pause boolean governing BOTH tracks, and renders ONE
// control. The CSS selector is the band, not the section:
//
//   [data-social-motion][data-paused='true'] [data-review-track],
//   [data-social-motion][data-paused='true'] [data-partner-track]
//
// ⚠️ NEITHER REVIEWS NOR PARTNERS ARE IN THIS COMPONENT. Both arrive as
// `children`, already rendered by the server components that own the data, so
// the Google response and the partner records stay out of the client bundle
// entirely. This file is a few hundred bytes; the content is not. If you are
// tempted to pass data in here to "simplify" it, that is the thing not to do.
//
// Everything else about the motion is CSS in src/styles/tailwind.css:
//
//   direction        reviews left-to-right, partners right-to-left
//   running/paused   `animation-play-state`, driven by [data-paused] here and
//                    by per-track :hover and :focus-within in the stylesheet
//   reduced motion   a media query that removes both animations entirely
//   no JavaScript    a <noscript> rule doing the same, so the tracks are static
//                    and readable and this button is hidden rather than left
//                    inert
//
// EXPLICIT PAUSE OUTRANKS HOVER AND FOCUS. Those pause only while the pointer or
// focus is inside a track; this button's state persists until pressed again.
// That ordering is required — otherwise moving the mouse away would silently
// restart motion the visitor had deliberately stopped.
export function SocialProofMotion({ children, label }) {
  const [paused, setPaused] = useState(false)

  return (
    <div data-social-motion data-paused={paused ? 'true' : 'false'}>
      {/* Rendered BEFORE the tracks so a keyboard user reaches the control
          before entering a moving region, not after traversing it.

          The container classes are repeated here because the tracks are
          full-bleed — they run to the viewport edges, which is what makes them
          read as continuous strips. The control must not follow them out
          there: without this it right-aligns to the viewport edge instead of to
          the content column everything else on the page uses. */}
      <div
        className="mx-auto mb-4 flex max-w-[1200px] justify-end px-8"
        data-social-motion-control
      >
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border-[1.5px] border-[#e3dfe8] px-4 py-2 text-sm font-semibold text-[#17131c] transition-colors hover:border-[#17131c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {/* Two glyphs, both decorative — the state is carried by the visible
              WORD beside them and by aria-pressed, never by the icon alone. */}
          <span aria-hidden="true" className="text-xs">
            {paused ? '▶' : '❙❙'}
          </span>
          {paused ? 'Resume motion' : 'Pause motion'}
          {/* Names what the control governs, which is now more than one band.
              The caller composes this from whatever is actually moving, so the
              accessible name never promises to pause something that is static. */}
          <span className="sr-only"> for {label}</span>
        </button>
      </div>

      {children}
    </div>
  )
}
