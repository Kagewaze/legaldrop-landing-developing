import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import courierImage from '@/images/medical-pharma.jpg'
import handoffImage from '@/images/legal-document.jpg'
import { DROPBATCH_EXPLAINER_ENABLED } from '@/lib/config'

export const metadata = {
  title: 'DropBatch long-distance delivery | Druppr',
  description:
    'Check scheduled long-distance delivery availability on compatible trips already heading your way.',
}

const STEPS = [
  ['01', 'Enter your route', 'Tell us where the package is travelling.'],
  ['02', 'Schedule the trip', 'DropBatch is designed for scheduled long-distance deliveries.'],
  ['03', 'We check matching trips', 'Druppr checks compatible trips already heading that way.'],
  ['04', 'See your DropBatch price', 'When a compatible trip is available, we show the authoritative DropBatch price.'],
]

export default function DropBatchPage() {
  if (!DROPBATCH_EXPLAINER_ENABLED) notFound()

  return (
    <div className="bg-[#fbf9fc] text-[#17131c]">
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">DropBatch</p>
          <h1 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-[-0.025em] sm:text-6xl">
            Deliver farther for less with DropBatch.
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-8 text-[#5f5868]">
            DropBatch matches scheduled long-distance deliveries with compatible trips already travelling in that direction, making better use of unused vehicle capacity. When a match is available, it can cost less.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/drop-batch/request" className="min-h-11 rounded-control bg-brand-600 px-6 py-3.5 text-center font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 hover:bg-brand-700">
              Check DropBatch availability
            </Link>
            <Link href="/send" className="min-h-11 rounded-control border border-[#d9d2df] bg-white px-6 py-3.5 text-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
              Book a standard delivery
            </Link>
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-card sm:min-h-[460px]">
          <Image src={courierImage} alt="A courier loading packages into a delivery van." fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="how-dropbatch-works" className="border-y border-[#ebe6ef] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 sm:py-24">
          <h2 id="how-dropbatch-works" className="font-display text-3xl font-extrabold sm:text-4xl">How DropBatch works</h2>
          <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([number, title, body]) => (
              <li key={number} className="rounded-card border border-[#ebe6ef] bg-[#fbf9fc] p-6">
                <span className="text-sm font-extrabold text-brand-700">{number}</span>
                <h3 className="mt-3 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 leading-7 text-[#5f5868]">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
        <div className="relative min-h-[300px] overflow-hidden rounded-card sm:min-h-[400px]">
          <Image src={handoffImage} alt="Two people handing over a package envelope." fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">A practical handoff</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Your package joins a trip already being made.</h2>
          <p className="mt-5 text-lg leading-8 text-[#5f5868]">DropBatch connects real routes, real packages and available vehicle space. It is designed for convenient, scheduled handoffs—not instant pickup.</p>
        </div>
      </section>

      <section className="bg-surface-ink text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 sm:py-20">
          <h2 className="font-display text-3xl font-extrabold">Built for longer, planned routes</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['80 km minimum', 'The route must be at least 80 km.'],
              ['Scheduled pickup', 'Choose a future date and time.'],
              ['Compatible vehicle', 'The trip must have a suitable vehicle and capacity.'],
              ['Conditional availability', 'A price appears only when a compatible active trip matches.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-card border border-white/15 bg-white/5 p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
              </div>
            ))}
          </div>
          <Link href="/drop-batch/request" className="mt-10 inline-flex min-h-11 items-center rounded-control bg-white px-6 py-3 font-semibold text-[#17131c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Get a DropBatch quote
          </Link>
        </div>
      </section>
    </div>
  )
}
