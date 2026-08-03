# Homepage Phase 1 — Foundation Report

> **Status: Phase 1 complete, awaiting approval. Phase 2 has not begun.**
>
> Phase 1 established a measured, accessible, performant and reversible foundation. No homepage architecture, copy, positioning, section order or animation was changed. The only intentional visual change is the correction of six contrast defects.
>
> **Measurement discipline.** Every figure below is labelled: **[measured]** captured from a production build, **[observed]** confirmed manually in-browser, **[not captured]** could not be reliably obtained in this environment. Nothing is estimated.

---

## 1. Environment and method

| Item | Value |
|---|---|
| Framework | Next.js 14.2.18 |
| Build | `npm run build` (production) — **not** dev server |
| Server | `npm run start` |
| Browser | Chromium via Playwright |
| Baseline captured | before any application-code edit |
| Date | 2026-08-03 |

---

## 2. Build results

| | Before | After | Δ |
|---|---|---|---|
| Build | ✅ success **[measured]** | ✅ success **[measured]** | — |
| Lint (`next lint`) | not run at baseline | ✅ **No ESLint warnings or errors** **[measured]** | — |
| Homepage route type | `○ (Static)` prerendered **[measured]** | `○ (Static)` prerendered **[measured]** | **unchanged** |
| Static pages generated | 16/16 **[measured]** | 16/16 **[measured]** | — |

---

## 3. JavaScript bundle

| Route | Before | After | Δ |
|---|---|---|---|
| **`/` route size** | 1.16 kB **[measured]** | 1.17 kB **[measured]** | **+0.01 kB** |
| **`/` First Load JS** | 100 kB **[measured]** | 100 kB **[measured]** | **0** |
| **Shared JS (all routes)** | 87.2 kB **[measured]** | 87.2 kB **[measured]** | **0** |
| `/legal` | 96 kB | 96 kB | 0 |
| `/medical` | 96 kB | 96 kB | 0 |
| `/send` | 102 kB | 102 kB | 0 |
| `/contact-us` | 153 kB **[measured]** | 154 kB **[measured]** | **+1 kB** |

**`/contact-us` +1 kB is expected and explained:** it is a `'use client'` page that consumes the shared `Layout`/`Header`/`Footer`, so the added focus-ring and hit-area class strings land in its client bundle. The homepage is a server component, so the same strings ship as HTML, not JS — which is why `/` is unchanged.

**Client islands on `/`: 1 (`HeaderMobileNav`) — unchanged. No island was added.** **[measured]**

---

## 4. Accessibility — before and after

Audited on the production build at 1440×900.

| Check | Before | After |
|---|---|---|
| Contrast failures on `/` | **6** **[measured]** | **0** **[measured]** |
| Interactive elements without focus treatment on `/` | **15 of 19** **[measured]** | **0 of 20** **[measured]** |
| Skip link | absent **[measured]** | present, functional **[measured]** |
| `<main>` programmatically focusable | no **[measured]** | yes (`#main-content`, `tabIndex={-1}`) **[measured]** |
| Targets under WCAG 2.5.8 AA (24×24) | **5** (footer links, 22 px tall) **[measured]** | **0** **[measured]** |
| `<h1>` count | 1 **[measured]** | 1 **[measured]** |
| Landmarks | header/main/nav/footer **[measured]** | header/main/nav/footer **[measured]** |
| Named footer navs | 0 **[measured]** | 3 (`footer-services`, `footer-company`, `footer-support`) **[measured]** |
| Images missing `alt` | 0 **[measured]** | 0 **[measured]** |
| CLS on `/` (desktop) | 0.0016 **[measured]** | 0.0059 **[measured]** — well inside the 0.05 budget |

### A1 / A2 — Contrast: fixed

Root cause: `#8d8695` used as small text on light grounds. Replaced with **`#5f5868`**, the existing secondary-body tone already used throughout the marketing pages. **No new token was created** — an existing token satisfied the requirement, so per the Phase 1 brief none was added.

