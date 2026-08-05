# Homepage Implementation Plan

> **Status: awaiting approval. No application code has been written.**
>
> This plan translates [`HOMEPAGE.md`](HOMEPAGE.md) into a phased engineering plan against the repository as it actually exists. Every figure in *Current Homepage Architecture* was measured against a production build on 2026-08-03, not estimated. Where a number could not be captured reliably, it is marked as such rather than guessed.

---

## 1. Objective

**A first-time visitor should understand within five seconds that Druppr is a technology-enabled logistics platform coordinating same-day deliveries, not merely a traditional courier company.**

Measured against the standard in `HOMEPAGE.md` → *Success Criteria*: ≥ 80% of first-time test participants identify Druppr as a technology-enabled logistics platform, logistics network, or logistics software company; ≤ 20% understand it as *only* a traditional courier service. Participants may recognise that Druppr performs deliveries — the test is whether software, coordination, tracking and operational infrastructure register as central.

Everything in this plan is subordinate to that outcome. A phase that does not measurably move it, or that protects it (performance, accessibility, trust), does not belong here.

---

## 2. Source-of-Truth Documents

| Document | Governs | Changes when |
|---|---|---|
| [`CLAUDE.md`](../CLAUDE.md) | How we work in this repo; pointers to the documents below | Repo conventions change |
| [`docs/VISION.md`](VISION.md) | Company and product vision — mission, positioning, customers, trust, engineering principles | Strategy changes (rare, deliberate) |
| [`docs/HOMEPAGE.md`](HOMEPAGE.md) | Homepage strategy — audience priority, narrative order, section gates, success criteria, motion permissions, decision framework | Homepage strategy changes |
| `docs/HOMEPAGE_IMPLEMENTATION_PLAN.md` *(this file)* | Engineering execution — architecture, components, phases, budgets, rollback | Continuously, as phases complete |

**Precedence, highest first:**

1. **`VISION.md`** — on principle: mission, positioning, trust, ethics, honesty of claims. Nothing below may override it. In particular its Trust Philosophy is absolute: no claim ships that cannot be proven.
2. **`HOMEPAGE.md`** — on homepage strategy: what sections exist, in what order, under what gates, and what "done" means.
3. **This plan** — on execution only: which files, which components, which phase, which budget.
4. **`CLAUDE.md`** — repo working conventions, subordinate to all three on homepage matters.

A conflict between this plan and `HOMEPAGE.md` is a defect **in this plan**. A conflict between `HOMEPAGE.md` and `VISION.md` is a defect in one of those two and must be resolved in the documents before code is written — never silently in code.

---

## 3. Current Homepage Architecture

*All paths relative to repo root. Measured 2026-08-03 against `next build` + `next start`, Next.js 14.2.18.*

### 3.1 Current section order

`src/app/(main)/page.jsx` (66 lines, async server component) renders, inside `<div className="bg-surface-page">`:

| # | Section | Component | Ground |
|---|---|---|---|
| 1 | Hero | `src/components/home/Hero.jsx` | `surface-ink` + photo + 4-stop scrim |
| 2 | Reviews *(conditional)* | `src/components/home/Reviews.jsx` | page |
| 3 | Services | `src/components/home/Services.jsx` | `surface-tint` band |
| 4 | HowItWorks | `src/components/home/HowItWorks.jsx` | `brand-600` band |
| 5 | Medical vertical | `src/components/home/VerticalSection.jsx` | `surface-tint` |
| 6 | Legal vertical | *(same component)* | page |
| 7 | WhyBrand | `src/components/home/WhyBrand.jsx` | page |
| 8 | Coverage | `src/components/home/Coverage.jsx` | `surface-tint` + `border-y` |
| 9 | BecomeADriver | `src/components/home/BecomeADriver.jsx` | page (brand-600 card) |

Reviews renders only when `getGoogleReviews()` returns non-null with `totalCount > 0`. In local/unkeyed environments the page has 8 sections.

### 3.2 Homepage components

| File | Lines | Boundary |
|---|---|---|
| `src/components/home/Hero.jsx` | 238 | server |
| `src/components/home/Services.jsx` | 376 | server |
| `src/components/home/VerticalSection.jsx` | 167 | server |
| `src/components/home/Reviews.jsx` | 117 | server |
| `src/components/home/HowItWorks.jsx` | 110 | server |
| `src/components/home/Coverage.jsx` | 102 | server |
| `src/components/home/WhyBrand.jsx` | 85 | server |
| `src/components/home/BecomeADriver.jsx` | 36 | server |

### 3.3 Server / client boundaries

**The homepage renders with zero page-level client components.** The only client boundary reachable from `/` is `src/components/HeaderMobileNav.jsx` (67 lines), a Headless UI disclosure inside the shared `Header`.

Client components elsewhere in the repo (not on `/`): `ExpandingGallery.jsx` (331, used by `/legal` + `/medical`), all seven `src/components/send/*`, `src/lib/send-flow.js` (339), `TrackingMap.jsx` (110), `LiveTracking.jsx` (186), `PartnerTrackingMap.jsx` (354), `PartnerLiveTracking.jsx` (189), `PaymentAlert.jsx` (67), `src/app/contact-us/page.jsx` (310), `src/app/send/*`.

**This zero-JS property is the most valuable and most fragile asset in this project. Every phase below is budgeted against it.**

### 3.4 Shared components — change here affects other routes

| Component | Also used by | Constraint |
|---|---|---|
| `home/WhyBrand.jsx` | `/medical`, `/legal` | Prop-driven, holds no copy of its own |
| `home/Coverage.jsx` | `/medical`, `/legal` | **Two separate return trees, not an `{image && …}` guard** — a guard changes the RSC payload for both B2B pages. Documented at `Coverage.jsx:48–54`, verified by diffing prerendered HTML |
| `home/VerticalSection.jsx` | Copy mirrors `/medical` + `/legal` | Copy bound by exclusion lists at `src/app/(main)/medical/page.jsx` and `src/app/(main)/legal/page.jsx` |
| `Header.jsx`, `Footer.jsx`, `Layout.jsx` | Every `(main)` route | — |
| `icons.jsx` (329) | Home, `/medical`, `/legal` | 22 glyphs, `fill="currentColor"`, colour set by call site |
| `tailwind.config.js` | Entire app | Token changes ripple to `send/**`, `contact-us`, both B2B pages |

### 3.5 Google Maps and Places architecture

