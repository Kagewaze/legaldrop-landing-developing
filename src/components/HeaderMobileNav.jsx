'use client'

import Link from 'next/link'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

// The ONLY client component in the site chrome. Header.jsx and Footer.jsx stay
// server components; this exists purely so the 'use client' boundary wraps the
// disclosure state and nothing else.
//
// The design toggles the sheet with a window.innerWidth resize listener and a
// `mobile` state flag. That is not ported: measuring the viewport in JS to
// decide what to render causes a hydration mismatch (the server has no window)
// and a flash of the wrong layout. The breakpoint here is pure CSS —
// `md:hidden` on this component, `hidden md:flex` on the desktop nav — so both
// render correctly before any JS executes.

export function HeaderMobileNav({ links, cta }) {
  // Nothing shippable behind the burger yet — render no control at all rather
  // than a button that opens an empty sheet.
  if (links.length === 0 && !cta) {
    return null
  }

  return (
    // No `relative` here on purpose: the panel below is positioned against the
    // <header> (the nearest positioned ancestor), so the sheet spans the full
    // viewport width beneath the bar rather than hanging off the burger.
    <Popover className="md:hidden">
      <PopoverButton
        aria-label="Menu"
        className="flex cursor-pointer flex-col gap-[5px] p-[10px] ui-not-focus-visible:outline-none"
      >
        <span className="block h-[2px] w-5 rounded-[2px] bg-white" />
        <span className="block h-[2px] w-5 rounded-[2px] bg-white" />
        <span className="block h-[2px] w-5 rounded-[2px] bg-white" />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute inset-x-0 top-[68px] z-50 border-t border-white/20 bg-brand-600 transition duration-150 ease-out data-[closed]:-translate-y-2 data-[closed]:opacity-0"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-8 pb-[22px] pt-2">
          {links.map((link) => (
            <PopoverButton
              key={link.href}
              as={Link}
              href={link.href}
              className="border-b border-white/20 py-[14px] text-[17px] font-semibold text-white"
            >
              {link.label}
            </PopoverButton>
          ))}

          {cta && (
            <PopoverButton
              as={Link}
              href={cta.href}
              className="mt-[14px] rounded-[12px] bg-white py-[14px] text-center text-[16px] font-bold text-brand-600"
            >
              {cta.label}
            </PopoverButton>
          )}
        </div>
      </PopoverPanel>
    </Popover>
  )
}
