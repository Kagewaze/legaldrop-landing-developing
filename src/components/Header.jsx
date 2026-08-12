import Link from 'next/link'
import clsx from 'clsx'

import { BRAND } from '@/lib/config'
import { NAV_LINKS, NAV_CTA } from '@/lib/navigation'
import { HeaderMobileNav } from '@/components/HeaderMobileNav'

// Druppr site header. Rendered on every route.
//
// Server component. The mobile disclosure is the only stateful part and lives
// behind its own 'use client' boundary in HeaderMobileNav.jsx.
//
// COLOUR: surface.page ground with graphite type, and brand-600 on exactly ONE
// element — the CTA pill. docs/HOMEPAGE.md reserves the accent for the one or
// two moments per page that deserve emphasis; in the chrome, that is the CTA.
// Do not repaint the bar or add a second purple element here.
//
// A hairline bottom border, not a shadow: the header shares surface.page with
// the homepage hero, so a shadow would draw a seam where there is meant to be
// none.

// Both variants are semibold: nav is nav, and weight is not what should carry
// the active state — the 2px underline does that on its own. The design's
// LINK/ACTIVE pair used 600/700, but a one-step weight change between adjacent
// nav items reads as a rendering inconsistency rather than as emphasis.
const NAV_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page'

// HIT AREA WITHOUT LAYOUT CHANGE. The nav links render at 26px tall, which
// clears WCAG 2.5.8 Target Size (Minimum, AA — 24x24) but not the 44x44 comfort
// target from platform guidance. The `after` overlay is a transparent 44px-tall
// box centred on the link: it enlarges what a finger or pointer can hit without
// moving the text or the active underline by a pixel.
//
// Padding was the obvious alternative and was rejected: the active state hangs a
// border under the text, so any vertical padding drags the underline away from
// the word it belongs to. The gap between nav items is 32px (gap-8), so the 4px
// horizontal bleed below cannot overlap a neighbouring target.
const NAV_HIT_AREA =
  "relative after:absolute after:-left-1 after:-right-1 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"

// Active state is never colour alone: the 2px rule is present regardless, and
// aria-current carries it for assistive technology.
const NAV_LINK = `text-base font-semibold text-[#17131c] transition-colors hover:text-brand-700 ${NAV_HIT_AREA} ${NAV_FOCUS}`
const NAV_LINK_ACTIVE = `text-base font-semibold text-[#17131c] border-b-2 border-brand-600 pb-[2px] ${NAV_HIT_AREA} ${NAV_FOCUS}`

export function Header({ active }) {
  // Only shippable destinations render. Everything else is defined in
  // src/lib/navigation.js with live: false and skipped here — see that file.
  const links = NAV_LINKS.filter((link) => link.live)
  const cta = NAV_CTA.live ? NAV_CTA : null

  return (
    // `relative` anchors the mobile sheet, which positions itself against this
    // element so it spans the full viewport width under the bar.
    //
    // bg-surface-page, NOT bg-white — the homepage hero shares this ground, and
    // pure white would read as a distinct band again.
    <header className="relative border-b border-[#eeebf1] bg-surface-page text-[#17131c]">
      <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-5 px-8">
        <Link
          href="/"
          className={`text-2xl font-bold text-[#17131c] ${NAV_HIT_AREA} ${NAV_FOCUS}`}
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
                // White on brand-600 is 7.02:1. Hover uses brand-700 from the
                // ramp — no arbitrary shades.
                className={`rounded-full bg-brand-600 px-[22px] py-[10px] text-base font-semibold text-white transition-colors hover:bg-brand-700 ${NAV_FOCUS}`}
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
