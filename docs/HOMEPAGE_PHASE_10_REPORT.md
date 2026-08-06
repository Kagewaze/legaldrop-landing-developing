# Homepage Phase 10 — Permission-Gated Partner Logo System

> **Status: engineering complete. Zero partners approved, so the section does not render.
> Four commits created. Nothing pushed, nothing merged.**
>
> ⚠️ **SUPERSEDED BY PHASE 10.1 (appended below).** The founder approved all six partners on
> 2026-08-05 and the section now renders. Everything in Phase 10 below describes the state at the
> time it was written and is retained as that record.
>
> **That the section is invisible is the deliverable working, not a defect.** Every supplied
> permission record arrived blank, so the gate holds all six back. The system is built, tested
> against every state including three, six and all-approved, and will render at the correct size
> the moment a completed record exists — with no code change.

---

## 1. Founder-deferred five-second test

Recorded in full at `HOMEPAGE_PHASE_9_REPORT.md` → **Phase 9.2**, committed as `d7ddad6`.

| Field | Value |
|---|---|
| Decision | Five-second test **deferred until after launch** |
| Date · decision-maker | 2026-08-05 · Abdul, founder |
| Participant responses | **None available** |
| Was it run? | **No.** It did not pass and it did not fail |
| Fabricated results? | **No** — no participants, responses, percentages or conclusions |
| Development and merge | May proceed |
| Status | **Post-launch positioning-validation task** |

A scoring commitment was recorded **before** any result exists, so it cannot be tuned later: a
courier-only answer will be scored courier-only and will not be reinterpreted as a platform answer
because the participant mentioned tracking in a later question. Thresholds stay at ≥ 80% / ≤ 20%.

**Production Google Reviews validation remains a deployment verification item** and is not
described as completed anywhere in this phase — no credentials, no deployment access.

---

## 2. Repository root used

```
C:\Users\Abdul\LegalDrop\legaldrop-landing-develop\legaldrop-landing-develop
```

The **inner** directory, confirmed by the presence of `package.json`, `src/`, `docs/`, `.git/` and
`incoming/`. The outer wrapper holds only `.claude/`, a handoff note and this directory.

**⚠️ One documented marker did not exist: there was no `public/` directory.** The brief's expected
structure lists it, but this project had never had one — Next.js does not require it, and every
image until now was a static import from `src/images/`. `public/` was created by this phase to
hold the partner assets, at the path the brief specifies. Recorded rather than silently reconciled,
because "the folder is missing" and "I am in the wrong folder" look identical from one `ls` and
lead to opposite actions.

---

## 3. Incoming asset path

```
incoming/druppr-partner-logo-assets.zip      (supplied, already matched by *.zip in .gitignore)
incoming/druppr-partner-logo-assets/         (extracted here for inspection)
```

The package arrived **as a ZIP, not extracted**. It was unpacked in place. `incoming/` remains
**untracked** and no production code imports anything from it.

---

## 4. Asset inventory

28 files supplied.

| Group | Files | Disposition |
|---|---|---|
| `originals/` | 6 PNG, 198×77 → 1080×1080, 3.7–264 kB | inspected, **not committed** |
| `trimmed/` | 6 PNG, whitespace-trimmed | inspected, **not committed** |
| `public/images/partners/` | 6 PNG + 6 WebP, all 600×240 | source for the shipped assets, **not committed as supplied** |
| `src/data/partners.js` | metadata, all `pending` | rewritten and committed |
| `PARTNER_LOGO_PERMISSIONS.md` | blank register | expanded and committed to `docs/` |
| `preview.png` | contact sheet | inspected, **not committed** |
| `druppr-partner-logo-assets.zip` | 1.45 MB | **not committed** |

All originals carry an alpha channel; the six 600×240 standardised files are genuinely transparent
(`isOpaque: false`), correctly letterboxed, with no distortion.

---

## 5. Partner names detected

| # | Name as supplied | Corroborated by the artwork itself? |
|---|---|---|
| 1 | General Basket Logistics Services | ✅ the mark reads "GENERAL BASKET / LOGISTICS SERVICES" |
| 2 | **Haut Logistics** | ❌ **no company name appears in the mark at all** |
| 3 | That Local Girl | ✅ the mark reads "THAT LOCAL GIRL" |
| 4 | Can-Anny | ✅ the mark reads "CAN-ANNY" |
| 5 | Arc Law | ✅ the mark reads "ARC LAW" |
| 6 | The Accelerator Centre | ✅ the mark reads "THE ACCELERATOR CENTRE" |

### ⚠️ "Haut Logistics" is inferred and could not be confirmed

The brief warned specifically about this name, and the warning is justified. The supplied artwork
is a **symbol-only mark** — a circular monogram with a stylised letterform and an aircraft — and
**carries no text whatsoever**. The other five marks contain their own names as artwork, so those
at least corroborate the spelling the pack used. This one does not.

The name therefore rests on nothing verifiable: not the artwork, not the permission register
(field 1 is blank for all six), and not the slug, which was derived from the same guess. It is
flagged in the register, in `src/data/partners.js` and here. **Publishing an unconfirmed name
misnames a real business on a commercial page**, which is a worse failure than showing no logo.

**Every one of the six names is provisional**, because "Exact public company name" is blank in all
six records. The five corroborations above are evidence about spelling, not the company confirming
how it wishes to be named.

