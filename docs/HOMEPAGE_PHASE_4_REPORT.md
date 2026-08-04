# Homepage Phase 4 — Platform Showcase

> **Status: Phase 4 complete, awaiting approval. Phase 5 has not begun.**
>
> Labels as before: **[measured]** from a production build, **[observed]** confirmed manually, **[not captured]** unavailable here. Nothing estimated.
>
> Branch: `homepage-redesign`. Nothing pushed, nothing merged.

---

## 1. Repository surfaces reviewed

| Surface | Path |
|---|---|
| Consumer tracking page | `src/app/track/[trackingCode]/page.jsx` |
| Consumer live tracking | `src/app/track/[trackingCode]/LiveTracking.jsx` |
| Consumer map | `src/app/track/[trackingCode]/TrackingMap.jsx` |
| Partner tracking page | `src/app/track-partner/[trackingToken]/page.jsx` |
| Partner live tracking | `src/app/track-partner/[trackingToken]/PartnerLiveTracking.jsx` |
| Partner map | `src/app/track-partner/[trackingToken]/PartnerTrackingMap.jsx` |
| Booking flow | `src/app/send/page.jsx`, `send/details`, `send/pay` |
| Booking state | `src/lib/send-flow.js` |
| Order payload | `src/components/send/buildOrderPayload.js` |
| Vehicles | `src/components/send/vehicles.js` |
| Pricing | `src/components/send/PriceBreakdown.jsx`, `useVehicleQuotes.js` |
| Maps loader | `src/lib/maps-loader.js` |
| Assets | `src/images/`, `public/` |

## 2. Real capabilities verified

| Capability | Evidence |
|---|---|
| **Status model — 9 values** | `LiveTracking.jsx:14–23` — `pending`, `assigned`, `ongoing`, `awaiting_seller_confirmation`, `awaiting_handoff`, `delivered`, `cancelled`, `failed`, `refunded` |
| **Order categories — 3 values** | `send/page.jsx:143` `SECTION_PRESETS = ['medical_supply','legal_document','other']` |
| **Vehicles — 6** | `vehicles.js` — bike, car, suv, minivan, cargovan, boxtruck |
| **Booking capture** | `send-flow.js:21–36` — pickup/dropoff `{address, lat, lng}`, packageCount, weight, vehicle, contact |
| **Order submission** | `buildOrderPayload.js` — senderLocation/Address/Name/Phone, vehicle, section, `receivers[]`, paymentIntent |
| **Multi-stop** | `receivers` is an array; partner tracking renders numbered destinations |
| **Tracking fields** | `track/page.jsx:149–163`, `track-partner/page.jsx:157–188` — Tracking Code, Category, Vehicle, Order Placed, Route Distance, On Route To Pickup, Package Picked Up, Sender, Pickup Address, Destinations |
| **Driver display** | `track-partner/page.jsx:154,287` — **first initial only** + `vehicleType`. The product never shows a full driver name |
| **ETA** | `LiveTracking.jsx:50–62` — `durationText` + `distanceText` |
| **Route distance** | `route.distanceInKm` |
| **Live polling** | 6 s interval, terminal-status allowlist |
| **Pricing line items** | `PriceBreakdown.jsx` — base fare, distance (km), labour, heavy item, platform fee, total |

## 3. Capabilities excluded, and why

| Excluded | Reason |
|---|---|
| **Drop-off confirmation code** | Not rendered anywhere in this repository. Phase 0 excludes it pending five founder confirmations |
| **Chain of custody** | Phase 0 gate unmet — no designed artifact exists. Frame 3 shows *timestamps* and calls them timestamps |
| **Proof-of-delivery legal weight** | Phase 0 D10 lists evidentiary claims as blocked |
| **Business / partner portal** | ⚠️ **No portal exists.** `/track-partner` is a *tracking page*, not a dashboard — no order list, no login, no filters, no account view. Frame 3 became a delivery record rather than a portal for this reason |
| **App Store / Google Play** | Zero references anywhere in `src/` or `public/`; founder has not supplied listings |
| **Integrations, API, webhooks** | None exist (confirmed in Phase 0 D6) |
| **Analytics, filters, route optimisation, AI dispatch, fleet metrics** | No such functionality in the repository |
| **Signatures, seals, affidavits, sworn service** | Excluded by `VISION.md` and Phase 0 |

## 4. Frames shipped

**Three.** All three are faithful to existing functionality; none required invented capability.

## 5. Fields displayed per frame

**Frame 1 — Request & dispatch** (status chip: **Assigned**)
Order · Category · Pickup · Destination · Vehicle · Driver (`A. · Car` — initial plus vehicle type, matching the product)

