import Image from 'next/image'
import Link from 'next/link'

import { ROUTES, SERVICE_AREA_PHRASE } from '@/lib/navigation'
import cyclist from '@/images/hero-cyclist.jpg'

// Home hero: a courier photograph with the booking card over it.
//
// The photograph replaced the stylised CityMap SVG. CityMap.jsx is still on
// disk and now unimported — removing it is a separate cleanup commit, same as
// the Pocket-template components noted in app/(main)/page.jsx.

export function Hero() {
  // The address form is the entry point to the send flow. It renders only once
  // that flow exists.
  const sendIsLive = ROUTES.send.live

  return (
    // The background is a dark brand-tinted ink rather than the SVG's pale
    // #eceee8: it is what shows for the instant before the photograph paints,
    // and a pale flash under a dark scrim reads as a broken image.
    <section className="relative isolate overflow-hidden bg-[#1a1220]">
      {/* `fill` supplies position:absolute + inset:0 inline; the class list only
          has to place the layer behind the content and frame the crop.

          object-position is pulled above centre. At hero aspect the frame keeps
          a horizontal band of a 2400x1400 source, and the default 50% band puts
          the bright crosswalk stripes behind the card. 40% brings the dark glass
          facade down into that space instead, and still holds the courier and
          the delivery bag in frame down to 380px. The image is NOT mirrored. */}
      <Image
        src={cyclist}
        alt="A bicycle courier with a delivery bag riding across a city crosswalk."
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[50%_40%]"
      />

      {/* Legibility scrim. Note what it is NOT for: the h1 and the subcopy live
          inside the white card below, so no text ever sits on the photograph.
          Its job is art direction, and keeping the white card from dissolving
          into a bright background — so it stays light, and clears the courier.

          Tinted with the ink token (#17131c) warmed toward the brand hue rather
          than neutral black. Two treatments: from `sm` up the card occupies the
          left half, so the gradient runs left to right and is fully transparent
          by 62%. Below `sm` the card is nearly full-width and there is no clear
          side to protect, so the gradient runs diagonally and keeps a floor of
          0.42 across the frame instead of reaching zero.

          Painted over the image by DOM order — same -z-10, later sibling — so
          both layers stay below the in-flow content of this stacking context. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[image:linear-gradient(160deg,rgba(26,18,32,0.90)_0%,rgba(32,20,44,0.68)_45%,rgba(32,20,44,0.42)_100%)] sm:bg-[image:linear-gradient(90deg,rgba(26,18,32,0.86)_0%,rgba(32,20,44,0.60)_30%,rgba(32,20,44,0)_62%)]"
      />

      {/* The design fixes the hero at 520px and positions the card absolutely
          over it. Here the card is in normal flow and the photograph sits
          behind it, so
          the section grows with its content on narrow screens instead of the
          card overflowing a fixed-height box. */}
      <div className="mx-auto flex max-w-[1200px] items-center px-8 py-14 lg:min-h-[520px] lg:py-16">
        {/* Over a photograph the card has to read as a lifted surface rather
            than a pasted rectangle. Three low-opacity layers do that where one
            60px blur cannot: a 2px contact shadow that seats the edge, a mid
            shadow for the lift, and a wide soft one for the ambient falloff.
            The hairline ring at 7% ink defines the edge itself — without it the
            white surface meets the scrim with no termination at all. */}
        <div className="w-full max-w-[520px] rounded-[18px] bg-white p-7 shadow-[0_1px_2px_rgba(23,19,28,0.12),0_10px_24px_-8px_rgba(23,19,28,0.18),0_28px_56px_-24px_rgba(23,19,28,0.24)] ring-1 ring-[#17131c]/[0.07]">
          {/* Sourced from navigation.js rather than hardcoded. This used to
              read "across Toronto", which was narrower than both the metadata
              description and the footer's service-area line — the site claimed
              three different coverage areas. See SERVICE_AREA_PHRASE. */}
          <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#17131c] sm:text-[30px]">
            Send anything across {SERVICE_AREA_PHRASE}
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
