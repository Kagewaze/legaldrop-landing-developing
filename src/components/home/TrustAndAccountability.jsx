import Link from 'next/link'

import { ROUTES, SERVICE_AREA } from '@/lib/navigation'

// The homepage's closing evidence layer, and its last section before the
// footer. It replaces two things:
//
//   home/WhyBrand.jsx  as rendered on the HOME PAGE ONLY — a four-card grid of
//                      table stakes (same-day, live tracking, vehicle options,
//                      recorded delivery). `HOMEPAGE.md` → Homepage Narrative
//                      rules that section out by name: "A 'why choose us'
//                      feature grid of table stakes... tells an informed buyer
//                      we do not know what is table stakes." By Phase 5 three
//                      of its four cards were also restating what the Platform
//                      Showcase and the two vertical frames now show directly.
//   home/Coverage.jsx  as rendered on the HOME PAGE ONLY — a service-area line,
//                      an eight-neighbourhood list and a 377 kB photograph.
//                      `HOMEPAGE.md` rules the list out too: "Enumerated
//                      service areas are a local-services SEO pattern and the
//                      single strongest small-business signal available."
//
// ⚠️ BOTH COMPONENTS ARE STILL LIVE. /medical and /legal each render WhyBrand
// with their own reasons and Coverage without an image. Neither file was
// touched. Only the homepage's two call sites went. Coverage's two-tree
// structure in particular is load-bearing for those pages' RSC payloads — read
// the comment at Coverage.jsx:48 before going near it.
//
// ── WHAT THIS SECTION IS ALLOWED TO SAY ─────────────────────────────────────
//
// Every statement below is a capability this repository renders, and each is
// annotated with where. Nothing here is a certification, a guarantee, a
// compliance posture or a performance promise, and the vocabulary Phases
// 4.1–4.3 removed does not return: no insurance, TDG, PHIPA, security,
// encryption, SLA, chain of custody, drop-off code, signature, photo, proof of
// service, temperature control, scheduled routes or invoicing.
//
// Three words are deliberately absent from the pillar copy: PROOF, CUSTODY and
// VERIFICATION. What the product makes is a record, and that is what it is
// called.
//
// The section carries NO iconography. Shields, padlocks, certification badges,
// rosettes and compliance seals are all prohibited here, and once those are
// gone an icon set adds decoration rather than meaning — so the hierarchy is
// carried by type and a hairline rule, which is also what keeps this reading as
// operational rather than as a trust-badge panel.

// Each pillar's rule sits above it, so at lg the three columns share one
// baseline and below lg the rules separate stacked rows without a divider
// element. #eeebf1 is the card-border token already used by PlatformShowcase.
const PILLAR = 'border-t border-[#eeebf1] pt-5'

