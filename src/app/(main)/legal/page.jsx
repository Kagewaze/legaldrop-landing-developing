import { BRAND } from '@/lib/config'
import { PARTNER_URL } from '@/lib/navigation'
import {
  AuditableRecord,
  LiveTracking,
  TimestampedTracking,
} from '@/components/icons'
import { Coverage } from '@/components/home/Coverage'
import { ExpandingGallery } from '@/components/ExpandingGallery'
import { WhyBrand } from '@/components/home/WhyBrand'
import courthouse from '@/images/legal-courthouse.jpg'
import document from '@/images/legal-document.jpg'
import lawoffices from '@/images/legal-lawoffices.jpg'

// /legal — a B2B lead-generation page for law firms.
//
// NOT a booking surface. Every call to action here registers a firm on the
// partner platform. No send-flow embed, no address form, no price.
//
// ⚠️ This paragraph used to say firms "run on accounts, matter-level billing
// and vetted-driver arrangements". Matter-level billing and driver vetting are
// not evidenced anywhere in this repository and were removed from the public
// copy in Phases 4.2 and 4.3; the description went with them, because a comment
// that states a removed claim as fact is how it gets restored.
//
// ── COPY IS CONSTRAINED. READ BEFORE EDITING ────────────────────────────────
//
// The design export (design/Druppr Legal.dc.html) is the VISUAL reference only.
// Its copy makes claims this business cannot currently evidence, excluded on
// purpose — not overlooked:
//
//   "Downtown filings in under 90 minutes"  no committed time exists
//   "100% signed proof" / "Signature — Captured"  handover is a DROP-OFF CODE
//   "Affidavit of service" / sworn service  no affidavit is produced
//   "Seal — Unbroken", "tamper-evident envelopes"  no seal programme exists
//   "Sealed chain-of-custody", seal numbers  unverified
//   "Up to three attempts included"     no such service level is defined
//   NDA / confidentiality-module gating  not a product that exists
//
// The buyer here is a firm relying on delivery proof in a proceeding. A claim
// about sworn service, signatures or seals that does not hold is not a
// marketing problem — it is a claim a court may be asked to lean on.
//
// This line used to end "describe only the proof this system actually produces:
// a timestamped trail and a drop-off code." Both halves have since changed. The
// drop-off code was removed in Phase 4.2 (not rendered anywhere in this
// repository; blocked by Phase 0 pending five founder confirmations), and Phase
// 4.3 stopped using the word PROOF on this page at all — Phase 0 D10 lists
// proof-of-delivery evidentiary weight as blocked, so nothing here should be
// framed as proving anything.
//
// DESCRIBE ONLY: a timestamped status trail, retrievable by tracking code.

export const metadata = {
  title: 'Legal document delivery',
}

// PHASE 4.2 removed 'Confidentiality-trained drivers' — the confidentiality
// course is planned work with no completion record, and the claim was the same
// one the record cards below had just lost, stated more baldly and rendered
// higher on the page.
//
// PHASE 4.3 removed the two it had flagged and left standing:
//
//   'Proof of delivery'  REMOVED. Ambiguous in the one context where ambiguity
//     is expensive. To a firm, "proof" reads as evidentiary weight, and Phase 0
//     D10 lists proof-of-delivery evidentiary claims as BLOCKED — no legal
//     review has confirmed what the record proves or what standard it meets.
//     What this product makes is a timestamped status trail retrievable by
//     tracking code, so that is what the strip now says. Not restated as
//     "legally valid proof", "court-ready", "verified legal service" or
//     "indisputable confirmation".
//   'Fully insured'      REMOVED. No policy, effective dates, insured entity,
//     covered operations or exclusions were produced. VISION.md → Trust
//     Philosophy names this exact phrase: "No 'fully insured' gloss over an
//     undefined reality." Not softened to "protected", "covered" or "liability
//     protected".
//
// Both are RESTORABLE the day the evidence exists. 'Shared tracking link' is
// the replacement because it is the one verified facet the record cards below
// do not carry: track/[trackingCode] and track-partner/[trackingToken] serve
// the same job to the firm and to the recipient.
const CREDENTIALS = [
  'Delivery record',
  'Timestamped status',
  'Shared tracking link',
]

