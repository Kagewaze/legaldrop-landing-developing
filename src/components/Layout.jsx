import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'

// SKIP LINK. The first focusable element in the document, so a keyboard or
// screen-reader user can jump the header and its nav in one tab.
//
// Visually hidden until focused rather than permanently hidden: `sr-only`
// removes it from the visual flow, and the `focus:` overrides put it back as a
// real, styled control at the top-left. It is NOT `display:none` — that would
// take it out of the focus order entirely, which defeats the purpose.
//
// Styled in the design system when visible: brand-600 ground, white text,
// rounded-control.
//
// RING COLOURS FOLLOW THE HEADER, NOT THE PAGE. When focused this link paints
// at the top-left of the viewport, which puts it OVER the purple header bar —
// so it takes the header's inverted recipe (white ring, brand-600 offset)
// rather than the light-ground one. A brand-600 ring here would sit on
// brand-600 and disappear.
const SKIP_LINK =
  'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 ' +
  'focus:rounded-control focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-base ' +
  'focus:font-semibold focus:text-white focus:outline-none focus:ring-2 ' +
  'focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600'

export function Layout({ children }) {
  return (
    <>
      {/* `focus:`, not `focus-visible:` — this control exists only for keyboard
          users and must appear whenever it receives focus, including the
          programmatic focus some assistive technologies apply. */}
      <a href="#main-content" className={SKIP_LINK}>
        Skip to main content
      </a>
      <Header />
      {/* tabIndex={-1} makes the landmark programmatically focusable so the
          skip link moves focus here, not merely the scroll position. Without
          it some browsers scroll but leave focus stranded in the header. */}
      <main id="main-content" tabIndex={-1} className="flex-auto focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  )
}
