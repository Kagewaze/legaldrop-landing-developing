# Homepage Phase 5 — Regulated Vertical Experience

> **Status: Phase 5 complete, awaiting approval. Phase 6 has not begun.**
>
> Labels as in earlier phases: **[measured]** from a production build,
> **[observed]** confirmed manually. Nothing estimated.
>
> Branch `homepage-redesign`. Five commits, nothing pushed, nothing merged.
> Claim decisions from Phases 4.1–4.3 are treated as binding and none was
> reopened.

---

## 1. Preflight results **[measured]**

| Check | Result |
|---|---|
| Branch | `homepage-redesign` |
| Working tree | clean |
| Commit `55c73af` present | ✅ |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled successfully |

**Baseline recorded before any change:**

| Metric | Value |
|---|---|
| `/` route type | `○ (Static)` |
| `/` route size · First Load JS | 2.86 kB · **102 kB** |
| Shared JS | **87.2 kB** |
| `/medical` | 845 B · 95.8 kB |
| `/legal` | 1.02 kB · 96 kB |
| Maps / Places on `/`, `/medical`, `/legal` | **0 / 0** |
| CLS | `/` 0 · `/medical` 0.0001 · `/legal` 0.0002 |
| Horizontal overflow | none at 390/768/1024/1440 |
| Focus treatment missing | `/` 0/18 · `/medical` 5/21 · `/legal` 4/22 · `/contact-us` 2/21 |
| **Gallery geometry at 1440** | row **1136 px**; `/medical` panels **[1044, 76]**, `/legal` **[952, 76, 76]** |

Baseline screenshots at 390/768/1024/1440 for `/`, `/medical`, `/legal`, plus
the homepage vertical sections and `/contact-us`, in `scratchpad/phase5/before/`.

---

## 2. `ExpandingGallery` root cause

### ⚠️ The defect reported in Phases 4.2 and 4.3 does not exist

Both reports stated the gallery "collapsed" at 1440 px — panels occupying
~250–380 px of a 1200 px container, copy clipped mid-sentence, on both pages.
**That finding was false, and it was mine.**

**What actually happened.** Every one of those observations came from a
screenshot captured with Puppeteer's `fullPage: true`. That option changes the
emulated device metrics to the full document size, which **re-triggers CSS
transitions**. `ExpandingGallery` animated `flex-grow` over 360 ms
(`lg:transition-[flex-grow] lg:duration-slow`), so the capture landed on the
transition's **first frame**, where every panel still sits at its 76 px
`flex-basis`. The screenshot was real; the page it depicted never existed.

**Three independent confirmations [measured]:**

| Method | Result |
|---|---|
| Live DOM measurement at 1440 | open panel **952 px** of a 1136 px row (`/legal`); **1044 px** (`/medical`) — as designed |
| Viewport screenshot (no `fullPage`) | renders correctly; open panel fills the row |
| `fullPage` **under `prefers-reduced-motion: reduce`** | renders correctly — no transition to catch mid-flight |

That last row is the discriminator: suppressing motion is the only variable
changed, and it removes the symptom entirely.

**Method correction adopted for this phase.** Every `fullPage` capture in the
Phase 5 harness emulates `prefers-reduced-motion: reduce`, and the reason is
written at the top of `scratchpad/phase5/shoot.js`. This is the third
measurement-method error in this project — after Phase 2.1's alpha compositing
and Phase 4.2's greedy `<script>` regex — and the pattern is consistent: a
harness that is wrong in a plausible direction produces a finding that survives
review because it matches an expectation.

### The real defect: resilience, not layout

**With JavaScript disabled, most panels were unreachable.** `openIndex` is
`useState(0)` with no non-JS path to change it:

| Width | Behaviour without JS **[measured]** |
|---|---|
| 1440 (`/legal`) | panel 0 at 952 px; panels 1–2 at **76 px**, copy `visibility: hidden`, `opacity: 0` |
| 768 / 390 (`/legal`, `mobileHeroMode`) | panel 0 full; panels 1–2 are **64 px rows** whose expand button does nothing |
| 1440 (`/medical`) | panel 0 at 1044 px; panel 1 at **76 px**, copy hidden |

Two of three legal services and one of two medical services were readable only
after hydration. That violates the floor in `HOMEPAGE_IMPLEMENTATION_PLAN.md`
§11 — *"no content hidden behind JS"* — and `VISION.md`'s minimal-client-JS and
accessibility principles.

---

## 3. Gallery architecture, before and after