- **Loader:** `src/lib/maps-loader.js` (146 lines, server-safe module, browser-only functions). Hand-rolled inline bootstrap — **no npm Maps package**. Exports `importMapsLibrary(name)` and `loadMaps()`.
- **Version pinned** to `v: '3.64'` (quarterly). Deliberate: `PlaceAutocompleteElement`'s selection event was renamed `gmp-placeselect` → `gmp-select` between versions. Bumping requires smoke-testing `/track`, `/track-partner` and the send autocomplete.
- **Key:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with a **hardcoded browser-key literal fallback** at `maps-loader.js:22–24`. Browser keys are public by nature and protected by HTTP-referrer restrictions, but the literal is flagged in-file for deletion once the env var is deployed.
- **Consumers:** `send/SendMap.jsx`, `send/AddressAutocomplete.jsx`, `track/[trackingCode]/TrackingMap.jsx`, `track-partner/[trackingToken]/PartnerTrackingMap.jsx`.
- **Measured: the homepage makes zero requests to `maps.googleapis.com` today.** Preserving that is a hard budget in §10.
- **Places (server):** `src/lib/google-reviews.js` uses Places API **(New)** `places.googleapis.com/v1`, `server-only`, `GOOGLE_PLACES_API_KEY` (not `NEXT_PUBLIC_`), field mask `rating,userRatingCount,reviews`, `revalidate: 86400`.

### 3.6 Existing product interfaces that can be reused

| Surface | Path | Lines | What it proves |
|---|---|---|---|
| Consumer live tracking | `src/app/track/[trackingCode]/LiveTracking.jsx` | 186 | Status badge, ETA, polling (6 s), terminal-status allowlist |
| Consumer map | `src/app/track/[trackingCode]/TrackingMap.jsx` | 110 | Live driver marker |
| Partner live tracking | `src/app/track-partner/[trackingToken]/PartnerLiveTracking.jsx` | 189 | Partner-scoped status view |
| Partner map | `src/app/track-partner/[trackingToken]/PartnerTrackingMap.jsx` | 354 | Route polyline, pickup/dropoff pins, animated car glyph |
| Send map | `src/components/send/SendMap.jsx` | 279 | Route rendering via `routes` library |
| Address autocomplete | `src/components/send/AddressAutocomplete.jsx` | 588 | Google `PlaceAutocompleteElement`, Druppr-themed |
| Price breakdown | `src/components/send/PriceBreakdown.jsx` | 122 | Live quote presentation |
| Vehicle picker | `src/components/send/VehiclePicker.jsx` | 113 | Capability/vehicle selection |

**Real system state available for an honest status sequence.** `LiveTracking.jsx:14–23` documents the backend's authoritative 9-value `TaskStatusType`: `pending`, `assigned`, `ongoing`, `awaiting_seller_confirmation`, `awaiting_handoff`, `delivered`, `cancelled`, `failed`, `refunded`. A homepage status progression built from these is grounded in the product; an invented sequence is not.

**Public tracking endpoint:** `${API_BASE_URL}/public/track/{code}` returns `{ status, message, driverLocation, eta }`.

#### ⚠ Blocking discovery — design-system drift

Measured token usage per file (marketing tokens = `surface-*`, `brand-*`, `rounded-card|tile|control`, `shadow-card|lift|hero`, `font-display`):

| File | Marketing tokens | Legacy utilities |
|---|---|---|
| `src/app/track/[trackingCode]/page.jsx` | **0** | 23 |
| `src/app/track-partner/[trackingToken]/page.jsx` | **0** | 29 |
| `src/app/track-partner/[trackingToken]/PartnerLiveTracking.jsx` | **0** | 19 |
| `src/app/send/page.jsx` | 3 | 1 |
| `src/components/send/PriceBreakdown.jsx` | 1 | 0 |

The tracking surfaces use `slate-*`, `rounded-3xl`, `emerald/rose/amber` badges and `shadow-sm` — the Tailwind default palette, not the Druppr design system. **A screenshot of `/track` today would look like a different company's product.** This directly constrains the Platform Showcase and is the single largest hidden dependency in this plan. Options are set out in §15 (D3).

#### ⚠ Chain of custody is not a designed surface

No dedicated custody-record UI exists. The tracking pages render an `InfoList` of fields — tracking code, status, `On Route To Pickup` timestamp, pickup/dropoff addresses. The *data* for a custody record exists; the *artifact* does not. `HOMEPAGE.md` §5 (Evidence) therefore has an unmet gate until one is designed.

### 3.7 Current image assets

`src/images/` — source file sizes:

| Asset | Size | Used by |
|---|---|---|
| `legal-courthouse.jpg` | 614 kB | `/legal` |
| `legal-document.jpg` | 570 kB | Home (legal vertical), `/legal` |
| `hero-cyclist.jpg` | 441 kB | **Home hero — likely LCP element** |
| `home-coverage-baystreet.jpg` | 377 kB | Home coverage |
| `legal-lawoffices.jpg` | 355 kB | `/legal` |
| `medical-temp.jpg` | 307 kB | `/medical` |
| `medical-pharma.jpg` | 194 kB | `/medical` |
| `medical-specimen.jpg` | 160 kB | Home (medical vertical), `/medical` |
| `logo.png` | 130 kB | **unused on marketing pages** |
| `track.jpg` | 89 kB | tracking |
| `logos/logo.svg` | 79 kB | **unused — never rendered** |
| `logo.jpg` | 47 kB | **unused on marketing pages** |

`next.config.js` has **no `images` block** — no `formats`, no tuned `deviceSizes`. All homepage images are static imports (intrinsic dimensions, so no layout shift).

### 3.8 Current review implementation

`src/lib/google-reviews.js` (168 lines, `server-only`). Place ID `ChIJ6bQwlukxK4gRFaB2nvrNqWw`. Returns `null` on any failure; `page.jsx` renders nothing when null. `Reviews.jsx` (117) renders a static `grid-cols-1 sm:grid-cols-2` of up to 5 reviews with initials avatars, star glyphs, verbatim text and a required attribution line. **Not a carousel.** Google selects which reviews are returned; there is no way to curate.

### 3.9 Current performance baseline

Production build, `/` is **○ Static (prerendered)**:

| Metric | Value |
|---|---|
| Route size `/` | **1.16 kB** |
| **First Load JS `/`** | **100 kB** |
| Shared baseline (all routes) | 87.2 kB |
| Homepage-specific JS | **≈ 12.8 kB** |
| CLS (desktop 1440) | **0.0016** |
| CLS (mobile 390) | **0.0014** |
| Total transfer, cold, desktop | 454 kB (179 kB images / 2 requests) |
| Total transfer, cold, mobile | 253 kB (29 kB images / 1 request) |
| `maps.googleapis.com` requests | **0** |
| Scroll height desktop 1440×900 | 4,740 px (**5.3 screens**) |
| Scroll height mobile 390×844 | 7,041 px (**8.3 screens**) |

