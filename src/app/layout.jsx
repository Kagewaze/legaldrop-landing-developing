import { Inter, Manrope } from 'next/font/google'
import clsx from 'clsx'

import { BRAND } from '@/lib/config'
import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Display face for headings and 30px band titles. Body copy stays Inter.
//
// Self-hosted by next/font at build time — no request to fonts.gstatic.com at
// runtime, so no third-party connection on the critical path. The latin subset
// is a 24.3 kB variable woff2 carrying the whole 200..800 axis.
//
// NARROWING THE WEIGHT RANGE SAVES NOTHING. Google serves the identical file
// for wght@600..800 as for the full axis — a variable font carries its axis
// inside the binary, and the range in the request only narrows the declared
// font-weight descriptor. Do not add a `weight` option here expecting a
// smaller download; there isn't one.
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

// Site-wide metadata. Composed from BRAND so the wordmark in the tab tracks the
// same constant as the one on the page.
//
// THE %s IS LOAD-BEARING. Next.js substitutes a child segment's title into it;
// a template without %s does not fall back to the child title, it REPLACES it.
// This template read ' - LegalDrop' for exactly that reason and every page
// under /send rendered a tab title of literally " - LegalDrop", silently
// discarding the title that segment had set. If you edit this string, keep the
// placeholder.
//
// Consequently a child segment sets only its own part of the title
// ('Send a package'), never the brand — the template appends that. A segment
// that needs to opt out entirely uses `title: { absolute: '...' }`.
// ⚠️ PHASE 9 — THE DESCRIPTION SELF-DESCRIBED AS A COURIER. It read:
//
//   "Same-day courier and delivery across Toronto and the GTA — with more
//    cities coming soon. See your price before you book."
//
// This string is emitted into <head> on EVERY route, so it is the copy that
// appears in search results, link previews and bookmarks — for many visitors it
// is read BEFORE the page it describes. It survived Phases 0-8 because every
// claim sweep so far read rendered body text; nothing looked in <head>.
//
// Two separate defects, both verified against the served HTML on all six public
// routes:
//
//   "Same-day courier"   Content gate C1 (HOMEPAGE.md) — "the page never
//                        self-describes as a courier or delivery service" — and
//                        VISION.md's unconditional "never let Druppr be
//                        described, internally or externally, as a courier".
//                        /medical gave the phrase up in its own <title> back in
//                        Phase 5 and accepted the SEO cost; the site-wide
//                        description was still carrying it.
//   "more cities         An unsupported forward-looking claim. No second city is
//    coming soon"        evidenced anywhere in this repository, and Phase 0 (D7)
//                        rules out "coming soon" framing.
//
// The replacement is not new copy: it is the h1 and the subheadline from
// HeroNetwork.jsx, both already vetted in Phase 2, so the description and the
// page it describes now make the same claim in the same words.
//
// "See your price before you book" was dropped rather than kept. It is true —
// /send quotes before payment — but it is the consumer price/speed register
// that HOMEPAGE.md keeps out of the brand voice, and a description is brand
// voice.
//
// STILL NOT WIRED to SERVICE_AREA in src/lib/navigation.js, which is flagged
// there. The area is spelled longhand here because SERVICE_AREA is a sentence
// ("Now serving Toronto and the GTA"), not a fragment that drops into this one.
// ⚠️ PHASE 9.1 — THE DEFAULT TITLE CHANGED. It read:
//
//   "Druppr - Your city's same-day delivery network"
//
// Founder-approved replacement, Gate 6. Two problems with the old wording, and
// neither was a content-gate violation — this is a positioning decision that was
// escalated rather than made in engineering:
//
//   "your city"          The service area is specifically Toronto and the GTA.
//                        A vague geography is a liability, not a growth story
//                        (HOMEPAGE.md -> Hero Philosophy); naming the real
//                        market and widening it later is a happy edit.
//   "delivery network"   Permitted, and inside the five-second test's accepted
//                        answers — but it was the last place the brand described
//                        itself in delivery rather than platform terms.
//
// The replacement is the h1 from HeroNetwork.jsx and the opening of the
// description below, so the browser tab, the search result and the page now all
// say the same thing in the same words.
//
// ONLY THE DEFAULT CHANGED. The template is untouched, so /medical, /legal and
// /send keep their own segment titles. This default is what /, /contact-us,
// /privacy-policy and the tracking routes render.
//
// THE %s IS STILL LOAD-BEARING — see the note below.
export const metadata = {
  title: {
    template: `%s - ${BRAND.name}`,
    default: `${BRAND.name} - Same-day logistics infrastructure for the GTA`,
  },
  description:
    'Same-day logistics infrastructure for Toronto and the GTA. Specimens, filings, business deliveries and parcels — dispatched, tracked and recorded on one platform.',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={clsx(
        'bg-surface-page antialiased',
        inter.variable,
        manrope.variable,
      )}
    >
      <body>{children}</body>
    </html>
  )
}