| | Before — `ExpandingGallery` | After — `ServicePanels` |
|---|---|---|
| Boundary | `'use client'` | **server component** |
| State | `useState(openIndex)`, `useId` | none |
| Desktop layout | lateral accordion, `lg:flex-[0_1_76px]` → `lg:flex-[1_1_76px]` | responsive grid |
| Track count | fixed row | `lg:grid-cols-3` at ≥3 panels, `lg:grid-cols-2` at 2 |
| Mobile | stacked cards, or 64 px rows under `mobileHeroMode` | stacked cards, all equal |
| Copy when closed | `visibility: hidden`, `opacity: 0` | **always visible** |
| Controls | `<button>` per panel + rotated title | **none** — no focusable element inside a card |
| Motion | 360 ms `flex-grow` + opacity | **none** |
| CTA | one per panel | **one per section** |
| JS disabled | ❌ panels unreachable | ✅ every panel complete |

**Why a grid rather than a repaired accordion.** With two panels on `/medical`
and three on `/legal` there is no space pressure an accordion relieves, and the
brief's own instruction is to *"choose the simplest architecture that preserves
comprehension."* A grid shows everything, needs no JS, has no keyboard or
`aria` surface to get wrong, and nothing to suppress under reduced motion.

**What was carried over deliberately.** The card treatment **is** the
accordion's open-panel treatment — the same 0.35 flat scrim, the same
directional gradient, the same 12 % hairline. Those values are measured contrast
decisions, so reusing them means no text/ground pair needed re-measuring. The
rationale for each moved into `ServicePanels.jsx` rather than being left behind.

`ExpandingGallery.jsx` is **retained on disk, unimported**, as the rollback
target, consistent with `Services.jsx`, `HowItWorks.jsx`, `Hero.jsx` and
`BecomeADriver.jsx`.

### One CTA per section, not one per card

The accordion could afford a per-panel CTA because only one panel was ever open.
Showing every card at once turned that into the same sentence — and the same tab
stop, to the same URL — two or three times in a row. The CTA moved below the
grid, and the cards contain **no focusable element at all**, so there is no
false affordance.

---

## 4. Two-panel and three-panel behaviour **[measured]**

At 1440, container 1136 px:

| Page | Panels | Widths | Dead cells |
|---|---|---|---|
| `/medical` | 2 | 560 · 560 | 0 |
| `/legal` | 3 | 368 · 368 · 368 | 0 |

At 768 both fall to `sm:grid-cols-2` (344 px cards); at 390 both are single
column (326 px). No panel is ever a sliver, and panel dimensions no longer
change with selection because there is no selection.

---

## 5. Homepage medical redesign

**Before:** eyebrow → `h2` → lead → CTA, beside a 4:3 stock photograph of a
specimen rack.

**After:** the photograph is replaced by a **Delivery request** frame — the
fields a clinic actually specifies.

Every field and value is repository-verified:

| Field | Value | Source |
|---|---|---|
| Category | Medical supply | `medical_supply`, one of three `SECTION_PRESETS`, `send/page.jsx:143` |
| Vehicle | Car | one of the six names in `send/vehicles.js` |
| Packages | 3 | `EMPTY_STATE.packageCount`, `<Stepper>` at `send/details/page.jsx:115`, priced at `PriceBreakdown.jsx:39` |
| Weight | Under 15 kg | `WEIGHT_OPTIONS[0].label` verbatim, `send-flow.js:78` |

## 6. Homepage legal redesign

**Before:** the mirror layout, beside a stock photograph of a document handover.

**After:** a **Delivery record** frame — a four-entry timestamp chronology plus
the retrieval mechanism.

| Entry | Source |
|---|---|
| Order placed · On route to pickup · Package picked up | `createdAt`, `onRouteToPickup`, `packagePickedUp` — `track/[trackingCode]/page.jsx:152–163` |
| Delivered | terminal value of the 9-value `TaskStatusType`, `LiveTracking.jsx:14–23` |
| "retrievable from its tracking code" | `/public/track/{code}` retrieval, already shipped in Phase 4's showcase caption |

**The two frames are deliberately different** because the buyers ask different
questions — *what will fit* versus *what remains afterwards* — and deliberately
lighter than `PlatformShowcase`'s three frames above them: same card recipe and
status vocabulary so the page reads as one system, but four fields, no step
index, no route drawing.