**LCP and FCP were not reliably captured in this headless harness** (`largest-contentful-paint` and paint entries returned null under CDP throttling). They are deliberately **not estimated**. Establishing them via Lighthouse is a Phase 1 deliverable and a precondition for every later phase's performance check.

### 3.10 Current accessibility baseline

Measured on the production build at 1440×900:

| Check | Result |
|---|---|
| `lang` attribute | ✅ `en` |
| Landmarks | ✅ `header`, `main`, `nav`, `footer` |
| **Skip link** | ❌ **absent** |
| `<h1>` count | ✅ 1 |
| Images missing `alt` | ✅ 0 of 4 |
| Interactive elements | 19 |
| **Without explicit focus-visible class** | ⚠️ **15 of 19** (rely on UA default) |
| **Touch targets < 44 px** | ⚠️ **10** — nav links 26 px tall, footer links 22 px, wordmarks 31/27 px |
| **Contrast failures (WCAG AA)** | ❌ **6** |

Measured contrast failures, all `#8d8695` on a light ground:

| Ratio | Required | Element |
|---|---|---|
| 3.51 | 4.5 | "Get your price" (14 px, hero card) |
| 3.51 | 4.5 | "Pickup address" (16 px) |
| 3.51 | 4.5 | "Dropoff address" (16 px) |
| 3.51 | 4.5 | "from" (12 px) |
| 3.21 | 4.5 | "For clinics & labs" (14 px eyebrow) |
| 3.35 | 4.5 | "For law firms" (14 px eyebrow) |

Footer uses `<h2>` for 14 px section headings ("Services", "Company", "Support") — semantically over-weighted.

### 3.11 Dead code and cleanup candidates

- `tailwind.config.js`: `marquee` keyframes + `animation.marquee` — **zero usages** in `src/`. Pocket-template residue.
- `animation.spin-slow/slower/reverse*` — no usages found on marketing routes.
- `src/components/Button.jsx`, `Container.jsx`, `CirclesBackground.jsx` — used **only** by `src/app/not-found.jsx`.
- `src/images/logo.png`, `logo.jpg`, `logos/logo.svg` — unused by marketing pages.

---

## 4. Target Homepage Architecture

Sections and order from `HOMEPAGE.md` → *Homepage Narrative*. **Integrations is omitted** — no real integration or public API exists in this repository (§8, D6).

### S1 — Hero and live network

| | |
|---|---|
| **Purpose** | Establish category in five seconds; open two segmented doors |
| **Objective** | Clarity + Conversion |
| **Required content** | Category headline (no "send" verb, no "courier"), one-line subhead naming what moves and what the platform does to it, network/product visual, two CTAs |
| **Required data** | None for a simulated network view. Real data only if a live feed is approved (D4) |
| **Proposed component** | `home/HeroNetwork.jsx` (server shell) + `home/NetworkCanvas.jsx` (client island, lazy) |
| **Boundary** | Server shell; **one** client island for motion only |
| **Status** | Rebuild of `home/Hero.jsx` |
| **Ships when** | Always — but the fake address form must be removed or made functional first (D5) |

### S2 — Operational proof

| | |
|---|---|
| **Purpose** | Answer "is this real" before any other question |
| **Objective** | Trust |
| **Required content** | 3–5 metrics, tabular figures, as-of date, definition of "on-time" |
| **Required data** | **Real, system-computed** (D1). No estimates, no placeholders |
| **Proposed component** | `home/OperationalProof.jsx` |
| **Boundary** | Server (static values at build) or server + revalidate if wired to an endpoint |
| **Status** | New |
| **Ships when** | **≥ 3 metrics are true, sourced and current.** Fewer → section does not ship; the showcase moves up |

### S3 — Platform showcase

| | |
|---|---|
| **Purpose** | Convert "technology-enabled" from claim to observation |
| **Objective** | Clarity + Trust |
| **Required content** | ≤ 3 real interfaces (dispatch, custody, partner portal) + the 9-value status progression |
| **Required data** | Product screenshots with redaction (D2), or restyled in-repo surfaces (D3) |
| **Proposed component** | `home/PlatformShowcase.jsx` + `home/StatusSequence.jsx` (client, lazy) |
| **Boundary** | Server; one optional client island for the status sequence |
| **Status** | New. **Blocked on the design-system drift in §3.6** |
| **Ships when** | ≥ 2 interfaces can be shown that look like Druppr |

### S4 — Regulated verticals

| | |
|---|---|
| **Purpose** | Promote the defensible business to the position its value warrants |
| **Objective** | Clarity + Conversion |
| **Required content** | Medical + legal, credentials as structure, links to existing pages |
| **Required data** | None new — TDG and confidentiality-training claims already vetted on `/medical`, `/legal` |
| **Proposed component** | Adapt `home/VerticalSection.jsx` |
| **Boundary** | Server |
| **Status** | Exists; needs promotion and weight, not rewrite |
| **Ships when** | Always |

### S5 — Evidence / chain-of-custody demonstration

| | |
|---|---|
| **Purpose** | Turn the strongest claim into an artifact |
| **Objective** | Trust |
| **Required content** | One redacted custody record: timestamps and status trail. **Drop-off code excluded** pending verification (Phase 0) |
| **Required data** | A real record (D2), redacted visibly — never substituted with plausible fake values |
| **Proposed component** | `home/CustodyRecord.jsx` |
| **Boundary** | Server (static asset or structured data) |
| **Status** | New. **No custody UI exists to screenshot** (§3.6) |
| **Ships when** | A real record can be shown, or a custody surface is designed and shipped in-product first |

### S6 — Trust and compliance

| | |
|---|---|
| **Purpose** | Clear procurement objections |
| **Objective** | Trust |
| **Required content** | Whatever subset of insurance, compliance posture, certifications, customers, reviews is individually verified |
| **Required data** | Per-signal verification (§8) |
| **Proposed component** | `home/TrustSignals.jsx` — renders any subset, lays out correctly with one |
| **Boundary** | Server; Reviews stays server with 24 h revalidate |
| **Status** | New wrapper; reuses `home/Reviews.jsx` demoted into it |
| **Ships when** | ≥ 1 signal verified. **No layout may depend on a signal that can disappear** |

### S7 — Consumer booking experience

| | |
|---|---|
| **Purpose** | Convert consumer intent without letting it define the brand |
| **Objective** | Conversion |
| **Required content** | One contained band, real address entry, price-from, tracking promise |
| **Required data** | Live quote via existing send flow |
| **Proposed component** | `home/ConsumerBand.jsx` + lazy `home/QuoteLauncher.jsx` |
| **Boundary** | Server band; **client island only on interaction** |
| **Status** | New band; reuses `send/AddressAutocomplete.jsx` |
| **Ships when** | The form is functional, or it is a button (D5). **A form that looks functional and is not never ships** |

