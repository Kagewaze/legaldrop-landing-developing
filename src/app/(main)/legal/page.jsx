import { BRAND } from '@/lib/config'
import { PARTNER_URL } from '@/lib/navigation'
import {
  DropOffCode,
  TimestampedTracking,
  VettedDrivers,
} from '@/components/icons'
import { Coverage } from '@/components/home/Coverage'
import { ExpandingGallery } from '@/components/ExpandingGallery'
import { WhyBrand } from '@/components/home/WhyBrand'
import courthouse from '@/images/legal-courthouse.jpg'
import document from '@/images/legal-document.jpg'
import lawoffices from '@/images/legal-lawoffices.jpg'

// /legal — a B2B lead-generation page for law firms.
//
// NOT a booking surface. Firms run on accounts, matter-level billing and
// vetted-driver arrangements, so every call to action here registers a firm on
// the partner platform. No send-flow embed, no address form, no price.
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
// marketing problem — it is a claim a court may be asked to lean on. Describe
// only the proof this system actually produces: a timestamped trail and a
// drop-off code.

export const metadata = {
  title: 'Legal document delivery',
}

const CREDENTIALS = [
  'Proof of delivery',
  'Confidentiality-trained drivers',
  'Fully insured',
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
      'Documents taken from your office to the registry, with the trip tracked and the drop-off confirmed on arrival.',
    image: courthouse,
    alt: 'A stone courthouse building with a Canadian flag flying outside.',
  },
  {
    title: 'Confidential document delivery',
    description:
      'Client files and sensitive correspondence carried by drivers trained on confidentiality, released at the destination you name.',
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

// Passed to the shared WhyBrand grid — the "Proof of delivery" section from the
// brief, rendered in the same card treatment as the home page.
const PROOF_REASONS = [
  {
    title: 'Timestamped tracking',
    description: 'Every job carries a live, time-stamped record of the trip.',
    icon: <TimestampedTracking className="h-5 w-5" />,
  },
  {
    title: 'Drop-off code confirmation',
    description: 'A code confirms the handover at the destination.',
    icon: <DropOffCode className="h-5 w-5" />,
  },
  {
    title: 'Vetted drivers',
    description: 'Confidentiality training is required to take these jobs.',
    icon: <VettedDrivers className="h-5 w-5" />,
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
        lede="Filings, confidential files and process-serving runs moved by vetted drivers, with proof on every job."
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
      <WhyBrand heading="Proof of delivery" reasons={PROOF_REASONS} />
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