**Both frames carry a "Sample" chip.** The values are synthetic and Phase 0
(D2/D4) requires demonstration data labelled adjacent to the artifact. The legal
frame's clock differs from the showcase's third frame on purpose: two separate
demonstrations on one page should not imply one job.

---

## 7. Final medical copy

> **FOR CLINICS & LABS**
>
> **Medical logistics with the delivery in view**
>
> Coordinate specimens, pharmaceuticals and clinic supplies through a tracked
> workflow, with route and status visibility from pickup through completion.
>
> Arranged on your clinic's account rather than booked per drop.
>
> *[See medical delivery]*

## 8. Final legal copy

> **FOR LAW FIRMS**
>
> **Legal delivery with a record at every step**
>
> Coordinate filings, confidential files and process-serving runs through a
> tracked workflow, with timestamped status from request through completion.
>
> Arranged on your firm's account rather than booked per drop.
>
> *[See legal delivery]*

Headings changed from `Same-day medical transport` and `Filings and confidential
files` — both named cargo; these name what the section shows. The account line
moved out of each lead onto its own line so the lead carries one idea. **No
claim was added, and "record" is used rather than "proof".**

---

## 9. CTA destination audit **[measured]**

| CTA | Was | Actually reached | Verdict |
|---|---|---|---|
| Homepage medical CTA | `/medical` | `/medical` | ✅ accurate |
| Homepage legal CTA | `/legal` | `/legal` | ✅ accurate |
| "Set up your clinic account" (×3) | `PARTNER_URL` | **redirects to `/login`** | ⚠️ corrected |
| "Register your firm" (×2) | `PARTNER_URL` | **redirects to `/login`** | ⚠️ corrected |
| "Get started" (both final CTAs) | `PARTNER_URL` | **redirects to `/login`** | ⚠️ corrected |
| "Set up a business account" (`/contact-us`) | `PARTNER_URL` | **redirects to `/login`** | ⚠️ corrected |

**What the partner platform actually is [measured].** `https://partner.legaldrop.ca`
returns 200 and redirects to `/login` — *"Login - LegalDrop… Access the LegalDrop
delivery console to manage orders and clients"* — an email/password form with a
small "Sign up" link. `/signup` is real and self-serve: HTTP 200, *"Sign up -
LegalDrop… Create your LegalDrop account"*, with first name, last name, work
email, contact phone, password, confirm password and a "Create account" button.

**So the labels were accurate and the destinations were not.** A clinic clicking
*Set up your clinic account* arrived at a password field and had to find the
sign-up link to do the thing the button had just offered.

## 10. CTA labels changed

**None.** The destination genuinely provides a portal with self-serve account
creation, so *Set up your clinic account* and *Register your firm* describe what
a user gets. The fix is a new `PARTNER_SIGNUP_URL` pointing account-creation
intent at `/signup`. No route was created, and nothing claims a dashboard,
onboarding system or billing.

⚠️ **One observation for the founder.** The portal's own signup page says *"Set
up company access to schedule deliveries and monitor order statuses in real
time."* That is another origin's copy and it was **not** imported here — Phases
4.2 and 4.3 removed scheduling claims from these pages for want of evidence in
*this* repository. If the portal genuinely schedules, that is evidence that could
restore those claims, but it is confirmed by the founder, not by borrowing
another surface's sentence. Recorded in `navigation.js` beside the constant.

---

## 11. `/medical` refinements

- Gallery replaced (§3); the two-panel grid now fills the row as two 560 px
  cards rather than reading as a gap where a third used to be.
- `<title>` and `<h1>`: **"Medical courier" → "Medical logistics"**.
  `VISION.md` → Brand Positioning is unconditional — *never describe Druppr as a
  courier, internally or externally* — and the homepage section linking here now
  reads "Medical logistics with the delivery in view", so the destination was
  contradicting its own entry point. ⚠️ **SEO trade-off stated, not hidden:**
  "medical courier" is the higher-volume search term and the `<title>` gives it
  up. That is the cost of the positioning rule; if traffic proves to depend on
  it, that is a measured founder decision, not a quiet revert.
- CTA destinations → `/signup`; focus rings added.
- **No third panel was invented** and `medical-temp.jpg` stays unused, per
  Phase 4.3.
- **No new medical claim.** Copy is unchanged apart from the heading.

## 12. `/legal` refinements

