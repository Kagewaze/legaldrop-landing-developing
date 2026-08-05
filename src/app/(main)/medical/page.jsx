import { BRAND } from '@/lib/config'
import { PARTNER_SIGNUP_URL } from '@/lib/navigation'
import {
  AuditableRecord,
  RequestRide,
  SendPackage,
} from '@/components/icons'
import { Coverage } from '@/components/home/Coverage'
import { ServicePanels } from '@/components/ServicePanels'
import { WhyBrand } from '@/components/home/WhyBrand'
import pharma from '@/images/medical-pharma.jpg'
import specimen from '@/images/medical-specimen.jpg'

// /medical — a B2B lead-generation page for clinics, labs and pharmacies.
//
// NOT a booking surface. Every call to action here opens an account on the
// partner platform. There is deliberately no send-flow embed, no address form
// and no price on this page: quoting a consumer fare for specimen transport
// would set the wrong expectation for a service that is arranged on an account.
//
// ⚠️ This paragraph used to describe the account as "standing routes,
// per-location billing, driver certification on file". All three were removed
// from the public copy (Phases 4.2 and 4.3) because none is evidenced, so the
// description went too — a comment that states removed claims as fact is how
// they get restored by the next person editing this file.
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

// PHASE 5: was 'Medical courier'.
//
// VISION.md → Brand Positioning is unconditional: "Never let Druppr be
// described, internally or externally, as a courier or a delivery app." This
// page's own title and h1 were doing exactly that, and the homepage section
// that links here now reads "Medical logistics with the delivery in view" — so
// the destination was also contradicting its own entry point.
//
// ⚠️ SEO TRADE-OFF, STATED RATHER THAN HIDDEN: "medical courier" is the higher
// -volume search term and this change gives it up in the <title>. That is the
// cost of the positioning rule, and VISION.md governs on principle. If organic
// traffic for this page is later shown to depend on the term, the answer is a
// deliberate, measured decision by the founder — not a quiet revert here.
export const metadata = {
  title: 'Medical logistics',
}

// Rendered in the dark strip under the hero. Each is a standing capability of
// the service, not a performance claim.
//
// PHASE 4.2 removed 'TDG-licensed' (the founder is certified, the drivers are
// not) and 'Chain-of-custody' (no custody artifact exists in this product).
//
// PHASE 4.3 removed the two it had flagged and left standing:
//
//   'Fully insured'          REMOVED. No policy, effective dates, insured
//                            entity, covered operations or exclusions were
//                            produced. VISION.md → Trust Philosophy names this
//                            exact phrase as the thing not to do: "No 'fully
//                            insured' gloss over an undefined reality."
//   'Temperature-controlled' REMOVED. Carrying medical items is not cold-chain
//                            capability. No equipment spec, temperature range,
//                            handling procedure, monitoring, logging, driver
//                            instruction or exception process was produced.
//
// Neither was softened — no "protected deliveries", "covered service",
// "temperature-safe" or "medical-grade transport". Both are RESTORABLE the day
// the evidence exists; until then the strip states only what the tracking
// surfaces render.
//
// The replacement chip is the one tracking facet the WhyBrand cards below do
// not already carry: the link is SHAREABLE.
//
// PHASE 6.1 corrected both the chip and this note. They read "the link is
// SHARED" and said the two routes "serve the same job to the sender, the
// business and the recipient". Neither holds. track/[trackingCode] and
// track-partner/[trackingToken] are DIFFERENT routes with DIFFERENT
// identifiers and DIFFERENT payloads — the partner view also renders route
// distance, the sender's name, the pickup address and a receivers list. And
// nothing in this repository sends a link to a recipient; there is no
// notification code here at all. What is verified is that both routes are
// public with no login, so a holder can share access. "Shareable" says that;
// "shared" asserted a distribution that was never evidenced.
const CREDENTIALS = ['Live tracking', 'Timestamped status', 'Shareable tracking link']