---

## 6. Permission status for every partner

**0 of 6 approved. Every supplied record was a blank template.**

| Partner | 1 Name | 2 Relationship | 3 Permission | 4 Date | 5 Approver | 6 Role | 7 Link | 8 Restrictions | Status |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| General Basket Logistics Services | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⛔ Pending |
| Haut Logistics | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⛔ Pending |
| That Local Girl | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⛔ Pending |
| Can-Anny | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⛔ Pending |
| Arc Law | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⛔ Pending |
| The Accelerator Centre | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⛔ Pending |

**48 of 48 required fields are empty.** No partner is marked approved because an asset exists.

---

## 7. Production files copied

| Destination | Contents |
|---|---|
| `public/images/partners/` | 6 × WebP, 400×160, **55 kB total** |
| `src/data/partners.js` | the authoritative data module and permission gate |
| `docs/PARTNER_LOGO_PERMISSIONS.md` | the permission register |

Assets were derived from the supplied 600×240 canvases by **uniform scale to 400×160** — exactly
2× the 200×80 rendered tile. Nothing was cropped, stretched, recoloured, redrawn or converted to
monochrome. **That Local Girl's orange field and Arc Law's dark banner are preserved** as supplied
artwork; both were inspected after re-encoding.

| Logo | Supplied 600×240 PNG | Shipped 400×160 WebP |
|---|---:|---:|
| accelerator-centre | 49.1 kB | **14.1 kB** |
| arc-law | 70.0 kB | **6.2 kB** |
| can-anny | 27.0 kB | **8.9 kB** |
| general-basket-logistics | 54.8 kB | **14.3 kB** |
| haut-logistics | 37.9 kB | **10.1 kB** |
| that-local-girl | 14.4 kB | **2.0 kB** |
| **Total** | **264 kB** | **55 kB** |

---

## 8. Incoming files excluded from commits

Not committed: the **ZIP** · `originals/` · `trimmed/` · the supplied 600×240 **PNG and WebP
duplicates** · `preview.png` · the `incoming/` directory itself.

`incoming/` stays **untracked**; the ZIP is additionally matched by the existing `*.zip` rule in
`.gitignore`, so it cannot be committed by accident. The contact sheet was excluded because the
register now carries the same information in text, which does not go stale when an asset changes.

---

## 9. Partner data model

`src/data/partners.js`. Each record carries: `slug` · `name` · `alt` · `src` · `website` ·
`relationship` · `permission { status, date, approvedBy, approverRole, websiteLinkAllowed,
brandRestrictions }`.

Exports: **`PARTNER_LOGOS`** (the full inventory — never rendered) and **`APPROVED_PARTNERS`** (the
only export public components may consume). `page.jsx` imports only `APPROVED_PARTNERS`.

### The validator is deliberately stricter than the supplied one

The supplied pack filtered on `permission.status === 'approved'` **alone**. That is one keystroke
away from publishing a company's mark with no recorded approver, no date and no restrictions — the
flag set, every other field still `null`.

Here the status is treated as a **statement of intent** and the eight fields as **the evidence**,
and both must hold. Verified by test: a record with `status: 'approved'` and every other field
empty yields **`APPROVED_PARTNERS.length === 0`** and a development-time warning naming the missing
fields.

This is the single most likely way the section ships something it should not, because flipping one
string feels like the whole job.

**Linking is gated separately from display**, since pointing at a company's site is a further use
beyond showing its mark. Verified: `websiteLinkAllowed: false` with a URL present renders an
**unlinked** logo, and `websiteLinkAllowed: true` with `website: null` also renders unlinked.

---

## 10. Zero-, one-, two- and three-plus behaviour

All measured against a production build using temporary approval states, **reverted before any
commit**.

| Approved | Behaviour | Verified |
|---|---|---|
| **0** | **No section at all.** No heading, no empty band, no gap, no client island, no pause control | ✅ page height identical to Phase 9.2 at every width |
| **1** | Compact static row. No animation, no duplicate, no control | ✅ |
| **2** | Compact static row | ✅ `band=false`, `partnerTrack=false`, `control=null`, 2 logos, correct alts |
| **3** | Moving strip, duplicate, shared pause control | ✅ |
| **6** | Moving strip | ✅ 12 tiles (6 + 6 aria-hidden), duration 54s |

One or two logos are **never duplicated to simulate a larger network** — that would manufacture the
appearance of breadth out of the same two companies, which is the specific dishonesty the threshold
exists to prevent.

---

## 11. Heading and relationship wording

**Heading: "Business relationships".**

Chosen as the narrowest true statement available. It asserts that a relationship exists and claims
nothing about who pays whom, whether it is current, its scale, or whether the company endorses
Druppr — none of which a logo and a permission date can support.

**Excluded:** *Trusted by* · *Leading companies* · *Enterprise customers* · *Powering these
businesses* · *Our client network*. Each asserts something about the nature or currency of the
relationship that the records do not establish.

**With `relationship` blank in all six records, nothing more specific is sayable at all** — which
is one more reason the section stays hidden. When completed records support something narrower and
truer, change it in `PartnerStrip.jsx` and record why in the register.

> ⚠️ **Superseded by Phase 10.1 — all six founder-confirmed partner records are now approved and
> the section renders.** Relationships are recorded (five *business relationship*, one *program and
> accelerator relationship*), and the heading remains **"Business relationships"** because that is
> still the narrowest wording those records support. The relationship strings are not rendered.

