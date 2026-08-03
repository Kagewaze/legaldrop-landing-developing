# Homepage Phase 0 — Decisions and Content Readiness

> **Status: Phase 0 record. No application code has been written. Phase 1 has not begun.**
>
> This document records the product decisions approved by the founder, the content that is available, the evidence still required, and the blockers that must clear before implementation. It is subordinate to [`VISION.md`](VISION.md) on principle and [`HOMEPAGE.md`](HOMEPAGE.md) on homepage strategy, and it resolves the D1–D10 decisions raised in [`HOMEPAGE_IMPLEMENTATION_PLAN.md`](HOMEPAGE_IMPLEMENTATION_PLAN.md) §15.
>
> **Repository facts in this document were verified on 2026-08-03** against the working tree, not carried forward from earlier analysis.

---

## Approved Decisions

### D1 — Publishable metrics — **APPROVED WITH CONSTRAINTS**

**Approved for publication:**

| Metric | Approved wording | Requires |
|---|---|---|
| Completed deliveries | **50+ completed deliveries** | An as-of date |
| Business partners | **5 business partners** | An as-of date; see D8 before naming any of them |

**Prohibited until calculable from reliable operational data.** These must not be published, estimated, implied, approximated, or gestured at with adjectives:

- on-time delivery percentage
- median pickup time
- average delivery time
- customer retention rate
- active account count
- delivery success percentage

**Presentation guidance.** Two metrics do not fill a five-figure proof bar. Rather than padding it, the honest options are:

1. **Two metrics presented deliberately**, with an as-of date and a category statement (e.g. what kinds of movement those deliveries covered). Sparse and confident beats padded.
2. **Fold the metrics into the trust section** and let the platform showcase carry screen 2, until more metrics qualify.

`HOMEPAGE.md` sets the proof bar's gate at **≥ 3 verified metrics**. With two approved, **the standalone proof bar does not ship in Phase 3 as specified.** Options are set out in *Recommended Homepage Scope* below; this needs a founder decision (see **Open Question OQ-1**).

A note on framing, not a challenge to the decision: 50+ deliveries is a small number, and `VISION.md` → Trust Philosophy is explicit that *a modest true number outperforms an impressive false one*. Presenting it plainly, dated, is correct. Presenting it in a layout designed to hold large numbers will draw attention to its size — so the layout should be designed for two figures, not scaled down from five.

#### App Store and Google Play availability — **determination**

**Repository finding:** there is **no reference to the App Store, Google Play, Apple, iTunes, TestFlight, or any app download link anywhere in `src/` or `public/`.** App availability is currently not represented in this codebase at all.

**Determination: App Store and Google Play badges belong in the Platform Showcase, not the proof bar.**

| Placement | Verdict | Reasoning |
|---|---|---|
| **Proof bar** | ❌ **No** | The proof bar answers *"is this operating?"*. Store availability is evidence a product was **built and shipped**, not evidence of operational volume. Placing it among delivery counts dilutes operational proof — explicitly counter to the founder's instruction that it must not replace operational proof |
| **Platform showcase** | ✅ **Yes — recommended** | The showcase answers *"does the software exist?"*. Store presence is direct evidence of product maturity and is read that way by both buyers and the secondary investor audience. Badges sit naturally beneath the product frames |
| **Trust section** | ⚠️ Acceptable fallback | Works as a secondary credibility signal, but weaker — it is separated from the product frames it corroborates |

**Requires from founder:** confirmation that both apps are live and publicly downloadable, plus the store URLs. Badges must use Apple's and Google's official artwork and follow their brand guidelines.

---

### D2 — Product screenshots and evidence — **APPROVED WITH CONSTRAINTS**

**Approved for eventual display**, redacted: tracking interface · partner platform · delivery status flow · proof of delivery · dispatch or driver assignment · booking interface.

**Prohibited in any screenshot:** customer names, driver names or identifiers, real street addresses, phone numbers, email addresses, medical information, legal matter details, tracking codes tied to real orders, and any delivery detail traceable to a real customer.

Redaction must be **visibly a redaction**. Substituting plausible fake values for real ones is prohibited — it converts a screenshot from evidence into fiction.

#### Chain of custody — **BLOCKED**

**Confirmed: no designed chain-of-custody artifact exists in this repository.** The tracking pages render an `InfoList` of fields, not a custody record.

**Blocker 1 — data fields. Partially resolved by repository exploration.** The following fields are demonstrably rendered today:

| Field | Source |
|---|---|
| Tracking Code | `src/app/track/[trackingCode]/page.jsx:149`, `track-partner/…/page.jsx:158` |
| Category | both, `:150` / `:159` |
| Vehicle | both, `:151` / `:160` |
| Order Placed (`createdAt`) | both, `:152` / `:161` |
| Route Distance | partner only, `:165` |
| On Route To Pickup (timestamp) | both, `:156` / `:172` |
| Package Picked Up (timestamp) | both, `:163` / `:179` |
| Sender / Pickup Address | partner, `:186–187` |
| Status (9-value model) | `LiveTracking.jsx:14–23` — `pending`, `assigned`, `ongoing`, `awaiting_seller_confirmation`, `awaiting_handoff`, `delivered`, `cancelled`, `failed`, `refunded` |
| Driver location, ETA | `LiveTracking.jsx` (polled, 6 s) |

