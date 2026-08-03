import Link from 'next/link'

import { BRAND } from '@/lib/config'
import { ROUTES } from '@/lib/navigation'
import {
  DesignatedDriver,
  DropBatch,
  LegalDocuments,
  Marketplace,
  MedicalDelivery,
  PetTransport,
  RentCar,
  RequestRide,
  SendPackage,
  TowTruck,
  TrainingHub,
} from '@/components/icons'

// "Everything <brand> does" — three service groups, deliberately unequal.
//
// Rows are STATIC by default. They describe what the platform offers; they are
// not navigation. A row becomes a link only when its route is live, so this
// section can never emit a dead link to a page that does not exist.
//
// THREE ROUTES ARE LIVE TODAY: /send, /medical and /legal — all three in
// DELIVER. (This comment used to claim every route was live: false and that
// nothing rendered as a link. That went stale when the send flow and the two
// B2B pages shipped.) The remaining eight rows render as plain content.
//
// DELIVER LEADS, AND THAT IS WHY. It carries every live route, including
// /send — the page's actual conversion path. The other two groups are real
// offerings but nothing in them can be acted on yet, so the layout ranks them
// below rather than pretending all three are peers.
//
// EMPHASIS IS SIZE, SPAN AND GROUND — NEVER PURPLE. The how-it-works band
// immediately below this section is the page's single strong purple moment (see
// the comment in HowItWorks.jsx). A brand-600 card up here would halve it. The
// featured cell earns its weight with the widest column, the ink header and a
// larger icon tile instead.
//
// Medical and legal are ROWS here, not featured cells. Both get a full
// VerticalSection about a screen and a half below, with a photograph and real
// copy. Promoting them here would make the page deliver the same pitch twice
// inside two screens, and the second telling is the stronger one.

// Card chrome, shared by all three so the surface cannot drift between them.
//
// bg-surface-raised IS LOAD-BEARING ON EVERY CARD. DO NOT REMOVE IT AS
// REDUNDANT — it looks redundant and is not. These cards sit on the tinted
// band, so without an explicit surface they are transparent and inherit it.
// Every icon tile inside them is ALSO surface-tint, so card, tile and section
// all resolve to the same #f7f3fb and the tiles vanish completely. That is not
// hypothetical: it shipped that way for one release, invisible while the icons
// were flat placeholder shapes and obvious the moment they became real ones.
//
// overflow-hidden is what clips a header's ground to the 20px radius. The
// featured card's ink header depends on it; keep it on all three so the two
// treatments cannot diverge.
const CARD =
  'flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised shadow-card'

// The tile sets the icon colour for everything it wraps: the icons are
// fill="currentColor" and carry no colour of their own, so this one class is
// what makes all eleven ink. Change the ground here and the glyphs follow —
// a cell that wants a different tile ground must set text-* alongside it.
//
// Size is the one thing that varies, and only upward. 38px holding a 20px glyph
// is the FLOOR: icons.jsx documents that its silhouettes are drawn to survive
// 20px, and nothing here may go below it. The featured rows step up to 44/24,
// which is the emphasis the widest column can carry without a second colour.
const TILE =
  'flex flex-none items-center justify-center rounded-tile bg-surface-tint text-[#17131c]'

// Icons are stored as COMPONENTS, not as pre-sized elements. The row decides
// the glyph size, because the featured rows render theirs larger and a baked-in
// className cannot be overridden from the call site.
const DELIVER = [
  {
    route: ROUTES.send,
    title: 'Send a package',
    description: 'Same-day pickup, anywhere in the city',
    icon: SendPackage,
  },
  {
    route: ROUTES.medical,
    title: 'Medical delivery',
    description: 'Specimens and pharma, temp-controlled',
    icon: MedicalDelivery,
  },
  {
    route: ROUTES.legal,
    title: 'Legal documents',
    description: 'Court filings with chain of custody',
    icon: LegalDocuments,
  },
  {
    route: ROUTES.dropBatch,
    title: 'Drop Batch',
    description: 'Many stops on one optimised route',
    icon: DropBatch,
  },
  {
    route: ROUTES.marketplace,
    title: 'Marketplace',
    // Brand name comes from config — never hardcoded.
    description: `Local shops delivering through ${BRAND.name}`,
    icon: Marketplace,
  },
]

const MOVE = [
  {
    route: ROUTES.ride,
    title: 'Request a ride',
    description: 'Point to point, priced up front',
    icon: RequestRide,
  },
  {
    route: ROUTES.tow,
    title: 'Tow truck',
    description: 'Roadside help and flatbed towing',
    icon: TowTruck,
  },
  {
    route: ROUTES.designatedDriver,
    title: 'Designated driver',
    description: 'We drive you home in your own car',
    icon: DesignatedDriver,
  },
  {
    route: ROUTES.petTransport,
    title: 'Pet transport',
    description: 'Vet visits and grooming runs',
    icon: PetTransport,
  },
  {
    route: ROUTES.rentACar,
    title: 'Rent a car',
    description: 'Hourly or daily, delivered to you',
    icon: RentCar,
  },
]