---

## 12. Motion architecture

| Concern | Where it lives |
|---|---|
| Pause state | `SocialProofMotion.jsx` — one client component, **one instance**, one boolean |
| Keyframes, hover/focus pause, suppression | `src/styles/tailwind.css` |
| No-JavaScript suppression | one `<noscript>` block at band level in `page.jsx` |
| Review content | `Reviews.jsx` — **server** |
| Partner content | `PartnerStrip.jsx` — **server** |

**No dependency was added.** No marquee package, no carousel package. No bouncing, rotation,
pulsing, parallax, speed change or logo scaling.

---

## 13. Review and partner directions

| Band | Direction | Measured | Speed | Duration |
|---|---|---|---|---|
| Google Reviews | **left to right** | `translateX` **+35.4 px/s** | 34 px/s target | derived from count |
| Partner logos | **right to left** | `translateX` **−24.5 px/s** | 24 px/s target | 54 s at six logos |

Both durations are **derived** from the item count at a fixed pixels-per-second, so three partners
and six partners travel at the same speed rather than in the same time. Partners run slower than
reviews because a logo needs recognising rather than reading.

The opposite directions are deliberate: two bands moving the same way read as one long conveyor;
opposed, they read as two distinct pieces of evidence.

---

## 14. Shared pause-control architecture

**One client boundary, one instance, one control, governing both bands.**

Phase 9.1 fixed the ceiling at **3 islands, or 4 with the review-motion wrapper**. An independent
`PartnerMotion` island would have been a fifth, so Phase 8's `ReviewMotion` was widened into
`SocialProofMotion` rather than copied. It is mounted at page level around both sections; the CSS
selector targets the band, not the section:

```
[data-social-motion][data-paused='true'] [data-review-track],
[data-social-motion][data-paused='true'] [data-partner-track]
```

**Neither reviews nor partners are inside it.** Both arrive as `children`, already server-rendered,
so the Google response and the partner records never enter the client bundle. The wrapper owns only
the pause boolean.

**If nothing moves, no wrapper is mounted and no control is rendered** — verified at 0, 1 and 2
approved partners with reviews absent: `band=false`, `control=null`, and the island count drops to
three.

The control's accessible name lists only what is actually moving:

| State | Accessible name |
|---|---|
| Reviews only | *Pause motion for customer reviews* |
| Partners only | *Pause motion for partner logos* |
| Both | *Pause motion for customer reviews and partner logos* |

Verified behaviour with both bands moving:

| Interaction | Result |
|---|---|
| Hover the partner strip | partner **paused**, reviews keep running (per-region) |
| Pointer leaves | partner resumes |
| Press Pause | **both** paused, `aria-pressed="true"`, label → *Resume motion* |
| Hover in and out while paused | **both stay paused**, `aria-pressed` stays `true` |
| Press Resume | both running, `aria-pressed="false"` |

### ⚠️ A known trade-off, stated rather than hidden

With both bands rendering, the single control sits at the **top of the band, above the reviews** —
so a visitor bothered by the partner strip several hundred pixels below must scroll up to reach it.
One instance cannot render a control in two distant places, and two instances would have been a
fifth island.

It is acceptable rather than ideal: the control **precedes both moving regions in DOM and tab
order**, which is what Phase 8 established as the requirement, and hovering either strip already
pauses it without the button. Revisit if the ceiling is ever raised again.

---

## 15. Reduced-motion behaviour

`prefers-reduced-motion: reduce` removes both animations entirely and both tracks become static,
readable, wrapping blocks. The duplicates are removed and the pause control is hidden, because a
button offering to pause motion that does not exist is an inert control.

**The Phase 9 wrap bug was not repeated.** The partner track has the same `w-max`
(`width: max-content`) construction as the review track, so `flex-wrap: wrap` alone would never
have reached a wrap point — the exact defect that left 1 of 5 reviews readable at 390 px in Phase 9.
Both suppression copies release the width.

Measured with six approved partners:

| Condition | Logos fully on screen | Rows | Overflow |
|---|---|---|---|
| reduced motion, 1440 | **6 of 6** | 2 | none |
| reduced motion, 390 | **6 of 6** | 6 | none |

---

## 16. JavaScript-disabled behaviour

Identical to reduced motion, applied by a `<noscript>` block carrying the same declarations by a
mechanism that needs no scripting — necessary because the pause button is the only control and it
is inert without JavaScript, which would otherwise leave moving content a visitor cannot stop.

| Condition | Logos fully on screen | Rows | Overflow |
|---|---|---|---|
| no-JS, 1440 | **6 of 6** | 2 | none |
| no-JS, 390 | **6 of 6** | 6 | none |

The block lives once at band level, covering both tracks and the shared control. **Both copies —
the `@media` rule and the `<noscript>` — must change together**, and that is stated in both files.

---

## 17. Duplicate accessibility handling

| Guarantee | Implementation |
|---|---|
| Announced once | the duplicate half is `aria-hidden="true"` |
| Announced once, belt and braces | every duplicated `<img>` also carries `alt=""` |
| No duplicate tab stop | **the duplicate renders no anchor at all** |
| No duplicate ids | no `id` is used anywhere in the strip; React keys are namespaced `dup-` |
| Hidden when static | `display: none` under reduced motion and no-JS |

