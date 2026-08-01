import Image from 'next/image'
import Link from 'next/link'

import { ROUTES, SERVICE_AREA_PHRASE } from '@/lib/navigation'
import cyclist from '@/images/hero-cyclist.jpg'

// Home hero: a split pane over a courier photograph.
//
// LEFT  the headline and lead, set in white directly on the scrimmed photo.
// RIGHT the booking card, an opaque white surface.
//
// The headline used to live INSIDE the card, which capped its measure at the
// card's 464px interior. Moving it out is the structural point of this layout:
// the h1 is the page's thesis and should not be constrained by the width of a
// form preview sitting next to it.
//
// Below lg the two panes stack — headline first, card under it — and the card
// returns to being the only thing in the column.

// The card chrome, shared by both branches below so the surface cannot drift
// between them. Over a photograph the card has to read as a lifted surface
// rather than a pasted rectangle: shadow-hero is three low-opacity layers,
// which does that where one 60px blur cannot — a 2px contact shadow that seats
// the edge, a mid shadow for the lift, and a wide soft one for the ambient
// falloff. The hairline ring at 7% ink defines the edge itself; without it the
// white surface meets the scrim with no termination at all.
const CARD =
  'w-full max-w-[520px] rounded-card bg-white p-7 shadow-hero ring-1 ring-[#17131c]/[0.07]'

// ring-2 overrides the hairline above on focus rather than stacking with it —
// both write --tw-ring-shadow. The white offset puts a 2px gap between card
// edge and ring so the indicator reads against the photograph and not just
// against the card.
const CARD_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

// Field preview and CTA. transition-colors is the only animation in this
// component and it no-ops under reduced motion.
const FIELD =
  'flex items-center gap-3 rounded-control border-[1.5px] border-[#e3dfe8] px-4 py-3.5 transition-colors motion-reduce:transition-none group-hover:border-[#d5cddd]'