**⚠️ The drop-off confirmation code is not rendered anywhere in this repository.** It exists only as an icon (`icons.jsx:307 DropOffCode`) and as a claim in marketing copy (`/medical`, `/legal`, `home/WhyBrand.jsx`, `home/VerticalSection.jsx`). The backend model does include an `awaiting_handoff` status, which is consistent with a handoff code existing elsewhere — most likely in the driver app or a recipient flow outside this repo. **This does not mean the claim is false; it means it cannot be verified from this codebase.** Routed to D10 for confirmation before any homepage proof claim relies on it.

**Blockers 2–4 remain open:** the product surface is not designed; wording is not reviewed; no approved demonstration record exists.

**Synthetic demonstration.** Permitted only when labelled unambiguously as a product demonstration — e.g. *"Example record — demonstration data"* — placed adjacent to the artifact, not in a footnote. It must depict only fields that genuinely exist (the table above) and must never be captioned or implied to be a real customer record.

**Chain-of-custody section status: BLOCKED. Excluded from the initial homepage scope.**

---

### D3 — Product design-system drift — **ACKNOWLEDGED; RECOMMENDATION BELOW**

#### Legacy visual patterns — measured inventory

Across `track/[trackingCode]/page.jsx`, `track/[trackingCode]/LiveTracking.jsx`, `track-partner/[trackingToken]/page.jsx`, `track-partner/[trackingToken]/PartnerLiveTracking.jsx`:

| Legacy utility | Occurrences |
|---|---|
| `font-semibold` | 25 |
| `text-sm` | 17 |
| `slate-500` | 15 |
| `slate-200` | 14 |
| `text-xs` | 13 |
| `slate-900` | 10 |
| `shadow-sm` | 10 |
| `slate-400` | 9 |
| `rounded-full` | 7 |
| `rounded-3xl` | 7 |
| `slate-700` | 5 |
| `rounded-2xl` | 5 |
| `slate-100` | 4 |
| `emerald-*` / `rose-*` / `amber-*` status badges | ~14 combined |

**Marketing tokens used in these files: zero.**

#### Mapping to current Druppr tokens

| Legacy | Druppr token | Notes |
|---|---|---|
| `slate-900` | `#17131c` (ink) | Primary text |
| `slate-700` / `slate-600` | `#433d4b` | Secondary body |
| `slate-500` | `#5f5868` | Muted body |
| `slate-400` | `#8d8695` | ⚠️ **Inherits a known contrast failure** — `#8d8695` measures 3.21–3.51 against light grounds at ≤16 px. Do not map blindly; use `#5f5868` where the text is small |
| `slate-200` | `#eeebf1` (card border) / `#e5e1e8` | Hairlines |
| `slate-100` | `surface-tint` `#f7f3fb` | Fills |
| `rounded-3xl` (24 px) | `rounded-card` (20 px) | Semantic radius |
| `rounded-2xl` (16 px) | `rounded-card`, or retain for rows | Row-level treatment |
| `shadow-sm` | `shadow-card` | Ink-tinted elevation |
| `shadow-lg` | `shadow-lift` | One step up |
| `emerald-*` / `rose-*` / `amber-*` | **No equivalent exists** | ⚠️ **Gap** — `tailwind.config.js` defines no semantic success/warning/error colours. `VISION.md` → Design Philosophy calls for *"semantic colour (success, warning, live status), functional and quiet"*. These tokens must be **added** before any status UI can be restyled |

#### Recommended approach — **Option B: dedicated homepage product frames, with a follow-on restyle**

Three options were considered:

| Option | Approach | Trade-offs |
|---|---|---|
| **A — Restyle the live surfaces first** | Migrate `/track` and `/track-partner` to Druppr tokens, then screenshot them | ✅ Perfectly honest; ✅ fixes real product debt; ❌ touches **live customer-facing tracking**, the surface a waiting customer stares at; ❌ requires new semantic status tokens; ❌ regression risk on a payment-adjacent flow; ❌ blocks the homepage for weeks |
| **B — Homepage product frames** *(recommended)* | Build homepage-native components that render the **same real data and the same real 9-value status model**, styled in the Druppr system | ✅ Zero risk to live tracking; ✅ unblocks the homepage now; ✅ semantic tokens can be introduced in the homepage first and adopted by the product later; ⚠️ **the frame must depict only what the product actually does** — same fields, same states, same terminology; ❌ a temporary divergence between marketing frame and shipped UI |
| **C — Screenshot as-is** | Use the current slate-styled screens | ✅ Cheapest, ✅ maximally honest; ❌ looks like a different company's product on the page; ❌ actively undermines the design-maturity signal the homepage exists to create |

**Recommendation: B**, with two binding conditions to prevent it becoming a misleading mock:

1. **Fidelity constraint.** The frame renders only fields that exist (the D2 table) and only states from the real 9-value model. No invented panel, metric, chart, or capability. Reviewed against the live product before ship.
2. **Follow-on commitment.** Restyling `/track` and `/track-partner` is scheduled as its own workstream, so the divergence is temporary and closes in the product's favour. The homepage frame becomes the reference implementation for the semantic tokens.