The duplicate carries **no link rather than a neutralised one**. Removing a duplicated anchor from
the tab order with `tabIndex={-1}` would work, but not rendering a second anchor is a stronger
guarantee — there is nothing to neutralise, and nothing to regress if the attribute is later
dropped. Verified: with six linked partners, exactly **six** anchors exist in the strip.

Unlinked logos are **not interactive** — no `tabindex`, no role, no hover affordance.

---

## 18. Responsive results

Measured with six approved partners.

| Width | Overflow | Logos legible | Marks compressed | Notes |
|---|---|---|---|---|
| 320 | none | ✅ | none | strip scrolls within its own overflow |
| 390 | none | ✅ | none | |
| 430 | none | ✅ | none | |
| 768 | none | ✅ | none | |
| 1024 | none | ✅ | none | |
| 1440 | none | ✅ | none | |
| 1920 | none | ✅ | none | |
| 200% zoom (720×450) | none | ✅ | none | |

- **Movement does not widen the page** — the track's `overflow-hidden` parent contains the
  off-screen half; `document.scrollWidth === clientWidth` at every width.
- **No mark is ever compressed.** `object-contain` guarantees the canvas fits inside the tile,
  letterboxing rather than distorting. Every supplied canvas is already 2.5:1, the same ratio as
  the 200×80 tile, so today it letterboxes nothing.
- **The pause control stays reachable** — it sits inside the 1200 px content column rather than
  following the full-bleed track to the viewport edge.
- **One- and two-logo states look intentional** — a compact left-aligned row at reduced section
  padding, not a six-logo band with gaps where the others would be.
- **Phase 7.1 hero improvements are unchanged**: hero heights 912 / 897 / 1098 / 773 / 696 px at
  390 / 430 / 768 / 1024 / 1440, identical to Phase 9.

---

## 19. Client-island count

| Island | Present |
|---|---|
| `HeaderMobileNav` | always |
| `NetworkDemo` | always |
| `HeroAddressEntry` | always |
| `SocialProofMotion` | **only when a band actually moves** |

**Today: 3** (no reviews without a key, no approved partners). **With either or both bands moving:
4.** Verified by DOM inspection with six partners and five reviews stubbed: exactly four.

**Within the approved ceiling.** No fifth island was added and no independent `PartnerMotion`
exists.

---

## 20. Bundle measurements

| Metric | Phase 9.2 | **Phase 10** | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 7.09 kB | **7.09 kB** | **0** |
| **`/` First Load JS** | 101 kB | **101 kB** | **0** |
| Shared JS | 87.2 kB | **87.2 kB** | **0** |
| `/medical` · `/legal` · `/contact-us` · `/send` · `/privacy-policy` | — | unchanged | 0 |

### The 5 kB that was measured and then avoided

The first implementation used `next/image` and First Load JS went **101 → 106 kB**. Isolated by
building with and without the import: the cost is the image runtime, and **it is charged whether or
not the component renders**. With the section permission-gated and possibly hidden for months, that
would have shipped 5 kB to every visitor for content none of them can see.

What `next/image` would have bought is bought at build time instead — each logo is a 400×160 WebP,
exactly 2× its rendered tile, so there is no responsive ladder to generate and no format to
negotiate. The two properties that matter are kept with no runtime: `width`/`height` reserve the
box, and `loading="lazy"` is native.

The `@next/next/no-img-element` rule is disabled on those two lines specifically, with the
reasoning in the file. **If the logos ever become responsive or gain a `srcset`, `next/image` earns
its 5 kB and should be restored.**

---

## 21. Logo transfer measurements

| Logo | Source (supplied) | Shipped | Rendered | Encoded | Transferred | Format |
|---|---|---|---|---:|---:|---|
| general-basket-logistics | 253×200 → 600×240 | 400×160 | 200×80 css | 14.3 kB | 14.3 kB | `image/webp` |
| haut-logistics | 225×225 → 600×240 | 400×160 | 200×80 | 10.1 kB | 10.1 kB | `image/webp` |
| that-local-girl | 225×225 → 600×240 | 400×160 | 200×80 | 2.0 kB | 2.0 kB | `image/webp` |
| can-anny | 1080×1080 → 600×240 | 400×160 | 200×80 | 8.9 kB | 8.9 kB | `image/webp` |
| arc-law | 271×65 → 600×240 | 400×160 | 200×80 | 6.2 kB | 6.2 kB | `image/webp` |
| accelerator-centre | 198×77 → 600×240 | 400×160 | 200×80 | 14.1 kB | 14.1 kB | `image/webp` |
| **Total** | 264 kB as supplied | | | **55 kB** | **55 kB** | |

Served `200 image/webp`, confirmed by direct fetch. `naturalWidth × naturalHeight` decodes to
**400×160** against a **200×80** rendered box — a 2× ratio, correct for high-DPR displays.

**All six are `loading="lazy"`** and are requested only when the section scrolls into view — with
the section hidden today, **zero logo bytes are transferred at all.**

---

## 22. Maps and Places counts

| Point | Maps | Places |
|---|---:|---:|
| Homepage load, all five widths | **0** | **0** |
| After focusing the pickup field | 1 bootstrap | 1 per debounced query |

Unchanged by Phase 10. The partner system makes no third-party request of any kind.

---

## 23. CLS results

