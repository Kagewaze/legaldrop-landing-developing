import Image from 'next/image'

import { SERVICE_AREA } from '@/lib/navigation'

// Service-area band.
//
// SERVICE_AREA is shared with the footer's bottom bar so the two can never
// disagree about where the business operates.
//
// Shared by three pages: the home page, /medical and /legal. Only the home page
// carries a photograph, so `image` is optional and the two B2B pages call this
// with no props at all.
//
// `image` is a single object rather than separate src and alt props so that a
// picture can never arrive here without the text describing it.

const CITIES =
  'Downtown, North York, Scarborough, Etobicoke, Mississauga, Vaughan, Markham, Brampton.'

// Padding, not margin. This band used to space itself with mt-16 while every
// other section used top padding, so the gap above it came from a different box
// model than the gap above its neighbours and could not be reasoned about
// alongside them. It now carries the same py-16 sm:py-24 as every other
// top-level section, and the inner blocks below carry none of their own.
const BAND = 'border-y border-[#f0eaf6] bg-surface-tint py-16 sm:py-24'

export function Coverage({ image }) {
  const copy = (
    // The design puts a "Check your address →" link on the right. Omitted: it
    // has no destination, and there is no address-checking page to send anyone
    // to. The band still carries the information on its own.
    // The status dot that used to lead this line is gone. It was decorative
    // when it was brand purple; recoloured neutral it read as an artifact
    // rather than an indicator, since it never indicated anything.
    //
    // The flex wrapper went with it — a single child does not need one, and
    // `gap` between one item is not a thing. Consequence: the copy now starts
    // at the 1200px column's own px-8 edge, 26px left of where the dot and its
    // gap used to push it, which is the same left edge every other section on
    // the page aligns to. That alignment is the reason not to reinstate the
    // offset with padding.
    <div className="mx-auto max-w-[1200px] px-8">
      <div className="text-xl font-bold text-[#17131c]">{SERVICE_AREA}</div>
      <div className="mt-0.5 text-sm text-[#5f5868]">{CITIES}</div>
    </div>
  )

  // Two whole trees rather than one tree with an {image && …} guard inside it.
  // The guard looks equivalent and is not: React would see two children on the
  // section either way and serialise props.children as an ARRAY, so /medical
  // and /legal — which pass no image — would ship a different RSC payload than
  // they do today for identical rendered DOM. Returning early keeps the section
  // at exactly one child there, and their prerendered HTML byte-identical.
  // Verified by diffing .next/server/app/{medical,legal}.html across the change.
  if (!image) {
    return <section className={BAND}>{copy}</section>
  }

  return (
    <section className={BAND}>
      {copy}

      {/* The photograph sits below the copy rather than behind it. This is a
          quiet ~100px information strip immediately before the brand-600 driver
          CTA; overlaying the copy would need a heavy scrim and would turn the
          band into a second hero in the wrong place on the page.

          Native 8:3 from the static import's intrinsic 2400x900, so the height
          is known before the bytes arrive and nothing below it moves. */}
      <div className="mx-auto max-w-[1200px] px-8 pt-9">
        <div className="relative overflow-hidden rounded-card">
          <Image
            src={image.src}
            alt={image.alt}
            sizes="(min-width: 1200px) 1136px, calc(100vw - 4rem)"
            className="block w-full"
          />
          {/* The hairline goes on an overlay, not on the wrapper: an inset
              box-shadow paints beneath child content, so a ring on the wrapper
              would sit behind the photograph and never be seen.

              NEUTRAL, NOT BRAND. This was brand-600/25 — a purple frame on a
              photograph, which is decoration doing a structural job. Purple is
              reserved for action, and a picture frame is not an action.

              WHITE, NOT INK, AND THE DARK PHOTOGRAPH IS WHY. Ink at 10% was
              tried and is invisible here: this image is Bay Street at night and
              its edges are near-black, so a near-black hairline over them
              separates nothing. A light line is the only kind that can define
              an edge against a dark frame. 12% keeps it a hairline rather than
              a highlight, and it still reads on light images because it sits
              over the photograph's own edge pixels, not over the band.

              This is the pattern for card images from here on, so it has to
              survive both cases — that is what ruled ink out. Do not thicken
              it; a visible frame reads cheap. */}
          <div className="pointer-events-none absolute inset-0 rounded-card ring-1 ring-inset ring-white/[0.12]" />
        </div>
      </div>
    </section>
  )
}