### S8 — Closing calls to action

| | |
|---|---|
| **Purpose** | Final segmented conversion |
| **Objective** | Conversion |
| **Required content** | *Talk to our team* / *Book a delivery* |
| **Required data** | None |
| **Proposed component** | `home/ClosingCta.jsx` |
| **Boundary** | Server |
| **Status** | New; replaces `BecomeADriver` in this slot |
| **Ships when** | Always |

**Removed from the homepage:** the service catalogue (`Services.jsx`), the generic `HowItWorks` ladder, `WhyBrand` (table stakes), the `Coverage` neighbourhood list, and `BecomeADriver` (**removed outright — no driver page exists, so no link is added**; the dedicated page is separate future work, per Phase 0 OQ-4). Rationale is recorded in `HOMEPAGE.md` → *Homepage Narrative*; it is not re-litigated here.

---

## 5. Components to Reuse

| Component | Path | Verdict | Notes |
|---|---|---|---|
| Maps loader | `src/lib/maps-loader.js` | **Reuse directly** | Never re-implement. Any homepage map goes through `importMapsLibrary`. Keep `v: '3.64'` pinned |
| Address autocomplete | `src/components/send/AddressAutocomplete.jsx` | **Extract, then reuse** | 588 lines with a documented styling contract and event-handling rules. Extract a slim `HomeAddressField` wrapper; **do not fork the component** |
| Partner tracking map | `src/app/track-partner/[trackingToken]/PartnerTrackingMap.jsx` | **Adapt** | Route polyline + pins + car glyph is the closest thing to the hero network view. Adapt the *rendering technique*, not the component — it is token-drifted and route-coupled |
| Consumer tracking map | `src/app/track/[trackingCode]/TrackingMap.jsx` | **Adapt** | Simpler marker case; useful reference |
| Live tracking status model | `src/app/track/[trackingCode]/LiveTracking.jsx` | **Reuse the model, not the UI** | The 9-value `TaskStatusType` allowlist is the honest source for the status sequence |
| Send map | `src/components/send/SendMap.jsx` | **Leave unchanged** | Route rendering reference only |
| Price breakdown | `src/components/send/PriceBreakdown.jsx` | **Leave unchanged** | Reference for quote presentation |
| Icons | `src/components/icons.jsx` | **Reuse directly** | 22 glyphs, 38 px/20 px floor documented in-file |
| Design tokens | `tailwind.config.js` | **Reuse; additive changes only** | Never redefine an existing token — ripples to `send/**`, `contact-us`, `/medical`, `/legal` |
| Card recipe | inline in `Services.jsx`, `WhyBrand.jsx`, `Reviews.jsx`, `contact-us` | **Extract** | Same `border-[1.5px] #eeebf1 + rounded-card + shadow-card` copied in 4+ places |
| Reviews | `src/components/home/Reviews.jsx` | **Reuse, demoted** | Move into S6; keep the conditional-render and attribution behaviour exactly |
| Vertical section | `src/components/home/VerticalSection.jsx` | **Adapt** | Copy constraints must survive |
| Header / Footer / Layout | `src/components/{Header,Footer,Layout}.jsx` | **Refactor separately** | Out of homepage scope except the skip link and focus states |

---

## 6. Components to Create

Names follow repo convention: `src/components/home/PascalCase.jsx`, server by default, `'use client'` only where interaction requires it.

### `home/HeroNetwork.jsx` — server
Hero shell: headline, subhead, two CTAs, slot for the visual. **Data:** none. **Loading:** server-rendered, part of initial HTML. **A11y:** `<h1>`, CTAs are real links with visible focus. **Reduced motion:** N/A (static shell). **Mobile:** headline caps measure to force a two-line block; CTAs stack full-width.

### `home/NetworkCanvas.jsx` — client, lazy
The animated network/dispatch visual. **Data:** a static, honest fixture describing behaviour the product genuinely has; **not presented as live data** unless D4 approves a real feed. **Loading:** `next/dynamic`, `ssr: false`, mounted below the fold of the LCP path; a static poster image is the server-rendered fallback so the hero paints without it. **A11y:** `aria-hidden` on the decorative canvas with an adjacent text description; if it conveys information, it needs an accessible text equivalent. **Reduced motion:** renders the final static frame, no animation. **Mobile:** simplified — fewer nodes, no route animation, or the poster only.

### `home/OperationalProof.jsx` — server
Metric row. **Data:** 3–5 verified metrics + as-of date + on-time definition. **Loading:** static at build, or ISR if wired to an endpoint. **A11y:** each metric is a labelled pair, not a bare number; tabular figures; not a list of headings. **Reduced motion:** count-up animation suppressed, final value rendered. **Mobile:** 2×2 grid, never a horizontal scroller.

### `home/PlatformShowcase.jsx` — server
Up to three product frames + captions. **Data:** approved screenshots. **Loading:** `next/image` with intrinsic dimensions, lazy below fold, modern formats. **A11y:** descriptive alt stating what the interface shows; never `alt=""`. **Reduced motion:** N/A. **Mobile:** crop to a legible region rather than shrinking the whole frame.

### `home/StatusSequence.jsx` — client, lazy *(optional)*
The 9-value status progression advancing. **Data:** the real `TaskStatusType` allowlist. **Loading:** dynamic, below fold, IntersectionObserver-triggered. **A11y:** `aria-live="off"`; the full sequence is present in the DOM as static text so a screen reader gets the whole story without timing. **Reduced motion:** renders all steps in their final state at once. **Mobile:** vertical stack, no animation.

### `home/CustodyRecord.jsx` — server
The proof artifact. **Data:** one real redacted record. **Loading:** static. **A11y:** semantic `<dl>` or table, not a screenshot, if built as markup — preferable to an image because it is selectable, translatable and zoomable. **Reduced motion:** none. **Mobile:** stacks to label-over-value.

### `home/TrustSignals.jsx` — server
Renders whatever subset of trust signals is verified. **Data:** per-signal, individually gated. **A11y:** logos need real alt text or `alt=""` plus adjacent text. **Reduced motion:** any logo movement must have a pause control and honour reduced motion. **Mobile:** wraps to a grid; never an auto-advancing carousel.