**Founder's constraint honoured:** *"Do not make the homepage showcase look more mature than the product users actually receive."* Option B satisfies this only if condition 1 holds. If the fidelity constraint is not enforceable, **fall back to Option C** — an honest, visually inconsistent screenshot is better than a flattering fiction.

---

### D4 — Hero visual — **APPROVED**

**A simulated Druppr logistics network experience**, built on the existing map and tracking architecture (`src/lib/maps-loader.js`, `PartnerTrackingMap.jsx` rendering technique, the real 9-value status model).

Must communicate: active dispatch · route progression · pickup and destination · delivery status · multiple delivery categories · platform coordination.

**Honesty requirement.** The visual must not imply displayed jobs are live customer activity. Approved framing: **"See how the Druppr network works"**, or equivalent wording that presents it as a demonstration. The label must be visible with the visual, not hidden in a footnote.

**The cyclist stock image is retired from the hero** (`src/images/hero-cyclist.jpg`, 441 kB — also the likely LCP element).

**Technical constraint carried from the plan:** the hero visual must not put the Maps SDK on the critical rendering path. It should render as lightweight SVG/canvas with a static poster fallback, or lazy-mount below the LCP path. **The homepage currently makes zero requests to `maps.googleapis.com`; that must remain true on load.**

---

### D5 — Hero booking form — **APPROVED: FUNCTIONAL**

The homepage address experience is functional. The required user journey, all eight steps:

1. focus the pickup field → 2. type a pickup address → 3. select a suggestion → 4. focus the drop-off field → 5. type a destination → 6. select a suggestion → 7. press the primary pricing/booking action → 8. continue to the booking flow **with both selected addresses preserved**.

**Binding constraints:**

- **No redirect on first click of an address field.** The current behaviour — the whole card being one link to `/send` — is explicitly retired.
- **Reuse `src/lib/maps-loader.js`.** No second loader, no second API key, no npm Maps package. Version stays pinned at `v: '3.64'`.
- **Reuse `src/components/send/AddressAutocomplete.jsx`** via a thin wrapper. Its internals are a documented styling and event contract with Google's web component (`gmp-select`, not `gmp-placeselect`); they are not to be refactored.
- **Maps and Places load lazily on first interaction** where technically practical — focus or click on the field, never on page load.
- Autocomplete must integrate visually with Druppr **while preserving required Google attribution and platform terms.**
- **Do not load the full Maps experience on the critical rendering path unless testing proves it necessary.**

**Open engineering question (OQ-2):** address hand-off to `/send`. `src/lib/send-flow.js` and `src/lib/guest-session.js` already manage send-flow state; the mechanism for carrying two selected places from the homepage into that flow must be designed in Phase 7 and must not duplicate state management.

---

### D6 — Integrations — **EXCLUDED FROM SCOPE**

**Repository exploration performed.** Searched `src/` for webhooks, OpenAPI/Swagger specs, public API surfaces, developer documentation, Zapier, HL7, FHIR, LIS and EMR references.

**Finding: no customer-facing integration or public API exists.** The only API is the internal backend (`API_BASE_URL`, `src/lib/config.js`) which the site itself consumes. `/public/track/{code}` and `/public/pay/{code}` are endpoints this frontend calls — not published, documented, or offered integrations.

**Decision: the integrations section is removed from homepage scope.** The following must not appear anywhere on the homepage: API claims · LIS integrations · EMR integrations · practice-management integrations · document-management integrations · webhooks · partner integrations.

Revisit only when a real, verifiable, customer-facing integration ships.

---

### D7 — Non-live services — **APPROVED: REMOVE**

#### Currently live services — verified against `src/lib/navigation.js`

| Service | Route | Status |
|---|---|---|
| **Send a package** | `/send` | ✅ live — full flow: addresses, vehicle + price, Stripe payment |
| **Medical delivery** | `/medical` | ✅ live — account-based, page exists |
| **Legal documents** | `/legal` | ✅ live — account-based, page exists |

**Exactly three live services.** Two supporting pages are also live but are not services: `/contact-us`, `/privacy-policy`.

#### The eight to remove from the homepage

`ride` · `marketplace` · `dropBatch` · `tow` · `designatedDriver` · `petTransport` · `rentACar` · `trainingHub` — all `live: false`.

#### Recommended grouping of the three live services

Do **not** group them as a catalogue of three — three items in a "everything we do" frame reads as a small company listing everything it can think of. Group them by **how a customer buys**, which is a real distinction and the one that matters:

| Group | Services | Buying model | Homepage placement |
|---|---|---|---|
| **Book instantly** | Send a package | Priced up front, self-serve, pay at checkout | Consumer band (S7) |
| **On account** | Medical delivery · Legal documents | Contracted, standing routes, account-based, no price quoted | Regulated verticals (S4) |

This grouping is already the truthful structure of the business — `VerticalSection.jsx` documents that the account-based verticals differ *"in how a customer buys, not in marketing emphasis."* It also removes the need for a service-catalogue section at all: the two groups are already two homepage sections.

**Binding constraints honoured:** unavailable services get no visual treatment alongside live ones; no dead links; **"coming soon" is not used repeatedly across the homepage** — preferably not at all. Future services may be described in product or company documentation, never as active inventory.

