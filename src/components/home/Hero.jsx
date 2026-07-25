import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'
import { CityMap } from '@/components/home/CityMap'

// Home hero: stylised city map with a floating card over it.

export function Hero() {
  // The address form is the entry point to the send flow. It renders only once
  // that flow exists.
  const sendIsLive = ROUTES.send.live

  return (
    <section className="relative isolate overflow-hidden bg-[#eceee8]">
      <CityMap className="absolute inset-0 -z-10 h-full w-full" />

      {/* The design fixes the hero at 520px and positions the card absolutely
          over it. Here the card is in normal flow and the map sits behind, so
          the section grows with its content on narrow screens instead of the
          card overflowing a fixed-height box. */}
      <div className="mx-auto flex max-w-[1200px] items-center px-8 py-14 lg:min-h-[520px] lg:py-16">
        <div className="w-full max-w-[520px] rounded-[18px] bg-white p-7 shadow-[0_24px_60px_rgba(23,19,28,0.18)]">
          <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#17131c] sm:text-[30px]">
            Send anything across Toronto
          </h1>
          <p className="mt-1.5 text-[15px] leading-[1.5] text-[#5f5868]">
            Same-day courier for clinics, law firms, and everyone else. See your
            price before you book.
          </p>

          {sendIsLive ? (
            /* PHASE 1 (send flow) — SCAFFOLDING, NOT YET WIRED.
             *
             * These inputs have no state, no validation, no geocoding and no
             * submit handler. Flipping ROUTES.send.live to true is NOT on its
             * own sufficient to ship this: a form that accepts an address and
             * does nothing with it is worse than no form, because the customer
             * believes they have started a booking. Wire it to the send flow —
             * address autocomplete, quote request, and a real submit — in the
             * same change that flips the flag. */
            <div className="mt-[22px]">
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#e3dfe8] px-4 py-3.5 focus-within:border-brand-600">
                  <span className="h-[11px] w-[11px] flex-none rounded-full border-[2.5px] border-brand-600" />
                  <input
                    placeholder="Pickup address"
                    className="w-full border-none bg-transparent p-0 text-[16px] text-[#17131c] placeholder:text-[#8d8695] focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#e3dfe8] px-4 py-3.5 focus-within:border-brand-600">
                  <span className="h-[11px] w-[11px] flex-none bg-brand-600" />
                  <input
                    placeholder="Dropoff address"
                    className="w-full border-none bg-transparent p-0 text-[16px] text-[#17131c] placeholder:text-[#8d8695] focus:outline-none focus:ring-0"
                  />
                </label>
              </div>

              <div className="mt-[18px] flex items-center gap-[18px]">
                <Link
                  href={ROUTES.send.href}
                  className="flex-1 rounded-xl bg-brand-600 px-5 py-4 text-center text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
                >
                  See price
                </Link>
                <PriceFrom />
              </div>
            </div>
          ) : (
            <div className="mt-[22px] flex items-center gap-[18px]">
              <Link
                href="/contact-us"
                className="flex-1 rounded-xl bg-brand-600 px-5 py-4 text-center text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
              >
                Get in touch
              </Link>
              <PriceFrom />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function PriceFrom() {
  return (
    <div className="text-right leading-[1.2]">
      <div className="text-[12px] font-semibold text-[#8d8695]">from</div>
      <div className="text-[22px] font-extrabold tracking-[-0.02em] text-[#17131c]">
        $8.00
      </div>
    </div>
  )
}
