// Partner logo records. THE PERMISSION GATE LIVES HERE.
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
// and the eight fields are treated as THE EVIDENCE. Both must hold.
//
// The failure mode this prevents is not hypothetical: it is the single most
// likely way this section ships something it should not, because flipping one
// string feels like the whole job.

// Every field that must be present before a mark may be published. Order
// matches the register's audit table so the two read the same way.
const REQUIRED_FIELDS = [
  ['name', (p) => nonEmpty(p.name)],
  ['relationship', (p) => nonEmpty(p.relationship)],
  ['permission.status === "approved"', (p) => p.permission?.status === 'approved'],
  ['permission.date', (p) => nonEmpty(p.permission?.date)],
  ['permission.approvedBy', (p) => nonEmpty(p.permission?.approvedBy)],
  ['permission.approverRole', (p) => nonEmpty(p.permission?.approverRole)],
  // A boolean, so `false` is a COMPLETE answer meaning "linking not allowed".
  // Only null/undefined means nobody asked.
  ['permission.websiteLinkAllowed', (p) => typeof p.permission?.websiteLinkAllowed === 'boolean'],
  // Record 'None stated' rather than leaving null. Blank means not asked.
  ['permission.brandRestrictions', (p) => nonEmpty(p.permission?.brandRestrictions)],
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

// All supplied assets. NOT for rendering.
//
// Every record below is at its default state: nothing was supplied beyond the
// artwork and the slug. Every `name` here is PROVISIONAL until field 1 of the
// register is completed — see the note on `haut-logistics` in particular.
export const PARTNER_LOGOS = [
  {
    slug: 'general-basket-logistics',
    // Provisional. The mark itself reads "GENERAL BASKET / LOGISTICS SERVICES",
    // which corroborates the spelling but is not the company confirming it.
    name: 'General Basket Logistics Services',
    alt: 'General Basket Logistics Services logo',
    src: '/images/partners/general-basket-logistics.webp',
    website: null,
    relationship: null,
    permission: {
      status: 'pending',
      date: null,
      approvedBy: null,
      approverRole: null,
      websiteLinkAllowed: null,
      brandRestrictions: null,
    },
  },
  {
    // ⚠️ THIS NAME IS INFERRED AND UNCORROBORATED.
    //
    // The supplied artwork is a SYMBOL-ONLY mark — a circular monogram with a
    // stylised letterform and an aircraft — and carries no company name at all.
    // The other five marks contain their own names as artwork; this one does
    // not, so nothing in this repository confirms the spelling, the word, or
    // that "Logistics" belongs in it.
    //
    // The slug is not evidence: it was derived from the same guess. Field 1 of
    // the register must be filled in from the company itself. Publishing a
    // wrong name misnames a real business on a commercial page.
    slug: 'haut-logistics',
    name: 'Haut Logistics',
    alt: 'Haut Logistics logo',
    src: '/images/partners/haut-logistics.webp',
    website: null,
    relationship: null,
    permission: {
      status: 'pending',
      date: null,
      approvedBy: null,
      approverRole: null,
      websiteLinkAllowed: null,
      brandRestrictions: null,
    },
  },
  {
    slug: 'that-local-girl',
    name: 'That Local Girl',
    alt: 'That Local Girl logo',
    // The orange field is part of the supplied artwork, not padding. It is
    // preserved deliberately — see the strip component before "tidying" it.
    src: '/images/partners/that-local-girl.webp',
    website: null,
    relationship: null,
    permission: {
      status: 'pending',
      date: null,
      approvedBy: null,
      approverRole: null,
      websiteLinkAllowed: null,
      brandRestrictions: null,
    },
  },
  {
    slug: 'can-anny',
    name: 'Can-Anny',
    alt: 'Can-Anny logo',
    src: '/images/partners/can-anny.webp',
    website: null,
    relationship: null,
    permission: {
      status: 'pending',
      date: null,
      approvedBy: null,
      approverRole: null,
      websiteLinkAllowed: null,
      brandRestrictions: null,
    },
  },
  {
    slug: 'arc-law',
    name: 'Arc Law',
    alt: 'Arc Law logo',
    // Dark banner, part of the supplied artwork. Not to be inverted.
    src: '/images/partners/arc-law.webp',
    website: null,
    relationship: null,
    permission: {
      status: 'pending',
      date: null,
      approvedBy: null,
      approverRole: null,
      websiteLinkAllowed: null,
      brandRestrictions: null,
    },
  },
  {
    slug: 'accelerator-centre',
    name: 'The Accelerator Centre',
    alt: 'The Accelerator Centre logo',
    src: '/images/partners/accelerator-centre.webp',
    website: null,
    relationship: null,
    permission: {
      status: 'pending',
      date: null,
      approvedBy: null,
      approverRole: null,
      websiteLinkAllowed: null,
      brandRestrictions: null,
    },
  },
]

// THE ONLY EXPORT PUBLIC COMPONENTS MAY RENDER.
//
// Currently EMPTY — all six records are at their default state, so the homepage
// renders no partner section at all. That is the gate working, not a defect.
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