// Rendered by the shared ServicePanels grid. Descriptions are unchanged from the
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
    // PHASE 9: was 'A courier moving boxes on a hand truck from a delivery van.'
    //
    // This file's own Phase 5 note above gives up the "medical courier" search
    // term in the <title> because VISION.md forbids Druppr being described as a
    // courier — and then the alt text two blocks down said it anyway. Alt text
    // is published copy: screen readers announce it and search engines index it,
    // so the one word the page had deliberately paid to remove was still on it.
    //
    // The replacement follows the rule already stated above this array — alt
    // text "describes what is in the frame and nothing more". It names the
    // action and the objects, and assigns no job title to the person, which is
    // also more accurate: nothing in the photograph identifies who they work
    // for.
    alt: 'A person moving boxes on a hand truck from a delivery van.',
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
  // PHASE 4.3 REMOVED A THIRD PANEL: 'Temperature-controlled transport' —
  // "Cold-chain capable vehicles for goods that cannot travel at ambient
  // temperature. Tell us the range your shipment needs."
  //
  // The whole panel went, rather than being reworded, because the TITLE, the
  // DESCRIPTION and the PHOTOGRAPH were each the same unevidenced claim. The
  // image is `medical-temp.jpg` — "a gloved hand holding a metal transport
  // canister packed with cold packs". Rewriting the copy to workflow language
  // while keeping that frame would have left the photograph making the claim
  // the copy had just dropped, which is precisely what the constraints block
  // above forbids: a photograph must not narrate a capability the copy is
  // careful not to claim.
  //
  // No replacement panel was invented. There is no third medical service this
  // repository can evidence that is distinct from the two above, and Phase 4.3
  // prohibits inventing one to fill the slot. `medical-temp.jpg` is now unused
  // and is retained on disk as the rollback asset.
  //
  // RESTORE this panel only with equipment specs, defined temperature ranges,
  // handling procedures, monitoring/logging, driver instructions and exception
  // handling — not on a general ability to carry medical items.
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
    // PHASE 4.3 REPLACED TWO CARDS WITH THIS ONE.
    //
    //   'Standing scheduled routes — Recurring pickups at set times, arranged
    //     on your account.'  REMOVED. Phase 4.1 already established that
    //     scheduling is not a product this repository can evidence: there is no
    //     date or time picker in send/page.jsx and no scheduling field in
    //     send-flow.js EMPTY_STATE or buildOrderPayload.js. Nothing was
    //     produced describing how a standing route is requested, who approves
    //     it, how the schedule is recorded, how drivers are assigned, how it is
    //     billed, or whether it is available today. Not softened to "scheduled
    //     delivery", which would assert the same thing.
    //   'Monthly invoicing — Billed monthly, split per location for multi-site
    //     practices.'  REMOVED. No billing surface exists in this repository:
    //     no invoice generation, no billing frequency, no payment terms, no
    //     eligible-customer rule, no approval step. send/pay is a Stripe
    //     per-order checkout. A planned partner-portal feature does not support
    //     a present-tense claim.
    //
    // Two removals, one replacement — WhyBrand resolves 3 reasons to
    // lg:grid-cols-3, so the grid stays full. Leaving two cards would have sat
    // them in a 4-column track with two dead columns.
    //
    // The replacement is verified and is not a restatement of the two cards
    // above (vehicles, and the record). Package count and weight are genuinely
    // captured and genuinely priced: send-flow.js EMPTY_STATE carries
    // `packageCount` and `weight`, send/details/page.jsx renders a <Stepper>
    // for the count and a weight <select>, and PriceBreakdown.jsx charges for
    // extra packages and shows the weight label on the quote.
    title: 'Packages and weight',
    description: 'Set the number of packages and the weight when you book.',
    icon: <SendPackage className="h-5 w-5" />,
  },
]

export default function MedicalPage() {
  return (
    <div className="bg-surface-page">
      <Hero />
      <Credentials />
      <ServicePanels
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
            Medical logistics for GTA clinics and labs
          </h1>
          {/* PHASE 4.2: "handled by certified drivers" removed — driver
              certification is future operational work, not a present fact.
              "secure" also went: no security posture has been assessed or
              approved (Phase 0 D10).

              PHASE 4.3: "temperature-sensitive goods" removed. It names the
              cargo rather than a capability, which is why earlier passes let it
              stand — but with every temperature claim now gone from this page,
              advertising the service FOR goods that cannot travel at ambient
              temperature is itself a handling claim. A clinic reads it as "they
              can take this." Replaced with the neutral category the product
              actually carries (`medical_supply` is a real section preset in
              send/page.jsx:143). */}
          <p className="mt-4 max-w-[560px] text-lg text-[#5f5868]">
            Same-day transport for specimens, pharmaceuticals and clinic
            supplies, tracked from pickup through completion.
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
          {/* PHASE 4.2 removed "certified drivers" here and left the other two
              standing on the reasoning that they describe how an account is
              arranged rather than a shipped feature. PHASE 4.3 removed them:
              "how it is arranged" IS an operational claim to a clinic deciding
              whether to move its weekly lab runs onto this service.

                "Standing routes"       no scheduling exists in the product and
                                        no manual process was evidenced.
                "per-location billing"  no billing surface exists at all; this
                                        is the invoicing claim in fewer words.

              What replaces them is the one thing the partner platform
              demonstrably does: hold a business's jobs and let them be tracked
              (track-partner/[trackingToken]). */}
          <div className="mt-2 text-base opacity-85">
            Book and track your clinic&rsquo;s deliveries from the {BRAND.name}{' '}
            partner platform.
          </div>
        </div>

        <a
          href={PARTNER_SIGNUP_URL}
          className="rounded-control bg-white px-[30px] py-4 text-base font-semibold text-brand-600 transition-colors hover:bg-[#f2e9fa] hover:text-[#5d1f96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Get started
        </a>
      </div>
    </section>
  )
}

// PARTNER_SIGNUP_URL is a different origin, so these are plain anchors — next/link
// for in-app routes. Same tab: opening an account is the continuation of this
// page's journey, not a detour from it.
//
// The matching PartnerLink helper went with the card grid; its per-panel CTA
// now lives inside ServicePanels, which takes the label as a prop.
function PartnerCta({ children, className = '' }) {
  return (
    <a
      href={PARTNER_SIGNUP_URL}
      className={`inline-block rounded-control bg-brand-600 px-[30px] py-4 text-base font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${className}`}
    >
      {children}
    </a>
  )
}