- Gallery replaced; `mobileHeroMode` removed with the accordion.
- Hero lede rewritten. Phase 4.2 had aligned it to the homepage legal lead; once
  Phase 5 rebuilt the homepage section around that sentence, this page opened
  with a near-verbatim copy of the paragraph the visitor had just read. **The
  homepage now names the workflow and this page names the record and how it is
  retrieved** — the detail the destination has room for.
  > Filings, confidential files and process-serving runs, each leaving a
  > timestamped record your firm can retrieve from its tracking code.
- Section CTA takes the white fill: **#7B2FBE on surface-ink #1a1421 measures
  2.57:1**, under the 3:1 non-text floor; white measures **18.01:1**.
- CTA destinations → `/signup`; focus ring added to the final CTA.
- **No proof-of-service, signature, court-ready, affidavit or guarantee language
  was introduced.** The distinction between a delivery record and evidentiary
  proof is preserved.

## 13. `/contact-us` contrast correction

`SERVICE_AREA` at 14 px on the section's opaque white ground:

| | Colour | Ratio | Verdict |
|---|---|---|---|
| Was | `#8d8695` | **3.51:1** | ❌ under 4.5:1 |
| Now | `#5f5868` | **6.81:1** | ✅ |

Neither colour carries alpha and the ground is `#ffffff`, so there is nothing to
composite — the pair is the measurement. No new token; `#5f5868` is the existing
secondary body tone. This is the A1/A2 failure Phase 1 remediated on the
homepage and both B2B pages; `/contact-us` was missed and never re-audited until
the Phase 4.3 sweep. **Kept as its own commit** so it reverts independently.

The page was not otherwise redesigned.

---

## 14. Files modified

| File | Change |
|---|---|
| `src/components/ServicePanels.jsx` | **new** — static server-rendered grid |
| `src/components/ExpandingGallery.jsx` | untouched, now **unimported** (rollback) |
| `src/components/home/VerticalSection.jsx` | rewritten around product frames |
| `src/app/(main)/page.jsx` | `frameSide` props; tint moved medical → legal |
| `src/app/(main)/medical/page.jsx` | gallery swap, title/h1, CTA destinations, focus rings |
| `src/app/(main)/legal/page.jsx` | gallery swap, lede, CTA styling/destinations, focus ring |
| `src/app/contact-us/page.jsx` | contrast fix, CTA destination, focus rings |
| `src/lib/navigation.js` | `PARTNER_SIGNUP_URL` + audit record |

## 15. Components created or refactored

- **Created:** `ServicePanels` (server), with `FrameHeader`, `FrameNote`,
  `Field`, `MedicalFrame`, `LegalFrame` inside `VerticalSection.jsx`.
- **Refactored:** `VerticalSection` — prop `imageSide` → `frameSide`, `image`/
  `alt` → `frame`, new `note`; DOM order is now copy-then-frame at every width,
  so reading order never depends on which side the frame takes.
- **Retired from composition:** `ExpandingGallery`.

## 16. Client-side JavaScript changes

**Removed, none added.** `ExpandingGallery` was the only client component
reachable from `/medical` and `/legal`; both pages are now server-only. The
homepage was already server-rendered and is unchanged — its sole client island
remains `HeaderMobileNav`.

---

## 17. Bundle measurements **[measured]**

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 2.86 kB | **2.46 kB** | −0.40 kB |
| **`/` First Load JS** | 102 kB | **102 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| `/medical` route size · First Load | 845 B · 95.8 kB | **952 B · 93.2 kB** | +107 B · **−2.6 kB** |
| `/legal` route size · First Load | 1.02 kB · 96 kB | **1.13 kB · 93.4 kB** | +110 B · **−2.6 kB** |
| Client islands on `/` | 2 | **2** | 0 |

Route sizes rose slightly because all panel copy is now in the markup; First
Load JS fell on both B2B pages because the client boundary is gone. The
homepage's own route size fell as two image imports left the RSC payload.

## 18. Maps and Places **[measured]**

| Route | Maps | Places |
|---|---|---|
| `/` · `/medical` · `/legal` · `/contact-us` | **0** | **0** |
| `/send` | 6 | 0 (expected — the address flow) |
| `/track/[code]` · `/track-partner/[token]` | 0 | 0 |

## 19. Accessibility results **[measured]**

