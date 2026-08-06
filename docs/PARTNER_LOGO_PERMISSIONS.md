# Partner Logo Permission Register

> **This register is the gate. `src/data/partners.js` mirrors it, and the homepage renders only
> what this document approves.**
>
> **Possessing or uploading a logo is not permission to publish it.** Neither is a completed
> delivery, the "5 business partners" metric, a pitch deck, a grant application, customer history,
> an email thread, or the fact that the file sits in this repository. Publication permission is a
> named person, in a stated role, granting it on a stated date, in writing.
>
> A partner becomes publishable only when **every required field below is complete** and
> `Permission status` reads **Approved**. Setting the status without the fields does nothing: the
> data module validates every field independently and will keep the partner out of
> `APPROVED_PARTNERS` regardless of what the status says.

**Approval date: 2026-08-05 · Result: 6 of 6 APPROVED · The public section renders.**

All six were approved for public display by the founder. Superseding the Phase 10 audit, which
recorded 0 of 6 with every field blank.

---

## Required fields

Each partner needs all nine. Every row maps to a check in `src/data/partners.js`, so this table and
the validator cannot drift.

| # | Field | Code field | Why it is required |
|---|---|---|---|
| 1 | **Exact public company name** | `name` | The legal or trading name the company wants shown. Must not be inferred from artwork |
| 2 | **Relationship type** | `relationship` | Determines what the section may claim. An unstated relationship cannot be described |
| 3 | **Permission to display publicly** | `permission.status` + `permission.displayAllowed` | The permission itself. Must be **Yes**, in writing. Two fields, because an approval on file and an approval that covers *public display* are not the same thing |
| 4 | **Permission date** | `permission.date` | When it was granted. An undated permission cannot be reviewed or expired |
| 5 | **Approver name** | `permission.approvedBy` | Who granted it. A company cannot consent; a person does |
| 6 | **Approver role** | `permission.approverRole` | Whether that person could grant it |
| 7 | **Website-link permission** | `permission.websiteLinkAllowed` | Linking a mark is a further use beyond displaying it. A boolean — `false` is a complete answer; only `null` means nobody asked |
| 8 | **Brand restrictions** | `permission.brandRestrictions` | Clear space, minimum size, background rules, prohibited treatments. Record **"None stated"** explicitly rather than leaving it blank — blank means *not asked* |
| 9 | **Evidence reference** | `evidenceReference` | Where the approval can be found later. An approval nobody can locate is not auditable, and this section's whole defence is that it is auditable |

**Also record:** the approved website URL, but only when field 7 is **Yes**.

*Fields 3 and 9 were added in Phase 10.1. The bar went up in the same change that approved the six —
the records pass because the values were supplied, not because the gate was loosened.*

---

## Approval summary — 2026-08-05

| Partner | Relationship | Display | Linking | Status |
|---|---|:--:|:--:|---|
| General Basket Logistics Services | business relationship | ✅ | ❌ | **Approved** |
| Haut Logistics | business relationship | ✅ | ❌ | **Approved** |
| That Local Girl | business relationship | ✅ | ❌ | **Approved** |
| Can-Anny | business relationship | ✅ | ❌ | **Approved** |
| Arc Law | business relationship | ✅ | ❌ | **Approved** |
| The Accelerator Centre | **program and accelerator relationship** | ✅ | ❌ | **Approved** |

**Decision-maker: Abdul, Founder · 2026-08-05.**
**Evidence:** Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.

**Website linking is disabled for every partner and no website URL is stored for any of them.**
No logo is wrapped in a link, and no logo enters the keyboard tab order.

### ⚠️ The Accelerator Centre is NOT described as a customer

Its relationship is recorded as a **program and accelerator relationship**, which is a materially
different thing from the other five. None of the six is described as a paying customer, a recurring
customer, an enterprise customer, currently active, endorsing Druppr, or exclusively served by
Druppr — no record supports any of those.

The relationship strings are **not rendered on the page**. They constrain what the section may
claim; the heading is the only claim made, and "Business relationships" accommodates both an
accelerator programme and five ordinary business relationships without asserting either is a sale.

### ⚠️ "Haut Logistics" — inferred, then founder-confirmed

Phase 10 withheld this name because the artwork is a **symbol-only mark carrying no text at all**,
so unlike the other five nothing in the repository corroborated it, and the slug came from the same
guess.

**The founder confirmed on 2026-08-05 that "Haut Logistics" is the correct public name, explicitly
despite the symbol-only artwork.** That founder statement is what the name now rests on. The
artwork still does not corroborate it and never did — both halves are kept on the record, so if the
name is ever disputed it is clear exactly what the evidence is.

---

## General Basket Logistics Services

- Asset slug: `general-basket-logistics`
- Asset: `public/images/partners/general-basket-logistics.webp` (400×160 WebP, 2× the 200×80 rendered tile)
- **Permission status: APPROVED**
- Exact public company name: **General Basket Logistics Services**
- Relationship: **business relationship**
- Permission to display name and logo publicly: **Yes**
- Permission date: **2026-08-05**
- Approved by — name: **Abdul**
- Approver role: **Founder**
- Website linking allowed: **No**
- Approved website URL: **none — not applicable, linking is disabled**
- Brand-use restrictions: **None stated**
- Evidence location or reference: **Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.**

## Haut Logistics

> ⚠️ **Name was inferred from a symbol-only mark, then confirmed by the founder on 2026-08-05.**
> The artwork does not corroborate it; the founder statement does. See the note above.