| Width | Phase 9.2 | **Phase 10** |
|---|---:|---:|
| 390 | 0.0020 | **0.0020** |
| 430 | 0.00003 | **0.00003** |
| 768 | 0.00023 | **0.00023** |
| 1024 | 0.00023 | **0.00023** |
| 1440 | 0.0001 | **0.0001** |

**Identical.** No material regression — and none is expected, because every logo declares
`width`/`height` so its box is reserved before the bytes arrive.

---

## 24. Regression results

| Route | HTTP | H1 | Heading skips | Console errors | Overflow |
|---|---|---|---|---|---|
| `/` | 200 | 1 | none | 0 | none |
| `/medical` | 200 | 1 | none | 0 | none |
| `/legal` | 200 | 1 | none | 0 | none |
| `/contact-us` | 200 | 1 | none | 0 | none |
| `/send` | 200 | 1 | none | 0 | none |
| `/send/details` · `/send/pay` | 200 | — | — | 0 | none |
| `/track/[code]` | 200 | 1 | none | 0 | none |
| `/track-partner/[token]` | 200 | 1 | none | 0 | none |
| `/privacy-policy` | 200 | 1 | none | 0 | none |
| `/nonexistent-control` | **404** | — | — | — | — |

The 404 control confirms the 200s are meaningful rather than a catch-all. Landmarks, skip link,
focus visibility, target sizes and duplicate-id checks all unchanged across every route.

**Page height with zero approved partners is byte-identical to Phase 9.2** — 6223 / 6030 / 5838 /
4125 px at 390 / 430 / 768 / 1024 — confirming there is no gap where the section would be.

---

## 25. Remaining permission gaps

**48 of 48 required fields are outstanding.** For every one of the six organizations, all eight are
needed:

1. Exact public company name · 2. Relationship type · 3. Permission to display publicly ·
4. Permission date · 5. Approver name · 6. Approver role · 7. Website-link permission ·
8. Brand restrictions

Plus the evidence location, and the approved URL where linking is permitted.

**Priority item: confirm the name behind `haut-logistics`.** It is the only one with no artwork
corroboration at all, and it is the one most likely to be published wrong.

**A note on field 8:** record `"None stated"` explicitly when no restrictions were given. Blank is
read as *not asked*, and the validator treats it as incomplete — deliberately.

**A minimum of three completed records is required before any moving strip appears.** One or two
render a compact static row.

---

## 26. Does the section currently render publicly?

> ⚠️ **SUPERSEDED BY PHASE 10.1 — the answer is now YES.** All six were approved on 2026-08-05.

**No.**

`APPROVED_PARTNERS` is empty, so `page.jsx` renders no partner section, no heading, no gap, no
client island and no pause control. The homepage is byte-identical to Phase 9.2.

**This is the permission gate working as designed, not a defect.** The engineering is complete and
tested at every state; only the paperwork is outstanding.

---

## 27. Is Phase 10 ready for approval?

**Yes**, with the permission gap stated plainly rather than buried.

- Assets integrated, optimized 264 kB → 55 kB, aspect ratios and brand fields preserved.
- Permission register and data module agree, with a validator stricter than the supplied one.
- All five states implemented and verified: 0, 1, 2, 3, 6.
- One shared client boundary; island count 3, or 4 when a band moves — within the approved ceiling.
- Directions, speeds and durations measured, not asserted.
- Reduced-motion and no-JavaScript states show **every** logo; the Phase 9 wrap bug was not
  repeated.
- Zero bundle impact: static, 101 kB, 87.2 kB shared, 0 Maps/Places, CLS unchanged.
- Full regression clean across all nine routes.

**What is not done, and cannot be done here:** no partner is approved, so nothing renders. That
requires written permission from six organizations, not more engineering.

---

## 28. Confirmation

- **Nothing has been pushed. Nothing has been merged.** The branch has no upstream configured.
- **No previous commit was amended.**
- **No fake approval was committed.** Temporary approval states were used for testing and reverted;
  the committed `partners.js` has all six at `pending` with every field `null`. Verified by grep
  before committing: `0` occurrences of `status: 'approved'`.
- **No test stub was committed** — the review stub used for the dual-motion test was reverted.
- **`incoming/` remains untracked** and no production code imports from it.
- **No partner logo is displayed publicly.**

---

**Phase 10 complete. Stopping here for review.**

---
---

# Phase 10.1 — Founder-Approved Partner Activation

> **Status: all six partners approved and live. The moving strip renders. Two commits created.
> Nothing pushed, nothing merged.**
>
> **No code change was required to activate them.** The Phase 10 system was built data-driven, so
> the approval is entirely a data and documentation change — which is the strongest evidence that
> the permission gate was a real gate rather than a switch.

## 10.1-1. Founder approval

| Field | Value |
|---|---|
| **Approval date** | **2026-08-05** |
| **Decision-maker** | **Abdul** |
| **Role** | **Founder** |
| **Evidence reference** | *Founder instruction recorded in the Phase 10.1 implementation request on 2026-08-05.* |
| **Scope** | Public display of all six supplied logos on the Druppr website |
| **Website linking** | **Disabled for every partner** |
| **Website URLs** | **`null` for every partner** |
| **Brand-use restrictions** | **"None stated"** for every partner |

The instruction itself is the written approval record, and it is cited as the evidence reference in
both the register and every data record.

## 10.1-2. Approved organizations and relationship types