const CERTIFICATIONS = [
  'TDG dangerous goods',
  'Client confidentiality',
  'Defensive driving',
  'First aid and CPR',
]

// `featured` is a DENSITY as well as a size. The lead card gets the larger tile
// and the roomier row; the two secondary cards run tighter, which is most of
// what shortens this section on a phone where all three are stacked. No service
// and no description is dropped at any width — the padding closes up, the
// content does not.
function ServiceRow({ service, featured = false }) {
  const Glyph = service.icon

  const body = (
    <>
      <div className={`${TILE} ${featured ? 'h-11 w-11' : 'h-[38px] w-[38px]'}`}>
        <Glyph className={featured ? 'h-6 w-6' : 'h-5 w-5'} />
      </div>
      <div>
        <div className="text-base font-bold text-[#17131c]">
          {service.title}
        </div>
        <div className="mt-0.5 text-sm text-[#5f5868]">
          {service.description}
        </div>
      </div>
    </>
  )

  const layout = `flex gap-3.5 ${featured ? 'p-3.5' : 'p-3'}`

  // Only a live route becomes interactive. Everything else is plain content —
  // no href, no hover affordance suggesting it can be clicked.
  //
  // ELEVATION, NOT MOVEMENT. The hover is a ground change plus one step up the
  // shadow ramp: shadow-card is the card at rest, shadow-lift is this row
  // sitting above it. There is no transform, and that is deliberate — every
  // hover in this product is colour-only, and a single service row is not the
  // place to introduce translate motion to the entire site.
  //
  // THE GROUND IS AN INK WASH, NOT surface-tint, AND THE ALPHA IS MEASURED.
  // This used to be hover:bg-surface-tint — the same #f7f3fb as the icon tile
  // inside the row — so on hover the tile dissolved into its own hover state
  // and the glyph was left floating on nothing.
  //
  // A LIGHTER WASH DOES NOT FIX THAT, IT MAKES IT WORSE. The tile only
  // separates from the white card by 1.10:1 to begin with, and every step from
  // white toward #f7f3fb closes that gap before it reopens. Measured against
  // the tile:
  //
  //     white (at rest)   1.10:1   the separation the tile normally gets
  //     ink 4%            1.01:1   invisible — the dissolve, relocated
  //     ink 6%            1.03:1   still worse than at rest
  //     ink 10%           1.12:1   first step that clears the rest state
  //
  // So 10% is a FLOOR, not a preference. The polarity inverts on hover — a
  // slightly darker chip on white becomes a slightly lighter one on grey — and
  // the tile stays legible on both sides of the change. Do not lighten this
  // toward the tile; that is the bug it was written to fix.
  //
  // `transition` rather than `transition-colors`, because box-shadow is not a
  // colour and would otherwise snap while the ground faded. duration-base is
  // the existing 200ms token.
  //
  // THE motion-reduce GUARD IS NOW REQUIRED. This hover used to be colour-only,
  // which had nothing for prefers-reduced-motion to reduce. An animating shadow
  // is a real motion and the setting has to be able to stop it. Plain form, not
  // `!` — there is no responsive variant here for it to lose to.
  //
  // Card-level hover is deliberately NOT here — these cards are not links, and
  // lifting something that cannot be clicked reads as a broken affordance.
  if (service.route?.live) {
    return (
      <Link
        href={service.route.href}
        className={`${layout} rounded-2xl transition duration-base motion-reduce:transition-none hover:bg-[#17131c]/10 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
      >
        {body}
      </Link>
    )
  }

  return <div className={layout}>{body}</div>
}

// Padding comes from the caller so the featured header can sit taller than the
// two secondary ones without a second component.
function CardHeader({ title, meta, className }) {
  return (
    <div className={`flex items-baseline justify-between ${className}`}>
      <div className="text-xl font-bold">{title}</div>
      <div className="text-xs font-semibold tracking-label">{meta}</div>
    </div>
  )
}

const HEADER_FEATURED = 'bg-surface-ink px-6 py-5 text-white'
const HEADER_SECONDARY = 'bg-surface-tint px-6 py-4 text-[#17131c]'

export function Services() {
  return (
    // TINTED BAND. The tint runs the full viewport width while the content
    // stays in the 1200px column, so the colour cannot live on the same element
    // as `mx-auto max-w-[1200px]` — it would paint a tinted rectangle with pale
    // gutters either side. Same two-element shape as Coverage, VerticalSection
    // and the how-it-works band.
    <section className="bg-surface-tint">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
        <h2 className="font-display text-3xl font-extrabold text-[#17131c] sm:text-4xl">
          Everything {BRAND.name} does
        </h2>
        <p className="mt-2.5 max-w-[560px] text-lg text-[#5f5868]">
          One app for sending, moving, and driving in the Greater Toronto Area.
        </p>

        {/* THREE CARDS, THREE WIDTHS. The track count changes at each step and
            each one is doing a specific job:

            base   1 column. Deliver, Move, Learn stacked in priority order.
            sm     2 columns, Deliver spanning BOTH. This is the orphan fix.
                   Three cards in a 2-column grid always leaves one alone at
                   half width with a dead half-column of tint beside it, which
                   is what shipped before. Deliver fills row one; Move and Learn
                   pair off on row two, so no cell is ever stranded.
            lg     10 columns, split 4 / 3 / 3. Not grid-cols-3, because equal
                   thirds are what this section had; the 4 is what makes Deliver
                   read as the lead — 441px against 325px at 1200, a third wider
                   again. 4+3+3 = 10 exactly, so the row closes with no
                   remainder.

                   A steeper 5/4/3 ramp over 12 columns was built first and
                   measured, and it fails at the bottom of the lg range: at
                   1024 the last column lands at 220px, which leaves the
                   certification chips 127px of text width against the 145px
                   "TDG dangerous goods" needs. Two of the four chips wrapped
                   to a second line and the stack went ragged, 63/63/42/42.
                   Three distinct widths is the more interesting rhythm and
                   this content cannot pay for it. Two equal secondaries also
                   say the same thing the sm layout says — one lead, two peers —
                   which is why the section now reads consistently at both
                   densities rather than differently at each.

            Deliver is not given a row-span here. Stacking Move and Learn beside
            a double-height Deliver was tried on paper and fails: the stack runs
            ~800px against Deliver's ~430px of content, so the lead card would
            stretch with a third of its height empty. */}
        <div className="mt-8 grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-10">
          {/* FEATURED — Deliver */}
          <div className={`${CARD} sm:col-span-2 lg:col-span-4`}>
            <CardHeader
              title="Deliver"
              meta={<span className="opacity-60">5 services</span>}
              className={HEADER_FEATURED}
            />
            {/* Two inner columns ONLY at sm, where this card spans the full
                1200px column and a single file of rows would leave most of the
                width empty. At lg it returns to one column, because the cell is
                487px there and two tracks would squeeze the descriptions. */}
            <div className="grid grid-cols-1 px-2.5 pb-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
              {DELIVER.map((service) => (
                <ServiceRow key={service.title} service={service} featured />
              ))}
            </div>
          </div>

          {/* SECONDARY — Move */}
          <div className={`${CARD} lg:col-span-3`}>
            <CardHeader
              title="Move"
              meta={<span className="opacity-60">5 services</span>}
              className={HEADER_SECONDARY}
            />
            <div className="flex flex-col px-2.5 pb-3 pt-2">
              {MOVE.map((service) => (
                <ServiceRow key={service.title} service={service} />
              ))}
            </div>
          </div>

          {/* SECONDARY — Learn.
              THE INK HEADER MOVED OFF THIS CARD. It used to be the section's
              only dark accent, which put the emphasis on the one group holding
              a single not-yet-live item. The accent now sits on Deliver, and
              this header matches Move's — one accent in the section, not two
              competing for it. */}
          <div className={`${CARD} lg:col-span-3`}>
            <CardHeader
              title="Learn"
              meta={<span className="opacity-60">Driver training</span>}
              className={HEADER_SECONDARY}
            />
            <div className="flex flex-1 flex-col px-6 pb-5 pt-5">
              <div className="flex gap-3.5">
                <div className={`${TILE} h-[38px] w-[38px]`}>
                  <TrainingHub className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-[#17131c]">
                    Training hub
                  </div>
                  <div className="mt-0.5 text-sm text-[#5f5868]">
                    Certifications that unlock higher-paying jobs
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {CERTIFICATIONS.map((certification) => (
                  <div
                    key={certification}
                    className="flex items-center gap-2.5 rounded-[11px] bg-surface-tint px-3.5 py-2.5"
                  >
                    <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#8d8695]" />
                    <span className="text-sm font-semibold text-[#17131c]">
                      {certification}
                    </span>
                  </div>
                ))}
              </div>

              {/* The design ends this card with "Browse the training hub →"
                  pointing at "#". Omitted: ROUTES.trainingHub is not live, and a
                  link to nowhere is worse than no link. Restore it when the
                  training hub ships. */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