**Also requires:** the footer Services column currently lists all 11. It must be reduced to the three live services (out of homepage scope but in the same commit series — see OQ-3).

---

### D8 — Partner logos and testimonials — **GATED ON WRITTEN PERMISSION**

No logo, company name, testimonial, or identifiable case study appears until permission is confirmed **in writing**. Until then: **no logo and no wording that implies endorsement** — including "trusted by clinics across Toronto" or similar unattributed implications.

An **anonymized description may be proposed** and must remain strictly factual — e.g. *"a downtown diagnostic laboratory, standing weekday routes"* — with no embellishment and no implied scale.

#### Content checklist — one required per proposed partner

| Field | Value |
|---|---|
| Legal company name | |
| Display name (as it should appear) | |
| Approved logo asset (file, format, clear-space rules) | |
| Permission status (`none` / `verbal` / **`written`**) | |
| Approved testimonial (verbatim) | |
| Approved service description | |
| Approval date | |
| Person who granted approval (name, role) | |
| Expiry or review date, if any | |

**Only `written` permits publication.** Verbal permission is not sufficient for a public marketing page naming a regulated business.

Five business partners are approved as a **count** (D1). Naming any of them requires a completed checklist each.

---

### D9 — Driver recruitment — **APPROVED: REMOVE FROM HOMEPAGE**

`src/components/home/BecomeADriver.jsx` is removed from the customer-facing homepage.

- Driver recruitment moves to a **dedicated driver page**.
- The homepage may carry **one restrained navigation or footer link**.
- **Prohibited in the primary customer journey:** driver earnings cards, recruitment animations, gig-work messaging, and "set your own hours" copy.

**Note:** `ROUTES.becomeADriver` is `live: false`, and the current component routes to `/contact-us` as a fallback. The dedicated driver page is a **prerequisite** for the footer link; until it exists, the link points nowhere and must be omitted (content gate C5 — no dead links). See OQ-4.

---

### D10 — Compliance and regulated claims — **ALL GATED ON REVIEW**

**No claim below is published until its row shows `Approved`.** The founder may approve **factual operational information**. Legal, privacy, insurance, security and regulatory claims require review by an appropriately qualified professional.

**Do not substitute HIPAA language for Canadian privacy requirements.** Ontario **PHIPA** governs; TDG governs dangerous goods.

| Proposed claim | Current evidence | Responsible reviewer | Approval status | Approved wording |
|---|---|---|---|---|
| Insurance / liability coverage | None in repo | Insurance broker + founder | ☐ Not started | |
| TDG certification status | Claimed in `WhyBrand`, `/medical`; no certificate in repo | Founder (operational fact) + compliance advisor | ☐ Not started | |
| PHIPA / privacy posture | `/privacy-policy` exists; homepage claim not drafted | Privacy counsel | ☐ Not started | |
| Medical specimen handling | Claimed on `/medical` under an exclusion list | Founder + compliance advisor | ☐ Not started | |
| Chain of custody | **Timestamps + status verified in repo; drop-off code NOT rendered anywhere in this codebase** | Founder (confirm where the code is produced) + legal counsel | ☐ **Blocked — verification required** | |
| Security controls | None in repo | Security reviewer | ☐ Not started | |
| Confidentiality training | Claimed on `/legal`, `VerticalSection` | Founder (operational fact) | ☐ Not started | |
| Service-level guarantees (SLA) | None; no SLA exists | Founder + counsel | ☐ Not started | |
| Delivery-time guarantees | None. `WhyBrand` says *"Most jobs collected within the hour"* — unsourced | Founder | ☐ **Review existing copy** | |
| Regulated-goods handling | TDG claim only | Compliance advisor | ☐ Not started | |
| Data storage and processing | `/privacy-policy` only | Privacy counsel | ☐ Not started | |
| Proof-of-delivery evidentiary claims | Timestamps verified; **evidentiary weight not established** | Legal counsel | ☐ **Blocked** | |

**Two existing on-site claims flagged for review** — they predate this project and are currently live:

1. **"Most jobs collected within the hour"** (`home/WhyBrand.jsx`) — a delivery-time claim with no operational basis available. D1 prohibits publishing pickup-time metrics; this is the same claim in prose. **Recommend removal or re-wording in Phase 1.**
2. **"Confirmed by drop-off code"** (`home/WhyBrand.jsx`) and equivalent wording on `/medical`, `/legal` — cannot be verified from this repository (see D2).

---

## Accessibility Findings

Recorded from the planning audit, measured on a production build at 1440×900. **Not repaired — remediation is scheduled, not performed.**

