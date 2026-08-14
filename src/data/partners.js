// Partner logo records. THE PERMISSION GATE LIVES HERE.
//
// ── `logoWidth` IS OPTICAL NORMALISATION, NOT A PERMISSION FIELD ────────────
//
// Every logo ships on an identical 400x160 canvas, but the MARK inside that
// canvas is a different size in each file. Measured ink bounding boxes:
//
//   general-basket   135x107   34% of canvas width
//   haut-logistics   121x93    30%
//   that-local-girl  107x107   27%
//   can-anny         133x91    33%
//   arc-law          347x101   87%   (and 55% ink — a solid black block)
//   accelerator      257x77    64%
//
// `object-contain` fits the CANVAS, so at one shared box size four marks
// rendered at ~30% while Arc Law rendered at 87% — the logo wall read as two
// tiers. `logoWidth` is the rendered canvas width that brings each MARK to a
// comparable optical size; the surrounding transparent padding simply overflows
// and is clipped by the tile. Aspect ratio is never touched.
//
// ⚠️ These are per-asset numbers. If a logo file is REPLACED, re-measure the ink
// box — do not carry the old number over, and do not "simplify" this to one
// shared value, which is the state it was just corrected from.
//
// ⚠️ POSSESSING A LOGO IS NOT PERMISSION TO PUBLISH IT.
//
// Neither is a completed delivery, the "5 business partners" metric, a pitch
// deck, a grant application, customer history, an email thread, or the fact that
// the file is sitting in this repository. Publication permission is a named
// person, in a stated role, granting it on a stated date, in writing. Phase 0
// (D8) requires exactly that and forbids inferring it from anything else.
//
// The paper register is docs/PARTNER_LOGO_PERMISSIONS.md. This file mirrors it.
// If the two disagree, the register is right and this file is a bug.
//
// ── HOW TO USE THIS MODULE ──────────────────────────────────────────────────
//
//   PARTNER_LOGOS      every supplied asset, whatever its permission state.
//                      ⚠️ NEVER RENDER THIS. It is the inventory, not the
//                      publishable set.
//   APPROVED_PARTNERS  the publishable subset. Public components import ONLY
//                      this.
//
// ── WHY THE VALIDATOR IS STRICTER THAN A STATUS FLAG ────────────────────────
//
// The supplied asset pack filtered on `permission.status === 'approved'` alone.
// That is one keystroke away from publishing a company's mark with no recorded
// approver, no date and no restrictions — the flag would be set and every other
// field would still be null. So the status is treated as a STATEMENT OF INTENT
// and the remaining fields are treated as THE EVIDENCE. Both must hold.
//
// The failure mode this prevents is not hypothetical: it is the single most
// likely way this section ships something it should not, because flipping one
// string feels like the whole job.
//
// ── PHASE 10.1: ALL SIX ARE NOW APPROVED ────────────────────────────────────
//
// The founder approved all six for public display on 2026-08-05. They render.
//
// They pass because every required value is now explicitly supplied, NOT
// because the gate was loosened — the list below grew by two fields in the same
// change. The gate is still the gate: set any one record's `displayAllowed` to
// false, or blank its `evidenceReference`, and that partner silently stops
// rendering while the other five continue.

