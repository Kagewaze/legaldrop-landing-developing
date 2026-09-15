import Image from 'next/image'
import { MarketingLink as Link } from '@/components/MarketingNavigation'
import { notFound } from 'next/navigation'

import courierImage from '@/images/dropbatch-hero.webp'
import handoffImage from '@/images/dropbatch-handoff.webp'
import { DROPBATCH_EXPLAINER_ENABLED } from '@/lib/config'
import {
  DROPBATCH_EXPLANATION,
  DROPBATCH_NO_PROMISE,
  STANDARD_EXPLANATION,
} from '@/lib/dropbatch-copy'

export const metadata = {
  title: 'DropBatch flexible delivery | Druppr',
  description:
    'Lower-cost delivery that matches your package with a verified Druppr driver already heading along your route.',
}

// ⚠️ STEP 04 IS THE ONE THAT KEEPS GETTING THIS WRONG.
//
// A DropBatch delivery does NOT join the driver job board. The backend excludes
// `pricingMode = 'dropbatch'` from that query outright and refuses it generic
// dispatch; it is matched against trips drivers have already posted and offered to
// one of them at a time. Describing a job board here promised a fulfilment model
// Druppr does not run. See @/lib/dropbatch-copy.
const STEPS = [
  ['01', 'Enter your route', 'Tell us where the package is travelling.'],
  ['02', 'Choose your timing', 'Request pickup as soon as a compatible driver accepts, or choose a preferred future time.'],
  ['03', 'Get your price', 'Druppr checks eligibility and calculates the authoritative DropBatch price.'],
  ['04', 'We find a driver already going your way', 'Book through Send a package, and Druppr matches your delivery against trips verified drivers have already posted.'],
]

export default function DropBatchPage() {
  if (!DROPBATCH_EXPLAINER_ENABLED) notFound()

  return (
    <div data-marketing-motion data-route-motion="page" data-marketing-route="/drop-batch" className="bg-[#fbf9fc] text-[#17131c]">
      <section data-motion-scene data-motion-side="right" className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div data-motion-copy>
          <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">DropBatch</p>
          <h1 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-[-0.025em] sm:text-6xl">
            Deliver farther for less with DropBatch.
          </h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-8 text-[#5f5868]">
            {DROPBATCH_EXPLANATION}
          </p>
          <p className="mt-4 max-w-[60ch] text-base leading-7 text-[#756d7e]">
            {DROPBATCH_NO_PROMISE}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link data-motion-control href="/drop-batch/request" className="min-h-11 rounded-control bg-brand-600 px-6 py-3.5 text-center font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 hover:bg-brand-700">
              Get my DropBatch price
            </Link>
            <Link data-motion-control href="/send" className="min-h-11 rounded-control border border-[#d9d2df] bg-white px-6 py-3.5 text-center font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
              Book a standard delivery
            </Link>
          </div>
        </div>
        <div data-motion="media" className="relative min-h-[320px] overflow-hidden rounded-card sm:min-h-[460px]">
          <Image src={courierImage} alt="A customer receiving a Druppr package at a doorway." fill priority placeholder="blur" sizes="(min-width: 1200px) 548px, (min-width: 1024px) calc(50vw - 52px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="how-dropbatch-works" className="border-y border-[#ebe6ef] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 sm:py-24">
          <h2 data-motion="reveal" id="how-dropbatch-works" className="font-display text-3xl font-extrabold sm:text-4xl">How DropBatch works</h2>
          <ol data-motion-group className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([number, title, body]) => (
              <li data-motion-hover="card" key={number} className="rounded-card border border-[#ebe6ef] bg-[#fbf9fc] p-6">
                <span className="text-sm font-extrabold text-brand-700">{number}</span>
                <h3 className="mt-3 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 leading-7 text-[#5f5868]">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section data-motion-chapter data-motion-scene data-motion-side="left" className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
        <div data-motion="media" className="relative min-h-[300px] overflow-hidden rounded-card sm:min-h-[400px]">
          <Image src={handoffImage} alt="A driver handing a Druppr package to a customer beside a vehicle." fill placeholder="blur" sizes="(min-width: 1200px) 548px, (min-width: 1024px) calc(50vw - 52px), (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)" className="object-cover" />
        </div>
        <div data-motion-copy>
          <p className="text-sm font-extrabold uppercase tracking-label text-brand-700">A practical handoff</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Your package joins a trip already being made.</h2>
          <p className="mt-5 text-lg leading-8 text-[#5f5868]">After booking, Druppr compares your pickup and destination against trips verified drivers have already posted, and offers your package to the driver whose route fits with the least detour. That driver still has to accept, so matching and pickup can take longer than Standard Delivery, and a compatible trip is not guaranteed.</p>
          <p className="mt-4 text-lg leading-8 text-[#5f5868]"><strong className="font-semibold text-[#3d3646]">Standard Delivery instead:</strong> {STANDARD_EXPLANATION}</p>
        </div>
      </section>

      <section className="bg-surface-ink text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 sm:py-20">
          <h2 data-motion="reveal" className="font-display text-3xl font-extrabold">Built on trips drivers are already making</h2>
          <div data-motion-group className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Flexible distance', 'Short and longer routes can use DropBatch.'],
              ['Flexible pickup', 'Choose ASAP or a preferred future date and time.'],
              ['Supported vehicle', 'Choose a DropBatch-supported vehicle for the package.'],
              ['Matched, not dispatched', 'We offer your package to a verified driver whose posted trip already fits your route.'],
            ].map(([title, body]) => (
              <div data-motion-hover="card" key={title} className="rounded-card border border-white/15 bg-white/5 p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
              </div>
            ))}
          </div>
          <Link data-motion-control href="/drop-batch/request" className="mt-10 inline-flex min-h-11 items-center rounded-control bg-white px-6 py-3 font-semibold text-[#17131c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Get a DropBatch quote
          </Link>
        </div>
      </section>
    </div>
  )
}