| Check | `/` | `/medical` | `/legal` | `/contact-us` |
|---|---|---|---|---|
| `<h1>` count | 1 | 1 | 1 | 1 |
| Heading order | `H1 H2×8` | `H1 H2 H3 H3 H2×4` | `H1 H2×7` | `H1 H2×4` |
| Heading skips | none | none | none | none |
| **Contrast failures (off-image)** | **0** | **0** | **0** | **0** |
| **Focus treatment missing** | **0 / 17** | **0 / 16** | **0 / 15** | **0 / 21** |
| Images missing `alt` | 0 / 1 | 0 / 2 | 0 / 3 | 0 / 0 |
| Text below 12 px | 0 | 0 | 0 | 0 |
| Horizontal overflow | none | none | none | none |
| 200 % zoom (720 px viewport) | no overflow | no overflow | no overflow | no overflow |

**Focus treatment was 5/21, 4/22 and 2/21 at baseline on `/medical`, `/legal`
and `/contact-us`. It is now zero everywhere**, including `/send` and both
tracking routes.

**Contrast measured with alpha compositing**, and each failure additionally
tagged for whether its ground is a photograph. `/medical` reports 4 raw
failures; **all four are over photographs**, where a computed-style walker
cannot resolve the ground and returns white-on-white. Pixel-sampled, the same
runs measure:

| Text | Ratio |
|---|---|
| "Pharmaceutical delivery" | **17.26:1** |
| "Prescriptions and pharmacy stock…" | **11.36:1** |
| "Lab & specimen transport" | **13.27:1** |
| "Samples collected from your clinic…" | **9.52:1** |
| "Court filings" / "Documents taken…" / "Process serving" | **14.42 / 11.33 / 17.15:1** |

