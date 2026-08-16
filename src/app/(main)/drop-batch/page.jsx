import { TripBoard } from '@/components/dropbatch/TripBoard'
import { fetchPublicTrips } from '@/lib/drop-batch'

// /drop-batch — the public DropBatch product page.
//
// ⚠️ LIVES IN THE (main) ROUTE GROUP ON PURPOSE. The group contributes no URL
// segment — this is still /drop-batch — but (main)/layout.jsx re-exports
// components/Layout, which supplies the skip link, the site Header, the
// <main id="main-content"> landmark and the Footer.
//
// It was briefly at src/app/drop-batch/ instead, outside the group, and the
// page rendered with NO header, NO footer, no skip link and no main landmark:
// the whole document had three focusable elements and no way to navigate
// anywhere else on the site. Keep it beside its peers /legal and /medical.
//
// ⚠️ NOT LINKED YET. src/lib/navigation.js keeps dropBatch.live = false, so
// Header and Footer skip it; the route is reachable directly for review. Flip
// that flag only when the page is approved.
//
// ⚠️ THE BOARD IS THE ARGUMENT. Everything on this page is subordinate to the
// real trips below — a diagram of how batching *could* work would be weaker than
// the actual list of people already driving somewhere with room to spare. If the
// board is empty, the page says so rather than substituting a concept graphic.
//
// ⚠️ WHAT THIS PAGE MAY NOT CLAIM. Payment is not implemented for DropBatch, the
// public projection carries no trip id, and nothing here can book anything. No
// "Book", no "Reserve", no price, no "live" language.

// ⚠️ MUST NOT BE PRERENDERED. Statically generating this route bakes whatever
// the board held at BUILD time into the HTML — and if the backend is unreachable
// during the build, that is an empty board, so the first visitors are told "no
// trips right now" when the marketplace may be busy. That is the same false
// statement TripBoard's error state exists to avoid.
//
// It is also wrong on principle: the backend filters departureDate >= today, so
// a snapshot taken on build day decays every day it is served.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'DropBatch | Trip capacity on Druppr',
  description:
    'People already travelling between cities post their trips on Druppr. DropBatch makes the carrying space on those trips discoverable.',
}

const STEPS = [
  {
    number: '01',
    title: 'Someone posts a trip',
    body: 'A user or an activated driver posts a trip they are already planning — where they are leaving from, where they are going, and when.',
  },
  {
    number: '02',
    title: 'Spare capacity becomes visible',
    body: 'The trip appears on the board with the room it has left: package space, seats, trunk, and the largest package it can take.',
  },
  {
    number: '03',
    title: 'A sender requests space',
    body: 'In the Druppr app, a sender asks the trip owner for the space they need on a trip going their way.',
  },
  {
    number: '04',
    title: 'The trip owner decides',
    body: 'Requests go to whoever posted the trip. They accept or decline, and the two sides can message about the details.',
  },
]

export default async function DropBatchPage() {
  // Server-fetched from the default Toronto origin so the board is populated on
  // first paint — no client request, no geolocation prompt. A failure here must
  // not take the page down: the board renders its own empty/error handling and
  // the rest of the page still explains the product.
  let initialTrips = []
  try {
    initialTrips = await fetchPublicTrips()
  } catch {
    initialTrips = []
  }

  return (
    <div className="bg-surface-page">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-8 pb-12 pt-16 sm:pb-16 sm:pt-24">
        <span className="block text-sm font-semibold uppercase tracking-label text-[#5f5868]">
          DropBatch
        </span>
        <h1 className="mt-3 max-w-[18ch] text-balance font-display text-4xl font-extrabold -tracking-[0.02em] text-[#17131c] sm:text-6xl">
          Trips going your way.
        </h1>
        <p className="mt-5 max-w-[62ch] text-pretty text-lg text-[#5f5868]">
          People are already driving between cities. Some of those trips have
          room to spare. DropBatch makes that carrying capacity discoverable — so
          a delivery can travel with a trip that was happening anyway.
        </p>
        <p className="mt-4 max-w-[62ch] text-pretty text-base text-[#5f5868]">
          Users and activated drivers both post trips. Requesting space, managing
          requests and messaging happen in the Druppr app.
        </p>
      </section>

      {/* ── THE BOARD ────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="available-trips"
        className="border-y border-[#eeebf1] bg-surface-tint/40"
      >
        <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-20">
          <h2
            id="available-trips"
            className="font-display text-3xl font-extrabold -tracking-[0.015em] text-[#17131c]"
          >
            Available DropBatch trips
          </h2>
          <p className="mt-3 max-w-[62ch] text-base text-[#5f5868]">
            Real trips posted on Druppr, showing the space each one has left.
            Trip owners are not identified here.
          </p>

          <div className="mt-8">
            <TripBoard initialTrips={initialTrips} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="how-dropbatch-works"
        className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24"
      >
        <h2
          id="how-dropbatch-works"
          className="font-display text-3xl font-extrabold -tracking-[0.015em] text-[#17131c]"
        >
          How DropBatch works
        </h2>

        <ol className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.number}>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-extrabold tracking-label text-brand-600">
                  {step.number}
                </span>
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="h-px w-10 bg-[linear-gradient(to_right,rgba(123,47,190,0.45),rgba(123,47,190,0))]"
                  />
                ) : null}
              </div>
              <h3 className="mt-2 font-display text-xl font-extrabold text-[#17131c]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[46ch] text-base text-[#5f5868]">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── APP CONTINUATION ─────────────────────────────────────────────
          ⚠️ TEXT, NOT A BUTTON, AND THAT IS DELIBERATE. No App Store or Play
          Store URL exists anywhere in this repo or the mobile repo, and the
          Expo scheme (legaldrop://) only resolves on a device that already has
          the app — on desktop it does nothing. A button that silently fails is
          worse than a sentence that is true. Add a real CTA once a verified
          store link exists. */}
      <section className="border-t border-[#eeebf1]">
        <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-20">
          <div className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold text-[#17131c]">
              Posting and booking happen in the app
            </h2>
            <p className="mt-3 max-w-[62ch] text-base text-[#5f5868]">
              This page is for discovering what is moving. Posting a trip,
              requesting space on one, and messaging a trip owner are all handled
              in the Druppr app, where you are signed in to your own account.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