// Every field that must be present before a mark may be published. Order
// matches the register's audit table so the two read the same way.
// ⚠️ PHASE 10.1 STRENGTHENED THIS LIST; IT WAS NOT RELAXED TO LET THE SIX
// THROUGH. Two fields were ADDED — `permission.displayAllowed` and
// `evidenceReference` — so the records now clear a HIGHER bar than the one they
// failed in Phase 10, not a lowered one. `displayAllowed` in particular splits
// "the approval exists" from "the approval covers public display", which the
// single `status` string had been carrying alone.
const REQUIRED_FIELDS = [
  ['name', (p) => nonEmpty(p.name)],
  ['relationship', (p) => nonEmpty(p.relationship)],
  ['permission.status === "approved"', (p) => p.permission?.status === 'approved'],
  // Must be exactly true. An approval on file that does not extend to public
  // display is not permission to publish.
  ['permission.displayAllowed === true', (p) => p.permission?.displayAllowed === true],
  ['permission.date', (p) => nonEmpty(p.permission?.date)],
  ['permission.approvedBy', (p) => nonEmpty(p.permission?.approvedBy)],
  ['permission.approverRole', (p) => nonEmpty(p.permission?.approverRole)],
  // A boolean, so `false` is a COMPLETE answer meaning "linking not allowed".
  // Only null/undefined means nobody asked.
  ['permission.websiteLinkAllowed', (p) => typeof p.permission?.websiteLinkAllowed === 'boolean'],
  // Record 'None stated' rather than leaving null. Blank means not asked.
  ['permission.brandRestrictions', (p) => nonEmpty(p.permission?.brandRestrictions)],
  // Where the approval can be found later. An approval nobody can locate is not
  // auditable, and this section's whole defence is that it is auditable.
  ['evidenceReference', (p) => nonEmpty(p.evidenceReference)],
  // The asset itself.
  ['src', (p) => nonEmpty(p.src)],
  ['alt', (p) => nonEmpty(p.alt)],
]

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

// Missing-field names for one partner. Empty array means publishable.
export function missingPermissionFields(partner) {
  return REQUIRED_FIELDS.filter(([, ok]) => !ok(partner)).map(([field]) => field)
}

// ⚠️ LINKING IS A SEPARATE PERMISSION FROM DISPLAYING.
//
// A partner may be approved for display and still not be linkable, so the link
// is gated on its own flag AND on a real URL. `websiteLinkAllowed: false` with a
// URL present still renders an unlinked logo — the URL being known is not the
// same as being allowed to point at it.
export function canLinkPartner(partner) {
  return partner.permission?.websiteLinkAllowed === true && nonEmpty(partner.website)
}