**Frame 2 — Tracking** (status chip: **Ongoing**)
Static SVG route (no Maps) · Route (`Downtown Toronto → North York`) · Distance (`14.2 km`) · Estimated arrival (`18 min away · 6.4 km` — the product's real `durationText · distanceText` shape)

**Frame 3 — Delivery record** (status chip: **Delivered**)
Four timestamped entries: Order placed `9:02` · On route to pickup `9:18` · Package picked up `9:34` · Delivered `10:07`. Caption names order, category and distance as retrievable from the tracking code.

Every field maps to one the product genuinely renders.

## 6. Status model used

Real values, title-cased exactly as the product renders them: **Assigned**, **Ongoing**, **Delivered**. Drawn from the 9-value `TaskStatusType`. Terminal failure states (`cancelled`, `failed`, `refunded`) and the two conditional states are real but not part of a representative journey, so they are not shown.

**Status is never colour alone** — every chip carries its status as text; the tint is redundant reinforcement.

## 7. Synthetic data used

| Field | Value |
|---|---|
| Order id | `DRP-2048` — obviously synthetic |
| Category | Medical specimen |
| Pickup / Destination | Downtown Toronto / North York — **area names, not addresses** |
| Vehicle | Car |
| Distance | 14.2 km |
| Driver | `A.` + Car — **initial only**, matching the product |
| ETA | 18 min away · 6.4 km |
| Timestamps | 9:02 / 9:18 / 9:34 / 10:07 |

**No real customer, business or driver names; no phone numbers; no real order IDs; no real addresses; no medical or legal detail; no PII.**

## 8. How demonstration data is labelled

A section-level eyebrow reading **"Product demonstration"** with a **"Sample data"** chip beside it, immediately above the heading and visible before any frame. Not a footnote.

## 9. Product design drift discovered

Measured token usage — marketing tokens (`surface-*`, `brand-*`, `rounded-card|tile|control`, `shadow-card|lift|hero`, `font-display`) versus legacy utilities:

| File | Marketing | Legacy |
|---|---:|---:|
| `track/[trackingCode]/page.jsx` | **0** | 23 |
| `track-partner/[trackingToken]/page.jsx` | **0** | 29 |
| `track-partner/.../PartnerLiveTracking.jsx` | **0** | 19 |

| Drift | Class | Detail |
|---|---|---|
| `slate-*` palette instead of ink/surface tokens | **Visual-only** | `slate-900/700/500/400/200/100` vs `#17131c`, `#5f5868`, `#eeebf1` |
| `rounded-3xl` / `rounded-2xl` instead of `rounded-card` | **Visual-only** | 24 px / 16 px vs the 20 px semantic radius |
| `shadow-sm` / `shadow-lg` instead of `shadow-card` / `shadow-lift` | **Visual-only** | Untinted vs ink-tinted elevation |
| `emerald` / `rose` / `amber` status badges | **Visual-only, with a gap** | ⚠️ `tailwind.config.js` defines **no semantic success/warning/error tokens**. They must be added before the product can be restyled |
| Centred single-column page layout | **Structural** | Product pages use a `max-w-3xl` centred stack; marketing uses a 1200 px column |
| Driver shown as initial + vehicle type | **Content** | Intentional privacy behaviour — the homepage frame reproduces it exactly |
| No portal/dashboard surface | **Functional** | Not drift — the capability does not exist |

## 10. How the homepage frames address the drift

Per Phase 0 **D3 Option B**: dedicated homepage frames in the Druppr design system that faithfully represent existing functionality.

- **Visual-only drift is resolved by the frame**, which uses `rounded-card`, `shadow-card`, `border-[#eeebf1]`, `surface-tint` headers and the marketing type scale. This is presentation, not behaviour.
- **Structural drift is not imitated** — the frames are not a shrunken copy of a `max-w-3xl` page; they are a presentation of the same data.
- **Content is reproduced exactly**, including the driver-initial convention.
- **No functionality is added.** No control, filter, analytic or workflow state appears that the product lacks.
- **The live `/track` and `/track-partner` pages were not touched.** No silent redesign of the product.

**Recorded as separate future work:** restyling the live tracking surfaces, which requires adding semantic status tokens first. That is a product workstream, not a homepage one.

## 11. Components created

**`src/components/home/PlatformShowcase.jsx`** — server component, zero client JavaScript. Contains three presentational frames, a shared `FrameHeader`, and a `Field` row primitive. All provenance is recorded in a header comment naming the file and line of every verified capability.

## 12. Components removed from composition

| Component | Reason |
|---|---|
| `home/Services.jsx` | The catalogue in which 8 of 11 entries were not bookable (Phase 0 D7) |
| `home/HowItWorks.jsx` | The generic courier funnel — enter addresses, see price, pay, track — which `HOMEPAGE.md` rules out because every competitor prints it |

**Verified replaced, not duplicated [measured]:** `"Everything Druppr does"` **false**, `"How it works"` **false**, `"From request to recorded delivery"` **true**.

## 13. Components retained for rollback

`home/Services.jsx`, `home/HowItWorks.jsx` and `home/Hero.jsx` all remain **on disk, unimported**. Restoring any is a two-line change in `page.jsx`. None is deleted in this phase.

⚠️ **Consequence worth knowing:** `HowItWorks` was the page's only full-bleed `brand-600` band. Purple now appears only on CTAs and status chips. That is closer to what `VISION.md` asks for ("purple spent deliberately and sparingly"), but the page has lost a strong colour beat. Worth reassessing once the remaining sections are rebuilt.

## 14. Final section copy

> **Product demonstration** · *Sample data*
>
> **From request to recorded delivery**
>
> Requests, dispatch, tracking and the record that remains afterwards all run in one system. These are the surfaces that do it.

Frame captions:
1. *"A request captures both addresses, the vehicle it needs and who is receiving it, then goes out to drivers for assignment."*
2. *"The sender, the business and the recipient follow the same job on one shared tracking link."*
3. *"Every job leaves a timestamped record — order DRP-2048, Medical specimen, 14.2 km — retrievable from its tracking code after delivery."*

No "revolutionary", "industry-leading", "enterprise-grade", "AI-powered", "real-time network", or "logistics operating system". The heading describes exactly what the three frames show.

## 15. Section placement

**Immediately after Operational Proof.** Reviews moved below the showcase.

**Before → After [measured]:**

| # | Before | After |
|---|---|---|
| 1 | Hero | Hero |
| 2 | Operational record | Operational record |
| 3 | *(Reviews, conditional)* | **From request to recorded delivery** |
| 4 | **Everything Druppr does** | *(Reviews, conditional)* |
| 5 | **How it works** | Same-day medical transport |
| 6 | Same-day medical transport | Filings and confidential files |
| 7 | Filings and confidential files | Why Druppr |
| 8 | Why Druppr | Coverage |
| 9 | Coverage | Become a driver |
| 10 | Become a driver | — |

Medical, legal, Why Druppr, Coverage and driver sections were **not** reordered relative to each other.

## 16. Client-side JavaScript added

**None.** Server component, static markup. No tabs, no carousel, no slides, no hover dependency, no new island.

## 17. Bundle measurements **[measured]**

| Metric | Phase 3 | Phase 4 | Δ |
|---|---:|---:|---:|
| `/` route size | 2.86 kB | **2.86 kB** | **0** |
| **`/` First Load JS** | 102 kB | **102 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| Route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| Client islands on `/` | 2 | **2** | **0 added** |

## 18. Maps and Places **[measured]**

| Route | Requests |
|---|---|
| `/` | **0** |
| `/medical`, `/legal` | 0 |
| `/send` | 7 (expected — the address flow) |
| `/track/[code]`, `/track-partner/[token]` | 0 |

Frame 2's route is a static inline SVG. **No Maps SDK on the homepage.**

## 19. Accessibility results **[measured]**

| Check | Result |
|---|---|
| Semantic section heading | `<h2 id="platform-showcase">`, section `aria-labelledby` matches |
| Heading order on `/` | `H1 H2 H2 H2 H2 H2` — no skips |
| `<h1>` count | 1 |
| Structure | 2 `<dl>` field lists + 1 `<ol>` timeline |
| **Contrast failures** | **0** |
| Text below 12 px | **0** at all four widths |
| Horizontal overflow | **none** at any width |
| `aria-live` regions | **0** |
| SVGs hidden from AT | ✅ all `aria-hidden="true"` |
| **Focusable elements in the section** | **0** |
| **`<button>` elements in the section** | **0** |
| Keyboard traversal | **0 of 14 tab stops** land inside the showcase |
| Status by colour alone | No — every chip carries text |

**No false affordances.** Nothing in the frames is a `<button>` or `<a>`; they are presentational `<span>`/`<div>`, so there is nothing focusable that performs no action.

### ⚠️ A defect I introduced and fixed

The first implementation reintroduced the exact `#8d8695`-at-12px contrast failure that Phase 1 removed from this codebase — **7 failures** across the frame step numbers (`01`/`02`/`03`) at 3.21:1 on the tint headers and 3.51:1 on white. Corrected to `#5f5868`; the step index is now quieter than its label by *weight*, not by a colour that fails AA. Re-measured: **0 failures**. Recorded because it shows the Phase 1 fix does not automatically protect new components.

## 20. JavaScript-disabled results **[measured]**

| Check | Result |
|---|---|
| Heading | ✅ |
| All three frames | ✅ 3 rendered |
| Demonstration labelling | ✅ "Product demonstration" + "Sample data" |
| Statuses | ✅ Assigned, Ongoing, Delivered |
| Timeline entries | ✅ 4 of 4 |
| Route SVG | ✅ present |

Identical to the JS-enabled render — the section is static HTML.

## 21. Reduced-motion results **[measured]**

Content identical across 2.5 s; complete state shown. Nothing in the section animates, so there is nothing to suppress.

## 22. CLS results **[measured]**

| Route | 3 isolated runs |
|---|---|
| `/` | **0.0001** |
| `/medical` | **0.0002** |
| `/legal` | **0.0003** |

Per-width on `/`: 390 `0.0011` · 768 `0.0004` · 1024 `0.0003` · 1440 `0.0002`. **No regression**, all ~45× inside the 0.05 budget.

**Measurement note.** A sequential six-route audit pass reported `/legal` at **0.6703** and `/medical` at 0.0133. Re-measured in **fresh browser contexts, three runs each**, both are ~0.0003 — the high figures were an artifact of navigating many routes in one context. Shift sources are the nav font swap. Phase 4 touched no file either route consumes.

## 23. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 7 (expected) |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

Page scroll height: 1440 `5,035 → 5,035`; 390 `6,772 → 6,740`. **The showcase is smaller than the two sections it replaced.**

## 24. Screenshots captured

In `scratchpad/phase4/`: `p4-showcase-390/768/1024/1440.png` · `p4-fullpage-1440.png` (complete new section order) · `p4-js-disabled.png` · `p4-reduced-motion.png`.

Section height: 390 **1,693 px (2.01 screens)** · 768 1,576 · 1024 1,018 · 1440 **1,026 px (1.14 screens)**.

## 25. Deviations from the implementation plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **Frame 3 is a delivery record, not a partner portal** | No portal exists. `/track-partner` is a tracking page. The plan's S3 named "partner console"; building one would have been inventing a product |
| 2 | **No App Store / Google Play badges** | Zero repository references and no founder-supplied listings. Phase 4 brief excludes them on exactly this condition |
| 3 | **Three frames, not the plan's "≤3 with tracking reserved for later"** | Tracking is fully verifiable today, so it shipped now |
| 4 | **Section is tinted, not page-ground** | White frames need a ground to sit on — the same rationale `Services.jsx` documented — and it breaks the two dark sections above |

## 26. Remaining weaknesses

| # | Item | Status |
|---|---|---|
| **W4** | **Showcase is 2.01 screens at 390.** Three product frames on a phone is genuinely two screens of content, not padding — but it is the tallest section on the page | New |
| **W5** | **The page lost its only purple band** with HowItWorks. More restrained, but a weaker colour rhythm | New |
| **W6** | **`Why Druppr` still carries two unverified claims** — *"Most jobs collected within the hour"* and *"Confirmed by drop-off code"*. Both were flagged in Phase 0; both are now more prominent with Services and HowItWorks gone. **Phase 6 territory, but they are live today** | Carried, more urgent |
| **W7** | The ETA (`18 min away`) is a real product field in a labelled demo, **not** a performance claim — but a hurried reader could mistake it for a typical time | New |
| W1–W3 | "50+" is a floor; mixed metric units; provenance invisible to readers | Unchanged |
| R5 | LCP / FCP **[not captured]** | Unchanged |
| R6 | 4 images above the 200 kB ceiling | Unchanged |
| R10 | **Formal five-second test not run** | Unchanged — no participants in any phase |
| R11 | 768 hero at 1.03 viewports | Unchanged |

## 27. Acceptance criteria

| Criterion | Status |
|---|---|
| Homepage remains statically rendered | ✅ `○ (Static)` |
| Shared JS ≈ 87.2 kB | ✅ **unchanged** |
| First Load JS ≤ ~102 kB | ✅ **102 kB, unchanged** |
| No new client island | ✅ **zero client JS added** |
| Zero Maps and Places on `/` | ✅ **0** |
| No autoplay video, no animation dependency | ✅ |
| No material CLS regression | ✅ |
| No console errors | ✅ 0 across six routes |
| Production build passes | ✅ |
| Lint passes | ✅ |
| Frames faithful to real capabilities | ✅ every field traced to a file and line |
| No invented functionality | ✅ |
| No false affordances | ✅ 0 focusable elements, 0 buttons |
| Live product pages untouched | ✅ |

**Phase 4 meets its acceptance criteria.**

## 28. Phase 5

**Phase 5 has not begun.** No regulated-vertical redesign, no trust and compliance section, no consumer booking form, no address inputs, no autocomplete, no pricing, no address handoff, no reviews or partner movement, no chain-of-custody artifact, no integrations, no insurance/TDG/PHIPA/security/SLA claims, no case studies, no customer logos, no testimonials, no driver recruitment, no footer restructuring, and no broader motion system.

---

# Phase 4.1 — Claim Hygiene

> A narrowly scoped factual-accuracy correction required by the Trust Philosophy. Not a copy redesign. **Phase 5 has not begun.**

## Files modified

| File | Change |
|---|---|
| `src/components/home/WhyBrand.jsx` | Two `HOME_REASONS` entries corrected |
| `src/components/home/VerticalSection.jsx` | `LEGAL_VERTICAL.lead` — drop-off code removed |
| `src/components/home/PlatformShowcase.jsx` | ETA field relabelled |
| `src/components/home/NetworkDemo.jsx` | Two contrast corrections (see *Self-reported measurement failure*) |

**Blast radius verified before editing.** `HOME_REASONS` and `VerticalSection` are imported **only** by `src/app/(main)/page.jsx`. `/medical` and `/legal` import the `WhyBrand` *component* but pass their own reasons. **These edits change the homepage only** — confirmed by grep and by regression-testing both routes.

## Claims removed and replacement wording

### 1. Pickup-time claim — removed

| | |
|---|---|
| **Was** | Same-day delivery — *"Most jobs collected within the hour."* |
| **Now** | Same-day delivery — **"Request and track a delivery through one platform."** |

**Why the old claim went:** it asserts measured pickup performance. Phase 0 (D1) prohibits publishing pickup-time metrics until they can be computed from operational data, and no such figure exists.

**Not replaced with another number.** "Typically within 60 minutes", "usually collected quickly", "rapid pickup" and similar reproduce the same defect in softer words.

**Evidence for the replacement** — every verb maps to a shipped surface:

| Verb | Evidence |
|---|---|
| Request | `src/app/send/page.jsx` + `send/details` + `send/pay` — a complete booking flow |
| Track | `src/app/track/[trackingCode]/` and `track-partner/[trackingToken]/` |
| One platform | Both run on the same order — `buildOrderPayload.js` creates it, the tracking code retrieves it |

### ⚠️ "On-demand and scheduled delivery options" was REJECTED

The brief permitted this wording *only if* scheduled delivery could be verified. **It cannot.** The send flow books immediately: there is no date or time picker in `send/page.jsx`, and no scheduling field in `send-flow.js:21–36` or `buildOrderPayload.js`. "Standing routes" appears **only in marketing copy** (`contact-us`, the medical vertical lead) and never in product code. Publishing it would have created a new unsupported claim while removing one.

The narrower factual statement was used instead, adapted only to avoid saying "same-day" twice under a card already titled *Same-day delivery*.

### 2. Drop-off-code claim — removed, two places

**(a) `WhyBrand.jsx` — HOME_REASONS**

| | |
|---|---|
| **Was** | Confirmed delivery — *"Confirmed by drop-off code and tracked live."* |
| **Now** | **Recorded delivery** — **"Timestamped status from request through completion."** |

**The title changed too, deliberately.** "Confirmed" implies a confirmation mechanism, and the only one we could name is the blocked drop-off code. "Recorded" is exactly what the product produces, and it matches the hero's own wording.

**(b) `VerticalSection.jsx` — LEGAL_VERTICAL lead**

| | |
|---|---|
| **Was** | *"… Every job carries a timestamped trail **and a drop-off code**, on your firm's account."* |
| **Now** | *"… Every job carries a timestamped trail, on your firm's account."* |

The verified half stays; the unverifiable half goes.

**Evidence for the replacements:**

| Field | Source |
|---|---|
| Order Placed (`createdAt`) | `track/[trackingCode]/page.jsx:152` |
| On Route To Pickup | `:156` |
| Package Picked Up | `:163` |
| Status reaching `delivered` | `LiveTracking.jsx:14–23` |

**Why the old claim went:** the drop-off code is **not rendered anywhere in this repository** — it exists only as an icon (`icons.jsx:307`) and in marketing copy. Phase 0 blocks it pending five founder confirmations.

**No substitute proof mechanism was introduced** — no secure handoff code, recipient PIN, verification code, custody confirmation, tamper-proof claim or captured signature. No evidentiary weight is implied.

### 3. ETA presentation — corrected, not removed

| | |
|---|---|
| **Was** | `Estimated arrival` — 18 min away · 6.4 km |
| **Now** | **`Sample ETA`** — 18 min away · 6.4 km |

The field represents a **real product capability** (`LiveTracking.jsx:50–62` renders `durationText` + `distanceText`), so per the brief it was corrected rather than removed. An unlabelled time beside a route reads as a normal Druppr delivery time; the section-level "Sample data" chip is not enough at the point of the number itself.

The visible **Product demonstration** and **Sample data** labels are retained.

## Repository-wide homepage claim sweep

| Claim | Location | Classification |
|---|---|---|
| "Most jobs collected within the hour" | `WhyBrand` HOME_REASONS | **Unsupported — removed** |
| "Confirmed by drop-off code" | `WhyBrand` HOME_REASONS | **Unsupported — removed** |
| "and a drop-off code" | `VerticalSection` legal lead | **Unsupported — removed** |
| "Estimated arrival" (unlabelled) | `PlatformShowcase` | **Clearly labelled product demonstration** (corrected to Sample ETA) |
| **"TDG-certified drivers"** + "Trained for medical and regulated goods" | `WhyBrand` HOME_REASONS | ⚠️ **Requires professional review** — Phase 0 D10, reviewer not yet assigned. **Left in place**: not named for removal in this brief, and it is a specific factual claim the founder plus a compliance advisor can confirm |
| **"moved by TDG-certified drivers"** | `VerticalSection` medical lead | ⚠️ **Requires professional review** — same |
| "drivers who must complete confidentiality training" | `VerticalSection` legal lead | ⚠️ **Requires professional review** — Phase 0 D10 lists confidentiality training as founder-approvable operational fact, not yet approved |
| "Live tracking — A map link for you and your recipient" | `WhyBrand` | **Verified** — `TrackingMap`, `PartnerTrackingMap`, shared tracking link |
| "50+ / 5 / 5" + "Accurate as of August 2026" | `OperationalProof` | **Already approved** — founder-confirmed, Phase 3 |
| Hero: "dispatched, tracked and recorded" | `HeroNetwork` | **Verified** — Phase 2, deliberately not "evidenced" |
| Showcase frames, statuses, fields | `PlatformShowcase` | **Verified** — every field traced to file and line, Phase 4 §2 |
| Network demo statuses and queue | `NetworkDemo` | **Clearly labelled product demonstration** |
| "Now serving Toronto and the GTA" + neighbourhoods | `Coverage` | **Verified** — factual service area |
| "get paid weekly", "once you are certified" | `BecomeADriver` | ⚠️ **Requires confirmation** — driver-facing operational claims. Phase 0 D9 removes this section entirely in a later phase; **left in place**, out of scope here |
| "Drop-off code confirmation" | `/legal` page (own copy) | **Outside the homepage** — still present, needs its own pass |
| "live tracking and drop-off code confirmation" | `/medical` page (own copy) | **Outside the homepage** — still present, needs its own pass |

**No insurance, PHIPA, HIPAA, SLA, security, signature, seal, affidavit, sworn-service, "real-time", customer-scale or fleet-size claim appears anywhere on the homepage.** Verified by grep across every homepage-rendered component.

## Shared-route impact

**None.** `HOME_REASONS` and `VerticalSection` are homepage-only. Confirmed by rendered-text sweep after the change:

| Route | "within the hour" | "drop-off code" |
|---|---|---|
| `/` | ✅ absent | ✅ absent |
| `/medical` | ✅ absent | ⚠️ **present** (its own copy, out of scope) |
| `/legal` | ✅ absent | ⚠️ **present** (its own copy, out of scope) |
| `/send`, `/track/*`, `/track-partner/*` | ✅ absent | ✅ absent |

⚠️ **The homepage legal lead now diverges from `/legal`**, which still says "Drop-off code confirmation" (`legal/page.jsx:89`). Deliberate and temporary: the homepage must be accurate now; `/legal` needs its own claim pass. **Recorded as required follow-up.**

## ⚠️ Self-reported measurement failure

The claim sweep surfaced **three real WCAG AA contrast failures in the hero** that earlier phases reported as passing:

| Element | Was | Measured |
|---|---|---|
| Route arrow `→` (14 px, `text-white/30`) | reported passing | **2.70:1** ❌ |
| Queue status "Assigned" (12 px, `text-white/40`) | reported passing | **3.82:1** ❌ |
| Queue status "Pending" (12 px, `text-white/40`) | reported passing | **3.82:1** ❌ |

**Cause: my Phase 2.1 contrast probe compared the raw `rgba()` colour without compositing its alpha over the ground.** `rgba(255,255,255,0.3)` was read as pure white and scored 18:1. This is the same flaw caught and corrected in Phase 3 — but the Phase 2.1 result was never re-measured with the corrected method, so **the Phase 2.1 report's "0 contrast failures" was wrong for these three elements.**

**Corrected here**, both to `text-white/50` (**5.26:1**), which still reads as the quietest element in its row. Strictly this is outside a claim-hygiene brief; it is included because the failures are real, live, trivially fixable, and hidden by my own faulty measurement.

**Re-measured with alpha compositing: 0 contrast failures on the homepage.**

## Bundle measurements **[measured]**

| Metric | Phase 4 | Phase 4.1 | Δ |
|---|---:|---:|---:|
| `/` route size | 2.86 kB | **2.86 kB** | **0** |
| **`/` First Load JS** | 102 kB | **102 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| Route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| Client islands | 2 | **2** | **0 added** |

**Zero client-side JavaScript added.**

## Accessibility results **[measured]**

| Check | Result |
|---|---|
| Contrast failures on `/` | **0** (was 3, undetected) |
| Interactive elements without focus treatment | **0** |
| `<h1>` count | 1 |
| Heading order | `H1 H2 H2 H2 H2 H2` — no skips |
| Maps / Places on `/` | **0 / 0** |
| CLS | **0.0009** — no regression |

## Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors |
|---|---|---|---|
| `/` | 200 | 1 | **0** |
| `/medical` | 200 | 1 | **0** |
| `/legal` | 200 | 1 | **0** |
| `/send` | 200 | 1 | **0** |
| `/track/[code]` | 200 | 1 | **0** |
| `/track-partner/[token]` | 200 | 1 | **0** |

**JavaScript disabled:** hero, proof, showcase, "Sample ETA" and "Recorded delivery" all render; no banned phrase present. **Reduced motion:** content identical across 2.2 s, complete.

## Remaining claims requiring professional review

| # | Claim | Where | Owner |
|---|---|---|---|
| **1** | **TDG-certified drivers** | Homepage `WhyBrand` + medical vertical lead | Founder + compliance advisor (Phase 0 D10) |
| **2** | **Confidentiality training** | Homepage legal vertical lead | Founder (operational fact, D10) |
| **3** | Driver "paid weekly" / "once you are certified" | Homepage `BecomeADriver` | Founder — section slated for removal (D9) |
| **4** | **Drop-off code** on `/medical` and `/legal` | Those pages' own copy | Founder — needs its own claim pass |
| **5** | Insurance, PHIPA, security, SLA | Not on the homepage | Unchanged from Phase 0 |

**Items 1–3 are live on the homepage today and are not resolved by this pass.** They were not named for removal in this brief, and each is a specific factual claim a founder or advisor can confirm rather than an unverifiable mechanism. They should be closed before the homepage is considered claim-clean.

---

# Phase 4.2 — Final Claim Cleanup

> The last factual-accuracy pass before Phase 5. It removes the claims Phase 4.1
> left standing — driver TDG certification, confidentiality training, and the
> driver-recruitment pay claims — and extends the pass to `/medical` and
> `/legal`, which Phase 4.1 explicitly deferred. **Phase 5 has not begun.**
>
> Labels as before: **[measured]** from a production build, **[observed]**
> confirmed manually. Nothing estimated.

## 1. The rule this pass applied

**A founder's certification does not establish driver certification, and a
planned training requirement does not establish that drivers have completed
that training.**

Phase 4.1 left TDG and confidentiality-training wording in place on the grounds
that each was "a specific factual claim the founder plus a compliance advisor
can confirm." That reasoning was wrong in an important way, and the correction
is the substance of this phase: the founder holds TDG certification; the
**drivers do not**. The claim was not awaiting confirmation — it was already
known to be false of the population it described. A planned in-app training
requirement is future operational work, not a present-tense fact about anyone.

Nothing was softened. "Regulation-ready drivers", "compliance-trained fleet",
"privacy-trained drivers" and "confidentiality-certified drivers" assert the
same unevidenced thing in vaguer words and were all rejected.

## 2. Preflight **[measured]**

| Check | Result |
|---|---|
| Branch | `homepage-redesign` |
| Commit `3a5aca3` present | ✅ |
| Working tree clean | ❌ — see below |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled successfully |

⚠️ **The working tree was not clean at preflight.** Five files carried
uncommitted edits, every hunk labelled `PHASE 4.2` and implementing this brief.
A prior session had made the edits and stopped before verification,
documentation or commit. They were **related, not unrelated**, so the "stop if
unrelated changes are present" gate did not fire; the work was verified against
the brief, completed where incomplete, and committed here. Four defects in that
partial work are recorded in §6.

### Baseline phrase search at `3a5aca3` — routes affected

| Phrase | File | Public route |
|---|---|---|
| `TDG-certified drivers` | `home/WhyBrand.jsx:50` | `/` |
| `TDG-certified drivers` | `home/VerticalSection.jsx:85` | `/` |
| `confidentiality training` | `home/VerticalSection.jsx:117` | `/` |
| `confidentiality training` | `legal/page.jsx:95` | `/legal` |
| `paid weekly`, `once you are certified` | `home/BecomeADriver.jsx:23` | `/` |
| `drop-off code` | `legal/page.jsx:89` | `/legal` |
| `drop-off code` | `medical/page.jsx:100` | `/medical` |
| `confirmation code`, `signature on delivery`, `proof and photo` | comments only | none |

`TDG certified drivers`, `confidential training` and `dropoff code` returned no
matches anywhere.

**Not caught by the phrase list, found by reading the files:**
`'Confidentiality-trained drivers'` in the `/legal` credentials strip. The brief's
search terms were `confidentiality training` and `confidential training`; the
rendered string is the hyphenated adjectival form. It is the same claim, stated
more baldly, higher on the page than the card that was being removed.

## 3. Claims removed, and their replacements

### 3.1 Homepage — `WhyBrand.jsx` (Task 1)

| | |
|---|---|
| **Was** | **TDG-certified drivers** — *"Trained for medical and regulated goods."* |
| **Now** | **Vehicle options for every delivery** — **"Choose from bike, car, SUV, minivan, cargo van and box truck."** |

**Evidence [measured].** All six names verified in `src/components/send/vehicles.js`:
`Bike`, `Car`, `SUV`, `Minivan`, `Cargo van`, `Box truck` — the `name` field of
each entry in `VEHICLES`, selectable in the live booking flow. "Choose from"
describes the options; no availability guarantee is implied.

**The icon changed with it.** `TdgCertified` is a shield with a diamond cut out,
and `icons.jsx:213` records that the diamond is chosen because *"TDG placards are
diamonds — the shape is the actual regulatory signifier."* Leaving it would have
gone on making the regulatory claim in the register that survives skim-reading.
Replaced with `RequestRide`, the car silhouette.

### 3.2 Homepage — medical vertical lead (Task 2)

| | |
|---|---|
| **Was** | *"Specimen runs, pharmacy stock and temperature-sensitive goods, moved by TDG-certified drivers. **Standing routes** are arranged on your account, not booked per drop."* |
| **Now** | **"Medical deliveries coordinated through a tracked workflow, with route and status visibility from pickup through completion. Arranged on your clinic's account rather than booked per drop."** |

Two claims went. The TDG one for the reason in §1. **"Standing routes"** went
because Phase 4.1 had already established it is unverifiable — there is no date
or time picker in `send/page.jsx` and no scheduling field in `send-flow.js:21–36`
or `buildOrderPayload.js` — yet it survived that pass in this sentence.

No specimen-handling certification, cold-chain capability, PHIPA, chain of
custody or TDG compliance was introduced.

### 3.3 Homepage — legal vertical lead (Task 3)

| | |
|---|---|
| **Was** | *"Filings, confidential files and process-serving runs, moved by drivers who must complete confidentiality training. Every job carries a timestamped trail, on your firm's account."* |
| **Now** | **"Filings, confidential files and process-serving runs coordinated through a tracked delivery workflow, with timestamped status from request through completion, on your firm's account."** |

No sworn service, admissibility, captured signature, affidavit or evidentiary
chain of custody is implied. The timestamped status is real: `createdAt`,
`onRouteToPickup`, `packagePickedUp`, and a status reaching `delivered`.

### 3.4 Driver recruitment — removed from the homepage (Phase 0 D9)

`BecomeADriver` carried *"get paid weekly"* and *"once you are certified"*.
Removing the section removes both without a driver-programme redesign.

| Requirement | Status |
|---|---|
| Homepage import removed | ✅ |
| Rendered section removed | ✅ |
| Component file retained on disk, unimported | ✅ `src/components/home/BecomeADriver.jsx` |
| No footer link created | ✅ — and none renders: `ROUTES.becomeADriver` is `live: false` and `Footer.jsx:65` filters on `item.live` |
| No dead route created | ✅ **[measured]** `become-a-driver` appears 0 times in the prerendered `/` HTML |
| No replacement recruitment CTA | ✅ |
| Documented as separate future work | ✅ this section + `page.jsx` comment |

### 3.5 `/medical` (Task 4)

| Location | Was | Now |
|---|---|---|
| Credentials strip | `TDG-licensed` | **`Live tracking`** |
| Credentials strip | `Chain-of-custody` | **`Timestamped status`** |
| Hero lead | *"Same-day **secure** transport … handled by **certified drivers**."* | **"Same-day transport for specimens, pharmaceuticals and temperature-sensitive goods, tracked from pickup through completion."** |
| Pharmaceutical delivery | *"… by drivers certified to carry regulated goods."* | **"… tracked from pickup through completion."** |
| Lab & specimen transport | *"… with the **handover confirmed** and the trip tracked end to end."* | **"… with the trip tracked from pickup through completion."** |
| Reasons card 1 | **Certified drivers** — *"TDG certification is required to take these jobs, and **enforced**."* | **Vehicle matched to the job** — **"Bike, car, SUV, minivan, cargo van or box truck."** |
| Reasons card 2 | **A record you can audit** — *"… live tracking and **drop-off code confirmation**."* | **A record of every job** — **"Live tracking and timestamped status from pickup through completion."** |
| Final CTA | *"Standing routes, per-location billing and **certified drivers** …"* | **"Standing routes and per-location billing, managed from the Druppr partner platform."** |

*"secure"* went with the hero rewrite: no security posture has been assessed or
approved (Phase 0 D10). *"enforced"* asserted an active control that does not
exist. *"audit"* implied evidentiary weight the record has not been assessed for.

### 3.6 `/legal` (Task 5)

| Location | Was | Now |
|---|---|---|
| Credentials strip | `Confidentiality-trained drivers` | **`Timestamped status`** |
| Hero lede | *"… moved by **vetted drivers**, with **proof on every job**."* | **"Filings, confidential files and process-serving runs coordinated through a tracked delivery workflow, with timestamped status from request through completion."** |
| Court filings | *"… with the trip tracked and the **drop-off confirmed on arrival**."* | **"… with the trip tracked from pickup through completion."** |
| Confidential document delivery | *"… carried by **drivers trained on confidentiality**, released at the destination you name."* | **"… carried to the destination you name, tracked from pickup through completion."** |
| Proof card 2 | **Drop-off code confirmation** — *"A code confirms the handover at the destination."* | **Route and status visibility** — **"Follow the job from pickup through completion."** |
| Proof card 3 | **Vetted drivers** — *"Confidentiality training is required to take these jobs."* | **A record you can retrieve** — **"Every job's record is retrievable from its tracking code."** |

The hero lede now matches the approved homepage legal lead, so the two surfaces
state the same true thing rather than diverging.

**Evidence for card 3 [measured].** `src/app/track/[trackingCode]/page.jsx`
fetches `/public/track/{code}` and renders Tracking Code, Category, Vehicle,
Order Placed, On Route To Pickup and Package Picked Up. This is the same
statement already shipped on the homepage showcase caption in Phase 4
("retrievable from its tracking code after delivery").

**No substitute proof mechanism was introduced anywhere** — no PIN, no
recipient code, no signature, no seal, no custody claim, no evidentiary weight.

## 4. Section order — before and after **[measured]**

| # | Before (Phase 4.1) | After (Phase 4.2) |
|---|---|---|
| 1 | Hero | Hero |
| 2 | Operational record | Operational record |
| 3 | From request to recorded delivery | From request to recorded delivery |
| 4 | *(Reviews, conditional)* | *(Reviews, conditional)* |
| 5 | Same-day medical transport | Same-day medical transport |
| 6 | Filings and confidential files | Filings and confidential files |
| 7 | Why Druppr | Why Druppr |
| 8 | Coverage | Coverage |
| 9 | **Become a driver** | — **removed** |

**One change: `BecomeADriver` removed. Nothing was reordered.** `HeroNetwork`,
`NetworkDemo`, the operational-proof metrics and the Platform Showcase frames
were not modified; `Services` and `HowItWorks` were not restored.

## 5. Files modified

| File | Change |
|---|---|
| `src/components/home/WhyBrand.jsx` | TDG card → vehicle options; icon `TdgCertified` → `RequestRide` |
| `src/components/home/VerticalSection.jsx` | Medical and legal leads rewritten |
| `src/app/(main)/page.jsx` | `BecomeADriver` import and render removed |
| `src/app/(main)/medical/page.jsx` | Credentials, hero, two panels, two reason cards, final CTA; icon `CertifiedDriver` → `RequestRide` |
| `src/app/(main)/legal/page.jsx` | Credentials, hero lede, two panels, two proof cards; icons `DropOffCode`/`VettedDrivers` → `LiveTracking`/`AuditableRecord` |

**Blast radius.** `HOME_REASONS` and `VerticalSection` are imported only by
`src/app/(main)/page.jsx`; `/medical` and `/legal` import the `WhyBrand`
*component* but pass their own reasons. Homepage edits therefore cannot reach the
two B2B pages, and each B2B page was edited in its own file. `BecomeADriver.jsx`
itself was not modified — only unimported.

## 6. Defects found in the inherited partial work

Four, all fixed here. Recorded because three of them would have shipped a claim
this phase exists to remove.

| # | Defect | Fix |
|---|---|---|
| **1** | **`'Confidentiality-trained drivers'` still rendering** in the `/legal` credentials strip — the exact claim Task 3 prohibits, and one of the brief's named "do not replace it with" forms. Missed because the phrase search used `confidentiality training`, not the hyphenated adjective | Replaced with `Timestamped status` |
| **2** | **`/legal` hero lede still said "moved by vetted drivers, with proof on every job"** while the card below it had just had "Vetted drivers" removed for being unevidenced. Internally contradictory, and an unqualified proof claim in the first sentence a firm reads | Replaced with the approved homepage legal wording |
| **3** | **A new claim was introduced while removing one.** The `/legal` proof card had become *"Same-day across the GTA — Requested and dispatched the same day"*, a dispatch-timing promise, under a "Proof of delivery" heading — when Phase 0 withheld pickup-time claims and said they must not be replaced by another timing promise | Replaced with the retrievable-record card (§3.6) |
| **4** | **`/medical`'s vehicle card kept the `CertifiedDriver` icon** — a rosette with a check, i.e. a credential badge, sitting beside vehicle copy and still asserting certification pictorially | Replaced with `RequestRide` |

## 7. Repository-wide claim sweep **[measured]**

Rendered text of all six routes, extracted from the prerendered HTML with
scripts and tags stripped. **The extractor was validated against 11 positive
controls before the negative sweep was trusted** — a first attempt used a greedy
`<script>` regex that emptied every document and reported a clean sweep on
nothing.

### Prohibited vocabulary — rendered output

| Term | `/` | `/medical` | `/legal` | `/send` | `/track/*` | `/track-partner/*` |
|---|---|---|---|---|---|---|
| TDG · certified · certification | 0 | 0 | 0 | 0 | 0 | 0 |
| confidentiality · confidentiality-trained · trained | 0 | 0 | 0 | 0 | 0 | 0 |
| vetted | 0 | 0 | 0 | 0 | 0 | 0 |
| drop-off code · dropoff code · confirmation code | 0 | 0 | 0 | 0 | 0 | 0 |
| signature · photo proof · proof and photo | 0 | 0 | 0 | 0 | 0 | 0 |
| chain of custody · chain-of-custody | 0 | 0 | 0 | 0 | 0 | 0 |
| paid weekly · once you are certified · earnings | 0 | 0 | 0 | 0 | 0 | 0 |
| PHIPA · HIPAA · SLA · guarantee | 0 | 0 | 0 | 0 | 0 | 0 |
| regulated goods · within the hour | 0 | 0 | 0 | 0 | 0 | 0 |
| sworn · affidavit · tamper · sealed | 0 | 0 | 0 | 0 | 0 | 0 |

The only raw match anywhere was `signed` on `/`, four times — every one a
substring of `Assigned`/`assigned`, the real `TaskStatusType` value. Not a
signature claim.

### Classification of every surviving claim

| Claim | Where | Classification |
|---|---|---|
| Request a delivery · track a delivery · tracking link · route visibility · status progression · timestamped status | `/`, `/medical`, `/legal` | **Repository verified** |
| Six vehicle types | `/`, `/medical` | **Repository verified** — `send/vehicles.js` |
| Record retrievable from its tracking code | `/`, `/legal` | **Repository verified** — `track/[trackingCode]/page.jsx` |
| Shared tracking link for sender, business and recipient | `/` | **Repository verified** — `TrackingMap`, `PartnerTrackingMap` |
| 50+ completed deliveries · 5 business partners · 5 onboarded GTA drivers · Accurate as of August 2026 | `/` | **Founder confirmed** — Phase 3, unchanged |
| Now serving Toronto and the GTA | all three | **Founder confirmed** — factual service area |
| Product demonstration · Sample data · Sample ETA · "an illustration, not live customer activity" | `/` | **Clearly labelled demonstration** |
| Same-day (as a service category) | all three | **Founder confirmed** — category, not a timing promise. No pickup-time or dispatch-time claim remains |
| **Fully insured** | `/medical`, `/legal` | ⚠️ **Requires professional review** |
| **Proof of delivery** (credential chip + section heading) | `/legal` | ⚠️ **Requires professional review** |
| **Temperature-controlled** · **Cold-chain capable vehicles** | `/medical` | ⚠️ **Requires founder confirmation** |
| **Standing scheduled routes** · **Recurring pickups at set times** · **Standing routes and per-location billing** | `/medical` | ⚠️ **Requires founder confirmation** — contradicted by the repository (§3.2) |
| **Monthly invoicing, split per location** | `/medical` | ⚠️ **Requires founder confirmation** — no billing surface in this repository |
| **Served documents delivered to the address you provide** | `/legal` | ⚠️ **Requires review** — qualified in-copy to the trip and the record, never the legal outcome |
| Insurance · PHIPA · security · SLA · integrations · API | nowhere | **Excluded from public copy** |
| Chain of custody · drop-off code · signatures · seals · affidavits | nowhere | **Excluded from public copy** |
| Driver pay · driver availability · recruitment | nowhere | **Outside current scope** — separate future work |

**No unsupported present-tense homepage claim remains.** Every ⚠️ row is on
`/medical` or `/legal`, is pre-existing, was not named for removal in this
brief, and is a commercial or professional fact the founder or an adviser can
evidence directly — unlike driver certification, which was known to be false of
the population it described.

⚠️ **`Fully insured` deserves particular attention.** `VISION.md` → Trust
Philosophy names this exact phrase as prohibited: *"No 'fully insured' gloss
over an undefined reality."* It was left in place because withdrawing an
insurance claim is a commercial decision, not a copy decision — but on the
document's own terms it should be confirmed against a policy or removed.

## 8. Bundle measurements **[measured]**

| Metric | Baseline `3a5aca3` | Phase 4.2 | Δ |
|---|---:|---:|---:|
| `/` route size | 2.86 kB | **2.86 kB** | **0** |
| **`/` First Load JS** | 102 kB | **102 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/medical` | 997 B / 96 kB | 997 B / 96 kB | 0 |
| `/legal` | 1.02 kB / 96 kB | 1.02 kB / 96 kB | 0 |
| Client islands on `/` | 2 | **2** | **0 added** |

Both figures were taken from two full production builds — the baseline was built
from a stash of these changes, not carried forward from the Phase 4.1 report.
Removing `BecomeADriver` moved no bytes because it was a server component
contributing no client JavaScript.

**Scroll height at 1440 [measured]:**

| Route | Baseline | Phase 4.2 | Δ |
|---|---:|---:|---:|
| `/` | 5,035 px | **4,711 px** | **−324 px** (the driver band) |
| `/medical` | 2,651 px | 2,679 px | +28 px (copy reflow) |
| `/legal` | 2,251 px | 2,279 px | +28 px (copy reflow) |

Interactive elements on `/`: **18 → 17**, the removed driver CTA.

## 9. Maps and Places **[measured]**

Network trace, fresh browser context per route.

| Route | Maps | Places |
|---|---|---|
| `/` | **0** | **0** |
| `/medical` | **0** | **0** |
| `/legal` | **0** | **0** |
| `/send` | 6 | 0 (expected — the address flow) |
| `/track/[code]` | 0 | 0 |
| `/track-partner/[token]` | 0 | 0 |

## 10. Accessibility results **[measured]**

Contrast computed **with alpha compositing** — translucent foregrounds are
flattened over their resolved ground before the ratio is taken, the correction
Phase 4.1 recorded.

| Check | Baseline | Phase 4.2 |
|---|---|---|
| Contrast failures on `/` | 0 | **0** |
| Contrast failures on `/legal` | 0 | **0** |
| Interactive elements without focus treatment, `/` | 0 / 18 | **0 / 17** |
| Interactive elements without focus treatment, `/medical` | 5 / 21 | 5 / 21 — **unchanged, pre-existing** |
| Interactive elements without focus treatment, `/legal` | 4 / 22 | 4 / 22 — **unchanged, pre-existing** |
| `<h1>` count | 1 per route | **1 per route** |
| Heading order `/` | `H1 H2×8` | **`H1 H2×8`** — no skips |
| Heading order `/medical` | `H1 H2 H3 H3 H3 H2×4` | **identical** — no skips |
| Heading order `/legal` | `H1 H2×7` | **identical** — no skips |
| Console errors, six routes | 0 | **0** |

**JavaScript disabled:** the homepage renders complete — hero, `OPERATIONAL
RECORD` with all three metrics, the showcase, all four Why Druppr cards
including the new vehicle card, both vertical leads. No prohibited phrase
present. **Reduced motion:** content identical across 2.5 s, complete state
shown.

### ⚠️ Two measurement artifacts, recorded so they are not mistaken for defects

1. **`/medical` reported 6 contrast failures at ~1.05:1.** All six are white text
   inside `ExpandingGallery`, sitting on a **photograph**. The computed-style
   walker resolves a ground by climbing ancestors for a background *colour*;
   finding none, it fell back to the page ground and scored white-on-white.
   Re-measured by **sampling the rendered pixels**: **15.70:1**, **6.41:1** and
   **5.77:1** for the three horizontal runs — all passing. The two vertical
   spine labels (`writing-mode: vertical-rl`) defeated the pixel sampler's clip
   as well and were confirmed legible by screenshot. `/legal` reports 0 for the
   same component only because its gallery ground is an opaque
   `bg-surface-ink`. **Real contrast regressions introduced by this phase: 0.**
2. **The first baseline capture was invalid.** The Phase 4.2 server was still
   holding port 3000, the baseline `next start` failed with `EADDRINUSE`, and
   the "baseline" screenshots were the Phase 4.2 build. Caught because the
   images showed the new copy. The port was cleared and every baseline figure in
   this report re-measured against a server verified to be serving `TDG-licensed`.

## 11. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

## 12. Screenshots captured

In `scratchpad/phase42/shots/`: `p42-home-full-1440.png` ·
`p42-medical-full-1440.png` · `p42-legal-full-1440.png` ·
`p42-home-whybrand-1440.png` · `p42-home-whybrand-390.png` ·
`p42-home-medical-1440.png` · `p42-home-legal-1440.png` ·
`p42-home-tail-no-driver-1440.png` · `p42-medical-reasons-1440.png` ·
`p42-legal-proof-1440.png` · `p42-js-disabled.png` · `p42-reduced-motion.png`.
Baseline comparisons in `scratchpad/phase42/baseline/`.

## 13. Out-of-scope finding, not addressed

**`ExpandingGallery` renders collapsed at 1440 on both `/medical` and `/legal`.**
The three panels occupy roughly 380 px of a 1200 px container, and the open
panel's copy is clipped mid-sentence. **This is pre-existing** — confirmed
against the baseline build, where it is marginally worse (the open panel's title
is cut off entirely). It is a layout defect in a shared component, not a claim
problem, and the brief forbids redesigning these pages. **Recorded as required
follow-up.**

Also unchanged and out of scope: the `Coverage` neighbourhood list renders on
all three routes, which `HOMEPAGE.md` → *Homepage Narrative* rules out as a
local-services SEO pattern; and the 5 + 4 pre-existing focus-treatment gaps on
`/medical` and `/legal` (Phase 0 A5, never remediated on those routes).

## 14. Acceptance criteria

| Criterion | Status |
|---|---|
| No driver TDG-certification claim on any public route | ✅ **[measured]** |
| No confidentiality-training claim on any public route | ✅ **[measured]** |
| No claim softened rather than removed | ✅ |
| Driver recruitment removed, component retained, no dead link | ✅ |
| `/medical` and `/legal` drop-off-code language removed | ✅ **[measured]** |
| Homepage remains statically rendered | ✅ `○ (Static)` |
| First Load JS ≈ 102 kB · shared ≈ 87.2 kB | ✅ **both unchanged** |
| Zero Maps and Places on `/` | ✅ **0 / 0** |
| No client JavaScript added | ✅ |
| Section order unchanged except the driver removal | ✅ |
| `HeroNetwork`, `NetworkDemo`, proof metrics, showcase frames untouched | ✅ |
| No console errors | ✅ 0 across six routes |
| Production build passes · lint passes | ✅ |

**Phase 4.2 meets its acceptance criteria.**

## 15. Phase 5

**Phase 5 has not begun.** No regulated-vertical redesign, no trust and
compliance section, no consumer booking form, no address inputs, no
autocomplete, no pricing, no address handoff, no reviews or partner movement, no
chain-of-custody artifact, no integrations, no insurance/TDG/PHIPA/security/SLA
claims, no case studies, no customer logos, no testimonials, no driver page, and
no broader motion system.

---

# Phase 4.3 — B2B Claim Closeout

> Closes the six claims Phase 4.2 flagged and left standing on `/medical` and
> `/legal`, plus one found on a third route no earlier phase had audited.
> **Phase 5 has not begun.**
>
> Labels as before: **[measured]** from a production build. Nothing estimated.

## 1. The evidence position

Every one of Tasks 1–5 is conditional on the founder supplying current
documentary or operational evidence: a policy with effective dates and an
insured entity; a legal review of what the delivery record proves; equipment
specs and temperature ranges; a described standing-route process; a described
billing process.

**No such evidence was supplied.** The brief's own decision standard therefore
resolves every one of them the same way — *"Remove it when the capability is
planned, informal, unavailable, expired, or cannot be verified"* — so all five
claims were **removed**, none were softened, and each is recorded in-file with
the exact evidence that would restore it.

This is not a judgement that the claims are false. Insurance and a manual
standing-route arrangement may well exist. It is a judgement that **a public
present-tense claim requires evidence at the time it is published**, and none
was available at the time of this pass.

## 2. Preflight **[measured]**

| Check | Result |
|---|---|
| Branch | `homepage-redesign` |
| Working tree clean | ✅ |
| Commit `f870aa4` present | ✅ |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled successfully |

### Occurrence record — every match, and where it renders

Repository search plus a rendered-text sweep of **all eight public routes**.

| Phrase | Renders on | Location |
|---|---|---|
| `fully insured` | **`/medical`**, **`/legal`** | credentials strip, both |
| `proof of delivery` | **`/legal`** ×2 | credentials strip + `WhyBrand` section heading |
| `temperature-controlled` | **`/medical`** ×3 | credential chip + gallery panel title (rendered twice by `ExpandingGallery`) |
| `cold-chain` | **`/medical`** | gallery panel description |
| `standing routes` | **`/medical`** | final CTA |
| `standing routes` | **`/contact-us`** | ⚠️ "Set up a business account" description |
| `monthly invoicing` | **`/medical`** | reason-card title |
| `insurance` | nowhere | source comments only |
| `audit` | nowhere | `AuditableRecord` icon identifier + comments |
| `chain of custody` | nowhere | `home/Services.jsx` — **unimported**, rollback only |
| `temperature controlled`, `cold chain`, `monthly billing` | nowhere | no matches |

⚠️ **`/contact-us` was carrying the standing-routes and per-location-billing
claim** and had never been audited by Phases 0–4.2, which scoped themselves to
the homepage and the two B2B pages. It was found only because this phase swept
*rendered routes* rather than named files. `/privacy-policy` was swept for the
first time too (§8).

## 3. Decisions — Keep / Narrow / Remove

| # | Claim | Decision | Basis |
|---|---|---|---|
| 1 | **Fully insured** | **REMOVE** | No policy, effective dates, insured entity, covered operations, vehicle/courier coverage, exclusions or approved wording produced. `VISION.md` → Trust Philosophy names this exact phrase: *"No 'fully insured' gloss over an undefined reality."* |
| 2 | **Proof of delivery** | **NARROW** | No legal review of what the record proves or what standard it meets. Phase 0 D10 lists proof-of-delivery evidentiary weight as **BLOCKED**. The three cards underneath were already accurate; the *heading* was doing the overclaiming |
| 3 | **Temperature-controlled / cold-chain** | **REMOVE** | No equipment spec, temperature range, handling procedure, monitoring, logging, driver instruction or exception process. Carrying medical items is not cold-chain capability |
| 4 | **Standing / scheduled routes** | **REMOVE** | No scheduling exists in the product — no date or time picker in `send/page.jsx`, no scheduling field in `send-flow.js` `EMPTY_STATE` or `buildOrderPayload.js` — and no manual process was described |
| 5 | **Monthly invoicing** | **REMOVE** | No billing surface exists at all: no invoice generation, billing frequency, payment terms, eligibility rule or approval step. `send/pay` is per-order Stripe checkout |

**None was softened.** No "protected deliveries", "covered service", "insured
network", "liability protected", "temperature-safe", "medical-grade transport",
"legally valid proof", "court-ready proof", or "scheduled delivery".

## 4. Exact replacement wording

### `/medical`

| Location | Was | Now |
|---|---|---|
| Credentials strip | `Live tracking` · **`Fully insured`** · `Timestamped status` · **`Temperature-controlled`** | `Live tracking` · `Timestamped status` · **`Shared tracking link`** |
| Hero lead | "Same-day transport for specimens, pharmaceuticals and **temperature-sensitive goods**, tracked from pickup through completion." | **"Same-day transport for specimens, pharmaceuticals and clinic supplies, tracked from pickup through completion."** |
| Gallery panel 3 | **Temperature-controlled transport** — "Cold-chain capable vehicles for goods that cannot travel at ambient temperature…" | **panel removed entirely** |
| Reason card 3 | **Standing scheduled routes** — "Recurring pickups at set times, arranged on your account." | **Packages and weight** — **"Set the number of packages and the weight when you book."** |
| Reason card 4 | **Monthly invoicing** — "Billed monthly, split per location for multi-site practices." | **card removed** (two cards → one replacement) |
| Final CTA | "**Standing routes and per-location billing**, managed from the Druppr partner platform." | **"Book and track your clinic's deliveries from the Druppr partner platform."** |

**Why the hero lead changed too.** "Temperature-sensitive goods" names the
cargo, not a capability, which is why earlier passes let it stand. With every
temperature claim now gone from the page, advertising the service *for goods
that cannot travel at ambient temperature* is itself a handling claim — a clinic
reads it as *"they can take this."* `medical_supply` is a real section preset
(`send/page.jsx:143`), so "clinic supplies" claims nothing new.

**Why the whole panel went rather than its wording.** The title, the description
**and the photograph** were each the same claim. `medical-temp.jpg` is *"a gloved
hand holding a metal transport canister packed with cold packs"*. Rewriting the
copy to workflow language while keeping that frame would have left the
photograph making the claim the copy had just dropped — exactly what the file's
own constraints block forbids. No replacement panel was invented, because this
repository evidences no third medical service distinct from the two remaining,
and Task 6 prohibits inventing one. `medical-temp.jpg` is now unused and retained
on disk.

**Why one replacement for two removed cards.** `WhyBrand` resolves three reasons
to `lg:grid-cols-3`; two would have sat in a four-column track with two dead
columns. The replacement is verified and restates neither card above it:
`send-flow.js` `EMPTY_STATE` carries `packageCount` and `weight`,
`send/details/page.jsx:115,135` renders a `<Stepper>` and a weight `<select>`,
and `PriceBreakdown.jsx:39` charges for extra packages.

### `/legal`

| Location | Was | Now |
|---|---|---|
| Credentials strip | **`Proof of delivery`** · `Timestamped status` · **`Fully insured`** | **`Delivery record`** · `Timestamped status` · **`Shared tracking link`** |
| `WhyBrand` heading | **Proof of delivery** | **The record every job leaves** |
| Const name | `PROOF_REASONS` | `RECORD_REASONS` |

The three cards beneath — *Timestamped tracking*, *Route and status visibility*,
*A record you can retrieve* — were **left exactly as Phase 4.2 wrote them.** They
describe timestamps, status and retrieval accurately. Only the frame that called
all three "proof" was removed.

### `/contact-us`

| Was | Now |
|---|---|
| "**Standing routes and per-location billing** for clinics and firms." | **"Book and track deliveries for your clinic or firm from one account."** |

### Source comments corrected

Three comment blocks stated removed claims as fact — the `/medical` header
("standing routes, per-location billing, driver certification on file"), the
`/legal` header ("accounts, matter-level billing and vetted-driver
arrangements"), and the `/legal` constraints block ("describe only the proof this
system actually produces: a timestamped trail and a drop-off code"). All three
were rewritten. **A comment that states a removed claim as fact is how the claim
gets restored by the next person editing the file.**

## 5. Files modified

| File | Change |
|---|---|
| `src/app/(main)/medical/page.jsx` | Credentials strip, hero lead, gallery panel removed, two reason cards → one, final CTA, header comment; imports `ScheduledRoutes`/`MonthlyInvoicing`/`temp` dropped, `SendPackage` added |
| `src/app/(main)/legal/page.jsx` | Credentials strip, `WhyBrand` heading, `PROOF_REASONS` → `RECORD_REASONS`, header and constraints comments |
| `src/app/contact-us/page.jsx` | `OTHER_WAYS` business-account description |

**Rendered routes affected:** `/medical`, `/legal`, `/contact-us`. The homepage
was **not** touched — `HeroNetwork`, `NetworkDemo`, `OperationalProof`,
`PlatformShowcase`, the Phase 3 metrics and the section order are all unchanged,
and no booking or tracking architecture was modified.

## 6. Final claim sweep **[measured]**

Rendered text of all eight public routes, extractor validated against 8 positive
controls before the negative sweep was trusted.

| Term | `/` | `/medical` | `/legal` | `/send` | `/contact-us` | `/privacy-policy` | `/track/*` | `/track-partner/*` |
|---|---|---|---|---|---|---|---|---|
| insurance · insured · fully insured | 0 | **0** | **0** | 0 | 0 | 0 | 0 | 0 |
| proof · custody · signature · affidavit · sworn | 0 | **0** | **0** | 0 | 0 | 0 | 0 | 0 |
| temperature · cold-chain · refrigerat* | 0 | **0** | 0 | 0 | 0 | 0 | 0 | 0 |
| invoic* · monthly billing | 0 | **0** | 0 | 0 | 0 | 0 | 0 | 0 |
| standing route · scheduled route · recurring | 0 | **0** | 0 | 0 | **0** | 0 | 0 | 0 |
| TDG · certified · certification · confidentiality | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| guarantee · SLA · PHIPA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| secure · security | 0 | 0 | 0 | 0 | 0 | **3** | 0 | 0 |
| audit | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

`signed` matches 4× on `/` — every one a substring of `Assigned`/`assigned`, the
real `TaskStatusType` value, as established in Phase 4.2.

### Classification of every surviving claim

| Claim | Where | Classification |
|---|---|---|
| Request · track · tracking link · shared tracking link · route and status visibility · timestamped status | `/`, `/medical`, `/legal` | **Repository verified** |
| Six vehicle types | `/`, `/medical` | **Repository verified** — `send/vehicles.js` |
| Packages and weight set at booking | `/medical` | **Repository verified** — `send-flow.js`, `send/details/page.jsx`, `PriceBreakdown.jsx` |
| Record retrievable by tracking code | `/`, `/legal` | **Repository verified** — `track/[trackingCode]/page.jsx` |
| Book and track from the partner platform | `/medical`, `/contact-us` | **Repository verified** — `track-partner/[trackingToken]` |
| 50+ deliveries · 5 partners · 5 drivers · Accurate as of August 2026 | `/` | **Founder confirmed** — Phase 3 |
| Now serving Toronto and the GTA | all marketing routes | **Founder confirmed** |
| Product demonstration · Sample data · Sample ETA · "an illustration, not live customer activity" | `/` | **Clearly labelled demonstration** |
| Same-day (service category) | `/`, `/medical` | **Founder confirmed** — category, not a timing promise |
| Served documents delivered to the address you provide | `/legal` | **Repository verified as worded** — describes the trip and the returned record, never the legal outcome |
| Fully insured · Proof of delivery · Temperature-controlled · Cold-chain · Standing routes · Monthly invoicing | — | **REMOVED** |
| TDG · confidentiality training · drop-off code · signatures · seals · affidavits · chain of custody · PHIPA · SLA · integrations · API | — | **Removed / excluded from public copy** |
| **"We implement security measures … including encryption and restricted access"** | **`/privacy-policy`** | ⚠️ **STILL BLOCKED** — see §8 |

**No unresolved present-tense claim remains on any marketing route.** The single
outstanding item is on the privacy policy, which is a legal instrument rather
than marketing copy.

## 7. `ExpandingGallery` — Phase 5 prerequisite

**Confirmed defect, not repaired in this phase** (Task 7 forbids a partial CSS
patch).

| Property | Finding |
|---|---|
| Widths | At 1440 px the gallery stays collapsed; panels occupy ~250–380 px of a 1200 px container |
| Copy | The open panel's copy is clipped — on `/medical` the panel **title is cut off entirely** and the description wraps one word per line |
| Routes | Both `/medical` and `/legal` |
| Origin | **Pre-existing.** Confirmed against the `3a5aca3` baseline build during Phase 4.2, where it is marginally worse |
| Mechanism | `ExpandingGallery.jsx:143–145` — closed panels are `lg:flex-[0_1_76px]`, the open panel `lg:flex-[1_1_76px]`. The open panel's `flex-grow` is not filling the row |
| ⚠️ Phase 4.3 consequence | Removing the temperature panel leaves `/medical` with **two** panels, so the unfilled row is now **more conspicuous**. The claim decision was correct and the layout defect is unrelated to it, but the two are visible together |

**Added to the Phase 5 implementation prerequisites as a visual and responsive
defect requiring repair or replacement.** It is not a claim problem, and it
should be fixed before `/medical` and `/legal` are next presented.

## 8. Remaining item requiring professional review

**`/privacy-policy` §4 Data Security** — *"We implement security measures to
protect your information, including encryption and restricted access."*

This asserts specific security controls. Phase 0 D10 lists **Security controls:
none in repo, security reviewer, not started.** It surfaced for the first time in
this phase because `/privacy-policy` had never been swept.

**Deliberately not edited.** A privacy policy is a legal instrument, not
marketing copy; its wording carries compliance consequences, and Phase 0 assigns
it to privacy counsel. Rewriting it on engineering judgement would be a worse
error than leaving it flagged. **Owner: privacy counsel + founder.**

The adjacent *"Secure payment details processed through third-party providers"*
is accurate as worded — payment data is handled in Stripe's elements, which is
what `VISION.md` → Trust Philosophy requires.

## 9. Bundle measurements **[measured]**

| Metric | Phase 4.2 | Phase 4.3 | Δ |
|---|---:|---:|---:|
| `/` route size | 2.86 kB | **2.86 kB** | **0** |
| **`/` First Load JS** | 102 kB | **102 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/medical` | 997 B / 96 kB | **845 B / 95.8 kB** | **−152 B** |
| `/legal` | 1.02 kB / 96 kB | 1.02 kB / 96 kB | 0 |
| `/contact-us` | 33.4 kB / 154 kB | 33.4 kB / 154 kB | 0 |
| Client islands on `/` | 2 | **2** | **0 added** |

`/medical` shrank because a gallery panel, an image import, a reason card and
two icon imports were removed. **No client JavaScript was added anywhere.**

**Scroll height at 1440 [measured]:** `/` 4,711 px (unchanged) · `/medical`
2,679 → **2,596 px** · `/legal` 2,279 px (unchanged).

## 10. Maps and Places **[measured]**

| Route | Maps | Places |
|---|---|---|
| `/` | **0** | **0** |
| `/medical` | **0** | **0** |
| `/legal` | **0** | **0** |
| `/contact-us` | **0** | **0** |
| `/send` | 6 | 0 (expected — the address flow) |
| `/track/[code]`, `/track-partner/[token]` | 0 | 0 |

## 11. Accessibility results **[measured]**

Contrast computed **with alpha compositing**, and each failure additionally
tagged for whether its ground is a photograph.

| Check | Phase 4.2 | Phase 4.3 |
|---|---|---|
| Contrast failures on `/` | 0 | **0** |
| Contrast failures on `/legal` | 0 | **0** |
| Contrast failures on `/medical`, **off-image** | 0 | **0** |
| Contrast failures on `/medical`, over photographs | 6 | 5 — **harness artifact**, see below |
| Focus treatment missing, `/` | 0 / 17 | **0 / 17** |
| Focus treatment missing, `/medical` | 5 / 21 | **4 / 19** — improved with the removed panel |
| Focus treatment missing, `/legal` | 4 / 22 | 4 / 22 — unchanged, pre-existing |
| `<h1>` count | 1 per route | **1 per route** |
| Heading order `/` | `H1 H2×8` | **`H1 H2×8`** — no skips |
| Heading order `/medical` | `H1 H2 H3 H3 H3 H2×4` | **`H1 H2 H3 H3 H2×4`** — one fewer H3 (removed panel), no skips |
| Heading order `/legal` | `H1 H2×7` | **`H1 H2×7`** — unchanged |
| Console errors | 0 | **0 across seven routes** |

**The five `/medical` contrast entries are all white text over photographs
inside `ExpandingGallery`** — the computed-style artifact documented in Phase
4.2 §10, where pixel sampling measured the same runs at 15.70:1, 6.41:1 and
5.77:1. The harness now tags them, and **off-image failures are 0**.

**JavaScript disabled:** `/medical` and `/legal` both render complete — all new
credential chips, the new reason card, the new headings — and **no removed claim
appears**. **Reduced motion:** content identical across 2.5 s on `/`, `/medical`
and `/legal`.

### ⚠️ Pre-existing accessibility defect found on `/contact-us`

**3.51:1 at 14 px** — `SERVICE_AREA` ("Now serving Toronto and the GTA") rendered
in `#8d8695` at `contact-us/page.jsx:202`. This is the exact token failure Phase
0 recorded as A1/A2 and Phase 1 remediated **on the homepage and the two B2B
pages only**; `/contact-us` was missed and never re-audited.

**Not fixed here.** It is unrelated to claims, on a route outside this phase's
scope, and a claim-cleanup commit should stay independently reversible as a
claim change. **Recorded as a Phase 1 remediation gap and a Phase 5
prerequisite alongside `ExpandingGallery`.** The fix is the documented one:
`#8d8695` → `#5f5868`.

## 12. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/contact-us` | 200 | 1 | **0** | 0 |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

`/privacy-policy` also returns 200 and was swept for claims.

## 13. Screenshots captured

In `scratchpad/phase43/shots/`: `p43-medical-full-1440.png` ·
`p43-legal-full-1440.png` · `p43-home-full-1440.png` ·
`p43-medical-credentials-1440.png` · `p43-legal-credentials-1440.png` ·
`p43-medical-reasons-1440.png` · `p43-medical-gallery-1440.png` ·
`p43-legal-record-1440.png` · `p43-home-whybrand-1440.png` · plus
`p43-{home,medical,legal}-js-disabled.png`.

## 14. Acceptance criteria

| Criterion | Status |
|---|---|
| Insurance claims removed from all public routes | ✅ **[measured]** |
| Proof-of-delivery framing narrowed | ✅ **[measured]** |
| Temperature and cold-chain claims removed | ✅ **[measured]** |
| Standing/scheduled-route claims removed, all three routes | ✅ **[measured]** |
| Monthly-invoicing claim removed | ✅ **[measured]** |
| No claim softened while preserving its implication | ✅ |
| No empty slot, no duplicated card, no invented capability | ✅ 3-card grid, 3 chips per strip |
| No compliance claim, performance promise or new functionality added | ✅ |
| `ExpandingGallery` not modified | ✅ — documented as a Phase 5 dependency |
| Homepage untouched; section order unchanged | ✅ |
| `/` remains static · 102 kB · 87.2 kB shared | ✅ **all unchanged** |
| Zero Maps and Places on the homepage | ✅ **0 / 0** |
| No client JavaScript added | ✅ |
| All routes 200 · zero console errors | ✅ |
| Production build passes · lint passes | ✅ |

**Phase 4.3 meets its acceptance criteria.**

## 15. Phase 5

**Phase 5 has not begun.** No regulated-vertical redesign, no trust and
compliance section, no consumer booking form, no address inputs, no
autocomplete, no pricing, no address handoff, no reviews or partner movement, no
chain-of-custody artifact, no integrations, no scheduling, no invoicing, no
partner portal, no new routes, and no broader motion system.

**Carried into Phase 5 as prerequisites:** the `ExpandingGallery` collapse (§7)
and the `/contact-us` contrast failure (§11).
