import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import courierImage from '@/images/dropbatch-hero.png'
import handoffImage from '@/images/dropbatch-handoff.png'
import { DROPBATCH_EXPLAINER_ENABLED } from '@/lib/config'

export const metadata = {
  title: 'DropBatch long-distance delivery | Druppr',
  description:
    'Get flexible long-distance delivery pricing for eligible routes of at least 80 km.',
}

const STEPS = [
  ['01', 'Enter your route', 'Tell us where the package is travelling.'],
  ['02', 'Choose your timing', 'Request pickup as soon as a suitable driver accepts or choose a preferred future time.'],
  ['03', 'Get your price', 'Druppr checks eligibility and calculates the authoritative DropBatch price.'],
  ['04', 'Post the delivery', 'Book through Send a package and the delivery will join the normal Druppr driver job board.'],
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
            DropBatch is Druppr&apos;s lower-cost option for eligible long-distance deliveries. Choose ASAP or a preferred pickup time. Your price does not depend on a driver already being assigned; after booking, the job is posted for eligible Druppr drivers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/drop-batch/request" className="min-h-11 rounded-control bg-brand-600 px-6 py-3.5 text-center font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 hover:bg-brand-700">
              Get my DropBatch price
            </Link>
            <Link href="/send" className="min-h-11 rounded-control border border-[#d9d2df] bg-white px-6 py-3.5 text-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
              Book a standard delivery
            </Link>
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-card sm:min-h-[460px]">
          <Image src={courierImage} alt="A customer receiving a Druppr package at a doorway." fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
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
          <Image src={handoffImage} alt="A driver handing a Druppr package to a customer beside a vehicle." fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">A practical handoff</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">A long-distance job for Druppr drivers.</h2>
          <p className="mt-5 text-lg leading-8 text-[#5f5868]">After booking, your long-distance delivery enters Druppr&apos;s normal driver job board. A driver may accept quickly when the route fits, or it may take longer while drivers look for deliveries heading in the same direction. Acceptance is not guaranteed.</p>
        </div>
      </section>

      <section className="bg-surface-ink text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 sm:py-20">
          <h2 className="font-display text-3xl font-extrabold">Built for longer, planned routes</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['80 km minimum', 'The route must be at least 80 km.'],
              ['Flexible pickup', 'Choose ASAP or a preferred future date and time.'],
              ['Supported vehicle', 'Choose a DropBatch-supported vehicle for the package.'],
              ['Driver job board', 'Eligible drivers can accept immediately when the route fits.'],
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
