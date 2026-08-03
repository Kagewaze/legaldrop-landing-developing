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
