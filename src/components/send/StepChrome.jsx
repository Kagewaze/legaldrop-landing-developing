'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// "STEP n OF 3" header. Step 3 (payment) does not exist yet, but the flow is
// three steps and telling someone they are on step 2 of 2 would be a lie about
// how much is left.
const TOTAL_STEPS = 3

// Longest paths first — '/send' prefixes every other route in the flow.
const STEPS = [
  { path: '/send/details', index: 2, label: 'Choose vehicle' },
  { path: '/send/pay', index: 3, label: 'Payment' },
  { path: '/send', index: 1, label: 'Addresses' },
]

export function StepChrome() {
  const pathname = usePathname()
  const step = STEPS.find((entry) => pathname.startsWith(entry.path))

  // ── Focus management for step changes ─────────────────────────────────────
  //
  // App Router does not move focus on a client-side navigation. Pressing
  // Continue replaced the entire page while document.activeElement stayed on
  // <body>, so a screen-reader or keyboard user got no signal the step had
  // changed and their next Tab restarted from the top of the document.
  //
  // This lives here rather than in the three step pages for two reasons: it is
  // one implementation instead of three, and it means /send/pay — the file that
  // charges cards — is never opened to add a11y plumbing.
  //
  // Focus lands on this heading, which names the step ("Step 2 of 3, Choose
  // vehicle"), so the move itself is the announcement. That is why there is no
  // aria-live region here: a live region saying the same words would announce
  // the step twice. Live regions in this flow are reserved for genuinely
  // asynchronous status — the distance probe on step 1, the address commit in
  // AddressAutocomplete.
  const headingRef = useRef(null)

  // Focus only on a CHANGE of step, never on first paint — stealing focus on
  // initial page load is disorienting and drags the caret away from wherever
  // the browser put it.
  //
  // This compares the pathname rather than counting effect runs, and that is
  // deliberate. A "skip the first run" boolean latch looks equivalent and is
  // not: StrictMode double-invokes effects in development, so the first run
  // sets the latch and the SECOND one sails past it and focuses — the exact
  // behaviour the latch existed to prevent, on every page load. Seeding this
  // ref with the current pathname makes the check idempotent, so a replayed
  // effect is a no-op whether it replays on mount or after a navigation.
  const lastStepPathRef = useRef(pathname)

  useEffect(() => {
    if (lastStepPathRef.current === pathname) {
      return
    }

    lastStepPathRef.current = pathname

    // preventScroll: the heading already sits at the top of the flow, and
    // letting the browser scroll to it fights the page's own position.
    headingRef.current?.focus({ preventScroll: true })
  }, [pathname])

  if (!step) {
    return null
  }

  return (
    <h2
      ref={headingRef}
      // tabIndex -1 makes this programmatically focusable without adding it to
      // the tab order — the standard target for a post-navigation focus move.
      tabIndex={-1}
      className="mb-3.5 flex flex-wrap items-baseline gap-3.5 focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f6f4f8]"
    >
      <span className="text-[13px] font-extrabold tracking-[0.12em] text-brand-600">
        STEP {step.index} OF {TOTAL_STEPS}
      </span>
      <span className="text-[15px] text-[#5f5868]">{step.label}</span>
    </h2>
  )
}
