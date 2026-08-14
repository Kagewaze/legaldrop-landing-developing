'use client'

import { useState } from 'react'

import { useAutoScrollRail } from '@/components/home/useAutoScrollRail'

// Motion boundary for the Google review track.
//
// ⚠️ THIS USED TO WRAP THE WHOLE SECTION AND ONLY TOGGLE A `data-paused`
// ATTRIBUTE, while a CSS keyframe moved a transform underneath it. It now OWNS
// the scroll container, because the pause button and the autoplay loop have to
// agree about one position and a CSS marquee could never be swiped at all.
// Read useAutoScrollRail.js before changing this.
//
// ⚠️ REVIEW CONTENT IS STILL NOT IN THE CLIENT BUNDLE. The cards arrive as
// `children`, already rendered by the server component that owns the Google
// response. Do not start passing review data in here.
//
// LEFT-TO-RIGHT, preserved from the approved production motion: a negative
// speed walks scrollLeft down toward 0, so the cards travel rightward.
//
// 34 px/s is the SAME pace production already runs, carried over deliberately
// rather than re-picked — it moves a 340px card past a fixed point in ten
// seconds, slow enough to read a sentence without tracking it. The partner rail
// runs at the same pixel speed so the page ends on one tempo rather than two.
const REVIEW_SPEED = -34 // px/s

export function ReviewsMotion({ children, canLoop = true }) {
  const [paused, setPaused] = useState(false)
  const railRef = useAutoScrollRail({
    speed: REVIEW_SPEED,
    paused,
    enabled: canLoop,
  })

  return (
    <>
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
          className="inline-flex min-h-11 items-center gap-2 rounded-control border-[1.5px] border-[#e3dfe8] px-4 py-2 text-sm font-semibold text-[#17131c] transition-colors motion-reduce:transition-none hover:border-[#17131c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {/* Both glyphs are decorative — the state is carried by the visible
              WORD beside them and by aria-pressed, never by the icon alone. */}
          <span aria-hidden="true" className="text-xs">
            {paused ? '▶' : '❙❙'}
          </span>
          {paused ? 'Resume motion' : 'Pause motion'}
          <span className="sr-only"> for customer reviews</span>
        </button>
      </div>

      {/* ⚠️ `overflow-x-auto`, NOT `overflow-hidden`. The hidden version is what
          made the old track unswipeable: with no scrollport there was nothing
          for a finger or a trackpad to move. Pausing stops the loop; it does
          NOT lock the rail, so a paused track can still be read by hand.

          No scroll-snap and no `scroll-smooth`, for the same reasons documented
          on the partner rail: both fight a per-frame scrollLeft write. */}
      <ul
        data-review-track
        ref={railRef}
        tabIndex={0}
        aria-label="Customer reviews"
        className="flex list-none gap-5 overflow-x-auto px-8 pb-2 [-webkit-overflow-scrolling:touch] [overscroll-behavior-inline:contain] [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      >
        {children}
      </ul>
    </>
  )
}