| Element | File | Ground | Before | After **[measured]** |
|---|---|---|---|---|
| "Get your price" (14 px) | `home/Hero.jsx` | `#ffffff` card | 3.51:1 ❌ | **6.81:1** ✅ |
| "Pickup address" (16 px) | `home/Hero.jsx` | `#ffffff` card | 3.51:1 ❌ | **6.81:1** ✅ |
| "Dropoff address" (16 px) | `home/Hero.jsx` | `#ffffff` card | 3.51:1 ❌ | **6.81:1** ✅ |
| "from" (12 px) | `home/Hero.jsx` | `#ffffff` card | 3.51:1 ❌ | **6.81:1** ✅ |
| "For clinics & labs" (14 px) | `home/VerticalSection.jsx` | `surface-tint` `#f7f3fb` | 3.21:1 ❌ | **6.22:1** ✅ |
| "For law firms" (14 px) | `home/VerticalSection.jsx` | `surface-page` `#fbf9f8` | 3.35:1 ❌ | **6.49:1** ✅ |

**Foreground/background pairs and measured ratios:** `#5f5868` on `#ffffff` = **6.81:1**; on `#f7f3fb` = **6.22:1**; on `#fbf9f8` = **6.49:1**. All clear the 4.5:1 normal-text floor.

Two further instances of the same defect class were fixed pre-emptively in `home/Reviews.jsx` (review timestamp, Google attribution line). They did not appear in the audit because the Reviews section renders only when the Places API returns data, which it does not in a local unkeyed environment — but they would fail in production.

**Design weight:** the surrounding design was not made heavier. Only the text colour changed; no font-weight, size, background or border was altered.

### A3 — Skip link: added

`src/components/Layout.jsx`. Verified functionally **[measured]**:

- First tab stop on the page ✅
- `sr-only` until focused, then a real control — **198×50 px**, brand-600 ground, white text, `rounded-control` ✅
- Pressing Enter moves focus to `main#main-content` (confirmed `document.activeElement.id === 'main-content'`) ✅
- Present on `/`, `/medical`, `/legal` (the shared marketing layout) ✅
- `focus:` not `focus-visible:` — this control exists only for keyboard users and must appear on any focus
- Ring uses the header's inverted recipe (white ring, brand-600 offset) because when focused it overlays the purple header bar

### A4 — Touch targets: fixed to AA, with a documented correction

**⚠️ Correction to the implementation plan.** The plan's A4 finding cited *"2.5.8 Target Size (Minimum) (AA, 2.2)"* against a **44×44** threshold. Those are two different criteria:

- **WCAG 2.5.5 Target Size (Enhanced) — AAA — 44×44**
- **WCAG 2.5.8 Target Size (Minimum) — AA — 24×24**, with a spacing exception

Re-measured against the correct AA criterion, most flagged targets already passed:

| Element | Size | AA (24×24) | Action |
|---|---|---|---|
| Header nav links | 61×26, 42×26 | ✅ passed | Invisible 44 px hit area added anyway (free) |
| Header wordmark | 80×31 | ✅ passed | Invisible 44 px hit area added |
| Footer wordmark | 67×27 | ✅ passed | Focus ring added |
| **Footer links** | **164×22, 352×22** | ❌ **failed by 2 px** | **Fixed → ≥ 24 px** |

**Header:** an `::after` overlay provides a transparent 44 px-tall hit area centred on each link. Padding was rejected because the active nav state hangs a border under the text — any vertical padding would drag that underline away from the word. The overlay moves nothing. Gap between items is 32 px, so the 4 px horizontal bleed cannot overlap a neighbour.

**Footer:** `inline-flex min-h-[24px] items-center` brings the links to the AA minimum, plus an `::after` overlay expanding to the **32 px link pitch**. **44 px is deliberately not attempted here:** the pitch is 32 px (22 px text + 10 px gap), so a 44 px area would overlap its neighbour and route taps to the wrong destination — worse than a small target. 32 px is the largest non-overlapping area available without changing the footer's visual rhythm.

**Result: 0 targets below AA. [measured]** The remaining sub-44 px targets are a deliberate, documented trade-off against the AAA criterion.

### A5 — Focus visibility: fixed

**0 of 20 interactive homepage elements now lack a focus treatment (was 15 of 19). [measured]** A 22-stop keyboard traversal confirmed **every** tab stop renders a visible ring **[measured]**.

Rings follow the existing `Hero.jsx` / `VerticalSection.jsx` precedent, with the offset matched to each element's actual ground:

| Ground | Recipe |
|---|---|
| Light (white / `surface-page` / `surface-tint`) | `ring-brand-600` + `ring-offset-white` (or the matching surface) |
| `brand-600` (header, BecomeADriver card, skip link) | **inverted** — `ring-white` + `ring-offset-brand-600` |
| `surface-ink` (footer) | **inverted** — `ring-white` + `ring-offset-surface-ink` |

The inversion is necessary, not cosmetic: a brand-600 ring on a brand-600 ground is invisible. No browser outline was removed without an equivalent replacement — `focus-visible:outline-none` is always paired with a ring.

Focus is signalled by a **ring (shape), not colour alone**, satisfying the non-colour-dependence requirement.

### A6 — Semantic structure: verified

| Check | Result |
|---|---|
| Exactly one `<h1>` on `/` | ✅ **[measured]** |
| Heading order | ✅ h1 → h2, no skips **[measured]** |
| Landmarks | ✅ header, main, nav, footer **[measured]** |
| Decorative icons hidden | ✅ all `<svg>` carry `aria-hidden` (0 unhidden) **[measured]** |
| Accessible names | ✅ all links have text content **[measured]** |

**Footer headings — assessed and deliberately kept as `<h2>`.** The plan proposed demoting them. On review that is wrong: heading level follows document *structure*, not font size, and these are genuine section headings inside a `<footer>` landmark. The 14 px rendering is a type decision (documented in `Footer.jsx`), not a semantic one.

The real gap was the missing landmark. Each link group is now a `<nav aria-labelledby="footer-{id}">` pointing at its existing heading, so assistive technology can enumerate "Services" / "Company" / "Support" instead of meeting three unnamed link lists — and the accessible name cannot drift from the visible one.

### JavaScript resilience and reduced motion

- **No feature was added that hides content until JavaScript executes. [observed]** The skip link is CSS-only; the hit areas are CSS pseudo-elements; the focus rings are CSS.
- **No animation was added.** Phase 1 adds zero motion.
- Existing reduced-motion support is untouched: `motion-reduce:transition-none` in `Hero.jsx`, `VerticalSection.jsx`, `Services.jsx` and `ExpandingGallery.jsx` all remain as-is. **[observed]**

---

## 5. Image optimization

Re-encoded in place with sharp (mozjpeg, progressive), **preserving exact pixel dimensions, aspect ratio, filename and embedded colour profile**. No file was renamed; no import churn.

| File | Before | After | Saved | Quality | Dimensions |
|---|---:|---:|---:|---|---|
| `hero-cyclist.jpg` | 441 kB | **294 kB** | −33% | q72 | 2400×1400 unchanged |
| `home-coverage-baystreet.jpg` | 377 kB | **232 kB** | −38% | q72 | 2400×900 unchanged |
| `legal-courthouse.jpg` | 614 kB | **413 kB** | −33% | q72 | 2000×1500 unchanged |
| `legal-document.jpg` | 570 kB | **296 kB** | −48% | q72 | 2000×1500 unchanged |
| `legal-lawoffices.jpg` | 355 kB | **199 kB** | −44% | q72 | 2000×1500 unchanged |
| `medical-pharma.jpg` | 194 kB | **168 kB** | −13% | q82 | 2000×1500 unchanged |
| `medical-specimen.jpg` | 160 kB | **139 kB** | −13% | q82 | 2000×1500 unchanged |
| `medical-temp.jpg` | 307 kB | **161 kB** | −48% | q76 | 2000×1500 unchanged |
| **TOTAL** | **3,018 kB** | **1,902 kB** | **−37%** | | |

**Not touched, deliberately:** `logo.jpg`, `logo.png` (unused by marketing pages), `track.jpg` (tracking route, already 89 kB, outside Phase 1 scope). The retired `hero-cyclist.jpg` was **optimized but kept** — Phase 1 does not delete it, per the brief.

**Visual degradation check: none observed. [observed]** Full-page screenshots at 390/768/1024/1440 compared before/after; photography is indistinguishable at normal display sizes.

### ⚠️ The 200 kB source ceiling is NOT fully met

The implementation plan set a ≤ 200 kB source ceiling. Four files remain above it:

| File | After | Over ceiling |
|---|---:|---|
| `legal-courthouse.jpg` | 413 kB | +213 kB |
| `legal-document.jpg` | 296 kB | +96 kB |
| `hero-cyclist.jpg` | 294 kB | +94 kB |
| `home-coverage-baystreet.jpg` | 232 kB | +32 kB |

**Why, and what it would take.** At their current pixel dimensions these files cannot reach 200 kB without quality low enough to show artefacts. Reaching the ceiling requires **downscaling**, which changes intrinsic dimensions — something the Phase 1 brief cautioned against. Assessment per file:

- **`hero-cyclist.jpg` (2400×1400)** — renders full-bleed at `sizes="100vw"`. At a 1440 viewport on a 2× display it needs ~2880 px; 2400 already under-delivers. **Should not be downscaled.**
- **`home-coverage-baystreet.jpg` (2400×900)** — `sizes` caps at 1136 px; 2× = 2272 px. **Correctly sized already.**
- **`legal-*` (2000×1500)** — displayed at ≤ ~690 px; 2× = ~1380 px. These **could** drop to ~1500 px wide and clear the ceiling with room to spare.

**Not done unilaterally** — it trades retina quality on `/legal` and `/medical` and changes intrinsic dimensions. Flagged as a decision for you (see §11).

**Honest framing:** the source reduction mainly cuts repository weight and image-optimizer input. Because Next re-encodes per request, the user-facing saving is smaller — see §6.

---

## 6. Runtime performance

| Metric | Before | After | Note |
|---|---|---|---|
| Homepage route type | Static prerender **[measured]** | Static prerender **[measured]** | preserved |
| CLS desktop 1440 | 0.0016 **[measured]** | 0.0059 **[measured]** | inside the 0.05 budget |
| CLS mobile 390 | 0.0014 **[measured]** | 0 **[measured]** | — |
| Total transfer, cold desktop | 454 kB **[measured]** | **437 kB** **[measured]** | −17 kB |
| Total transfer, cold mobile | 253 kB **[measured]** | **253 kB** **[measured]** | unchanged |
| Image bytes, cold desktop | 179 kB **[measured]** | **160 kB** **[measured]** | −19 kB |
| Image bytes, cold mobile | 29 kB **[measured]** | **29 kB** **[measured]** | unchanged |
| Served image format | WebP (default) | **AVIF** **[measured]** | `content-type: image/avif` confirmed |
| `maps.googleapis.com` requests on `/` | **0** **[measured]** | **0** **[measured]** | ✅ preserved |
| Scroll height 1440 | 4,740 px | 4,744 px | +4 px (footer link min-height) |
| Scroll height 390 | 6,949 px | 6,958 px | +9 px |

**LCP and FCP: [not captured].** `largest-contentful-paint` and paint entries returned null in this headless environment under CDP throttling, across several attempts and two measurement strategies. **They are deliberately not estimated.** Establishing them requires Lighthouse in an environment where the compositor reports paint timings; this is carried forward as an open item.

**Performance claim, stated conservatively:** the recorded results support a **−17 kB cold desktop transfer** and a format upgrade to AVIF. They do **not** support a claim of improved LCP, because LCP was not captured. Mobile transfer is unchanged.

**CLS moved from 0.0016 to 0.0059** — a real increase, though 8× inside budget. Most likely the skip link participating in layout on focus, or AVIF decode timing. Flagged for monitoring, not treated as a regression.

---

## 7. Regression results

All routes on the production build, HTTP status and console errors captured. **[measured]**

| Route | Status | Renders | `<h1>` | Console errors | Notes |
|---|---|---|---|---|---|
| `/` | 200 ✅ | ✅ | 1 | **0** | skip link ✅, 0 contrast fails, 0 focus gaps |
| `/medical` | 200 ✅ | ✅ | 1 | **0** | skip link ✅, named footer navs ✅ |
| `/legal` | 200 ✅ | ✅ | 1 | **0** | skip link ✅, 0 contrast fails |
| `/send` | 200 ✅ | ✅ | 1 | **0** | own layout — no skip link/footer (pre-existing) |
| `/track/[code]` | 200 ✅ | ✅ | 1 | **0** | own layout, unaffected |
| `/track-partner/[token]` | 200 ✅ | ✅ | 1 | **0** | own layout, unaffected |