### `home/ConsumerBand.jsx` — server + `home/QuoteLauncher.jsx` — client, lazy
Contained consumer conversion band. **Data:** live quote via the existing send flow. **Loading:** the band is server HTML with a real `<button>`/link; the Maps-backed autocomplete island loads **on first interaction only**. **A11y:** real labels, not placeholders-as-labels; visible focus; keyboard-operable. **Reduced motion:** no transitions on field focus beyond colour. **Mobile:** full-width fields, 44 px minimum targets.

### `home/ClosingCta.jsx` — server
Two segmented CTAs. Trivial; server.

### `home/SectionHeader.jsx` — server
Eyebrow + `<h2>` + optional lead. Five sections hand-roll this today with drifting scales (`Services` is the only `h2` carrying `sm:text-4xl`). Consolidates the scale.

### `ui/Reveal.jsx` — client, single instance
The **only** general motion primitive. IntersectionObserver, `once`, section-level. **Content is visible by default**; animation is an enhancement, so a JS failure never hides the page. Honours `prefers-reduced-motion` via `motion-reduce:transition-none`.

---

## 7. Components to Refactor

| Component | Issue | Recommended action |
|---|---|---|
| `home/Services.jsx` (376) | Largest homepage component; three concerns (data, row, card). Slated for removal from `/` but the row/tile recipes are worth keeping | **Extract** `ServiceRow`, `CardHeader`, tile recipe into `ui/` before deleting the section, so nothing useful is lost |
| `home/Hero.jsx` (238) | Carries a 4-stop measured scrim, a `clamp()` split rationale, and the "do not add an `<input>` back here" constraint | **Extract, never rewrite.** Move the scrim and card as whole units with their comments intact |
| `home/Coverage.jsx` (102) | **Shared**; two-tree structure is load-bearing for `/medical` + `/legal` RSC payloads | **Leave structurally unchanged.** If removed from `/`, remove the *call*, not the component |
| `home/WhyBrand.jsx` (85) | **Shared** with both B2B pages | Removing from `/` is a `page.jsx` change only. Do not modify the component |
| `home/VerticalSection.jsx` (167) | Copy under legal exclusion lists | **Adapt presentation only.** Read both exclusion lists before touching a word |
| `send/AddressAutocomplete.jsx` (588) | Large, but the size is a documented styling/event contract with Google's web component | **Extract a wrapper. Do not refactor internals** — regression risk lands on the live booking flow |
| `track*` surfaces | Token-drifted (§3.6) | **Separate workstream.** Restyling them is a product change, not a homepage change — but the homepage depends on it (D3) |
| `Header.jsx` / `Footer.jsx` | Touch targets, focus states, footer heading levels | **Targeted fixes in Phase 1**, not a redesign |

**No wholesale rewrites.** Every file above carries comments recording measured decisions — scrim stops, RSC payload shape, contrast values, copy exclusions, Maps event names. Those comments migrate with the code or the knowledge is lost.

---

## 8. Content and Data Gates

**No placeholder claim may ship as if it were real — in production, in staging, or in a design comp that could be mistaken for the page.**

| Item | Available now | Needs confirmation | Needs real operational data | Needs customer permission | Needs screenshots | Needs future product work |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Deliveries completed | | | ✅ | | | |
| Active business customers | | | ✅ | | | |
| On-time percentage *(+ definition of on-time)* | | ✅ | ✅ | | | |
| Median / pickup-time metrics | | ✅ | ✅ | | | |
| Custody records issued | | | ✅ | | | |
| Coverage / network density figure | | ✅ | ✅ | | | |
| Insurance | | ✅ | | | | |
| Security posture | | ✅ | | | | ✅ |
| TDG certification status | | ✅ | | | | |
| Privacy / PHIPA compliance claims | | ✅ | | | | |
| Customer logos | | | | ✅ | | |
| Testimonials / case studies | | | | ✅ | | |
| Chain-of-custody record | | ✅ | ✅ | ✅ | ✅ | ✅ |
| Integrations / public API | | | | | | ✅ |
| SLA claims | | ✅ | | | | ✅ |
| Google reviews | ✅ | | | | | |
| Service-area statement | ✅ | | | | | |
| Medical/legal credential copy *(already vetted)* | ✅ | | | | | |
| Product screenshots (dispatch, tracking, partner) | | ✅ | | | ✅ | ✅ *(restyle)* |

**Gate rules.** A section renders only the subset that is verified. A metric that cannot be computed is **removed, never frozen** at its last good value. Compliance vocabulary is jurisdiction-accurate — **Ontario PHIPA, not HIPAA**; TDG for dangerous goods. Proof claims describe exactly a timestamped custody trail and a drop-off confirmation code, never sworn service, signatures, seals or affidavits.

---

## 9. Motion System

Permissions come from `HOMEPAGE.md` → *Motion Philosophy*. Every animation must answer: *if this were removed, what would the visitor understand less well?*

### Product-demonstration motion — permitted

| Motion | Improves | Where |
|---|---|---|
| Route drawing between two points | **Clarity** — makes coordination legible in space | S1 |
| Dispatch activity (an offer arriving, a job resolving) | **Trust** — communicates real system state | S1 |
| Delivery-status progression through the real 9-value model | **Clarity + Trust** — makes a state change legible | S3 |
| Proof-record generation (a record stamping into existence) | **Trust** — shows the artifact being produced | S5 |
| Metric count-up, once, on entry | **Trust** — draws the eye to evidence. **Only if the number is real** | S2 |

### Interaction feedback — permitted

Hover and focus states (colour and elevation, ≤ 200 ms), form focus transitions, progress within multi-step flows, one orchestrated hero load sequence. Improves **clarity** and **conversion** by confirming interactivity.

### Movement requiring justification

- **Review movement** — ⚠️ **AMENDED BY THE PHASE 8 APPROVAL.** This line previously read *"permitted only as a static grid or a manually-controlled scroller. Auto-advance is prohibited."* The Phase 8 brief approved a continuously moving review track (left to right) under conditions that did not exist when the prohibition was written: a visible pause/resume control with `aria-pressed`, hover and focus pausing, explicit pause outranking both, full suppression under `prefers-reduced-motion` and without JavaScript, an `aria-hidden` duplicate so each review is announced once, and a measured count threshold below which the static grid still renders. Recorded here rather than left as a contradiction between this document and the code — see `HOMEPAGE_PHASE_8_REPORT.md`. **The static grid remains the behaviour below four reviews.**
- **Partner-logo movement** — a marquee is permitted only with a visible pause control, reduced-motion suppression, and only when logos are real and consented. Default is a **static grid**. Note `tailwind.config.js` already defines an unused `marquee` animation; reviving it requires meeting these conditions, not merely referencing it.

### Decorative motion — rejected

