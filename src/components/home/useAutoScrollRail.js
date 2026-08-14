'use client'

import { useEffect, useRef } from 'react'

// AUTOPLAY THAT THE USER CAN GRAB.
//
// ⚠️ WHY THIS REPLACED THE CSS MARQUEE, AND WHY IT MUST NOT GO BACK.
//
// The review track used to be a `transform: translateX()` keyframe animation on
// a `w-max` list inside `overflow-hidden`. That construction CANNOT be swiped —
// not "was not wired up", cannot. The animation moves a transform; a finger, a
// trackpad and a wheel move scroll offset. They are two different coordinate
// systems on two different elements, so a gesture had nothing to take hold of,
// and any attempt to drive both at once makes them fight: the transform keeps
// replaying its own timeline underneath whatever the user just did.
//
// So autoplay and the user now write to THE SAME NUMBER: `scrollLeft` on a real
// overflow container. Autoplay is a rAF loop nudging that number; a swipe,
// a two-finger trackpad push, shift+wheel and the arrow keys all change the same
// number natively. Handing control over is therefore not a handoff at all —
// there is only one position, and whoever moved it last owns it. Resuming is
// just the loop continuing from wherever the number now is, which is why it
// never snaps back, never restarts at card one, and never jumps a phase.
//
// ── PARAMETERS ──────────────────────────────────────────────────────────────
//   speed      px/second. NEGATIVE scrolls toward 0, i.e. content travels
//              left→right. Positive scrolls content right→left.
//   paused     external stop (the Reviews pause button). Manual scrolling stays
//              fully available while paused — pausing stops the loop, it does
//              not lock the rail.
//   enabled    false disables autoplay entirely (too few items to loop).
//
// ── THE LOOP SEAM ───────────────────────────────────────────────────────────
// The caller renders the item set TWICE. Half the scroll width is therefore one
// full set, and the two halves are pixel-identical, so subtracting or adding
// one half-width puts the rail on a visually identical frame. That reposition is
// what makes the loop endless, and it is invisible precisely because it lands on
// the same picture. It wraps in BOTH directions so a user who swipes backwards
// past the start does not hit a dead end either.
const RESUME_DELAY_MS = 1100

export function useAutoScrollRail({ speed, paused = false, enabled = true }) {
  const ref = useRef(null)
  // Live values the rAF loop reads, so changing `paused` never restarts the
  // loop and never loses sub-pixel position.
  const pausedRef = useRef(paused)
  const idleUntilRef = useRef(0)
  // True sub-pixel scroll position; see the note in the frame loop.
  const posRef = useRef(null)

  pausedRef.current = paused

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    // E6 hard floor: no automatic movement at all under reduced motion. The
    // rail stays a normal scroll container, so every item is still reachable —
    // motion is removed, content is not.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return

    // A gesture is any real input on the rail. `scroll` is deliberately NOT in
    // this list: the loop writes scrollLeft every frame and would therefore
    // read its own writes as user input and permanently yield to itself.
    const yieldToUser = () => {
      idleUntilRef.current = performance.now() + RESUME_DELAY_MS
    }
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown']
    events.forEach((e) =>
      el.addEventListener(e, yieldToUser, { passive: true }),
    )

    let raf = 0
    let last = performance.now()

    const frame = (now) => {
      const dt = Math.min(now - last, 64) // clamp: a backgrounded tab must not
      last = now //                          resume by leaping a huge delta
      const half = el.scrollWidth / 2

      if (
        half > 0 &&
        !pausedRef.current &&
        now >= idleUntilRef.current &&
        document.visibilityState === 'visible'
      ) {
        // ⚠️ THE POSITION IS ACCUMULATED HERE, NOT READ BACK OFF THE ELEMENT.
        //
        // This looks like a pointless extra variable and it is the opposite.
        // `scrollLeft` ROUNDS TO WHOLE PIXELS on a scroll container, so
        // `el.scrollLeft = el.scrollLeft + 0.57` reads back as +1, and the
        // 0.43 remainder is gone. Do that every frame and the rail advances
        // exactly one pixel per FRAME instead of per unit of time — measured
        // at 60 px/s on a 60Hz display against a requested 34, and it would
        // have run at 120 px/s on a 120Hz screen.
        //
        // Keeping the true position in a float and writing it out each frame
        // makes the speed frame-rate independent, which is the whole point of
        // multiplying by dt.
        if (posRef.current === null) posRef.current = el.scrollLeft

        // The user (or a native fling) moved it: adopt their position and carry
        // on from there. The tolerance is above the ±0.5 that rounding alone
        // can produce, so ordinary rounding never reads as a gesture.
        if (Math.abs(el.scrollLeft - posRef.current) > 1.5) {
          posRef.current = el.scrollLeft
        }

        let next = posRef.current + (speed * dt) / 1000
        if (next >= half) next -= half
        else if (next <= 0) next += half
        posRef.current = next
        el.scrollLeft = next
      }

      raf = requestAnimationFrame(frame)
    }

    // Travelling toward 0 needs somewhere to travel FROM, so start on the
    // second copy. Visually identical to starting at 0.
    if (speed < 0) el.scrollLeft = el.scrollWidth / 2
    posRef.current = el.scrollLeft

    // Skip the accumulated delta from time spent hidden.
    const onVisible = () => {
      last = performance.now()
    }
    document.addEventListener('visibilitychange', onVisible)

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisible)
      events.forEach((e) => el.removeEventListener(e, yieldToUser))
    }
  }, [speed, enabled])

  return ref
}
