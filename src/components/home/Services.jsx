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

// "Everything <brand> does" — three grouped service cards.
//
// Rows are STATIC by default. They describe what the platform offers; they are
// not navigation. A row becomes a link only when its route is live, so this
// section can never emit a dead link to a page that does not exist. Every route
// below is currently live: false, so today every row renders as plain content.

// The tile sets the icon colour for everything it wraps: the icons are
// fill="currentColor" and carry no colour of their own, so this one class is
// what makes all eleven ink. Change the ground here and the glyphs follow.
const ICON_TILE =
  'flex h-[38px] w-[38px] flex-none items-center justify-center rounded-tile text-[#17131c]'

// Icons come from the shared silhouette set in src/components/icons.jsx.
// They replaced inline CSS shapes — a circle, a dash, a diamond — that were
// placeholders and said nothing about the service they labelled. Size is set
// here; colour comes from ICON_TILE above.
const DELIVER = [
  {
    route: ROUTES.send,
    title: 'Send a package',
    description: 'Same-day pickup, anywhere in the city',
    icon: <SendPackage className="h-5 w-5" />,
  },
  {
    route: ROUTES.medical,
    title: 'Medical delivery',
    description: 'Specimens and pharma, temp-controlled',
    icon: <MedicalDelivery className="h-5 w-5" />,
  },
  {
    route: ROUTES.legal,
    title: 'Legal documents',
    description: 'Court filings with chain of custody',
    icon: <LegalDocuments className="h-5 w-5" />,
  },
  {
    route: ROUTES.dropBatch,
    title: 'Drop Batch',
    description: 'Many stops on one optimised route',
    icon: <DropBatch className="h-5 w-5" />,
  },
  {
    route: ROUTES.marketplace,
    title: 'Marketplace',
    // Brand name comes from config — never hardcoded.
    description: `Local shops delivering through ${BRAND.name}`,
    icon: <Marketplace className="h-5 w-5" />,
  },
]

const MOVE = [
  {
    route: ROUTES.ride,
    title: 'Request a ride',
    description: 'Point to point, priced up front',
    icon: <RequestRide className="h-5 w-5" />,
  },
  {
    route: ROUTES.tow,
    title: 'Tow truck',
    description: 'Roadside help and flatbed towing',
    icon: <TowTruck className="h-5 w-5" />,
  },
  {
    route: ROUTES.designatedDriver,
    title: 'Designated driver',
    description: 'We drive you home in your own car',
    icon: <DesignatedDriver className="h-5 w-5" />,
  },
  {
    route: ROUTES.petTransport,
    title: 'Pet transport',
    description: 'Vet visits and grooming runs',
    icon: <PetTransport className="h-5 w-5" />,
  },
  {
    route: ROUTES.rentACar,
    title: 'Rent a car',
    description: 'Hourly or daily, delivered to you',
    icon: <RentCar className="h-5 w-5" />,
  },
]

const CERTIFICATIONS = [
  'TDG dangerous goods',
  'Client confidentiality',
  'Defensive driving',
  'First aid and CPR',
]

function ServiceRow({ service, iconBackground }) {
  const body = (
    <>
      <div className={`${ICON_TILE} ${iconBackground}`}>{service.icon}</div>
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

  // Only a live route becomes interactive. Everything else is plain content —
  // no href, no hover affordance suggesting it can be clicked.
  if (service.route?.live) {
    return (
      <Link
        href={service.route.href}
        className="flex gap-3.5 rounded-2xl p-3.5 transition-colors hover:bg-surface-tint"
      >
        {body}
      </Link>
    )
  }

  return <div className="flex gap-3.5 p-3.5">{body}</div>
}

function CardHeader({ title, meta, className }) {
  return (
    <div
      className={`flex items-baseline justify-between px-6 py-5 ${className}`}
    >
      <div className="text-xl font-bold">{title}</div>
      <div className="text-xs font-semibold tracking-label">{meta}</div>
    </div>
  )
}

export function Services() {
  return (
    // TINTED BAND. The one section on the home page that gets a ground of its
    // own, and the only place in this pass where a wrapper element was added.
    //
    // It has to be a wrapper: the tint runs the full viewport width while the
    // content stays in the 1200px column, so the colour cannot live on the same
    // element as `mx-auto max-w-[1200px]` without painting a tinted rectangle
    // with pale gutters either side. Coverage and the medical/legal heroes
    // already use exactly this two-element shape.
    //
    // This section earns it: three large white cards gain more from a tinted
    // ground than anything else on the page.
    <section className="bg-surface-tint">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
        <h2 className="font-display text-3xl font-extrabold text-[#17131c] sm:text-4xl">
          Everything {BRAND.name} does
        </h2>
        <p className="mt-2.5 max-w-[560px] text-lg text-[#5f5868]">
          One app for sending, moving, and driving in the Greater Toronto Area.
        </p>

        {/* bg-surface-raised ON ALL THREE CARDS IS LOAD-BEARING. DO NOT REMOVE
            IT AS REDUNDANT — it looks redundant and is not.

            These cards sit on the tinted band above, so without an explicit
            surface they are transparent and inherit it. That is not a subtle
            loss: every icon tile inside them is ALSO surface-tint, so card,
            tile and section all resolve to the same #f7f3fb and the tiles
            vanish completely. The row icons then read as floating on nothing,
            and the tinted card headers disappear along with them.

            This is not hypothetical. These cards carried no background for one
            release after the section became a band, and that is exactly what
            shipped. It was invisible while the icons were flat placeholder
            shapes and obvious the moment they became real ones.

            The white is also the point of the surfaces pass: cards are
            surface.raised so they sit ON a ground rather than dissolve into
            it. A card on a tinted band with no background of its own is the
            one case where that premise silently fails. */}
        <div className="mt-8 grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised shadow-card">
            <CardHeader
              title="Deliver"
              meta={<span className="opacity-60">5 services</span>}
              className="bg-surface-tint text-[#17131c]"
            />
            <div className="flex flex-col px-2.5 pb-3 pt-2">
              {DELIVER.map((service) => (
                <ServiceRow
                  key={service.title}
                  service={service}
                  iconBackground="bg-surface-tint"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised shadow-card">
            <CardHeader
              title="Move"
              meta={<span className="opacity-60">5 services</span>}
              className="bg-surface-tint text-[#17131c]"
            />
            <div className="flex flex-col px-2.5 pb-3 pt-2">
              {MOVE.map((service) => (
                <ServiceRow
                  key={service.title}
                  service={service}
                  iconBackground="bg-surface-tint"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised shadow-card">
            <CardHeader
              title="Learn"
              meta={<span className="opacity-60">Driver training</span>}
              className="bg-surface-ink text-white"
            />
            <div className="flex flex-1 flex-col px-6 pb-6 pt-[22px]">
              <div className="flex gap-3.5">
                <div className={`${ICON_TILE} bg-surface-tint`}>
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

              <div className="mt-5 flex flex-col gap-2.5">
                {CERTIFICATIONS.map((certification) => (
                  <div
                    key={certification}
                    className="flex items-center gap-2.5 rounded-[11px] bg-surface-tint px-3.5 py-3"
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