// Rendered by the shared ExpandingGallery. Descriptions are unchanged from the
// card grid this replaced — see the constraints block above before touching a
// word of them. Alt text describes what is in the frame and nothing more: on
// this page especially, a photograph must not imply a proof mechanism the copy
// deliberately does not claim.
const SERVICES = [
  {
    title: 'Court filings',
    description:
      // PHASE 4.2: "and the drop-off confirmed on arrival" removed — the only
      // confirmation mechanism named anywhere is the unverifiable code.
      'Documents taken from your office to the registry, with the trip tracked from pickup through completion.',
    image: courthouse,
    alt: 'A stone courthouse building with a Canadian flag flying outside.',
  },
  {
    title: 'Confidential document delivery',
    description:
      // PHASE 4.2: "carried by drivers trained on confidentiality" removed —
      // the confidentiality course is planned, not delivered.
      'Client files and sensitive correspondence carried to the destination you name, tracked from pickup through completion.',
    image: document,
    alt: 'Two people passing a large document envelope across a desk.',
  },
  {
    title: 'Process serving',
    description:
      'Served documents delivered to the address you provide, with a timestamped record of the attempt returned to your firm.',
    image: lawoffices,
    alt: 'Carved "Law Offices" lettering on the facade of a building.',
  },
]

// Passed to the shared WhyBrand grid, in the same card treatment as the home
// page.
//
// PHASE 4.3 renamed this from PROOF_REASONS, and renamed the section heading it
// renders under from "Proof of delivery" to "The record every job leaves". The
// three cards were already accurate — they describe timestamps, status and
// retrieval — but the heading above them was doing the overclaiming, framing
// all three as PROOF to a buyer who may one day rely on that word in a
// proceeding. Phase 0 D10 lists proof-of-delivery evidentiary weight as
// BLOCKED, so the frame had to go even though its contents could stay.
//
// Do not restore "proof" as the heading without legal review confirming both
// what the record proves and what standard it satisfies.
const RECORD_REASONS = [
  {
    title: 'Timestamped tracking',
    description: 'Every job carries a live, time-stamped record of the trip.',
    icon: <TimestampedTracking className="h-5 w-5" />,
  },
  {
    // WAS: 'Drop-off code confirmation — A code confirms the handover at the
    // destination.' Removed in Phase 4.2. The code is not rendered anywhere in
    // this repository and Phase 0 blocks it pending founder verification of
    // where it is generated, who receives it, how it is validated, whether it
    // is live, and what is retained. No substitute mechanism was introduced —
    // no PIN, no signature, no seal.
    title: 'Route and status visibility',
    description: 'Follow the job from pickup through completion.',
    icon: <LiveTracking className="h-5 w-5" />,
  },
  {
    // WAS: 'Vetted drivers — Confidentiality training is required to take
    // these jobs.' The confidentiality course is PLANNED work: it does not yet
    // exist, is not assigned, and has no completion record. "Vetted" was
    // dropped with it — driver vetting is not evidenced here either.
    //
    // An intermediate revision put 'Same-day across the GTA — Requested and
    // dispatched the same day' here. That was ALSO WRONG and is recorded so it
    // is not reintroduced: it swapped an unevidenced training claim for a new
    // dispatch-timing promise, on a page under a "Proof of delivery" heading,
    // when Phase 0 withheld pickup-time claims and said they must not be
    // replaced by another timing promise. Removing one unsupported claim by
    // adding a different one is not a claim-hygiene pass.
    //
    // What is here instead is the third genuinely distinct, repository-verified
    // fact about the record: it survives the delivery and is retrievable by
    // code. src/app/track/[trackingCode]/page.jsx fetches /public/track/{code}
    // and renders Tracking Code, Category, Vehicle, Order Placed, On Route To
    // Pickup and Package Picked Up. This is the same statement already shipped
    // on the homepage showcase caption in Phase 4.
    title: 'A record you can retrieve',
    description: 'Every job’s record is retrievable from its tracking code.',
    icon: <AuditableRecord className="h-5 w-5" />,
  },
]