- Asset slug: `haut-logistics`
- Asset: `public/images/partners/haut-logistics.webp` (400×160 WebP, 2× the 200×80 rendered tile)
- **Permission status: APPROVED**
- Exact public company name: **Haut Logistics**
- Relationship: **business relationship**
- Permission to display name and logo publicly: **Yes**
- Permission date: **2026-08-05**
- Approved by — name: **Abdul**
- Approver role: **Founder**
- Website linking allowed: **No**
- Approved website URL: **none — not applicable, linking is disabled**
- Brand-use restrictions: **None stated**
- Evidence location or reference: **Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.**

## That Local Girl

> Note: the mark sits on its own **orange field**, part of the supplied artwork and preserved. It
> must not be knocked out, recoloured or flattened to match neighbouring logos.

- Asset slug: `that-local-girl`
- Asset: `public/images/partners/that-local-girl.webp` (400×160 WebP, 2× the 200×80 rendered tile)
- **Permission status: APPROVED**
- Exact public company name: **That Local Girl**
- Relationship: **business relationship**
- Permission to display name and logo publicly: **Yes**
- Permission date: **2026-08-05**
- Approved by — name: **Abdul**
- Approver role: **Founder**
- Website linking allowed: **No**
- Approved website URL: **none — not applicable, linking is disabled**
- Brand-use restrictions: **None stated**
- Evidence location or reference: **Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.**

## Can-Anny

- Asset slug: `can-anny`
- Asset: `public/images/partners/can-anny.webp` (400×160 WebP, 2× the 200×80 rendered tile)
- **Permission status: APPROVED**
- Exact public company name: **Can-Anny**
- Relationship: **business relationship**
- Permission to display name and logo publicly: **Yes**
- Permission date: **2026-08-05**
- Approved by — name: **Abdul**
- Approver role: **Founder**
- Website linking allowed: **No**
- Approved website URL: **none — not applicable, linking is disabled**
- Brand-use restrictions: **None stated**
- Evidence location or reference: **Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.**

## Arc Law

> Note: the mark sits on its own **dark banner**, part of the supplied artwork and preserved. It
> must not be inverted or placed on a light knockout.

- Asset slug: `arc-law`
- Asset: `public/images/partners/arc-law.webp` (400×160 WebP, 2× the 200×80 rendered tile)
- **Permission status: APPROVED**
- Exact public company name: **Arc Law**
- Relationship: **business relationship**
- Permission to display name and logo publicly: **Yes**
- Permission date: **2026-08-05**
- Approved by — name: **Abdul**
- Approver role: **Founder**
- Website linking allowed: **No**
- Approved website URL: **none — not applicable, linking is disabled**
- Brand-use restrictions: **None stated**
- Evidence location or reference: **Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.**

## The Accelerator Centre

> ⚠️ **Not a customer.** Recorded as a program and accelerator relationship, and must not be
> described otherwise.

- Asset slug: `accelerator-centre`
- Asset: `public/images/partners/accelerator-centre.webp` (400×160 WebP, 2× the 200×80 rendered tile)
- **Permission status: APPROVED**
- Exact public company name: **The Accelerator Centre**
- Relationship: **program and accelerator relationship**
- Permission to display name and logo publicly: **Yes**
- Permission date: **2026-08-05**
- Approved by — name: **Abdul**
- Approver role: **Founder**
- Website linking allowed: **No**
- Approved website URL: **none — not applicable, linking is disabled**
- Brand-use restrictions: **None stated**
- Evidence location or reference: **Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.**

---

## How to approve a partner

1. Obtain **written** permission from a named person who can grant it.
2. Fill in all nine fields above. Record `Brand-use restrictions` as **"None stated"** if genuinely
   none were given — blank is read as *not asked*.
3. Mirror the same values into that partner's entry in `src/data/partners.js`, and set BOTH
   `permission.status` to `'approved'` AND `permission.displayAllowed` to `true`.
4. Rebuild. The partner appears in `APPROVED_PARTNERS` only if the validator finds every field
   present; otherwise it is silently excluded and a development-time warning names the missing
   fields.
5. **Section behaviour follows the count automatically:** 0 approved → no section at all;
   1–2 → a compact static row; 3+ → the moving strip. Nothing needs to be switched on by hand.

## What the section may claim

The heading is constrained by the **relationship** field, not by enthusiasm.

**In use: "Business relationships".** It is the only claim the section makes. It accommodates five
plain business relationships and one accelerator programme without asserting that any of them is a
sale — which is exactly why it, and not a warmer alternative, is the heading.

**Prohibited** unless the completed records explicitly support them: *Trusted by* · *Leading
companies* · *Enterprise customers* · *Powering these businesses* · *Our client network* ·
*Our customers*.

**The relationship strings are not rendered.** They exist to bound what may be said, and nothing
per-partner is published beyond each logo and its alt text.

The section must never imply that an organisation is a paying customer, a recurring account,
currently active, an enterprise customer, exclusively served by Druppr, or publicly endorsing it,
unless its record says so. **No record currently says so for any of the six.**

## Moving-strip threshold

A moving strip requires **at least three distinct approved partners**. One or two are never
duplicated to simulate a larger network — with fewer than three the loop's duplicate is on screen
beside the original and a visitor simply sees the same logos twice.

**Six are approved, so the moving strip renders.** If approvals are ever withdrawn below three, the
section reverts to a compact static row on its own, with no code change.

## Asset notes

- Source files are raster. Replace with official **SVG** when the companies supply them.
- Supplied `.webp` variants were deliberately **not** copied into the repository: `next/image`
  re-encodes to AVIF/WebP from the PNG, so committing them would be an unused duplicate variant.
- Logos are never stretched, recoloured, redrawn, converted to monochrome, or cropped through
  meaningful artwork. Each is letterboxed onto a uniform 600×240 transparent canvas so a strip is
  optically even without distorting any mark.