Background particles, floating shapes, gradient drift, spinning logos, parallax for depth, scroll-jacking, pinned sections, auto-advancing carousels, counters on unreal numbers, motion that delays reaching the product or price, motion that moves a control the user may click, anything causing layout shift, anything violating `prefers-reduced-motion`.

### Technical rules

One reveal primitive, section-level only — never per-card staggers cascading down the page. Content visible by default. Motion never blocks LCP or runs on the critical path. Total budget: **one orchestrated hero moment + quiet section reveals.**

---

## 10. Performance Budget

Preserving the current server-rendered advantage is a hard requirement, not an aspiration.

| Budget | Current | Target / ceiling |
|---|---|---|
| Route rendering | Static prerender | **Must remain static** |
| First Load JS `/` | 100 kB | **≤ 130 kB** |
| Homepage-specific JS | ≈ 12.8 kB | **≤ 40 kB** |
| Client islands on `/` | 1 (`HeaderMobileNav`) | **≤ 3, or ≤ 4 with the review-motion wrapper** — resolved 2026-08-05, see below |
| LCP (mid-tier, 4G) | *not captured — Phase 1* | **≤ 2.0 s** |
| CLS | 0.0016 / 0.0014 | **≤ 0.05** |
| Total transfer, cold desktop | 454 kB | **≤ 600 kB** |
| Total transfer, cold mobile | 253 kB | **≤ 400 kB** |
| Largest single image (source) | 441 kB | **≤ 200 kB** |
| `maps.googleapis.com` on load | **0 requests** | **0 requests** |
| Autoplay animation cost | none | **≤ 2 ms/frame**, paused off-screen and when tab hidden |

### The island ceiling — exceeded in Phase 8, escalated in Phase 9, RESOLVED in Phase 9.1

**Resolved 2026-08-05. Decision-maker: Abdul. Gate 4, Option A — approve the
implemented architecture.** `HOMEPAGE.md` E5 has been raised from ≤ 2 to **≤ 3,
or ≤ 4 while the Google Reviews motion wrapper renders**, and this plan's §10 row
now matches it. The authoritative statement of the new ceiling, the conditions it
depends on, and what it does not license lives in `HOMEPAGE.md` → *Experience
gates* → *E5 was raised on 2026-08-05*; it is not restated here.

**The gate was exceeded before it was raised, and that is not smoothed over.**
The history below is retained deliberately.

| Source | Ceiling **as it stood when the conflict was found** |
|---|---|
| `HOMEPAGE.md` → Experience gates, **E1–E9 are hard gates** | **≤ 2** interactive islands *(since raised — see above)* |
| This plan, §10 above | **≤ 3** *(since aligned — see above)* |
| **Measured on the live page, Phase 9** | **3**, or **4** when Google returns ≥ 4 reviews |

The two documents have disagreed since they were written; nobody reconciled them,
and the actual count passed both numbers without either being cited. Phase 8
recorded the increase honestly ("Client islands 3 → 4") but did not note that it
crossed a ceiling.

Every island traces to an approved decision, which is why this reads as a stale
number rather than as scope creep:

| Island | Approved by |
|---|---|
| `HeaderMobileNav` | pre-existing; the shared header's mobile disclosure |
| `NetworkDemo` | Phase 0 **D4** — the hero demonstration |
| `HeroAddressEntry` | Phase 0 **D5** — "functional or a button", and functional was chosen |
| `ReviewMotion` | Phase 8 brief — the approved auto-advance exception |

**What is NOT in question:** the budget the number exists to protect is being
met. `/` is still `○ (Static)`, First Load JS is **101 kB** against a 130 kB
ceiling, shared JS 87.2 kB, and the reviews themselves stay server-rendered —
`ReviewMotion` is a wrapper around `children`, so no review data enters the
client bundle.

~~**Resolution required from the founder:** either raise E5 in `HOMEPAGE.md` to
match what has been approved and shipped, or remove an island.~~ **Done —
2026-08-05, Option A.** E5 was raised; no island was removed. The four measured
properties above are the conditions the approval rests on, and if any of them
regresses the approval does not carry.

**Google Maps and Places must not load on the critical path.** If a functional homepage address form ships (S7), the Maps/Places SDK loads **lazily on first user interaction** — focus or click on the field — never on page load. The server-rendered band must be complete and usable-looking before any Maps code is requested. A hero network visual that requires Maps is **not permitted**; use a lightweight rendering (SVG/canvas) with a static poster fallback.

`next.config.js` gains an `images` block (`formats: ['image/avif','image/webp']`, tuned `deviceSizes`) in Phase 1.

---

## 11. Accessibility Requirements

Floors, not goals. Each is a phase gate.

- **Keyboard:** every interactive element reachable and operable; logical tab order; no traps. A carousel/scroller, if any, is arrow-key operable.
- **Visible focus:** adopt the existing `focus-visible:ring-2 ring-brand-600 ring-offset-2 ring-offset-white` recipe (already used in `Hero.jsx`, `VerticalSection.jsx`) across **all** interactive elements. Baseline: 15 of 19 currently rely on the UA default.
- **Semantic headings:** one `<h1>`; `<h2>` per section; no level skips. Fix the footer's 14 px `<h2>` micro-headings.
- **Skip link:** add one — currently absent.
- **Reduced motion:** every animation degrades to no motion via `motion-reduce:transition-none` (plain form; `!` only when competing with a responsive variant, per the documented precedent in `ExpandingGallery.jsx`).
- **Contrast:** every text/ground pair measured ≥ 4.5:1 (≥ 3:1 for large text). **Six existing failures must be fixed in Phase 1** — they are in the hero card and the vertical eyebrows and will otherwise be carried into the redesign.
- **JS-failure resilience:** no content hidden behind JS. Reveal animations render visible by default. If `NetworkCanvas` fails to load, the poster remains.
- **Pause controls:** any auto-moving content (logo marquee, review scroller) has a visible pause control and stops under reduced motion.
- **Simulated live activity:** if the network visual depicts non-live data it must not be announced as live. Decorative canvases are `aria-hidden` with an adjacent text description; informative ones need a text equivalent.
- **Touch targets:** ≥ 44×44 px. Baseline has 10 elements below that (nav 26 px, footer 22 px).

---

## 12. Mobile Strategy

| Width | Behaviour |
|---|---|
| **390** | Single column. Hero: headline → subhead → CTAs stacked full-width; network visual is a **static poster** or a simplified 2-node view, never an animated canvas. Proof metrics 2×2. Showcase crops to a legible region of one interface. Custody record stacks label-over-value. Consumer band full-width, 44 px targets |
| **768** | Two columns where content genuinely pairs. Hero may keep a stacked layout — a split at this width squeezes the headline. Showcase 2-up. Verticals stack, image first |
| **1024** | Split hero engages. Showcase up to 3-up if legible; otherwise 2-up. Verticals side by side |
| **1440** | Full intended composition. Content stays within `max-w-[1200px]`; grounds run full-bleed via the established two-element wrapper pattern |

