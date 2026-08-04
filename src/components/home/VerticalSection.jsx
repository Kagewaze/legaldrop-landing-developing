import Link from 'next/link'

import { ROUTES } from '@/lib/navigation'

// The two account-based verticals, given real weight on the home page.
//
// One component rendered twice. The differences between them are the content,
// the product frame each carries, which side that frame sits on, and whether
// the section has a tint band — so they are props, not a second file.
//
// WHY THESE TWO GET A SECTION AT ALL. Everything else on this page is
// instant-booked: enter two addresses, see a price, pay. Medical and legal are
// the opposite — contracted, account-based, no price quoted here. That is a
// genuine difference in how a customer buys, not a difference in marketing
// emphasis, and it is what the eyebrow above each heading is for. It sets the
// click expectation before the reader commits: this link goes to a page about
// opening an account, not to a checkout.
//
// ── PHASE 5 — WHY THE PHOTOGRAPHS ARE GONE ──────────────────────────────────
//
// Each section used to lead with a 4:3 photograph: a specimen rack for medical,
// a document handover for legal. Both are stock, and stock is the weakest thing
// these two sections could put in their most valuable position. It proves
// nothing — any competitor can license the same frame — and on a page whose
// whole argument is "this is software, not a courier" it argues the opposite.
//
// Each is replaced by a compact frame built from fields the product genuinely
// captures and renders. The frames are deliberately DIFFERENT from each other,
// because the two buyers are asking different questions:
//
//   medical  what does a request capture, and what will fit?   → a request spec
//   legal    what remains afterwards, and who can see it?      → a record
//
// They are also deliberately lighter than home/PlatformShowcase's three frames,
// which sit directly above: same card recipe and same status vocabulary so the
// page reads as one system, but four fields rather than six, no step index, and
// no route drawing. The showcase is the platform; these are one vertical's view
// of it.
//
// ⚠️ BOTH FRAMES CARRY SAMPLE VALUES AND BOTH SAY SO. The "Sample" chip in each
// frame header is the same device PlatformShowcase uses, and it is not
// decoration — Phase 0 (D2/D4) requires demonstration data to be labelled
// adjacent to the artifact, not in a footnote. Do not remove it while the
// values remain synthetic, and do not substitute plausible real-looking
// customer values for them.
//
// ── COPY IS CONSTRAINED. READ BEFORE EDITING ────────────────────────────────
//
// The copy below is bound by the SAME exclusion lists that govern the pages it
// links to. Those lists are the authority and they live at their call sites:
//
//   src/app/(main)/medical/page.jsx   the block above CREDENTIALS
//   src/app/(main)/legal/page.jsx     the block above SERVICES
//
// In short, and non-exhaustively: no pickup-time figure, no client count, no
// captured signature, no photo proof, no seals or tamper-evident packaging, no
// affidavit of service, no temperature or cold-chain claim, no standing or
// scheduled routes, no invoicing, no insurance, no TDG or confidentiality
// certification, no attempt-count service level, and nothing framed as PROOF.
// These buyers are audited themselves, and the legal claims are ones a court
// may be asked to lean on.
//
// Read the full lists before changing a word here. A claim that is wrong on
// this page is wrong in the same way it would be on the destination page — it
// is simply reaching the reader one screen earlier.

// Card recipe, borrowed verbatim from home/PlatformShowcase.jsx so the frames
// on this page terminate identically.
const CARD =
  'overflow-hidden rounded-card border-[1.5px] border-[#eeebf1] bg-surface-raised shadow-card'

// Primary link recipe, plus the focus treatment from home/Hero.jsx.
const CTA =
  'mt-8 inline-block rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

// Uppercased in CSS rather than typed in capitals, so the text a screen reader
// receives is a normal phrase rather than a run of letters.
// #5f5868, not #8d8695. Measured at 14px: 3.21:1 on surface-tint and 3.35:1 on
// surface-page, both under the 4.5:1 floor. #5f5868 is the existing secondary
// body tone and clears it on every ground this eyebrow sits on — no new token.
const EYEBROW =
  'block text-sm font-semibold uppercase tracking-label text-[#5f5868]'

// Frame chrome. The header carries the frame's name and the Sample chip; the
// footer carries one line saying what the frame is showing.
function FrameHeader({ title }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eeebf1] bg-surface-tint px-5 py-3.5">
      <span className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
        {title}
      </span>
      <span className="rounded-full bg-[#17131c]/[0.06] px-2.5 py-1 text-xs font-semibold text-[#17131c]">
        Sample
      </span>
    </div>
  )
}

