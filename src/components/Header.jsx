import Link from 'next/link'
import clsx from 'clsx'

import { BRAND } from '@/lib/config'
import { NAV_LINKS, NAV_CTA } from '@/lib/navigation'
import { HeaderMobileNav } from '@/components/HeaderMobileNav'

// Druppr site header, ported from design/DrupprNav.dc.html.
//
// Server component. The mobile disclosure is the only stateful part and lives
// behind its own 'use client' boundary in HeaderMobileNav.jsx.
//
// Colour: the bar is brand-600 (#7B2FBE), the token added in 2a4cc41. The two
// one-off pill hover shades below are design-specified values that have no
// entry in the brand scale, so they stay arbitrary — see the note on the CTA.

// Both variants are semibold: nav is nav, and weight is not what should carry
// the active state — the 2px underline does that on its own. The design's
// LINK/ACTIVE pair used 600/700, but a one-step weight change between adjacent
// nav items reads as a rendering inconsistency rather than as emphasis.
const NAV_LINK = 'text-base font-semibold text-white'
const NAV_LINK_ACTIVE =
  'text-base font-semibold text-white border-b-2 border-white pb-[2px]'

export function Header({ active }) {
  // Only shippable destinations render. Everything else is defined in
  // src/lib/navigation.js with live: false and skipped here — see that file.
  const links = NAV_LINKS.filter((link) => link.live)
  const cta = NAV_CTA.live ? NAV_CTA : null

  return (
    // `relative` anchors the mobile sheet, which positions itself against this
    // element so it spans the full viewport width under the bar.
    <header className="relative bg-brand-600 text-white">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-5 px-8">
        <Link
          href="/"
          className="text-2xl font-bold text-white"
        >
          {BRAND.name}
        </Link>

        {(links.length > 0 || cta) && (
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active === link.label ? 'page' : undefined}
                className={clsx(
                  active === link.label ? NAV_LINK_ACTIVE : NAV_LINK,
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* DELIBERATE DEVIATION: the design's pill reads "Sign in".
                Accounts do not exist and are not in scope for launch, so this
                is "Send a package" → /send instead. See NAV_CTA in
                src/lib/navigation.js for the full rationale. While /send is
                live: false, `cta` is null and nothing renders here. */}
            {cta && (
              <Link
                href={cta.href}
                className="rounded-full bg-white px-[22px] py-[10px] text-base font-semibold text-brand-600 transition-colors hover:bg-[#f2e9fa] hover:text-[#5d1f96]"
              >
                {cta.label}
              </Link>
            )}
          </nav>
        )}

        <HeaderMobileNav links={links} cta={cta} />
      </div>
    </header>
  )
}