**Shared-component impact reviewed.** `Header`, `Footer` and `Layout` are consumed by every `(main)` route plus `/contact-us`. Changes were additive (focus rings, hit areas, nav landmarks, skip link); no structural or copy change. `Coverage.jsx`'s documented two-tree RSC constraint, `WhyBrand`'s prop-driven contract and `VerticalSection`'s copy were **not touched**.

---

## 8. Architecture preserved

| Protected property | Status |
|---|---|
| Server-rendered homepage | ✅ still `○ (Static)` **[measured]** |
| Minimal client JS | ✅ 1 island, unchanged **[measured]** |
| Server-component boundaries | ✅ no component converted |
| Review-fetch caching (24 h revalidate) | ✅ untouched |
| Maps loader | ✅ untouched; 0 homepage requests **[measured]** |
| Send-flow state contract | ✅ untouched |
| Shared medical/legal components | ✅ no structural change |
| RSC payload constraints | ✅ `Coverage.jsx` two-tree structure intact |
| Institutional comments | ✅ preserved; new decisions documented in-file |

**Not done, as instructed:** no client conversion, no `SendFlowProvider` on `/`, no Maps on `/`, no handoff change, no pricing change, no copy change, no service removal, no network hero, no product frames, no proof bar, no section-order change.

---

## 9. Files modified

**Application code (9 files):**

| File | Change |
|---|---|
| `src/components/Layout.jsx` | Skip link; `main#main-content` with `tabIndex={-1}` |
| `src/components/Header.jsx` | Focus rings (inverted for purple); 44 px hit areas via `::after` |
| `src/components/Footer.jsx` | Focus rings (inverted for ink); AA target sizes; named `<nav>` landmarks |
| `src/components/home/Hero.jsx` | 4 contrast fixes (`#8d8695` → `#5f5868`) |
| `src/components/home/VerticalSection.jsx` | Eyebrow contrast fix |
| `src/components/home/Reviews.jsx` | 2 contrast fixes; focus ring on "See all reviews" |
| `src/components/home/Services.jsx` | Focus ring on the 3 live service rows |
| `src/components/home/BecomeADriver.jsx` | Focus ring (inverted for brand-600 card) |
| `next.config.js` | `images.formats: ['image/avif','image/webp']` — rewrites untouched |
| `tailwind.config.js` | Removed dead `marquee` animation + keyframe |

**Image assets (8 files):** re-encoded in place, listed in §5.

---

## 10. Dead configuration removed

**`marquee` only.** Repository-wide search confirmed **zero** consumers of `animate-marquee` or `--marquee-duration` in `src/`. **[measured]**

Removed:
- `theme.extend.animation.marquee` — `'marquee var(--marquee-duration) linear infinite'`
- `theme.extend.keyframes.marquee` — `{ '100%': { transform: 'translateY(-50%)' } }`

**Deliberately left in place:** `fade-in`, `spin-slow`, `spin-slower`, `spin-reverse`, `spin-reverse-slow`, `spin-reverse-slower`. These are **also** unused, but Phase 1 authorised removing the confirmed marquee configuration only. The two animations the app actually uses — `animate-pulse` and `animate-spin` — are Tailwind built-ins and were never defined here, so nothing removed or retained is load-bearing for them.

Build succeeded after removal. **[measured]**

---

## 11. Remaining accessibility issues and open items

| # | Item | Why it remains |
|---|---|---|
| R1 | **`/medical` and `/legal` page-local CTAs lack focus rings** (5 and 4 elements) | These are page-local `<a>` elements, not homepage elements. Phase 1's A5 scope is the homepage. Safe, small follow-up |
| R2 | **`/send` helper text at 3.51:1** (13 px) | Same defect class, inside the live booking flow — out of Phase 1 scope |
| R3 | **`/send` disabled "Continue" at 2.43:1** | WCAG 1.4.3 exempts disabled controls. Not a defect |
| R4 | **`/send`, `/track*` have no skip link and no `<main>`** | They use their own layouts, not the marketing `Layout`. Pre-existing |
| R5 | **LCP / FCP not captured** | Headless environment does not report paint timings reliably. Needs Lighthouse |
| R6 | **4 images above the 200 kB source ceiling** | Requires downscaling — a quality trade-off needing your decision (§5) |
| R7 | **Sub-44 px targets remain** (AAA criterion) | AA (24×24) is met everywhere. 44 px in the footer would overlap neighbours |