| # | Issue | Affected component | WCAG concern | Severity | Recommended remediation | Phase |
|---|---|---|---|---|---|---|
| A1 | Contrast 3.51:1 — "Get your price" (14 px), "Pickup address" (16 px), "Dropoff address" (16 px), "from" (12 px) | `home/Hero.jsx` | **1.4.3 Contrast (Minimum)** — AA fail | **High** | Replace `#8d8695` with `#5f5868` (≥ 4.5:1) or darken the token for small text | **1** |
| A2 | Contrast 3.21:1 "For clinics & labs", 3.35:1 "For law firms" (14 px eyebrows) | `home/VerticalSection.jsx` | **1.4.3** — AA fail | **High** | Same remedy; affects `/medical` + `/legal` — verify all three pages | **1** |
| A3 | No skip link | `components/Layout.jsx` / `app/(main)/layout.jsx` | **2.4.1 Bypass Blocks** | **Medium** | Add a visually-hidden, focus-visible skip link to `<main>` | **1** |
| A4 | 10 touch targets < 44 px — nav links 26 px tall, footer links 22 px, wordmarks 31/27 px | `Header.jsx`, `Footer.jsx` | **2.5.8 Target Size (Minimum)** (AA, 2.2) | **Medium** | Increase padding to a 44 px hit area without changing visual size | **1** |
| A5 | 15 of 19 interactive elements rely on the UA default focus ring | `Header.jsx`, `Footer.jsx`, `Services.jsx`, `Reviews.jsx` | **2.4.7 Focus Visible** / **2.4.11 Focus Appearance** | **Medium** | Adopt the existing recipe already used in `Hero.jsx` / `VerticalSection.jsx`: `focus-visible:ring-2 ring-brand-600 ring-offset-2 ring-offset-white` | **1** |
| A6 | Footer uses `<h2>` for 14 px section headings | `Footer.jsx` | **1.3.1 Info and Relationships** | **Low** | Demote to a non-heading element or `<h3>`; the size is not a heading level | **1** |

**Baseline passing and to be preserved:** `lang="en"` · `header`/`main`/`nav`/`footer` landmarks · exactly one `<h1>` · 0 of 4 images missing `alt` · CLS 0.0016 desktop / 0.0014 mobile.

---

## Phase 0 Content Inventory

| Asset / claim | Status | Notes |
|---|---|---|
| **50+ completed deliveries** | ✅ **Ready** | Approved D1. Needs an as-of date |
| **5 business partners** | ✅ **Ready** | Approved D1 as a count only. Naming any requires D8 |
| **5 onboarded GTA drivers** | ⚠️ **Requires confirmation** | Candidate third metric (OQ-1). Publishable only if founder confirms it is current at publication. Unlocks the three-metric proof bar |
| App Store approval | ⚠️ **Requires confirmation** | Not referenced anywhere in the repo. Need live status + store URL + official badge artwork |
| Google Play approval | ⚠️ **Requires confirmation** | As above |
| Tracking interface | 🎨 **Requires design** | Exists and functions, but token-drifted (D3). Homepage frame per Option B |
| Partner platform | 🎨 **Requires design** | Same; `PartnerLiveTracking` + `PartnerTrackingMap` exist, token-drifted |
| Proof of delivery | ⚠️ **Requires confirmation** | Timestamps + status verified; **drop-off code not rendered in this repo** |
| Chain-of-custody record | 🚧 **Requires product development** | No designed artifact. Fields partially confirmed. **Blocked** |
| Customer logos | 🔒 **Requires permission** | D8 checklist per partner, written permission only |
| Testimonials | 🔒 **Requires permission** | As above |
| Insurance | ⚖️ **Requires professional review** | No evidence in repo |
| TDG | ⚖️ **Requires professional review** | Claimed on-site today; certificate not in repo |
| Privacy / PHIPA | ⚖️ **Requires professional review** | Privacy counsel. **Never HIPAA** |
| Security | ⚖️ **Requires professional review** | No posture documented |
| Google reviews | ✅ **Ready** | `lib/google-reviews.js`, Places API (New), 24 h revalidate, conditional render. Consumer-grade proof only |
| Coverage | ✅ **Ready** | `SERVICE_AREA` = "Now serving Toronto and the GTA". **Do not publish the neighbourhood list** — a local-services SEO pattern |
| Vehicle types | ✅ **Ready** | Real product data, `send/vehicles.js`: Bike, Car, SUV, Minivan, Cargo van, Box truck |
| Consumer pricing | ⚠️ **Requires confirmation** | **`$8.00` removed from the hero** (OQ-5). Hardcoded literal at `Hero.jsx:235`, not from the pricing engine. "Regular deliveries start with an $8 base fee, plus distance" permitted **in a pricing section only**, pending confirmation. **"from $8" alone is prohibited** |
| SLA | ⚖️ **Requires professional review** | No SLA exists |
| Integrations | ❌ **Excluded from scope** | D6 — none exist |
| On-time %, median pickup, avg delivery, retention, active accounts, success % | 📊 **Requires operational calculation** | D1 — prohibited until calculable |
| "Most jobs collected within the hour" *(existing copy)* | ❌ **Excluded from scope** | Withheld. Unverified delivery-time claim. **Must not be replaced by another numerical pickup-time promise.** "On-demand and scheduled delivery options" permitted only if accurate |
| Drop-off confirmation code | 🚧 **Requires product development** | Unverifiable in this repo. Excluded from the state machine and custody claims pending 5 founder confirmations |
| Existing photography *(hero cyclist, verticals, coverage)* | ✅ **Ready** — *but see note* | Availability ≠ preferred use. **Cyclist retired from the hero.** Stock must not displace product interfaces or operational evidence |

---

## Recommended Homepage Scope

