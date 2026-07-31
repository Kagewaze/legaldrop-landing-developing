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
export const metadata = {
  title: {
    template: `%s - ${BRAND.name}`,
    default: `${BRAND.name} - Your city's same-day delivery network`,
  },
  description:
    'Same-day courier and delivery across Toronto and the GTA — with more cities coming soon. See your price before you book.',
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
