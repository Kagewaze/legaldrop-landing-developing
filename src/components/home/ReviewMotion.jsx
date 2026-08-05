'use client'

import { useState } from 'react'

// The ONLY client code Phase 8 adds. It owns one boolean — whether the visitor
// has explicitly paused the review track — and renders the button that toggles
// it plus the wrapper that carries the state as a data attribute.
//
// ⚠️ THE REVIEW CARDS ARE NOT IN THIS COMPONENT. They arrive as `children`,
// already rendered by the server component that owns the Google data, so they
// stay out of the client bundle entirely. This wrapper is a few hundred bytes;
// the reviews are not.
//
// Everything else about the motion is CSS:
//
//   running / paused   `animation-play-state`, driven by [data-paused] here and
//                      by :hover and :focus-within in globals.css
//   reduced motion     a media query that removes the animation entirely
//   no JavaScript      a <noscript> rule that does the same, so the track is
//                      static and readable and this button is hidden rather
//                      than left inert
//
// EXPLICIT PAUSE OUTRANKS HOVER. Hover and focus pause the track while the
// pointer or focus is inside it and resume on leave; the button's state
// persists until the visitor presses it again. That ordering is required —
// otherwise moving the mouse away would silently restart motion the visitor had
// deliberately stopped.
export function ReviewMotion({ children, label }) {
  const [paused, setPaused] = useState(false)

  return (
    <div className="mt-6" data-review-motion data-paused={paused ? 'true' : 'false'}>
      {/* Rendered before the track so a keyboard user reaches the control
          BEFORE entering the moving region, not after traversing it.

          The container classes are repeated here because the TRACK is
          full-bleed — it runs to the viewport edges, which is what makes it
          read as a continuous strip. The control must not follow it out there:
          without this it right-aligned to the viewport edge instead of to the
          heading above it. */}
      <div
        className="mx-auto mb-4 flex max-w-[1200px] justify-end px-8"
        data-review-motion-control
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
          <span className="sr-only"> for {label}</span>
        </button>
      </div>

      {children}
    </div>
  )
}