Given the decisions above, this is the recommended section order. **Sections whose shipping gate cannot reasonably be met are excluded.**

| # | Section | Purpose | Objective | Content available now | Missing content | Shipping gate | Phase |
|---|---|---|---|---|---|---|---|
| **1** | **Hero — simulated network** | Establish category in five seconds; two segmented doors | **Clarity + Conversion** | Map/tracking architecture; real 9-value status model; real vehicle types; real categories | Poster asset; demonstration-label wording | Visual labelled as demonstration; **0 Maps requests on load**; no cyclist image; no non-functional form | **1** |
| **2** | **Regulated verticals** *(promoted)* | Lead with the defensible business | **Clarity + Conversion** | Vetted `/medical` + `/legal` copy; existing photography; credential claims already on-site | D10 sign-off on TDG / confidentiality wording | Copy unchanged unless re-vetted; `/medical` + `/legal` render identically | **2** |
| **3** | **Platform showcase** | Convert "technology-enabled" from claim to observation | **Clarity + Trust** | Tracking + partner surfaces exist and function; real status model | Homepage product frames (D3 Option B); store badges + URLs | ≥ 2 frames that depict only real fields and states; fidelity review passed | **3** |
| **4** | **Trust — metrics, reviews, coverage** | Answer "is this real" | **Trust** | 50+ deliveries; 5 partners; Google reviews; service area | As-of dates; driver-count confirmation (OQ-1); anything from D8/D10 | ≥ 1 verified signal; **layout must survive reviews returning `null`**. **If the driver metric confirms, the three metrics may instead ship as a standalone proof bar at position 2** | **4** |
| **5** | **Consumer booking band** | Convert consumer intent, contained | **Conversion** | Full send flow; `AddressAutocomplete`; maps-loader; **existing `legaldrop.send-flow.v1` handoff contract** | Pricing-structure confirmation (OQ-5) | All 8 steps of D5 work; Maps lazy on interaction; **functional or a button**; **no price shown before a real quote returns**; addresses never in the URL | **5** |
| **6** | **Closing CTA** | Final segmented conversion | **Conversion** | — | — | Both destinations live | **5** |

### Excluded from the initial scope

| Section | Reason |
|---|---|
| **Standalone operational proof bar** | **Conditional (OQ-1).** Ships only if *5 onboarded GTA drivers* is confirmed current, giving three verified metrics. Otherwise the two approved metrics sit inside Trust (§4). The three-metric gate is not lowered |
| **Chain-of-custody / evidence** | D2 — no designed artifact; drop-off code unverified; blocked |
| **Integrations** | D6 — none exist |
| **Service catalogue** | D7 — three live services are expressed via §2 and §5, not a menu |
| **How it works ladder** | Generic courier funnel; the status progression in §3 replaces it |
| **Why Druppr grid** | Table stakes; also carries the unsourced "within the hour" claim |
| **Coverage neighbourhood list** | Local-services SEO pattern; area statement folds into §4 |
| **Driver recruitment** | D9 — dedicated page; footer link only once that page exists (OQ-4) |

### Open questions raised by Phase 0 — **ALL RESOLVED**

See *Resolved Open Questions* below for the full determinations. Summary:

| # | Question | Resolution |
|---|---|---|
| **OQ-1** | Two metrics against a three-metric gate | **Conditional.** A third candidate — 5 onboarded GTA drivers — may unlock the proof bar if confirmed current. Gate is **not** weakened |
| **OQ-2** | Homepage → `/send` address handoff | **Reuse the existing `legaldrop.send-flow.v1` sessionStorage contract.** No new mechanism, no addresses in the URL |
| **OQ-3** | Footer service catalogue | **Reduce 11 → 3 public categories** |
| **OQ-4** | Dedicated driver page | **Does not exist.** No section, no link. Recorded as separate future work; does not block the homepage |
| **OQ-5** | Hardcoded `$8.00` | **Removed from the hero specification.** Base-fee wording permitted only in a pricing context, pending confirmation |

---

## Resolved Open Questions

### OQ-1 — Operational proof: the third metric — **CONDITIONALLY RESOLVED**

**Candidate third metric: 5 onboarded GTA drivers.**

**This figure is not automatically publishable.** It requires founder confirmation that it remains accurate **as of the intended publication date** — driver counts move, and a number that was true during planning may not be true at ship.

**Decision logic — binding:**

| Condition | Outcome |
|---|---|
| 5 onboarded GTA drivers **confirmed and current** at publication | ✅ Three-metric operational proof bar ships: 50+ completed deliveries · 5 business partners · 5 onboarded GTA drivers |
| **Not confirmed**, or stale at publication | ❌ Proof bar does **not** ship. The two approved metrics are placed inside the **Trust / Operational Evidence** section until a third verified metric exists |

**The three-metric shipping gate in `HOMEPAGE.md` is not weakened.** It is met with a genuine third metric or it is not met; the section's presence is the variable, never the standard.

**Explicitly rejected as a substitute metric:** App Store and Google Play availability. Store presence demonstrates **product maturity**, not delivery performance, and belongs in the **Platform Showcase** (D1). It must never be counted toward the three-metric gate.