| # | Exact public name | Relationship recorded |
|---|---|---|
| 1 | General Basket Logistics Services | business relationship |
| 2 | Haut Logistics | business relationship |
| 3 | That Local Girl | business relationship |
| 4 | Can-Anny | business relationship |
| 5 | Arc Law | business relationship |
| 6 | **The Accelerator Centre** | **program and accelerator relationship** |

**The Accelerator Centre is not described as a customer** — its relationship is recorded as a
programme and accelerator relationship, which is a materially different thing from the other five.

**No organisation is described as** a paying customer · a recurring customer · an enterprise
customer · currently active · endorsing Druppr · exclusively served by Druppr. No record supports
any of those.

**The relationship strings are not rendered.** They exist to bound what the section may claim.
Nothing per-partner is published beyond each logo and its alt text.

### "Haut Logistics" — inferred, then founder-confirmed

Phase 10 withheld this name because the artwork is a **symbol-only mark carrying no text at all**,
so unlike the other five nothing in the repository corroborated it, and the slug came from the same
guess.

**The founder has confirmed it is the correct public name, explicitly despite the symbol-only
artwork.** That founder statement is now the evidence. The artwork still does not corroborate it
and never did — **both halves are kept on the record**, in the register and in
`src/data/partners.js`, so if the name is ever disputed it is clear exactly what it rests on.

## 10.1-3. Permission values recorded

Identical in `docs/PARTNER_LOGO_PERMISSIONS.md` and `src/data/partners.js` for all six:

```
permission.status             = 'approved'
permission.displayAllowed     = true
permission.date               = '2026-08-05'
permission.approvedBy         = 'Abdul'
permission.approverRole       = 'Founder'
permission.websiteLinkAllowed = false
permission.brandRestrictions  = 'None stated'
website                       = null
evidenceReference             = 'Founder instruction recorded in the Phase 10.1
                                 implementation request on 2026-08-05.'
```

### ⚠️ The gate was strengthened in the same change that passed it

The validator was **not** relaxed. Two required fields were **added**:

| Added field | Why |
|---|---|
| `permission.displayAllowed` — must be exactly `true` | Splits *"an approval exists"* from *"the approval covers public display"*, which the single `status` string had been carrying alone |
| `evidenceReference` — must be a non-empty string | Where the approval can be found later. An approval nobody can locate is not auditable, and being auditable is this section's entire defence |

So the six clear a **higher** bar than the one they failed in Phase 10.

**Verified the gate still bites**, by tampering with in-memory copies:

| Tamper | Result |
|---|---|
| all six as committed | `APPROVED_PARTNERS.length === 6`, **0 missing fields each** |
| set one `displayAllowed: false` | that partner reports missing `permission.displayAllowed === true` and drops out |
| blank one `evidenceReference` | that partner reports missing `evidenceReference` and drops out |

`PARTNER_LOGOS` remains the complete source collection and is still never rendered.
`page.jsx` imports only `APPROVED_PARTNERS`. **No temporary test-approval logic remains** — the
Phase 10 stub harness lived outside the repository and every state it wrote was reverted.

## 10.1-4. Public rendering

**Six logos rendered.** Heading: **"Business relationships"**.

| Property | Result |
|---|---|
| Semantic logos | **6**, each announced once |
| Visual duplicates | **6**, `aria-hidden="true"` **and** `alt=""` |
| Total `<img>` in the strip | 12 |
| **Anchors wrapping a logo** | **0** — verified in the served HTML and the rendered DOM |
| Logos in the tab order | **0** |
| Duplicate ids | none |
| Heading | *Business relationships* |

Section order, verified from the rendered DOM:

1. Hero · 2. Operational Proof · 3. Platform Showcase · **4. Google Reviews *(absent — no API key
in this environment)*** · **5. Business relationships** · 6. Medical · 7. Legal · 8. Trust and
Accountability · 9. Footer

With reviews absent the partner strip occupies slot 4 visually; the ordering in `page.jsx` is
unchanged and puts it after reviews whenever both render — confirmed during Phase 10 with a review
stub, where the order read *… Showcase → Rated 4.8 on Google → Business relationships → Medical …*.

### Logos are not links

`websiteLinkAllowed: false` and `website: null` for all six, so `canLinkPartner()` returns false
for every record and the component renders no `<a>` at all. **No empty anchors, no stored external
URLs, no keyboard-focusable logo.** Logos are informational images only.

The linking capability is retained in the component and gated on the data — the correct place for
it. It is off because the records say so, not because the ability was removed.

## 10.1-5. Motion

| Band | Direction | Measured | Duration |
|---|---|---|---|
| Google Reviews | **left to right** | +35.4 px/s | derived from review count |
| Partner logos | **right to left** | **−24.5 px/s** | **54 s** at six logos |

Slow, linear, seamless. **No dependency was added** — no marquee package, no carousel package, no
bouncing, rotation, pulsing, parallax, speed change or logo scaling.

### Shared pause control

**One `SocialProofMotion` client boundary, one instance, one control**, governing both bands. No
second island was created.

| Interaction | Result |
|---|---|
| Hover the partner strip | partner **paused**; reviews unaffected (per-region) |
| Pointer leaves | partner resumes |
| Keyboard focus inside a moving region | that region pauses |
| Press **Pause** | **both bands paused**, `aria-pressed="true"`, label → *Resume motion* |
| Hover in and out while paused | **stays paused**, `aria-pressed` stays `true` — explicit pause is authoritative |
| Press **Resume** | both running, `aria-pressed="false"` |