// THE GALLERY IS THE HERO.
//
// This page used to open with a text-only tinted band and show the photography
// three sections down. It now leads with the photography and the text band is
// gone — the h1 and its lead moved onto the gallery, which renders once, at the
// top, as the page's first section. There is no second copy: the same three
// photographs a visitor sees at the top ARE the service panels.
//
// The design's own hero centred on an "AFFIDAVIT OF SERVICE" proof pack — a job
// number, a signature line, a seal status, a PDF download. Every element of it
// is on the exclusion list above, which is why this page never had a visual
// hero panel to promote in the first place. The photographs carry it instead.
//
// The hero ground is surface-ink and the credentials strip directly beneath is
// also surface-ink, so the two read as one dark masthead that the photographs
// sit inside, rather than as a tint band followed by a dark rule.
//
// The h1 and lead below are the vetted copy from the old hero, unchanged. The
// old hero also carried a "Register your firm" button; it is not duplicated
// here because the open panel already shows that exact call to action a few
// hundred pixels lower, pointing at the same place.
export default function LegalPage() {
  return (
    <div className="bg-surface-page">
      <ExpandingGallery
        heading="Legal document delivery for GTA firms"
        // "served documents" was here. Unqualified it reads as asserting that
        // service was legally effected, which this business does not claim.
        // It survived in the old hero because the Process serving panel sat
        // close enough to qualify it; promoting this copy to the top moved
        // that qualifier several hundred pixels away. So the lede now mirrors
        // how :74 frames it — the trip and the record, never the legal
        // outcome: "a timestamped record of the attempt returned to your firm."
        //
        // PHASE 4.2 removed two more claims from this same sentence:
        //
        //   "moved by vetted drivers"  — driver vetting is not evidenced
        //     anywhere in this repository, and the RECORD_REASONS card that
        //     also said it was dropped in this pass. Leaving it in the h1 lede
        //     while removing it from a card below would have been incoherent.
        //   "with proof on every job"  — an unqualified proof claim, in the
        //     first sentence a firm reads, on a page whose whole risk is a
        //     buyer relying on our proof in a proceeding. Phase 0 D10 lists
        //     proof-of-delivery evidentiary weight as BLOCKED.
        //
        // The replacement is the wording approved for the homepage legal lead
        // (VerticalSection.jsx LEGAL_VERTICAL), so the two surfaces now say the
        // same true thing. It describes the workflow and the record, and claims
        // no sworn service, admissibility, signature, affidavit or custody.
        lede="Filings, confidential files and process-serving runs coordinated through a tracked delivery workflow, with timestamped status from request through completion."
        panels={SERVICES}
        cta="Register your firm"
        headingLevel="h1"
        // Panel titles move up with the section heading. Left at their default
        // h3 under an h1 the outline skips a level, which is what this page
        // shipped for the first build of this rework.
        panelHeadingLevel="h2"
        // Below lg this gallery is the whole hero, and three full-height cards
        // made that 1389px on a 390 phone. Compact mode keeps the open panel
        // and turns the other two into tappable rows.
        mobileHeroMode
        groundClassName="bg-surface-ink"
        headingClassName="font-display text-4xl font-extrabold text-white sm:text-5xl"
        ledeClassName="mt-4 max-w-[560px] text-lg text-white/85"
      />
      <Credentials />
      <WhyBrand heading="The record every job leaves" reasons={RECORD_REASONS} />
      <Coverage />
      <FinalCta />
    </div>
  )
}

function Credentials() {
  return (
    <section className="bg-surface-ink text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-8 py-6">
        {CREDENTIALS.map((credential) => (
          <div key={credential} className="flex items-center gap-2.5">
            <span className="h-[7px] w-[7px] flex-none rounded-full bg-brand-600" />
            <span className="text-sm font-semibold tracking-label">
              {credential}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
      <div className="flex flex-wrap items-center justify-between gap-8 rounded-card bg-brand-600 p-8 text-white sm:p-11">
        <div className="max-w-[560px]">
          <div className="font-display text-3xl font-bold">Register your firm</div>
          <div className="mt-2 text-base opacity-85">
            Filings, confidential files and process serving, managed from the{' '}
            {BRAND.name} partner platform.
          </div>
        </div>

        <a
          href={PARTNER_URL}
          className="rounded-control bg-white px-[30px] py-4 text-base font-semibold text-brand-600 transition-colors hover:bg-[#f2e9fa] hover:text-[#5d1f96]"
        >
          Get started
        </a>
      </div>
    </section>
  )
}

// The PartnerCta helper that used to live here went with the text hero — that
// hero was its only caller. Every remaining partner link on this page is a
// plain anchor at its own call site: FinalCta above, and the per-panel CTA
// inside ExpandingGallery, which takes the label as a prop.
//
// PARTNER_URL is a different origin, so these are anchors rather than
// next/link, and they open in the same tab: registering a firm is the
// continuation of this page's journey, not a detour from it.