**Target: ≤ ~5 mobile screen heights** (baseline 8.3). Achieved primarily by deleting sections that fail the decision framework — the catalogue, the generic ladder, the table-stakes grid, the neighbourhood list, driver recruitment — not by compressing necessary trust content. **Trust and conversion content is never cut to hit the scroll number**; if the two conflict, the scroll target yields and the reason is recorded.

Regulated-vertical content must be reachable by **screen 2** on mobile.

Complex elements simplify rather than shrink: maps → poster; screenshots → cropped region; metrics → 2×2; forms → full-width stacked fields.

---

## 13. Phased Implementation Roadmap

Each phase is independently reviewable and independently revertable. **No phase begins until Phase 0 resolves its inputs.**

### Phase 0 — Required decisions and content *(no code)*

**Purpose:** resolve everything that gates later phases.
**Files:** none.
**Deliverables:** answers to D1–D8 (§15); a written metric list with definitions and as-of dates; catalogue scope decision; compliance language sign-off; screenshot approval and redaction policy; hero form decision.
**Acceptance:** every §8 gate is marked *available* or *blocked*, with an owner.
**Rollback:** N/A.

### Phase 1 — Foundation *(no visual redesign)*

**Purpose:** fix the baseline before building on it.
**Files:** `next.config.js` (images block), `src/images/*` (re-encode), `src/components/{Header,Footer}.jsx` (focus, touch targets, footer heading levels), `src/app/(main)/layout.jsx` or `Layout.jsx` (skip link), `src/components/home/{Hero,VerticalSection}.jsx` (contrast fixes), `tailwind.config.js` (remove dead `marquee`), `src/lib/maps-loader.js` (delete key literal once env var confirmed).
**Acceptance:** 6 contrast failures → 0; touch targets ≥ 44 px; skip link present; focus recipe on all interactive elements; **LCP/FCP baseline captured via Lighthouse**; largest image ≤ 200 kB; First Load JS unchanged at ~100 kB.
**Screenshots:** before/after at 390/768/1024/1440 — should be near-identical.
**Tests:** `npm run build` clean; Lighthouse desktop + mobile; keyboard traversal; axe scan.
**Performance:** transfer must not increase; CLS ≤ 0.05.
**Rollback:** each fix is its own commit; revert individually.

### Phase 2 — Hero and network demonstration

**Purpose:** the five-second experience.
**Files:** new `home/HeroNetwork.jsx`, `home/NetworkCanvas.jsx`, `home/SectionHeader.jsx`; `src/app/(main)/page.jsx`; retire `home/Hero.jsx` after extracting its documented constraints.
**Explicitly out of scope:** the consumer quote form. It does **not** enter the hero in this phase.
**Acceptance:** new headline passes the no-courier/no-send-verb rules; product or network visible in screen 1; two segmented CTAs; **zero Maps requests**; ≤ 1 new client island; poster fallback renders with JS disabled; reduced motion renders the static frame; **network visual labelled as a demonstration** (Phase 0, D4); **cyclist image retired**; **no `$8.00` or any price in the hero** (OQ-5); **no driver recruitment CTA or link** (OQ-4); status depiction uses only the verified 9-value model — **no drop-off-code step**.
**Screenshots:** 4 widths, plus JS-disabled and reduced-motion captures.
**Tests:** build, Lighthouse, keyboard, axe, **first five-second test run**.
**Performance:** First Load JS ≤ 130 kB; LCP ≤ 2.0 s; CLS ≤ 0.05.
**Rollback:** `page.jsx` reverts to importing the previous hero; the old component is not deleted until Phase 9.

### Phase 3 — Operational proof

**Files:** new `home/OperationalProof.jsx`; `page.jsx`.
**Gate (Phase 0, OQ-1):** ships **only** if *5 onboarded GTA drivers* is confirmed current, joining *50+ completed deliveries* and *5 business partners* to make three verified metrics. If unconfirmed, this phase does not run and the two metrics move into Phase 6 (Trust). **The three-metric gate is not lowered.** App Store / Play availability may not substitute for a metric.
**Acceptance:** every figure traces to a system query; **an internal "accurate as of" date is recorded for each metric, in this document and in a source comment, even when not displayed**; section absent entirely if < 3 metrics verified; tabular figures; count-up suppressed under reduced motion.
**Screenshots:** 4 widths + reduced-motion.
**Tests:** a written source note per metric, reviewed by Abdul.
**Performance:** no new client island unless count-up is approved.
**Rollback:** remove one import from `page.jsx`.

### Phase 4 — Platform showcase

**Files:** new `home/PlatformShowcase.jsx`, optional `home/StatusSequence.jsx`; approved screenshot assets.
**Blocked on:** D3 (design-system drift) and D2 (screenshot approval).
**Acceptance:** ≥ 2 real interfaces, legible at the rendered width; descriptive alt text; screenshots dated and versioned; status sequence uses the real 9-value model; full sequence present as static DOM text.
**Screenshots:** 4 widths + reduced-motion.
**Tests:** build, Lighthouse, axe, screen-reader pass on the sequence.
**Performance:** images lazy below fold, modern formats, intrinsic dimensions; total transfer ≤ budget.
**Rollback:** remove the section import.

### Phase 5 — Regulated verticals

**Files:** `home/VerticalSection.jsx` (presentation only), `page.jsx`.
**Acceptance:** medical + legal reachable by mobile screen 2; **copy unchanged unless re-vetted against both exclusion lists**; `/medical` and `/legal` render byte-identically (diff prerendered HTML).
**Screenshots:** 4 widths, plus `/medical` and `/legal` regression shots.
**Tests:** build; prerendered-HTML diff for both B2B pages.
**Rollback:** revert the component; `page.jsx` unaffected.

### Phase 6 — Trust and compliance

**Files:** new `home/TrustSignals.jsx`; `home/Reviews.jsx` demoted into it; `page.jsx`.
**Acceptance:** every signal individually verified; layout correct with 1, 2 or N signals; **layout survives Reviews returning null**; PHIPA/TDG language exactly as vetted; no logo or testimonial without written consent.
**Screenshots:** 4 widths, plus a forced `reviews = null` capture.
**Tests:** build; null-reviews render test; axe.
**Rollback:** remove the section import.

### Phase 7 — Consumer booking experience