The control's accessible name names only what is actually moving. With reviews absent it reads
**"Pause motion for partner logos"**; with both bands live, **"Pause motion for customer reviews and
partner logos"**.

## 10.1-6. Reduced-motion results

`prefers-reduced-motion: reduce` removes all movement. The track becomes a static, centred,
wrapping block; the duplicate is removed; the pause control is hidden, because a button offering to
pause motion that does not exist is an inert control.

| Width | Logos fully on screen | Rows | Overflow |
|---|---|---|---|
| 1440 | **6 of 6** | 2 | none |
| 390 | **6 of 6** | 6 | none |
| 320 | **6 of 6** | 6 | none |

## 10.1-7. JavaScript-disabled results

Identical, applied by the `<noscript>` block — necessary because the pause button is the only
control and is inert without JavaScript.

| Width | Logos fully on screen | Rows | Overflow |
|---|---|---|---|
| 1440 | **6 of 6** | 2 | none |
| 390 | **6 of 6** | 6 | none |

**Every logo remains visible in both static fallback states.**

## 10.1-8. Accessibility results

| Check | Result |
|---|---|
| Accurate alt text, all six source logos | ✅ *"<Company> logo"* for each |
| Duplicate logos use `alt=""` | ✅ all six |
| Visual duplicates `aria-hidden` | ✅ |
| Each company represented once to assistive tech | ✅ |
| No logo is interactive | ✅ 0 anchors, no `tabindex`, no role |
| No logo in the tab order | ✅ tab stops 20, none a logo |
| No duplicate IDs | ✅ none anywhere on the route |
| Pause control uses `aria-pressed` | ✅ flips `false` ↔ `true` |
| Visible keyboard focus | ✅ 20 of 20 tab stops show a ring |
| Reduced-motion exposes all six | ✅ |
| JavaScript-disabled exposes all six | ✅ |
| No clipping at 200% zoom | ✅ measured at 720×450 CSS, DPR 2 |
| No horizontal page overflow | ✅ every width 320 → 1920 |
| No false interactive affordances | ✅ 0 false buttons |
| Exactly one `<h1>`, no heading skips | ✅ |

## 10.1-9. Responsive results

| Width | Overflow | Strip rows | Tile | Distorted | Clipped | Hero height |
|---|---|---|---|---|---|---|
| 320 | none | 1 | 200×80 | **0** | 0 | 968 px |
| 360 | none | 1 | 200×80 | **0** | 0 | 906 px |
| 390 | none | 1 | 200×80 | **0** | 0 | 912 px |
| 430 | none | 1 | 200×80 | **0** | 0 | 897 px |
| 768 | none | 1 | 200×80 | **0** | 0 | 1,098 px |
| 1024 | none | 1 | 200×80 | **0** | 0 | 773 px |
| 1280 | none | 1 | 200×80 | **0** | 0 | 696 px |
| 1440 | none | 1 | 200×80 | **0** | 0 | 696 px |
| 1920 | none | 1 | 200×80 | **0** | 0 | 696 px |
| 200% zoom | none | 1 | 200×80 | **0** | 0 | 1,098 px |

- **All six logos are recognisable** and none is compressed into an illegible mark.
- **Zero distortion at every width** — measured by comparing each rendered box ratio against the
  image's intrinsic ratio; `object-contain` letterboxes rather than stretches.
- **The moving strip stays one row** at every width, as intended.
- **Movement does not widen the page** — `document.scrollWidth === clientWidth` everywhere.
- **The pause control stays reachable**, inside the 1200 px content column rather than following
  the full-bleed track to the viewport edge.
- **Phase 7.1 is undone by nothing**: hero heights are identical to Phase 9 and Phase 10 at every
  width.
- Brand presentation preserved — **That Local Girl's orange field and Arc Law's dark banner both
  intact**, nothing recoloured, redrawn, cropped or converted to monochrome, no effects added
  inside any logo.

## 10.1-10. Performance measurements

| Metric | Phase 10 | **Phase 10.1** | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 7.09 kB | **7.09 kB** | **0** |
| **`/` First Load JS** | 101 kB | **101 kB** | **0** |
| Shared JS | 87.2 kB | **87.2 kB** | **0** |
| Client islands | 3 (nothing moving) | **4** (social-proof motion renders) | +1, **within the approved ceiling** |
| Maps requests before address interaction | 0 | **0** | 0 |
| Places requests before address interaction | 0 | **0** | 0 |
| New dependencies | — | **none** | — |
| Application console errors | 0 | **0** | 0 |

**The section costs zero client JavaScript.** It is server-rendered, and its logos are plain
`<img>` rather than `next/image` — a decision Phase 10 made by measurement, because the image
runtime costs 5 kB of First Load JS whether or not the component renders.

### CLS

| Width | Phase 10 | **Phase 10.1** |
|---|---:|---:|
| 390 | 0.0020 | **0.0020** |
| 430 | 0.00003 | **0.00003** |
| 768 | 0.00023 | **0.00023** |
| 1024 | 0.00023 | **0.0000** |
| 1440 | 0.0001 | **0.00006** |

**No material regression** — and none expected, because every logo declares `width`/`height`, so
its box is reserved before the bytes arrive.

