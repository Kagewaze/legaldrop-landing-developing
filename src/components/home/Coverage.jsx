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
    <div className="mx-auto flex max-w-[1200px] items-center gap-3.5 px-8">
      <span className="h-3 w-3 flex-none rounded-full bg-[#8d8695]" />
      <div>
        <div className="text-xl font-bold text-[#17131c]">{SERVICE_AREA}</div>
        <div className="mt-0.5 text-sm text-[#5f5868]">{CITIES}</div>
      </div>
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
              photograph, which is decoration doing a structural job. Purple now
              means "you can act on this", and a picture frame is not an action.

              KNOWN LIMITATION, deliberately accepted: this image is Bay Street
              at night and its edges are near-black, so ink at 10% over them is
              close to invisible. The previous note here argued exactly that
              point in favour of a stronger value. The line still does its job
              on light images, which is most of them, and a visible purple frame
              on every photograph was the worse of the two failures. If the edge
              needs defining on dark photographs specifically, the answer is
              white at a low alpha, not more ink. */}
          <div className="pointer-events-none absolute inset-0 rounded-card ring-1 ring-inset ring-[#17131c]/10" />
        </div>
      </div>
    </section>
  )
}