**Files:** new `home/ConsumerBand.jsx`, `home/QuoteLauncher.jsx`; a slim wrapper over `send/AddressAutocomplete.jsx`; `page.jsx`.
**Handoff architecture (Phase 0, OQ-2):** write the **existing** `legaldrop.send-flow.v1` sessionStorage contract — shape `{ address, lat, lng }` per `pickup`/`dropoff`, per `src/lib/send-flow.js:21–22`. Do **not** create a new key, do **not** extend the schema to Place ID or address components without a demonstrated endpoint requirement, and do **not** mount `SendFlowProvider` on `/` (it would convert the page to a client boundary). **No addresses in the URL**; `?source=homepage` is permitted. `/send` validates and rehydrates via `hasBothAddresses` + `Number.isFinite` rather than trusting the payload.
**Pricing constraint (Phase 0, OQ-5):** **no price is displayed until a real quote returns.** Loading, unavailable and error states must all be handled. `"from $8"` is prohibited; base-fee wording is permitted only in a pricing context and only after founder confirmation.
**Acceptance:** all 8 steps of the D5 journey work; no redirect on first field click; the form is **functional or is a button** — no non-functional element styled as an input; **Maps loads only on first interaction**, verified by network trace on load; continuation into `/send` preserves both addresses; real labels; 44 px targets.
**Screenshots:** 4 widths + focus states + quote loading/error states.
**Tests:** build; network trace confirming 0 Maps requests before interaction; keyboard-only booking start; **malformed-sessionStorage rehydration test**; axe.
**Performance:** First Load JS ≤ 130 kB **with the island excluded from initial load**.
**Rollback:** band degrades to a plain CTA button by removing the dynamic import.

### Phase 8 — Purposeful motion

**Files:** new `ui/Reveal.jsx`; applied section-by-section.
**Acceptance:** every animation maps to a permitted category in §9; content visible by default; reduced motion suppresses everything; CLS unchanged; any auto-moving content has a pause control.
**Screenshots:** before/after per section + reduced-motion.
**Tests:** build; reduced-motion pass; CLS measurement; JS-disabled render.
**Performance:** ≤ 2 ms/frame; observers disconnect after firing.
**Rollback:** `Reveal` becomes a pass-through wrapper in one edit.

### Phase 9 — Full verification

**Files:** none (verification + dead-code removal).
**Acceptance:** all §10 budgets met; all §11 floors met; **five-second test ≥ 80% platform / ≤ 20% courier-only**; `/medical`, `/legal`, `/send`, `/track*` regression-free; dead components removed.
**Screenshots:** full-page at 4 widths, before/after the entire project.
**Tests:** Lighthouse desktop + mobile; axe; keyboard; reduced motion; visual regression across all `(main)` routes; unmoderated five-second study (n ≥ 5).
**Rollback:** the project is a sequence of small commits; any phase reverts independently.

---

## 14. Commit Strategy

- **One outcome per commit.** Never combine two sections, and never combine a refactor with a behaviour change.
- **Extraction commits are separate from redesign commits.** An extraction must render byte-identically — verify by diffing prerendered HTML, not by reading the diff.
- **Every commit states its blast radius**: what changed *and* what was deliberately left untouched.
- **Preserve institutional knowledge.** Comments recording measured decisions (scrim stops, RSC payload shape, contrast values, copy exclusions, Maps event-name history, the 9-value status model) move with the code. Deleting a comment that records a measurement is deleting the measurement.
- **Shared components get their own commits**, with `/medical` and `/legal` regression evidence attached.
- **No commit ships an unverified claim**, including in fixtures or comps.
- Abdul commits; agents stop at a clean working tree with a summary.

---

## 15. Unresolved Decisions

> **⚠️ SUPERSEDED — D1–D10 were resolved in Phase 0.** The authoritative determinations, including OQ-1 through OQ-5, now live in [`HOMEPAGE_PHASE_0.md`](HOMEPAGE_PHASE_0.md). That document governs; the table below is retained only as the record of what was originally open. **Do not act on this table — read Phase 0.**
>
> Material changes Phase 0 made to this plan: integrations excluded (D6) · driver page and footer link removed, not deferred to a link (D9/OQ-4) · `$8.00` removed from the hero (OQ-5) · address handoff resolved to the existing `legaldrop.send-flow.v1` contract (OQ-2) · proof bar made conditional on a third verified metric (OQ-1) · drop-off code excluded from the state machine.

These required Abdul's approval and have now received it. **No product claim or strategic decision was made on his behalf.**

| # | Decision | Blocks | Why it cannot be assumed |
|---|---|---|---|
| **D1** | **Which operational metrics can be truthfully published**, with definitions and as-of dates (deliveries, on-time %, median pickup, active accounts, custody records) | Phase 3, S2 | Publishing an unverified figure to regulated buyers is a real-world false claim and violates `VISION.md` → Trust Philosophy |
| **D2** | **May real product screenshots and one redacted custody record be used?** Who approves redaction? | Phase 4, Phase 6, S3, S5 | Without them the page stays a brochure; with the wrong ones it leaks customer data |
| **D3** | **Design-system drift:** restyle `/track` + `/track-partner` to the Druppr system first, build homepage-native representations instead, or accept visually inconsistent screenshots? | Phase 4, S3 | Largest hidden dependency in the plan; changes scope by weeks either way |
| **D4** | **Hero network visual:** live data feed, honest simulation, or static poster? | Phase 2, S1 | A simulation presented as live would be dishonest; a live feed adds a client island and an endpoint |
| **D5** | **Hero/consumer form:** functional address entry, or a CTA button? | Phase 2, Phase 7, S1, S7 | A non-functional form styled as an input is prohibited by `HOMEPAGE.md`; which replacement is a product call |
| **D6** | **Do real integrations or a public API exist?** | Integrations section (currently omitted) | Omitted by default; only Abdul can confirm otherwise |
| **D7** | **Catalogue scope:** may the 8 non-live services be removed from the homepage and footer? Where do they go? | Phase 2 onward | Positioning decision, not a design one. Content gate C5 forbids presenting unbookable services |
| **D8** | **Customer logos, testimonials, case studies** — which are consented and in writing? | Phase 6, S6 | Requires customer permission; fabrication is prohibited |
| **D9** | **Driver recruitment page** — approve moving `BecomeADriver` off the homepage to its own route? | Phase 2 onward | Removes a supply-side funnel from the highest-traffic page |
| **D10** | **Insurance, security posture, SLA, TDG and PHIPA language** — who signs off on the exact wording? | Phase 6 | Compliance claims must be jurisdiction-accurate and legally reviewed |

---

**No application code has been written. Implementation begins only on approval.**