export function Hero() {
  // The address form is the entry point to the send flow. It renders only once
  // that flow exists.
  const sendIsLive = ROUTES.send.live

  return (
    // The background is a dark ink rather than a pale one: it is what shows for
    // the instant before the photograph paints, and a pale flash under a dark
    // scrim reads as a broken image. surface.ink, the shared dark token.
    <section className="relative isolate overflow-hidden bg-surface-ink">
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

      {/* LEGIBILITY SCRIM. Its job changed with this layout and the stops moved
          with it — the shape is the same left-to-right falloff, pushed right.
          It is NOT retuned from scratch.

          It used to protect an OPAQUE card sitting on the left: the requirement
          was only that a white rectangle not dissolve into a bright background.
          The left pane now carries WHITE TEXT, which is a far stricter job, and
          it sits over the palest part of this photograph — the plaza paving
          that runs across the left-centre of the frame.

          The old stops (0.60 at 30%, 0 at 62%) left the right end of the
          headline over roughly 0.24 of scrim, which measured below 4.5:1 on
          that paving. The mid stop moved to 45% and a fourth stop holds the
          falloff back until 66%, so the whole headline column sits over 0.58
          or more.

          IT SWITCHES AT `lg`, NOT `sm`, AND THAT BREAKPOINT IS LOAD-BEARING.
          A left-weighted gradient is only correct once the layout is actually
          two columns. It used to switch at `sm` because the card sat on the
          left at every width above that. The split now starts at `lg`, and
          for the 640-1023 band the panes are STACKED with the headline
          running full width — a gradient that reaches zero at 80% leaves the
          end of that headline on bare paving. Measured there during this
          build: 1.39:1. Below `lg` the diagonal with its 0.42 floor covers
          the whole frame, which is what a full-width headline needs.

          Painted over the image by DOM order — same -z-10, later sibling — so
          both layers stay below the in-flow content of this stacking context. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[image:linear-gradient(160deg,rgba(26,18,32,0.90)_0%,rgba(32,20,44,0.68)_45%,rgba(32,20,44,0.42)_100%)] lg:bg-[image:linear-gradient(90deg,rgba(26,18,32,0.88)_0%,rgba(32,20,44,0.70)_45%,rgba(32,20,44,0.20)_66%,rgba(32,20,44,0)_80%)]"
      />

      {/* THE SPLIT. The card track is clamped rather than fixed, and that is
          what keeps the headline out of trouble at the narrow end of the
          range.

          A flat `1fr 520px` looks right and squeezes the h1 exactly where
          there is least room: at 1024 the container is ~945 usable, so a 520
          card plus the gap leaves the headline 377px — under the 432px its
          second line needs — and it breaks to three lines. Pinning the card
          at 460 instead leaves 437px, which clears by 5px: not a margin, a
          coincidence waiting for a font metric to change.

          clamp(400,38vw,520) tracks the container instead. 400 is the floor
          the card's own contents need; 38vw holds a ~55/45 split through the
          middle of the range; 520 is the ceiling from the design, reached
          around 1370 where the container has already stopped growing. The
          headline keeps 65px or more of slack throughout.

          The section grows with its content on narrow screens rather than
          clipping, so min-height only applies from lg. */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-8 py-14 lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_clamp(400px,38vw,520px)] lg:gap-12 lg:py-16">
        {/* The measure is capped while the panes are stacked. Between 640 and
            1023 the column is the full container — 689px at 768 — and the
            whole headline fits on ONE line there, which loses the two-line
            block shape it holds at every other width and pushes white text out
            past where the scrim can protect it. text-balance does not prevent
            that: it evens out lines that already exist, it does not force a
            wrap. The cap is what forces the wrap; balance then picks the even
            split. From lg the grid column is narrower than this anyway, so the
            cap is released. */}
        <div className="max-w-[560px] lg:max-w-none">
          {/* Sourced from navigation.js rather than hardcoded. This used to
              read "across Toronto", which was narrower than both the metadata
              description and the footer's service-area line — the site claimed
              three different coverage areas. See SERVICE_AREA_PHRASE.

              THE THREE-STEP RAMP IS LOAD-BEARING. It was measured when this
              headline lived inside the card, where 390px left it a 255px line
              box: 48px wrapped to FOUR lines and grew the card from 409px to
              555px, 30px held two. The headline has 326px out here rather than
              255px, so the ramp is no longer at the edge it was set against —
              but 30px still gives the two-line block that every other
              breakpoint holds, and measured at 390 it is two lines at 207/223.
              Do not collapse the ramp without re-measuring 390.

              text-balance evens the two lines out; it does NOT create them.
              The wrap itself comes from the measure — see the cap on the
              wrapper above, which is what forces two lines in the stacked
              band. */}
          <h1 className="text-balance font-display text-3xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            Send anything across {SERVICE_AREA_PHRASE}
          </h1>
          {/* text-lg is the scale's lead-paragraph step; this is a lead
              paragraph now that it sits under the headline rather than inside
              a card. white/85 matches the copy treatment over photography in
              ExpandingGallery. */}
          <p className="mt-4 max-w-[480px] text-lg text-white/85">
            Same-day courier for clinics, law firms, and everyone else. See your
            price before you book.
          </p>
        </div>

        {sendIsLive ? (
          /* THE WHOLE CARD IS ONE LINK, and the fields inside it are STATIC —
           * deliberately not inputs.
           *
           * Real address entry lives on /send, where the Places autocomplete,
           * the geocoded coordinates and the flow state all are. Putting a
           * working form here would mean a second copy of that component and
           * its state, plus carrying a half-entered address across a
           * navigation — for a form the customer reaches in one click anyway.
           *
           * So this is a preview of that form, not the form. There is no
           * <input> and nothing focusable or typeable inside: a field that
           * accepts text and then throws it away is worse than no field,
           * because the customer believes they have already started their
           * booking.
           *
           * If this ever needs to accept a real address, move the autocomplete
           * into a shared component — do not add an <input> back here. */
          <Link
            href={ROUTES.send.href}
            aria-label="Send a package — enter your pickup and dropoff addresses"
            className={`group block select-none ${CARD} ${CARD_FOCUS}`}
          >
            <span className="block text-sm font-semibold tracking-label text-[#8d8695]">
              Get your price
            </span>

            <div className="mt-4 flex flex-col gap-2.5" aria-hidden="true">
              <div className={FIELD}>
                <span className="h-[11px] w-[11px] flex-none rounded-full border-[2.5px] border-brand-600" />
                <span className="text-base text-[#8d8695]">Pickup address</span>
              </div>
              <div className={FIELD}>
                <span className="h-[11px] w-[11px] flex-none bg-brand-600" />
                <span className="text-base text-[#8d8695]">Dropoff address</span>
              </div>
            </div>

            <div className="mt-[18px] flex items-center gap-[18px]">
              {/* A span, not a nested link — an <a> inside an <a> is invalid
                  and browsers will not nest the click targets predictably. */}
              <span className="flex-1 rounded-control bg-brand-600 px-5 py-4 text-center text-base font-semibold text-white transition-colors motion-reduce:transition-none group-hover:bg-brand-700">
                See price
              </span>
              <PriceFrom />
            </div>
          </Link>
        ) : (
          <div className={CARD}>
            <span className="block text-sm font-semibold tracking-label text-[#8d8695]">
              Get your price
            </span>
            <div className="mt-4 flex items-center gap-[18px]">
              <Link
                href="/contact-us"
                className={`flex-1 rounded-control bg-brand-600 px-5 py-4 text-center text-base font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-brand-700 ${CARD_FOCUS}`}
              >
                Get in touch
              </Link>
              <PriceFrom />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function PriceFrom() {
  return (
    <div className="text-right">
      <div className="text-xs font-semibold text-[#8d8695]">from</div>
      <div className="text-2xl font-bold text-[#17131c]">$8.00</div>
    </div>
  )
}
