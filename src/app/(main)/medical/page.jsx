import { BRAND } from '@/lib/config'
import { PARTNER_URL } from '@/lib/navigation'
import { Coverage } from '@/components/home/Coverage'
import { ExpandingGallery } from '@/components/ExpandingGallery'
import { WhyBrand } from '@/components/home/WhyBrand'
import pharma from '@/images/medical-pharma.jpg'
import specimen from '@/images/medical-specimen.jpg'
import temp from '@/images/medical-temp.jpg'

// /medical — a B2B lead-generation page for clinics, labs and pharmacies.
//
// NOT a booking surface. Medical delivery is an account relationship (standing
// routes, per-location billing, driver certification on file), so every call to
// action here opens an account on the partner platform. There is deliberately
// no send-flow embed, no address form and no price on this page: quoting a
// consumer fare for specimen transport would set the wrong expectation for a
// service that is contracted, not booked per-drop.
//
// ── COPY IS CONSTRAINED. READ BEFORE EDITING ────────────────────────────────
//
// The design export (design/Druppr Medical.dc.html) is the VISUAL reference
// only. Its copy carries claims this business has not verified, and they are
// excluded on purpose — not overlooked:
//
//   "Average pickup in 34 minutes"      no measured figure exists
//   "140+ GTA clinics and labs served"  no verified count exists
//   "Temperature logged every 60 seconds"  no such telemetry exists
//   "Signature on delivery"             handover is a DROP-OFF CODE, not a signature
//   "Photo proof of handover"           no photo is captured
//   "Tamper-evident bags", "sealed"     no sealed-bag programme exists
//   "Category B compliant packaging"    unverified regulatory claim
//   "Validated coolers", "excursion alerts"  unverified
//
// This page sells regulated medical transport to buyers who are themselves
// audited. An unverifiable claim here is not marketing puffery — it is the
// thing a clinic's compliance officer relies on when they hand over a
// specimen. Do not add a statistic, a temperature guarantee, a signature claim
// or a chain-of-custody mechanism that this business cannot evidence on
// request.

export const metadata = {
  title: 'Medical courier',
}

// Rendered in the dark strip under the hero. Each is a standing capability of
// the service, not a performance claim.
const CREDENTIALS = [
  'TDG-licensed',
  'Fully insured',
  'Chain-of-custody',
  'Temperature-controlled',
]

// Rendered by the shared ExpandingGallery. Descriptions are unchanged from the
// card grid this replaced — see the constraints block above before touching a
// word of them. Alt text describes what is in the frame and nothing more: these
// photographs must not narrate a capability the copy is careful not to claim.
const SERVICES = [
  {
    title: 'Pharmaceutical delivery',
    description:
      'Prescriptions and pharmacy stock moved between locations the same day, by drivers certified to carry regulated goods.',
    image: pharma,
    alt: 'A courier moving boxes on a hand truck from a delivery van.',
  },
  {
    title: 'Lab & specimen transport',
    description:
      'Samples collected from your clinic and delivered to the receiving lab, with the handover confirmed and the trip tracked end to end.',
    image: specimen,
    alt: 'Sample tubes standing in a laboratory rack.',
  },
  {
    title: 'Temperature-controlled transport',
    description:
      'Cold-chain capable vehicles for goods that cannot travel at ambient temperature. Tell us the range your shipment needs.',
    image: temp,
    alt: 'A gloved hand holding a metal transport canister packed with cold packs.',
  },
]

// Passed to the shared WhyBrand grid — same styling as the home page, written
// for a clinic buyer rather than a consumer.
const CLINIC_REASONS = [
  {
    title: 'Certified drivers',
    description:
      'TDG certification is required to take these jobs, and enforced.',
    icon: <span className="h-[12px] w-[12px] rotate-45 bg-white" />,
  },
  {
    title: 'A record you can audit',
    description:
      'Every job carries live tracking and drop-off code confirmation.',
    icon: <span className="h-[4px] w-[14px] rounded-[2px] bg-white" />,
  },
  {
    title: 'Standing scheduled routes',
    description: 'Recurring pickups at set times, arranged on your account.',
    icon: <span className="h-[14px] w-[14px] rounded-full border-2 border-white" />,
  },
  {
    title: 'Monthly invoicing',
    description: 'Billed monthly, split per location for multi-site practices.',
    icon: <span className="h-[11px] w-[14px] rounded-[2px] border-2 border-white" />,
  },
]

export default function MedicalPage() {
  return (
    <div className="bg-white">
      <Hero />
      <Credentials />
      <ExpandingGallery
        heading="What we move"
        panels={SERVICES}
        cta="Set up your clinic account"
      />
      <WhyBrand
        heading={`Why clinics choose ${BRAND.name}`}
        reasons={CLINIC_REASONS}
      />
      <Coverage />
      <FinalCta />
    </div>
  )
}

// The design's hero is built around a live "TODAY'S ROUTE" panel — timestamps,
// a named clinic, a 4.2 °C readout, a signature line. Every element of it is a
// claim excluded above, so the panel is not reproduced. What remains is the
// proposition and the action, on the design's own tinted band.
function Hero() {
  return (
    <section className="border-b border-[#f0eaf6] bg-[#faf7fd]">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-20">
        <div className="max-w-[720px]">
          <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#17131c] sm:text-[46px]">
            Medical courier for GTA clinics and labs
          </h1>
          <p className="mt-4 max-w-[560px] text-[17px] leading-[1.55] text-[#5f5868]">
            Same-day secure transport for specimens, pharmaceuticals, and
            temperature-sensitive goods, handled by certified drivers.
          </p>

          <PartnerCta className="mt-8">Set up your clinic account</PartnerCta>
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
            Set up your clinic account
          </div>
          <div className="mt-2 text-[16px] leading-[1.5] opacity-85">
            Standing routes, per-location billing and certified drivers, managed
            from the {BRAND.name} partner platform.
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

// PARTNER_URL is a different origin, so these are plain anchors — next/link is
// for in-app routes. Same tab: opening an account is the continuation of this
// page's journey, not a detour from it.
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