### Page height

The section adds ~296–328 px, which is the section existing rather than a regression:

| Width | Before (no partners) | After |
|---|---:|---:|
| 390 | 6,223 px | 6,519 px |
| 430 | 6,030 px | 6,326 px |
| 768 | 5,838 px | 6,166 px |
| 1024 | 4,125 px | 4,453 px |
| 1440 | 3,996 px | 4,324 px |

## 10.1-11. Logo transfer measurements

| Logo | Source dimensions | Natural | Rendered | Encoded | Transferred | Format |
|---|---|---|---|---:|---:|---|
| general-basket-logistics | 253×200 → 600×240 supplied | 400×160 | 200×80 css | 14.3 kB | **14.3 kB** | `image/webp` |
| haut-logistics | 225×225 → 600×240 | 400×160 | 200×80 | 10.1 kB | **10.1 kB** | `image/webp` |
| that-local-girl | 225×225 → 600×240 | 400×160 | 200×80 | 2.0 kB | **2.0 kB** | `image/webp` |
| can-anny | 1080×1080 → 600×240 | 400×160 | 200×80 | 8.9 kB | **8.9 kB** | `image/webp` |
| arc-law | 271×65 → 600×240 | 400×160 | 200×80 | 6.2 kB | **6.2 kB** | `image/webp` |
| accelerator-centre | 198×77 → 600×240 | 400×160 | 200×80 | 14.1 kB | **14.1 kB** | `image/webp` |
| **Total** | | | | **55.5 kB** | **55.5 kB** | |

**6 requests, 6 unique files, 55.5 kB total** — every response `200 image/webp`. The duplicate half
re-uses the same six URLs, so the seamless loop costs **no extra bytes**.

All six are `loading="lazy"` and are requested only when the section scrolls into view, so a
visitor who never reaches it transfers **zero** logo bytes. Natural 400×160 against a 200×80
rendered box is a 2× ratio, correct for high-DPR displays.

## 10.1-12. Staging-directory cleanup

`incoming/` was removed in full — the extracted `druppr-partner-logo-assets/` package **and** the
1.45 MB ZIP.

Confirmed **before** deleting that all six production assets exist and serve from
`public/images/partners/`. Nothing was tracked by git at any point, so the removal produces no
diff.

**Retained, as required:** `public/images/partners/` · `src/data/partners.js` ·
`docs/PARTNER_LOGO_PERMISSIONS.md` · `docs/HOMEPAGE_PHASE_10_REPORT.md`.

**Never committed:** the ZIP · `preview.png` · `originals/` · `trimmed/` · the supplied 600×240
duplicates · any temporary test state or approval stub.

## 10.1-13. Regression results

| Route | HTTP | H1 | Heading skips | Console errors | Overflow | Clipping |
|---|---|---|---|---|---|---|
| `/` | 200 | 1 | none | 0 | none | none |
| `/medical` | 200 | 1 | none | 0 | none | none |
| `/legal` | 200 | 1 | none | 0 | none | none |
| `/contact-us` | 200 | 1 | none | 0 | none | none |
| `/send` | 200 | 1 | none | 0 | none | none |
| `/send/details` · `/send/pay` | 200 | — | — | 0 | none | none |
| `/track/[code]` | 200 | 1 | none | 0 | none | none |
| `/track-partner/[token]` | 200 | 1 | none | 0 | none | none |
| `/privacy-policy` | 200 | 1 | none | 0 | none | none |
| `/nonexistent-control` | **404** | — | — | — | — | — |

The 404 control confirms the 200s are meaningful.

**Booking handoff re-verified end to end** with live Google Places, using generic public landmarks
only: 0 Maps/Places before interaction · one library bootstrap on focus · both addresses selected ·
submit gated until both are valid · editing invalidates coordinates · re-selection re-enables ·
`legaldrop.send-flow.v1` written with finite coordinates · **no addresses in the URL** · unrelated
booking state preserved · zero console errors.

**One known measurement artifact, unchanged from Phase 9:** the `/send` audit reports two tab stops
without a focus ring. The indicator is a border rendered inside Google's `gmp-place-autocomplete`
**closed** shadow root, confirmed visible by screenshot. Not a defect.

## 10.1-14. Files modified

| File | Change |
|---|---|
| `src/data/partners.js` | all six records approved; validator strengthened by two required fields |
| `docs/PARTNER_LOGO_PERMISSIONS.md` | register updated to 6 of 6 approved; field table mapped to code fields |
| `docs/HOMEPAGE_PHASE_10_REPORT.md` | this appendix |

**No component, style or page file changed.** The Phase 10 system was built data-driven, so
activation required no code — which is the clearest demonstration that the gate was a real gate.

**No `feat(home)` commit was created**, because there was no code change to put in it. Creating one
would have meant an empty commit.

The register and `src/data/partners.js` were committed **together**, deliberately: the two must
match exactly, and committing them in one change means they cannot be out of step at any point in
history.

## 10.1-15. Confirmation

- **Nothing has been pushed. Nothing has been merged.** The branch has no upstream configured.
- **No previous commit was amended.**
- **No temporary test state or fake approval was committed.**
- **The staging directory and the ZIP are gone.**
- All six partners are approved by an explicit, dated, attributed founder decision.

---

**Phase 10.1 complete. Stopping here for review.**