function FrameNote({ children }) {
  return (
    <p className="border-t border-[#eeebf1] px-5 py-3 text-sm text-[#5f5868]">
      {children}
    </p>
  )
}

// A label/value row, the shape every tracking surface in the product uses.
function Field({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="flex-none text-sm text-[#5f5868]">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-semibold text-[#17131c]">
        {value}
      </dd>
    </div>
  )
}

// MEDICAL FRAME — what a request captures.
//
// Every field and every value is real:
//   Category   `medical_supply`, one of three SECTION_PRESETS in
//              send/page.jsx:143, rendered title-cased as the tracking pages do
//   Vehicle    one of the six names in send/vehicles.js
//   Packages   send-flow.js EMPTY_STATE.packageCount, set by the <Stepper> in
//              send/details/page.jsx:115 and priced in PriceBreakdown.jsx:39
//   Weight     WEIGHT_OPTIONS[0].label in send-flow.js:78, verbatim
function MedicalFrame() {
  return (
    <div className={CARD}>
      <FrameHeader title="Delivery request" />
      <dl className="flex flex-col px-5 py-3">
        <Field label="Category" value="Medical supply" />
        <Field label="Vehicle" value="Car" />
        <Field label="Packages" value="3" />
        <Field label="Weight" value="Under 15 kg" />
      </dl>
      <FrameNote>
        Every request records what is moving, the vehicle it needs, and how many
        packages at what weight.
      </FrameNote>
    </div>
  )
}

// LEGAL FRAME — what remains afterwards.
//
// The four entries are the timestamp fields both tracking surfaces render:
// createdAt, onRouteToPickup and packagePickedUp (track/[trackingCode]/page.jsx
// :152–163) plus a status reaching `delivered` from the 9-value TaskStatusType
// in LiveTracking.jsx:14–23. Labels match the product's own wording.
//
// Times differ from the ones in PlatformShowcase's third frame on purpose:
// these are two separate demonstrations on one page, and reusing the same clock
// would imply they are the same job.
//
// The tracking code is the retrieval mechanism, and the note names the one
// genuinely distinguishing fact for this buyer — the link is shared, so the
// firm and the recipient read the same record. NOTHING here is framed as proof,
// service of process, or evidence.
const LEGAL_TRAIL = [
  { label: 'Order placed', time: '14:05' },
  { label: 'On route to pickup', time: '14:21' },
  { label: 'Package picked up', time: '14:38' },
  { label: 'Delivered', time: '15:12' },
]

function LegalFrame() {
  return (
    <div className={CARD}>
      <FrameHeader title="Delivery record" />
      <ol className="flex flex-col px-5 py-3">
        {LEGAL_TRAIL.map((entry, index) => (
          <li
            key={entry.label}
            className="flex items-baseline justify-between gap-4 py-2"
          >
            <span className="flex items-baseline gap-3 text-sm text-[#5f5868]">
              {/* The dot is redundant reinforcement for the ordering the <ol>
                  already carries, so it is hidden from assistive technology.
                  The last entry takes the brand fill because it is the terminal
                  status, never because colour alone is carrying meaning — the
                  status is written out beside it. */}
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 flex-none translate-y-[-2px] rounded-full ${
                  index === LEGAL_TRAIL.length - 1
                    ? 'bg-brand-600'
                    : 'bg-[#c9c3d1]'
                }`}
              />
              {entry.label}
            </span>
            <span className="min-w-0 text-right text-sm font-semibold tabular-nums text-[#17131c]">
              {entry.time}
            </span>
          </li>
        ))}
      </ol>
      <FrameNote>
        Every job leaves this trail, retrievable from its tracking code — on one
        link your firm and the recipient both read.
      </FrameNote>
    </div>
  )
}

export const MEDICAL_VERTICAL = {
  eyebrow: 'For clinics & labs',
  // PHASE 5. Was "Same-day medical transport" — accurate, but it named a
  // courier service. This names the thing the section actually shows: the
  // delivery, and the fact that you can see it.
  heading: 'Medical logistics with the delivery in view',
  // Claim history, so none of it is reintroduced:
  //   "Monthly invoicing"               removed — names a billing product that
  //                                     does not exist (Phase 4.3 removed the
  //                                     last of it from /medical).
  //   "moved by TDG-certified drivers"  removed in Phase 4.2 — the founder is
  //                                     certified, the drivers are not.
  //   "Standing routes"                 removed in Phase 4.2 — no scheduling
  //                                     exists in the send flow or the payload.
  //
  // Do NOT reintroduce specimen-handling certification, cold-chain capability,
  // temperature control, PHIPA, chain of custody or TDG here. Each needs
  // separate evidence, and Phases 4.2 and 4.3 removed every one of them from
  // the public copy.
  lead: 'Coordinate specimens, pharmaceuticals and clinic supplies through a tracked workflow, with route and status visibility from pickup through completion.',
  // The account framing moved out of the lead and into its own line so the lead
  // is one idea. It is a fact about how these buyers purchase, not a claim
  // about a feature.
  note: 'Arranged on your clinic’s account rather than booked per drop.',
  cta: 'See medical delivery',
  href: ROUTES.medical.href,
  frame: <MedicalFrame />,
}

export const LEGAL_VERTICAL = {
  eyebrow: 'For law firms',
  // PHASE 5. Was "Filings and confidential files" — a list of cargo. This names
  // the record, which is the thing a firm is actually buying, and it is the one
  // word this page is allowed to use. "Proof" is not: Phase 0 D10 lists
  // proof-of-delivery evidentiary weight as BLOCKED and Phase 4.3 removed the
  // word from /legal entirely.
  heading: 'Legal delivery with a record at every step',
  // Claim history, so none of it is reintroduced:
  //   "Served documents"                removed — reads as an assertion that
  //                                     service was legally effected. /legal is
  //                                     careful about exactly this: its Process
  //                                     serving panel promises the trip and the
  //                                     record of the ATTEMPT, never the legal
  //                                     outcome.
  //   "and a drop-off code"             removed in Phase 4.1 — not rendered
  //                                     anywhere in this repository, blocked by
  //                                     Phase 0 pending five confirmations.
  //   "drivers who must complete
  //    confidentiality training"        removed in Phase 4.2 — the course is
  //                                     planned work with no completion record.
  //
  // The timestamped status that remains is real: createdAt, onRouteToPickup,
  // packagePickedUp, and a status reaching `delivered`. It is described as a
  // record and nothing more — no sworn service, no admissibility, no captured
  // signature, no affidavit, no evidentiary chain of custody.
  lead: 'Coordinate filings, confidential files and process-serving runs through a tracked workflow, with timestamped status from request through completion.',
  note: 'Arranged on your firm’s account rather than booked per drop.',
  cta: 'See legal delivery',
  href: ROUTES.legal.href,
  frame: <LegalFrame />,
}

export function VerticalSection({
  eyebrow,
  heading,
  lead,
  note,
  cta,
  href,
  frame,
  // Which side the frame takes at lg. Below lg the panes stack and the frame is
  // always second — unlike the photograph it replaced, which led. A product
  // frame is the evidence for the claim above it, so on a phone the claim
  // should arrive first and the evidence should follow it.
  frameSide = 'left',
  // A full-bleed tint band. It needs the wrapper below for the same reason
  // home/Services.jsx does: the tint runs the whole viewport while the content
  // stays in the 1200px column, and those cannot be the same element.
  tinted = false,
}) {
  return (
    <section className={tinted ? 'bg-surface-tint' : undefined}>
      {/* py-12 while stacked rather than the site's py-16, the same allowance
          home/PlatformShowcase.jsx takes: a product frame plus its copy is
          already a tall block on a phone, and that height is content rather
          than padding. The full rhythm returns from sm. */}
      <div className="mx-auto max-w-[1200px] px-8 py-12 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* DOM order is copy then frame, always, so the reading order a
              screen reader or keyboard user gets never depends on which side
              the frame happens to sit on at lg. `order` only reorders the two
              columns from lg up. */}
          <div className={frameSide === 'left' ? 'lg:order-2' : undefined}>
            <span className={EYEBROW}>{eyebrow}</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-[#17131c]">
              {heading}
            </h2>
            <p className="mt-4 max-w-[560px] text-lg text-[#5f5868]">{lead}</p>
            {note && (
              <p className="mt-3 max-w-[560px] text-base text-[#5f5868]">
                {note}
              </p>
            )}
            {/* Internal, so next/link — this goes to the vertical's own page,
                which is where the partner-platform call to action lives. It
                deliberately does NOT jump straight to that platform: the page
                in between is the one that does the selling. */}
            <Link href={href} className={CTA}>
              {cta}
            </Link>
          </div>

          <div className={frameSide === 'left' ? 'lg:order-1' : undefined}>
            {frame}
          </div>
        </div>
      </div>
    </section>
  )
}
