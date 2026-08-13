'use client'

import { useState } from 'react'

// Motion boundary for the Google review track. Replaces SocialProofMotion.
//
// ⚠️ WHY THIS IS NO LONGER A SHARED SOCIAL-PROOF WRAPPER.
//
// It used to own ONE pause boolean governing both the review track and the
// partner strip, because a second island would have breached the approved
// homepage ceiling. That coupling is gone for a better reason than budget: the
// partner strip no longer moves at all. It is a manually scrolled rail now, so
// there is nothing there to pause, and a control that claimed to govern it
// would be lying about what it does.
//
// The island count is unchanged — this component replaces the old one rather
// than joining it.
//
// ⚠️ REVIEWS ARE NOT IN THIS COMPONENT. They arrive as `children`, already
// rendered by the server component that owns the Google response, so the review
// payload stays out of the client bundle. Do not pass data in here.
//
// Everything else is CSS in src/styles/tailwind.css:
//
//   direction        reviews travel left-to-right
//   running/paused   `animation-play-state`, driven by [data-paused] here and
//                    by :hover / :focus-within in the stylesheet
//   reduced motion   a media query that removes the animation entirely
//   no JavaScript    a <noscript> rule doing the same, so the track is static
//                    and readable and this button is hidden rather than inert
//
// EXPLICIT PAUSE OUTRANKS HOVER AND FOCUS. Those pause only while the pointer or
// focus is inside the track; this button's state persists until pressed again.
export function ReviewsMotion({ children }) {
  const [paused, setPaused] = useState(false)

  return (
    <div data-reviews-motion data-paused={paused ? 'true' : 'false'}>
      {/* Rendered BEFORE the track so a keyboard user reaches the control
          before entering a moving region, not after traversing it.

          The container classes are repeated because the track is full-bleed —
          it runs to the viewport edges, which is what makes it read as a
          continuous strip. The control must not follow it out there. */}
      <div
        className="mx-auto mb-4 flex max-w-[1200px] justify-end px-8"
        data-reviews-motion-control
      >
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border-[1.5px] border-[#e3dfe8] px-4 py-2 text-sm font-semibold text-[#17131c] transition-colors hover:border-[#17131c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {/* Both glyphs are decorative — the state is carried by the visible
              WORD beside them and by aria-pressed, never by the icon alone. */}
          <span aria-hidden="true" className="text-xs">
            {paused ? '▶' : '❙❙'}
          </span>
          {paused ? 'Resume motion' : 'Pause motion'}
          {/* Names exactly what this governs. It no longer needs a caller-
              supplied label, because it governs one thing and always the same
              thing. */}
          <span className="sr-only"> for customer reviews</span>
        </button>
      </div>

      {children}
    </div>
  )
}