**200 % zoom** reports 1–2 "clipped" nodes per page; every one is an `sr-only`
element (the skip link, and `NetworkDemo`'s screen-reader description), which
clips by design. **No visible text is clipped.**

**Status is never colour alone** — the legal frame's terminal dot is redundant
reinforcement for an `<ol>` order and a written label, and it is `aria-hidden`.

## 20. Keyboard results **[measured]**

First 12 tab stops on `/`, `/medical` and `/legal`: every stop exposes a visible
indicator, no trap, no hover-only content, logical order (skip link → wordmark →
nav → CTA → section CTAs → footer).

**The gallery has no controls to operate.** Replacing the accordion with a grid
removed three `<button>` elements per page and the `aria-expanded` state with
them; there is nothing to activate, nothing to announce, and no way for focus
traversal to change what is displayed.

## 21. JavaScript-disabled results **[measured]**

| Route | Body text | Result |
|---|---|---|
| `/` | 3,443 chars | complete |
| `/medical` | 1,328 chars | complete |
| `/legal` | 1,425 chars | complete |

**Every panel renders its title, full description and a reachable CTA at 1440,
768 and 390 on both pages** — the defect this phase existed to fix. Verified
per-panel, not merely by page length.

## 22. Reduced-motion results **[measured]**

Content identical across 2.5 s on `/`, `/medical` and `/legal`. `ServicePanels`
has no transitions at all, so there is nothing to suppress; the homepage frames
are static markup.

## 23. CLS results **[measured]**

| Route | Before | After | Budget |
|---|---:|---:|---:|
| `/` | 0 | **0** | ≤ 0.05 |
| `/medical` | 0.0001 | **0.0001** | ≤ 0.05 |
| `/legal` | 0.0002 | **0.0013** | ≤ 0.05 |

`/legal` rose slightly — three full-height image cards load where one card and
two 64 px rows did — and remains ~38× inside budget.

## 24. Regression-test results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/contact-us` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

**Page heights, before → after [measured]:**

| Route | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| `/` | 6,333 → **6,493** | 6,203 → 6,219 | 4,485 → 4,558 | 4,711 → **4,571** |
| `/medical` | 3,514 → 3,598 | 3,208 → **2,955** | 2,596 → 2,646 | 2,596 → 2,646 |
| `/legal` | 3,116 → **3,677** | 2,774 → 3,027 | 2,279 → 2,329 | 2,279 → 2,329 |

## 25. Screenshots captured

`scratchpad/phase5/before/` and `scratchpad/phase5/after/`:

- `/`, `/medical`, `/legal` full pages at **390 / 768 / 1024 / 1440**
- homepage medical and legal vertical sections at all four widths
- `/contact-us` at 1440, plus a crop of the corrected service-area text
- two-panel `/medical` and three-panel `/legal` desktop grids
- keyboard-focused CTA on `/medical` and `/legal`
- JavaScript-disabled full pages for `/`, `/medical`, `/legal`
- diagnostic pair proving the gallery artifact: `diag-viewport.png` (correct)
  versus `diag-fullpage.png` (the false collapse), plus the reduced-motion
  `fullPage` capture that renders correctly

## 26. Deviations from the plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **The gallery was replaced, not repaired** | There was no layout bug to repair (§2). The brief permits this: *"If interaction adds little value, consider a static responsive editorial layout."* With 2–3 panels it adds none, and the accordion was the cause of the real JS-disabled defect |
| 2 | **Photographs removed from the homepage verticals rather than demoted** | The brief asks for "one supporting photograph only when it adds context". Keeping a frame *and* a photo made a busy double-visual; the frame is the evidence and the photo was stock. Photography remains on `/medical`, `/legal` and homepage Coverage |
| 3 | **The tint moved from medical to legal** | Not requested. With both verticals on white frames, a tinted medical section merged with the tinted `PlatformShowcase` above it; Reviews only separates them when the Places API returns data |
| 4 | **One CTA per section instead of one per card** | Showing every card at once made the same CTA appear 2–3 times in a row, to the same URL |
| 5 | **`/medical` title and `h1` changed** | Not listed under Task 6, but the page called itself a courier while the homepage section linking to it did not — a direct `VISION.md` violation and exactly the contradiction Task 4 asks for |
| 6 | **A sixth commit for focus rings** | Five anchors relied on the UA default ring. They surfaced because Phase 5 changed the `href` on every one of them |

## 27. Remaining weaknesses

| # | Item | Status |
|---|---|---|
| **W8** | **`/legal` is 561 px taller at 390** (3,116 → 3,677). Three full cards replace one card plus two 64 px rows. Deliberate: nothing is behind a tap now, and it is still shorter than the three full-height cards `mobileHeroMode` was invented to avoid | New, accepted |
| **W9** | **Homepage is 160 px taller at 390** (6,333 → 6,493). A four-field frame with a caption exceeds a 4:3 photo. **E1 (≤ 5 mobile screens) was already unmet at 7.50 and is now 7.69** against the 844 px reference | New; E1 remains a Phase 9 target |
| **W10** | Both homepage frames use **synthetic values**. Labelled "Sample", per the `PlatformShowcase` precedent, but they are still not a real record | New |
| W6 | Insurance, PHIPA, security, SLA, TDG — still excluded, still unreviewed | Unchanged |
| — | `/privacy-policy` security-controls sentence | Unchanged — privacy counsel, out of scope |
| R5 | LCP / FCP **[not captured]** | Unchanged |
| R6 | 4 images above the 200 kB source ceiling | Unchanged |
| R10 | Formal five-second test not run | Unchanged — explicitly out of scope |

## 28. Acceptance criteria

| Criterion | Status |
|---|---|
| Gallery fills its content width at 1024 and 1440 | ✅ 1136 px row, no dead space |
| 2-panel and 3-panel configurations both distribute | ✅ 560×2 and 368×3 |
| No clipped copy, no unused horizontal void | ✅ |
| Mobile stacks; no hover requirement, no precision tapping | ✅ no controls at all |
| Interaction is accessible, or absent | ✅ absent — no focusable element in a card |
| **JS disabled: all panels and copy available** | ✅ **the defect is fixed** |
| Reduced motion respected | ✅ nothing animates |
| Verticals show real product capability, not compliance theatre | ✅ every field traced to a file and line |
| Medical and legal are related but distinct | ✅ request spec vs. record chronology |
| No governed claim restored or implied | ✅ swept; none present |
| Homepage remains static | ✅ `○ (Static)` |
| First Load ≈ 102 kB · shared ≈ 87.2 kB | ✅ **both unchanged** |
| No client JS added | ✅ **removed from two pages** |
| Zero Maps/Places on `/`, `/medical`, `/legal` | ✅ 0 |
| No material CLS regression | ✅ worst 0.0013 |
| Zero console errors | ✅ across seven routes |
| Section order unchanged | ✅ hero → proof → showcase → reviews → medical → legal → rest |
| `/contact-us` contrast corrected | ✅ 3.51:1 → 6.81:1 |

**Phase 5 meets its acceptance criteria**, with the two height regressions in
§27 recorded rather than hidden.

## 29. Phase 6

**Phase 6 has not begun.** No trust and compliance section, no insurance, TDG,
PHIPA, security or SLA claims, no privacy-policy edits, no customer logos,
testimonials or case studies, no reviews or partner-logo movement, no homepage
address form, no Places autocomplete, no quote calculation, no integrations, no
chain-of-custody artifact, no driver recruitment, no footer restructuring, and
no five-second testing.