// All supplied assets. NOT for rendering — that is APPROVED_PARTNERS below.
//
// This stays the complete source collection even though all six currently pass:
// the two lists are the same length today and must not be collapsed into one,
// because the moment a single approval is withdrawn they diverge again.
//
// RELATIONSHIP WORDING IS THE NARROWEST THE APPROVAL SUPPORTS. Five are a plain
// "business relationship"; The Accelerator Centre is a "program and accelerator
// relationship" and is NOT a customer. None of these strings is rendered —
// they constrain what the section may claim, and the heading is the only claim
// made. Do not upgrade any of them to "customer", "client" or "partner" without
// a record that says so.
export const PARTNER_LOGOS = [
  {
    slug: 'general-basket-logistics',
    // Confirmed by the founder 2026-08-05. The mark itself also reads
    // "GENERAL BASKET / LOGISTICS SERVICES", which agrees.
    name: 'General Basket Logistics Services',
    alt: 'General Basket Logistics Services logo',
    src: '/images/partners/general-basket-logistics.webp',
    logoWidth: 441,
    website: null,
    relationship: 'business relationship',
    evidenceReference:
      'Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.',
    permission: {
      status: 'approved',
      displayAllowed: true,
      date: '2026-08-05',
      approvedBy: 'Abdul',
      approverRole: 'Founder',
      websiteLinkAllowed: false,
      brandRestrictions: 'None stated',
    },
  },
  {
    // ⚠️ THIS NAME WAS INFERRED, AND IS NOW FOUNDER-CONFIRMED. Both halves of
    // that sentence are kept, because the second does not erase the first.
    //
    // The artwork is a SYMBOL-ONLY mark — a circular monogram with a stylised
    // letterform and an aircraft — carrying no company name at all. The other
    // five marks contain their own names as artwork; this one does not, so
    // Phase 10 flagged the name as resting on nothing verifiable and withheld
    // it. The slug was not evidence either: it came from the same guess.
    //
    // Phase 10.1: the founder confirmed on 2026-08-05 that "Haut Logistics" is
    // the correct public name, explicitly despite the symbol-only artwork. That
    // confirmation is the evidence — the artwork still is not, and never became
    // so. If the name is ever disputed, this is the record of exactly what it
    // rests on, and it is a founder statement rather than an inference.
    slug: 'haut-logistics',
    name: 'Haut Logistics',
    alt: 'Haut Logistics logo',
    src: '/images/partners/haut-logistics.webp',
    logoWidth: 500,
    website: null,
    relationship: 'business relationship',
    evidenceReference:
      'Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.',
    permission: {
      status: 'approved',
      displayAllowed: true,
      date: '2026-08-05',
      approvedBy: 'Abdul',
      approverRole: 'Founder',
      websiteLinkAllowed: false,
      brandRestrictions: 'None stated',
    },
  },
  {
    slug: 'that-local-girl',
    name: 'That Local Girl',
    alt: 'That Local Girl logo',
    // The orange field is part of the supplied artwork, not padding. It is
    // preserved deliberately — see the strip component before "tidying" it.
    src: '/images/partners/that-local-girl.webp',
    logoWidth: 520,
    website: null,
    relationship: 'business relationship',
    evidenceReference:
      'Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.',
    permission: {
      status: 'approved',
      displayAllowed: true,
      date: '2026-08-05',
      approvedBy: 'Abdul',
      approverRole: 'Founder',
      websiteLinkAllowed: false,
      brandRestrictions: 'None stated',
    },
  },
  {
    slug: 'can-anny',
    name: 'Can-Anny',
    alt: 'Can-Anny logo',
    src: '/images/partners/can-anny.webp',
    logoWidth: 455,
    website: null,
    relationship: 'business relationship',
    evidenceReference:
      'Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.',
    permission: {
      status: 'approved',
      displayAllowed: true,
      date: '2026-08-05',
      approvedBy: 'Abdul',
      approverRole: 'Founder',
      websiteLinkAllowed: false,
      brandRestrictions: 'None stated',
    },
  },
  {
    slug: 'arc-law',
    name: 'Arc Law',
    alt: 'Arc Law logo',
    // Dark banner, part of the supplied artwork. Not to be inverted.
    src: '/images/partners/arc-law.webp',
    logoWidth: 207,
    website: null,
    relationship: 'business relationship',
    evidenceReference:
      'Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.',
    permission: {
      status: 'approved',
      displayAllowed: true,
      date: '2026-08-05',
      approvedBy: 'Abdul',
      approverRole: 'Founder',
      websiteLinkAllowed: false,
      brandRestrictions: 'None stated',
    },
  },
  {
    slug: 'accelerator-centre',
    name: 'The Accelerator Centre',
    alt: 'The Accelerator Centre logo',
    src: '/images/partners/accelerator-centre.webp',
    logoWidth: 281,
    website: null,
    relationship: 'program and accelerator relationship',
    evidenceReference:
      'Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.',
    permission: {
      status: 'approved',
      displayAllowed: true,
      date: '2026-08-05',
      approvedBy: 'Abdul',
      approverRole: 'Founder',
      websiteLinkAllowed: false,
      brandRestrictions: 'None stated',
    },
  },
]

// THE ONLY EXPORT PUBLIC COMPONENTS MAY RENDER.
//
// Currently ALL SIX, following the founder's approval on 2026-08-05, so the
// homepage renders the moving strip. It is still a FILTER and not an alias:
// withdraw one approval and that partner stops rendering with no other change,
// and if the count ever falls below three the strip reverts to a static row on
// its own.
export const APPROVED_PARTNERS = PARTNER_LOGOS.filter(
  (partner) => missingPermissionFields(partner).length === 0,
)

// Development-time visibility, so a half-filled record is not silently dropped
// and mistaken for "the code is broken". Never runs in production, and never
// prints anything a visitor could see.
if (process.env.NODE_ENV === 'development') {
  const blocked = PARTNER_LOGOS.filter(
    (partner) => partner.permission?.status === 'approved' && missingPermissionFields(partner).length > 0,
  )

  for (const partner of blocked) {
    // eslint-disable-next-line no-console
    console.warn(
      `[partners] "${partner.slug}" is marked approved but is WITHHELD — missing: ` +
        missingPermissionFields(partner).join(', '),
    )
  }
}