**Every published metric carries an internal "accurate as of" date**, recorded in this document and in the component's source comment, **even when that date is not displayed publicly.** A metric with no recorded as-of date is not publishable.

| Metric | Value | Accurate as of | Publishable |
|---|---|---|---|
| Completed deliveries | 50+ | ☐ *to be supplied* | ✅ on date |
| Business partners | 5 | ☐ *to be supplied* | ✅ on date (count only — naming requires D8) |
| Onboarded GTA drivers | 5 | ☐ *to be supplied* | ⚠️ **requires founder confirmation of currency** |

---

### OQ-2 — Address handoff to `/send` — **RESOLVED: reuse the existing architecture**

**A suitable shared booking state architecture already exists.** Verified in `src/lib/send-flow.js`:

| Property | Value |
|---|---|
| Storage key | `legaldrop.send-flow.v1` |
| Mechanism | `sessionStorage` (deliberate — `guest-session.js:13–22` documents why not `localStorage`: session lifetime matches one booking) |
| Shape | `pickup: { address, lat, lng }`, `dropoff: { address, lat, lng }` (`send-flow.js:21–22`) |
| Validator | `hasBothAddresses(state)` (`:186`), coordinate check via `Number.isFinite(lat/lng)` (`:179–180`) |
| Access | `SendFlowProvider` / `useSendFlow()` React context (`:222`, `:331`) |

**Decision: the homepage writes into this existing contract. No new handoff mechanism is created.**

**Implementation constraints:**

1. **Write the existing schema exactly** — `{ address, lat, lng }` for each of `pickup` and `dropoff`. Do **not** extend the schema to carry Place ID or address components unless the quote/booking endpoint is shown to require them. The flow functions today without them, and widening a schema on a live Stripe-adjacent payment path is unjustified churn. If a genuine need appears, bump to `.v2` with an explicit migration rather than mutating `.v1`.
2. **Do not mount `SendFlowProvider` on the homepage.** It is a client context; mounting it would convert the whole page to a client boundary and destroy the zero-JS property. A small client island writes the sessionStorage key on submit, then navigates.
3. **No addresses in the URL.** Formatted addresses are customer data; placing them in query parameters exposes them to referrer headers, browser history, server logs and analytics. A non-identifying source indicator such as `?source=homepage` is permitted.
4. **`/send` validates and rehydrates; it never trusts the payload.** Malformed, partial, foreign-origin or hand-edited sessionStorage must fall back to the empty state, not throw and not proceed with bad coordinates. `hasBothAddresses` plus the existing `Number.isFinite` checks are the validation floor.

**Why this is safer than the alternatives:**

| Alternative | Why rejected |
|---|---|
| URL query parameters | Leaks full customer addresses into history, referrers and logs. Privacy review would be required and would likely fail |
| A new `sessionStorage` key | Two sources of truth for the same data; guaranteed drift; `/send` would need to reconcile them |
| `localStorage` | Wrong lifetime — persists for weeks past a booking, contradicting the documented rationale in `guest-session.js` |
| Server-side session | Adds infrastructure and a network round-trip for data the client already holds |
| Mounting the provider on `/` | Converts the homepage to a client boundary; violates the performance budget |

**Not implemented. Design recorded for Phase 5 (consumer booking).**

---

### OQ-3 — Footer services — **RESOLVED: reduce 11 → 3**

The footer's Services column (`src/lib/navigation.js` → `FOOTER_SECTIONS`) currently lists **11 entries**, 8 of which are `live: false`. It must not recreate the catalogue problem being removed from the homepage.

**Approved public categories:**

1. **Same-day delivery** → `/send`
2. **Medical logistics** → `/medical`
3. **Legal delivery** → `/legal`

**Prohibited in the footer:** unavailable services · dead routes · speculative services · repeated "coming soon" entries.

**One note for the founder, not a change to the decision.** The repository's current labels are `Send a package`, `Medical delivery`, `Legal documents` — these match the destination pages and the site's CTA vocabulary (`Send a package` is also the nav CTA). The approved category names read as service categories rather than actions, which is the more platform-appropriate register and consistent with the positioning goal. **Adopting the approved names is recommended**; if label/CTA consistency later proves confusing in testing, that is a copy revision, not a re-litigation of this decision.

Future service categories are recorded in product documentation, never presented as currently orderable.

---

### OQ-4 — Driver page — **RESOLVED: no page, no link, deferred**

**Repository confirms no dedicated driver page exists.** `ROUTES.becomeADriver` is `live: false` (`src/lib/navigation.js:42`), and `src/components/home/BecomeADriver.jsx` currently falls back to routing at `/contact-us`.

**Decisions:**

- The driver recruitment section is **removed from the approved homepage architecture**.
- **No footer or navigation link is added** — linking to a nonexistent route violates content gate C5 (no dead links).
- The dedicated driver page is recorded as **separate future work**, outside this project.
- **The customer homepage redesign is not blocked** on it.

Until a real driver page exists, the homepage contains **no driver recruitment CTA, no earnings animation, and no gig-work messaging.**

---

### OQ-5 — The hardcoded `$8.00` — **RESOLVED: removed from the hero**

`$8.00` is a hardcoded literal at `src/components/home/Hero.jsx:235`. It is not returned by the pricing engine; real quotes come from the backend via `src/components/send/useVehicleQuotes.js`.

