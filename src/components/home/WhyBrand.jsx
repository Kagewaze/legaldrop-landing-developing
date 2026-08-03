import {
  ConfirmedDelivery,
  LiveTracking,
  SameDayDelivery,
  TdgCertified,
} from '@/components/icons'

// A four-card value grid.
//
// Prop-driven so the marketing pages (/medical, /legal) can reuse the styling
// with their own audience's reasons. It holds no content of its own — a caller
// that passes nothing renders nothing, rather than silently falling back to the
// home page's copy on a page where that copy would be wrong.
//
// The home page's own content lives below as HOME_REASONS and is passed in
// explicitly, so this component has no privileged caller.

export const HOME_REASONS = [
  {
    // WAS: "Most jobs collected within the hour."
    //
    // Removed in Phase 4.1 as an unverified performance claim. It asserted
    // measured pickup performance, and Phase 0 (D1) prohibits publishing
    // pickup-time metrics until they can be computed from operational data.
    // No such figure exists.
    //
    // NOT replaced with another number. "Typically within 60 minutes",
    // "usually collected quickly", "rapid pickup" and the like reproduce the
    // same defect in softer words.
    //
    // The replacement is a capability statement, and every verb in it maps to
    // a shipped surface: request (the /send flow), track (the /track and
    // /track-partner pages), one platform (both run on the same order).
    //
    // "On-demand and scheduled delivery options" was the other permitted
    // wording and was REJECTED: scheduled delivery cannot be verified in this
    // repository. The send flow books immediately — there is no date or time
    // picker, and no scheduling field in send-flow.js or buildOrderPayload.js.
    // "Standing routes" appears only in marketing copy, never in product code.
    title: 'Same-day delivery',
    description: 'Request and track a delivery through one platform.',
    icon: <SameDayDelivery className="h-5 w-5" />,
  },
  {
    title: 'Live tracking',
    description: 'A map link for you and your recipient.',
    icon: <LiveTracking className="h-5 w-5" />,
  },
  {
    title: 'TDG-certified drivers',
    description: 'Trained for medical and regulated goods.',
    icon: <TdgCertified className="h-5 w-5" />,
  },
  {
    // CORRECTED TWICE. History matters here, because the card has drifted
    // toward an overclaim on each pass.
    //
    // Originally: "Signature on delivery — Proof and photo on every drop-off."
    // Neither was true: no signature is captured and no photo is taken.
    //
    // Then: "Confirmed delivery — Confirmed by drop-off code and tracked live."
    // That replaced one unverifiable proof mechanism with another. The drop-off
    // code is NOT rendered anywhere in this repository — it exists only as an
    // icon (icons.jsx:307) and in marketing copy — and Phase 0 blocks it
    // pending five founder confirmations about where it is generated, who
    // receives it, how it is validated, whether it is live, and what is
    // retained.
    //
    // NOW: only what the product demonstrably produces. Every tracking surface
    // renders a timestamp trail — Order Placed (createdAt), On Route To Pickup,
    // Package Picked Up — and a status that reaches `delivered`. See
    // track/[trackingCode]/page.jsx:149-163 and LiveTracking.jsx:14-23.
    //
    // The title moved from "Confirmed" to "Recorded" deliberately: "confirmed"
    // implies a confirmation mechanism, and the only one we could name is the
    // blocked drop-off code. "Recorded" is exactly what happens, and it matches
    // the hero's own wording.
    //
    // Do NOT restore a code, PIN, signature, seal or custody claim here without
    // independent verification and approval.
    title: 'Recorded delivery',
    description: 'Timestamped status from request through completion.',
    icon: <ConfirmedDelivery className="h-5 w-5" />,
  },
]

export function WhyBrand({ heading, reasons }) {
  // Three cards in a four-column grid leave a dead column that reads as a
  // missing card, so the track count follows the content. Four reasons — the
  // home page — resolve to lg:grid-cols-4, exactly as before.
  const columns = reasons.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'

  return (
    <section className="mx-auto max-w-[1200px] px-8 py-16 sm:py-24">
      <h2 className="font-display text-3xl font-extrabold text-[#17131c]">
        {heading}
      </h2>

      <div className={`mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 ${columns}`}>
        {reasons.map((reason) => (
          <div key={reason.title} className="rounded-card bg-surface-raised p-6 shadow-card">
            {/* Tinted tile with an ink icon, not an ink tile with a white
                one. A 36px solid-ink square repeated four across made the
                lightest section on the page carry its heaviest elements. The
                tint holds the tile's shape without the mass.

                THE COLOUR IS SET HERE, ONCE. Callers supply the icon, but the
                icons are fill="currentColor" and carry no colour of their own,
                so this text class is what inks all of them — home, /medical
                and /legal alike. A caller passing a colour would override it;
                none do, and none should. */}
            <div className="flex h-9 w-9 items-center justify-center rounded-tile bg-surface-tint text-[#17131c]">
              {reason.icon}
            </div>
            <div className="mt-4 text-lg font-bold text-[#17131c]">
              {reason.title}
            </div>
            <div className="mt-1.5 text-sm text-[#5f5868]">
              {reason.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