const PILLARS = [
  {
    // VERIFIED: src/app/track/[trackingCode]/page.jsx fetches
    // `${API_BASE_URL}/public/track/{code}` and src/app/track-partner/
    // [trackingToken]/page.jsx fetches `/public/track-partner/{token}`. Both
    // are PUBLIC endpoints: no session, no cookie, no Authorization header,
    // no login gate anywhere in either route. The code reaches the sender on
    // the payment step — send/pay/page.jsx:510 prints it and :515 links to
    // /track/{code}.
    //
    // ⚠️ NOT "THE RECIPIENT", AND THE DIFFERENCE IS EVIDENCE. The order payload
    // requires a recipient name plus a phone or an email (send-flow.js:47–61),
    // but NOTHING in this repository sends that recipient a tracking link —
    // there is no notification code here at all. The link being public and
    // shareable is verifiable; the product delivering it is not.
    //
    // PHASE 6.1 ALSO NARROWED THE LABEL. It read "One link, no login", which
    // was true of the no-login half and misleading on the other: there are TWO
    // tracking routes with two different identifiers and two different
    // payloads, so "one link" could be read as one identical URL that every
    // party opens. It is not. The label now names the property that is
    // actually verified — no account is involved — and the body says the
    // sharing is something the holder does, not something the product does.
    title: 'Tracking access without an account',
    body: 'Open the delivery from its tracking link and share that access with the people who need status visibility.',
  },
  {
    // VERIFIED: track/[trackingCode]/page.jsx:149–163 renders Order Placed
    // (createdAt), On Route To Pickup and Package Picked Up, each formatted as
    // a date and time; `delivered` is a value of the 9-value TaskStatusType
    // documented at LiveTracking.jsx:14–23. These are the product's own labels,
    // so a visitor who later opens a tracking page meets the same words.
    title: 'Status recorded as the job moves',
    body: 'Order placed, on route to pickup, package picked up and delivered — each one timestamped as it happens.',
  },
  {
    // ⚠️ DELIBERATELY NARROWER THAN "REMAINS AVAILABLE".
    //
    // Retrieval is verifiable: the tracking page is keyed on the code in the
    // URL and re-fetches on every request (`cache: 'no-store'`, page.jsx:67).
    // RETENTION IS NOT. How long the backend keeps a completed order is a
    // property of a service outside this repository, and no evidence for it was
    // produced. So this says information CAN BE RETRIEVED with the code, and
    // stops there — it does not promise the record will still be there in a
    // year. Widen this only when a retention period is documented.
    title: 'A record you can return to',
    body: 'Delivery information can be retrieved using its tracking code.',
  },
]

export function TrustAndAccountability() {
  return (
    <section
      aria-labelledby="trust-accountability"
      className="mx-auto max-w-[1200px] px-8 py-12 sm:py-24"
    >
      {/* Uppercased in CSS rather than typed in capitals, so a screen reader
          receives a normal phrase rather than a run of letters. #5f5868 rather
          than #8d8695: at 12px the lighter tone measures 3.21:1 on this ground,
          the failure Phase 1 removed from this codebase and Phase 4 briefly
          reintroduced. */}
      <span className="block text-xs font-semibold uppercase tracking-label text-[#5f5868]">
        Accountability built in
      </span>

      <h2
        id="trust-accountability"
        className="mt-3 font-display text-3xl font-extrabold text-[#17131c]"
      >
        Know where the delivery stands
      </h2>
      <p className="mt-2.5 max-w-[620px] text-lg text-[#5f5868]">
        Every job runs on one tracked record — open from a link, timestamped as
        it moves, and retrievable once it is done.
      </p>

      <div className="mt-9 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className={PILLAR}>
            <h3 className="text-base font-bold text-[#17131c]">
              {pillar.title}
            </h3>
            <p className="mt-1.5 text-sm text-[#5f5868]">{pillar.body}</p>
          </div>
        ))}
      </div>

      {/* CLOSING ROW — service area on one side, the two segmented actions on
          the other.

          The service area is a single line rather than the eight-neighbourhood
          list it replaces, and SERVICE_AREA is read from navigation.js so the
          footer and this section cannot drift apart.

          A ROW, NOT A FOURTH CARD. A fourth pillar would have been added for
          symmetry rather than because coverage is a third of this argument, and
          the brief rules that out explicitly.

          The two CTAs repeat the hero's, which is deliberate here and only
          here: this is the page's last section, and `HOMEPAGE.md` → Homepage
          Narrative ships a closing dual CTA "Always". They stay segmented —
          consumers to the booking flow, businesses to a human — because routing
          either into the other's path is a defect, not an experiment. */}
      <div className="mt-10 flex flex-col gap-6 border-t border-[#eeebf1] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold text-[#17131c]">{SERVICE_AREA}</p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={ROUTES.send.href}
            className="inline-block rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Book a delivery
          </Link>
          <Link
            href={ROUTES.contact.href}
            className="inline-block rounded-control border-[1.5px] border-[#e3dfe8] px-[30px] py-4 text-base font-semibold text-[#17131c] transition-colors motion-reduce:transition-none hover:border-[#17131c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Talk to our team
          </Link>
        </div>
      </div>
    </section>
  )
}
