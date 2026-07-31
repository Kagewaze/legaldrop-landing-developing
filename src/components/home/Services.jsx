import Link from 'next/link'

import { BRAND } from '@/lib/config'
import { ROUTES } from '@/lib/navigation'

// "Everything <brand> does" — three grouped service cards.
//
// Rows are STATIC by default. They describe what the platform offers; they are
// not navigation. A row becomes a link only when its route is live, so this
// section can never emit a dead link to a page that does not exist. Every route
// below is currently live: false, so today every row renders as plain content.

const ICON_TILE =
  'flex h-[38px] w-[38px] flex-none items-center justify-center rounded-tile'

// Icons are simple CSS shapes, as in the design — no icon library.
const DELIVER = [
  {
    route: ROUTES.send,
    title: 'Send a package',
    description: 'Same-day pickup, anywhere in the city',
    icon: <span className="h-[11px] w-[14px] rounded-[2px] border-2 border-brand-600" />,
  },
  {
    route: ROUTES.medical,
    title: 'Medical delivery',
    description: 'Specimens and pharma, temp-controlled',
    icon: <span className="h-[14px] w-[14px] rounded-full border-2 border-brand-600" />,
  },
  {
    route: ROUTES.legal,
    title: 'Legal documents',
    description: 'Court filings with chain of custody',
    icon: <span className="h-[14px] w-[12px] rounded-[2px] bg-brand-600" />,
  },
  {
    route: ROUTES.dropBatch,
    title: 'Drop Batch',
    description: 'Many stops on one optimised route',
    icon: (
      <span className="flex gap-[3px]">
        <span className="h-[5px] w-[5px] bg-brand-600" />
        <span className="h-[5px] w-[5px] bg-brand-600" />
        <span className="h-[5px] w-[5px] bg-brand-600" />
      </span>
    ),
  },
  {
    route: ROUTES.marketplace,
    title: 'Marketplace',
    // Brand name comes from config — never hardcoded.
    description: `Local shops delivering through ${BRAND.name}`,
    icon: <span className="h-[12px] w-[12px] rotate-45 bg-brand-600" />,
  },
]

const MOVE = [
  {
    route: ROUTES.ride,
    title: 'Request a ride',
    description: 'Point to point, priced up front',
    icon: <span className="h-[9px] w-[16px] rounded-[3px] bg-brand-600" />,
  },
  {
    route: ROUTES.tow,
    title: 'Tow truck',
    description: 'Roadside help and flatbed towing',
    icon: <span className="h-[4px] w-[16px] bg-brand-600" />,
  },
  {
    route: ROUTES.designatedDriver,
    title: 'Designated driver',
    description: 'We drive you home in your own car',
    icon: <span className="h-[14px] w-[14px] rounded-full bg-brand-600" />,
  },
  {
    route: ROUTES.petTransport,
    title: 'Pet transport',
    description: 'Vet visits and grooming runs',
    icon: (
      <span className="flex items-center gap-[3px]">
        <span className="h-[6px] w-[6px] rounded-full bg-brand-600" />
        <span className="h-[10px] w-[10px] rounded-full bg-brand-600" />
      </span>
    ),
  },
  {
    route: ROUTES.rentACar,
    title: 'Rent a car',
    description: 'Hourly or daily, delivered to you',
    icon: <span className="h-[14px] w-[14px] rounded-[3px] border-2 border-brand-600" />,
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
        className="flex gap-3.5 rounded-2xl p-3.5 transition-colors hover:bg-[#faf7fd]"
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
    <section className="mx-auto max-w-[1200px] px-8 pt-16">
      <h2 className="text-3xl font-extrabold text-[#17131c] sm:text-4xl">
        Everything {BRAND.name} does
      </h2>
      <p className="mt-2.5 max-w-[560px] text-lg text-[#5f5868]">
        One app for sending, moving, and driving in the Greater Toronto Area.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] shadow-card">
          <CardHeader
            title="Deliver"
            meta={<span className="opacity-75">5 services</span>}
            className="bg-brand-600 text-white"
          />
          <div className="flex flex-col px-2.5 pb-3 pt-2">
            {DELIVER.map((service) => (
              <ServiceRow
                key={service.title}
                service={service}
                iconBackground="bg-[#f3ebfb]"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] shadow-card">
          <CardHeader
            title="Move"
            meta={<span className="opacity-60">5 services</span>}
            className="bg-[#f2ebfb] text-[#4c1a7d]"
          />
          <div className="flex flex-col px-2.5 pb-3 pt-2">
            {MOVE.map((service) => (
              <ServiceRow
                key={service.title}
                service={service}
                iconBackground="bg-[#f6f4f8]"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] shadow-card">
          <CardHeader
            title="Learn"
            meta={<span className="opacity-60">Driver training</span>}
            className="bg-[#241a2e] text-white"
          />
          <div className="flex flex-1 flex-col px-6 pb-6 pt-[22px]">
            <div className="flex gap-3.5">
              <div className={`${ICON_TILE} bg-[#f3ebfb]`}>
                <span className="h-[14px] w-[14px] rounded-full border-2 border-brand-600 border-t-transparent" />
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
                  className="flex items-center gap-2.5 rounded-[11px] bg-[#faf7fd] px-3.5 py-3"
                >
                  <span className="h-[7px] w-[7px] flex-none rounded-full bg-brand-600" />
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
    </section>
  )
}