**Decision: removed from the approved hero specification.**

**The redesigned hero must not display an estimated price until all three hold:**

1. valid pickup **and** drop-off locations have been selected;
2. the real quote endpoint / pricing engine has returned a result;
3. loading, unavailable and error states are handled.

**Permitted wording, in a pricing context only** — not in the hero, and only after founder confirmation that the structure is current:

> "Regular deliveries start with an $8 base fee, plus distance."

**"from $8" alone is prohibited.** It implies a complete delivery costs $8, which distance-based pricing makes untrue for most jobs. That is precisely the class of claim `VISION.md` → Trust Philosophy forbids.

**Requires founder confirmation:** that regular-delivery pricing remains an **$8 base fee plus distance-based pricing** as of publication.

---

## Unverified Operational Claims — Decisions

### Drop-off confirmation code — **EXCLUDED PENDING CONFIRMATION**

The code cannot be verified anywhere in this repository. It exists only as an icon (`src/components/icons.jsx:307`) and as marketing copy on `/medical`, `/legal`, `home/WhyBrand.jsx` and `home/VerticalSection.jsx`. The backend's `awaiting_handoff` status is consistent with a handoff mechanism existing outside this codebase, but consistency is not verification.

**It must not be used as homepage product evidence until the founder confirms all five:**

| # | Confirmation required | Answer |
|---|---|---|
| 1 | Where the code is generated | ☐ |
| 2 | Who receives it | ☐ |
| 3 | How it is validated | ☐ |
| 4 | Whether it is currently active in production | ☐ |
| 5 | What record is retained after validation | ☐ |

**Until confirmed, it is excluded from the homepage state machine and from all chain-of-custody claims.** The status sequence in the Platform Showcase uses only the verified 9-value `TaskStatusType` model and must not depict a drop-off-code step.

This does not require changing the existing `/medical` and `/legal` copy in this project — but those claims inherit the same uncertainty and should be reviewed under D10.

### "Most jobs collected within the hour" — **WITHHELD**

Currently live in `src/components/home/WhyBrand.jsx`. Treated as an **unverified delivery-time claim** of the same class D1 prohibits.

**Decision: removed or withheld from the future homepage** unless reliable operational data supports it *and* the appropriate reviewer approves the wording.

**It must not be replaced with another numerical pickup-time promise.** Substituting "typically within 90 minutes" or similar reproduces the defect.

**Permitted alternative, if and only if it accurately reflects the current service:**

> "On-demand and scheduled delivery options"

This is a **capability** statement, not a performance promise, and is proposed subject to founder confirmation that scheduled delivery genuinely exists today.

---

## Photography Status — Clarification

Existing photography remains listed in the asset inventory. **Availability does not mean preferred use.**

- **`src/images/hero-cyclist.jpg` is retired from the target homepage** (D4). It is also the largest homepage image at 441 kB and the likely LCP element.
- **Generic stock photography must not displace** real product interfaces, operational evidence, or purpose-built product demonstrations. Where a photograph and a product frame compete for the same slot, the product frame wins.
- Photography retains a legitimate supporting role — scene and credibility — per `VISION.md` → Design Philosophy: *real, specific, and honest*, ideally our own operation rather than stock.
- The `/medical` and `/legal` vertical photographs (`medical-specimen.jpg`, `legal-document.jpg`) remain in use for those sections, where they support rather than replace evidence.

---

## Phase 0 Sign-off

**OQ-1 through OQ-5 are resolved.** The remaining items are founder confirmations of fact, not open design questions.

| # | Confirmation required | Gates | Blocks Phase 1? |
|---|---|---|---|
| 1 | **As-of dates** for *50+ completed deliveries* and *5 business partners* | Any metric display | ❌ No — gates Phase 4 |
| 2 | **Is *5 onboarded GTA drivers* current?** (OQ-1) | Proof-bar shape | ❌ No — gates Phase 4 |
| 3 | **Pricing structure** — is it still an $8 base fee plus distance? (OQ-5) | Pricing copy | ❌ No — gates Phase 5 |
| 4 | **Drop-off code** — all five confirmations | Custody + state machine | ❌ No — already excluded |
| 5 | **Does scheduled delivery exist?** — for the "On-demand and scheduled delivery options" alternative | Replacement copy for the withheld claim | ❌ No — gates Phase 2 |
| 6 | **App Store / Google Play** status, URLs, badge artwork | Platform Showcase | ❌ No — gates Phase 3 |
| 7 | **D3 Option B approval** (homepage product frames) | Platform Showcase architecture | ❌ No — gates Phase 3 |
| 8 | **D10 reviewer assignment** | All regulated claims | ❌ No — gates Phase 4 |
| 9 | **Approve the three footer categories** (OQ-3) | Footer reduction | ❌ No — gates Phase 2 |

**Phase 1 (Foundation) is not blocked by any outstanding item.** It comprises the six accessibility remediations (A1–A6), image re-encoding, the `next.config.js` images block, dead-config removal and the Lighthouse baseline — none of which depend on a content decision.

**Phase 0 is ready for approval.**

---

**No application code has been modified. Phase 1 has not begun.**
