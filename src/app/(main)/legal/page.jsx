import { BRAND } from '@/lib/config'
import { PARTNER_URL } from '@/lib/navigation'
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
    icon: <span className="h-[4px] w-[14px] rounded-[2px] bg-white" />,
  },
  {
    title: 'Drop-off code confirmation',
    description: 'A code confirms the handover at the destination.',
    icon: (
      <span className="mb-[3px] h-[10px] w-[14px] border-b-2 border-l-2 border-white" />
    ),
  },
  {
    title: 'Vetted drivers',
    description: 'Confidentiality training is required to take these jobs.',
    icon: <span className="h-[12px] w-[12px] rotate-45 bg-white" />,
  },
]

export default function LegalPage() {
  return (
    <div className="bg-white">
      <Hero />
      <Credentials />
      <ExpandingGallery
        heading="Legal services"
        panels={SERVICES}
        cta="Register your firm"
      />
      <WhyBrand heading="Proof of delivery" reasons={PROOF_REASONS} />
      <Coverage />
      <FinalCta />
    </div>
  )
}

// The design's hero centres on an "AFFIDAVIT OF SERVICE" proof pack — a job
// number, a signature line, a seal status, a PDF download. All of it is
// excluded above, so the panel is not reproduced.
function Hero() {
  return (
    <section className="border-b border-[#f0eaf6] bg-[#faf7fd]">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-20">
        <div className="max-w-[720px]">
          <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#17131c] sm:text-[46px]">
            Legal document delivery for GTA firms
          </h1>
          <p className="mt-4 max-w-[560px] text-[17px] leading-[1.55] text-[#5f5868]">
            Filings, confidential files, and served documents moved by vetted
            drivers, with proof on every job.
          </p>

          <PartnerCta className="mt-8">Register your firm</PartnerCta>
        </div>
      </div>
    </section>
  )
}

function Credentials() {
  return (
    <section className="bg-[#241a2e] text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-3 px-8 py-6">
        {CREDENTIALS.map((credential) => (
          <div key={credential} className="flex items-center gap-2.5">
            <span className="h-[7px] w-[7px] flex-none rounded-full bg-brand-600" />
            <span className="text-[14px] font-semibold tracking-[0.01em]">
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
    <section className="mx-auto max-w-[1200px] px-8 py-14">
      <div className="flex flex-wrap items-center justify-between gap-8 rounded-[22px] bg-brand-600 p-8 text-white sm:p-11">
        <div className="max-w-[560px]">
          <div className="text-[26px] font-extrabold tracking-[-0.02em] sm:text-[30px]">
            Register your firm
          </div>
          <div className="mt-2 text-[16px] leading-[1.5] opacity-85">
            Filings, confidential files and process serving, managed from the{' '}
            {BRAND.name} partner platform.
          </div>
        </div>

        <a
          href={PARTNER_URL}
          className="rounded-xl bg-white px-[30px] py-4 text-[16px] font-bold text-brand-600 transition-colors hover:bg-[#f2e9fa] hover:text-[#5d1f96]"
        >
          Get started
        </a>
      </div>
    </section>
  )
}

// External origin — plain anchors, not next/link. Same tab, as on /medical.
//
// The matching PartnerLink helper went with the card grid; its per-panel CTA
// now lives inside ExpandingGallery, which takes the label as a prop.
function PartnerCta({ children, className = '' }) {
  return (
    <a
      href={PARTNER_URL}
      className={`inline-block rounded-xl bg-brand-600 px-[30px] py-4 text-[16px] font-bold text-white transition-colors hover:bg-brand-700 ${className}`}
    >
      {children}
    </a>
  )
}
