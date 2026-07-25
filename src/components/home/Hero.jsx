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
            /* The two "fields" below are STATIC — deliberately not inputs.
             *
             * Real address entry lives on /send, where the Places autocomplete,
             * the geocoded coordinates and the flow state all are. Putting a
             * working form here would mean a second copy of that component and
             * its state, plus carrying a half-entered address across a
             * navigation — for a form the customer reaches in one click anyway.
             *
             * So this is a preview of that form, not the form. The whole card
             * is a single link into /send. There is no <input> and nothing
             * focusable or typeable: a field that accepts text and then throws
             * it away is worse than no field, because the customer believes
             * they have already started their booking.
             *
             * If this ever needs to accept a real address, move the autocomplete
             * into a shared component — do not add an <input> back here. */
            <Link
              href={ROUTES.send.href}
              aria-label="Send a package — enter your pickup and dropoff addresses"
              className="group mt-[22px] block select-none"
            >
              <div className="flex flex-col gap-2.5" aria-hidden="true">
                <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#e3dfe8] px-4 py-3.5 transition-colors group-hover:border-[#d5cddd]">
                  <span className="h-[11px] w-[11px] flex-none rounded-full border-[2.5px] border-brand-600" />
                  <span className="text-[16px] text-[#8d8695]">
                    Pickup address
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#e3dfe8] px-4 py-3.5 transition-colors group-hover:border-[#d5cddd]">
                  <span className="h-[11px] w-[11px] flex-none bg-brand-600" />
                  <span className="text-[16px] text-[#8d8695]">
                    Dropoff address
                  </span>
                </div>
              </div>

              <div className="mt-[18px] flex items-center gap-[18px]">
                {/* A span, not a nested link — an <a> inside an <a> is invalid
                    and browsers will not nest the click targets predictably. */}
                <span className="flex-1 rounded-xl bg-brand-600 px-5 py-4 text-center text-[16px] font-bold text-white transition-colors group-hover:bg-brand-700">
                  See price
                </span>
                <PriceFrom />
              </div>
            </Link>
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
