import { Inter } from 'next/font/google'
import clsx from 'clsx'

import { BRAND } from '@/lib/config'
import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
    <html lang="en" className={clsx('bg-gray-50 antialiased', inter.variable)}>
      <body>{children}</body>
    </html>
  )
}
