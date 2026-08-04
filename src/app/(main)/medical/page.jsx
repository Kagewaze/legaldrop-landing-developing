import { BRAND } from '@/lib/config'
import { PARTNER_URL } from '@/lib/navigation'
import {
  AuditableRecord,
  MonthlyInvoicing,
  RequestRide,
  ScheduledRoutes,
} from '@/components/icons'
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
// PHASE 4.2 replaced two of these four.
//
//   'TDG-licensed'      REMOVED. The founder holds TDG certification; the
//                       drivers do not. Driver certification is future work.
//   'Chain-of-custody'  REMOVED. No custody artifact exists in this product —
//                       Phase 0 blocks the claim, and what is actually
//                       produced is a timestamp trail, which is now stated.
//
// ⚠️ 'Fully insured' and 'Temperature-controlled' are LEFT IN PLACE and both
// REQUIRE REVIEW. They were not named for removal, and unlike TDG they are
// claims the founder may be able to evidence directly (a policy document; a
// vehicle capability). They are flagged in the Phase 4.2 report rather than
// removed unilaterally, because withdrawing an insurance claim is a
// commercial decision, not a copy decision. Confirm or remove them.
const CREDENTIALS = [
  'Live tracking',
  'Fully insured',
  'Timestamped status',
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
      // PHASE 4.2: "by drivers certified to carry regulated goods" removed —
      // the same unevidenced driver-certification claim as the TDG wording.
      'Prescriptions and pharmacy stock moved between locations the same day, tracked from pickup through completion.',
    image: pharma,
    alt: 'A courier moving boxes on a hand truck from a delivery van.',
  },
  {
    title: 'Lab & specimen transport',
    description:
      // PHASE 4.2: "with the handover confirmed" removed — the only handover
      // confirmation this business names is the unverifiable drop-off code.
      'Samples collected from your clinic and delivered to the receiving lab, with the trip tracked from pickup through completion.',
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
    // WAS: 'Certified drivers — TDG certification is required to take these
    // jobs, and enforced.' Removed in Phase 4.2: the requirement is future
    // operational work, and "enforced" asserted an active control that does
    // not exist. Replaced with a capability the repository proves — all six
    // vehicle names come from src/components/send/vehicles.js.
    //
    // THE ICON CHANGED TOO, and it is not cosmetic. This card kept
    // <CertifiedDriver />, which icons.jsx:241 documents as "Rosette with a
    // check" — a credential badge. Leaving it beside vehicle copy would have
    // gone on asserting certification in the one register that survives when a
    // reader skims past the words. RequestRide is the car silhouette, "same
    // silhouette language as the vehicle picker" (icons.jsx:110), so the glyph
    // now says what the card says.
    title: 'Vehicle matched to the job',
    description: 'Bike, car, SUV, minivan, cargo van or box truck.',
    icon: <RequestRide className="h-5 w-5" />,
  },
  {
    // WAS: 'A record you can audit — Every job carries live tracking and
    // drop-off code confirmation.' The drop-off code is unverifiable and
    // blocked by Phase 0; "audit" implied evidentiary weight the record has
    // not been assessed for. Both replaced with what the tracking surfaces
    // demonstrably render.
    title: 'A record of every job',
    description:
      'Live tracking and timestamped status from pickup through completion.',
    icon: <AuditableRecord className="h-5 w-5" />,
  },
  {
    title: 'Standing scheduled routes',
    description: 'Recurring pickups at set times, arranged on your account.',
    icon: <ScheduledRoutes className="h-5 w-5" />,
  },
  {
    title: 'Monthly invoicing',
    description: 'Billed monthly, split per location for multi-site practices.',
    icon: <MonthlyInvoicing className="h-5 w-5" />,
  },
]

export default function MedicalPage() {
  return (
    <div className="bg-surface-page">
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
    <section className="border-b border-[#f0eaf6] bg-surface-tint">
      <div className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
        <div className="max-w-[720px]">
          <h1 className="font-display text-4xl font-extrabold text-[#17131c] sm:text-5xl">
            Medical courier for GTA clinics and labs
          </h1>
          {/* PHASE 4.2: "handled by certified drivers" removed — driver
              certification is future operational work, not a present fact.
              "secure" also went: no security posture has been assessed or
              approved (Phase 0 D10). What remains describes the service and
              the tracking, both of which are real. */}
          <p className="mt-4 max-w-[560px] text-lg text-[#5f5868]">
            Same-day transport for specimens, pharmaceuticals and
            temperature-sensitive goods, tracked from pickup through
            completion.
          </p>

          <PartnerCta className="mt-8">Set up your clinic account</PartnerCta>
        </div>
      </div>
    </section>
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
          <div className="font-display text-3xl font-bold">Set up your clinic account</div>
          {/* PHASE 4.2: "certified drivers" removed for the same reason as
              the hero. "Standing routes" and "per-location billing" are
              retained — they describe how an account is arranged with the
              partner platform rather than a shipped product feature — but
              both are flagged for founder confirmation in the Phase 4.2
              report, since neither is evidenced in this repository. */}
          <div className="mt-2 text-base opacity-85">
            Standing routes and per-location billing, managed from the{' '}
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
      className={`inline-block rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors hover:bg-brand-700 ${className}`}
    >
      {children}
    </a>
  )
}