### False positives — investigated, not defects

- **`/medical` "12 contrast failures" at 1.05:1.** These are `ExpandingGallery` panel texts: white type over a dark photographic scrim. The audit's background-walker resolves the nearest opaque DOM ancestor and cannot see the photograph, so it compares white-on-white. **Verified by inspection — real contrast is high.** No change made; changing these would have introduced a real defect.
- **`Reviews.jsx:16` "broken image"** flagged by the design hook. Line 16 is prose *inside a comment* explaining why an `<img>` is deliberately **not** used for avatars. There is no image element in that file. No change, and no suppression comment added.

---

## 12. Screenshots captured

In `scratchpad/phase1/`:

| File | Content |
|---|---|
| `before-390/768/1024/1440.png` | Full-page baseline, pre-change |
| `after-390/768/1024/1440.png` | Full-page, post-change |
| `after-skiplink.png` | Skip link in its focused state |
| `after-navfocus.png` | Focused nav link showing the inverted ring on purple |
| `after-hero-crop.png` | Hero detail for image-quality comparison |

---

## 13. Acceptance criteria

| Criterion | Status |
|---|---|
| Production build passes | ✅ **[measured]** |
| Homepage remains server-rendered | ✅ `○ (Static)` **[measured]** |
| No Maps request on initial homepage load | ✅ 0 requests **[measured]** |
| First Load JS does not materially increase | ✅ 100 kB → 100 kB **[measured]** |
| Known contrast failures corrected | ✅ 6 → 0 **[measured]** |
| Skip link works | ✅ functionally verified **[measured]** |
| All homepage controls have visible keyboard focus | ✅ 20/20, 22-stop traversal **[measured]** |
| Undersized touch targets corrected where practical | ✅ AA met; AAA documented as a trade-off |
| Heading and landmark structure valid | ✅ **[measured]** |
| Reduced-motion behaviour intact | ✅ untouched **[observed]** |
| Images optimized without visible degradation | ✅ −37%, no degradation observed |
| Dead marquee config removed only if unused | ✅ confirmed unused before removal **[measured]** |
| No architecture / copy / positioning / section redesign | ✅ |
| Regression checks pass | ✅ 6/6 routes, 0 console errors **[measured]** |
| Before/after screenshots captured | ✅ |
| Evidence recorded in this document | ✅ |

**Phase 1 meets its acceptance criteria**, with two items carried forward that were not achievable within scope: the 200 kB image ceiling (needs a downscaling decision) and LCP/FCP (needs a Lighthouse-capable environment).

---

## 14. Commit structure

Changes are grouped for separate, independently revertable commits. **Documentation is uncommitted from the planning phases and must not be mixed with application code.**

| # | Commit | Files |
|---|---|---|
| 0 | *(pre-existing)* docs: homepage planning documents | `docs/HOMEPAGE.md`, `docs/HOMEPAGE_PHASE_0.md`, `docs/HOMEPAGE_IMPLEMENTATION_PLAN.md`, `CLAUDE.md` |
| 1 | a11y: skip link, focus rings, target sizes, footer nav landmarks | `Layout.jsx`, `Header.jsx`, `Footer.jsx` |
| 2 | a11y: correct contrast failures on homepage text | `home/Hero.jsx`, `home/VerticalSection.jsx`, `home/Reviews.jsx`, `home/Services.jsx`, `home/BecomeADriver.jsx` |
| 3 | perf: re-encode marketing images in place | `src/images/*.jpg` (8 files) |
| 4 | build: enable AVIF/WebP image output | `next.config.js` |
| 5 | chore: remove unused marquee animation config | `tailwind.config.js` |
| 6 | docs: Phase 1 report | `docs/HOMEPAGE_PHASE_1_REPORT.md` |

---

**Phase 2 has not begun. No hero redesign, no network visual, no product frames, no proof bar, no section reordering, no motion.**
