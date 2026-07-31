import Link from 'next/link'
import clsx from 'clsx'

import { BRAND } from '@/lib/config'
import {
  FOOTER_SECTIONS,
  LEGAL_ENTITY,
  SERVICE_AREA,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  formatPhone,
} from '@/lib/navigation'

// Druppr site footer, ported from design/DrupprFooter.dc.html.
//
// Server component — nothing here is interactive.
//
// COLOUR CONVENTION: brand-* tokens are used for the shared brand purple
// (#7B2FBE and its ramp). The dark footer palette below stays as arbitrary
// values, centralised in the constants here rather than repeated across ~20
// links. That is a deliberate choice: these shades appear in the footer and
// nowhere else across all 11 design files, so promoting them to global Tailwind
// tokens would imply a site-wide dark surface that does not exist. If a second
// dark surface ever ships, move them into theme.extend.colors then.
//
//   surface.ink  page   #a49bad  muted link    #2e2537  hairline
//   #c8c0d0  service     #8d8497  copyright     #e5dfea  contact (unused, null)
//
// The footer ground is now the shared surface.ink token rather than a local
// #1a1421 literal — same value, one definition. The remaining shades above are
// still footer-only and stay arbitrary.
//
// SECTION_HEADING is deliberately NOT font-display. These are <h2> elements,
// but they render at 14px, and a display face at micro-label size buys nothing
// and costs a second font on the critical path. The face follows the size, not
// the tag.

const SECTION_HEADING = 'text-sm font-semibold tracking-label text-white'
const FOOTER_LINK = 'text-sm text-[#a49bad] transition-colors hover:text-white'

export function Footer() {
  // Only shippable destinations render; a section whose every item is
  // live: false is dropped entirely rather than left as a bare heading.
  const sections = FOOTER_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.live),
  })).filter((section) => section.items.length > 0)

  // UNCONFIRMED placeholders — the block is skipped entirely while these are
  // null. See src/lib/navigation.js.
  const hasContact = Boolean(SUPPORT_PHONE || SUPPORT_EMAIL)

  // LEGAL_ENTITY is null until the registered company name is confirmed, so
  // fall back to the brand name — which claims no corporate form. Any terminal
  // period is stripped so the line below can always supply exactly one: both
  // 'LegalDrop' and a future 'Acme Inc.' render with a single closing period.
  const copyrightName = (LEGAL_ENTITY ?? BRAND.legalName).replace(/\.$/, '')

  return (
    <footer className="bg-surface-ink text-white">
      {sections.length > 0 && (
        // The design is a fixed 3-column grid with no mobile treatment. The
        // responsive steps are an addition, not a port — a fixed 3-up grid is
        // unreadable on a phone.
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-8 pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.id}>
              <h2 className={SECTION_HEADING}>{section.title}</h2>

              <div
                className={clsx(
                  'mt-4',
                  section.columns === 2
                    ? 'grid grid-cols-2 gap-x-6 gap-y-[10px]'
                    : 'flex flex-col gap-[10px]',
                )}
              >
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href} className={FOOTER_LINK}>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* leading-[1.8] below is retained deliberately — the sm token's
                  1.55 is body-copy leading, and this is a stacked contact block
                  of one-line items where the looser rhythm is what separates
                  them. Not a leftover. */}
              {section.id === 'support' && hasContact && (
                <div className="mt-[22px] text-sm leading-[1.8] text-[#e5dfea]">
                  {SUPPORT_PHONE && <div>{formatPhone(SUPPORT_PHONE)}</div>}
                  {SUPPORT_EMAIL && <div>{SUPPORT_EMAIL}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-[#2e2537]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5 px-8 py-[22px]">
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/"
              className="text-xl font-bold text-white"
            >
              {BRAND.name}
            </Link>
            <span className="flex items-center gap-[9px] text-sm text-[#c8c0d0]">
              <span
                aria-hidden
                className="h-[7px] w-[7px] rounded-full bg-[#b98ae0]"
              />
              {SERVICE_AREA}
            </span>
          </div>

          <div className="text-sm text-[#8d8497]">
            <div>
              &copy; {new Date().getFullYear()} {copyrightName}. All rights
              reserved.
            </div>
            {/* Deliberately literal, not composed from BRAND — it names both
                the new wordmark and the old one, and must not follow a future
                change to either constant. It is what makes the '© LegalDrop'
                line above read as continuity rather than as the wrong site.
                Muted footnote treatment: no weight, no colour, no emphasis. */}
            <div className="mt-1 text-xs">Druppr — formerly LegalDrop</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
