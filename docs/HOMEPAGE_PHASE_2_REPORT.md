# Homepage Phase 2 — Hero and Network Demonstration

> **Status: Phase 2 complete, awaiting approval. Phase 3 has not begun.**
>
> Measurement labels as in Phase 1: **[measured]** from a production build, **[observed]** confirmed manually, **[not captured]** unavailable in this environment. Nothing is estimated.
>
> Branch: `homepage-redesign`. Nothing pushed, nothing merged.

---

## 1. Files modified

| File | Change |
|---|---|
| `src/components/home/NetworkDemo.jsx` | **new** — client island, the network demonstration |
| `src/components/home/HeroNetwork.jsx` | **new** — server-rendered hero shell |
| `src/app/(main)/page.jsx` | swapped `Hero` → `HeroNetwork` (2 lines + a comment) |
| `docs/HOMEPAGE_PHASE_2_REPORT.md` | **new** — this document |

**No other application file was touched.** No shared medical/legal component, no `Services`, `HowItWorks`, `VerticalSection`, `WhyBrand`, `Coverage`, `BecomeADriver`, `Header`, `Footer`, `Layout`, `next.config.js` or `tailwind.config.js`.

## 2. Components created

**`HeroNetwork.jsx` — server component.** Headline, sub-copy, two CTAs, a restrained category signal, and a slot for the demonstration. Ships as HTML; contributes no JavaScript.

**`NetworkDemo.jsx` — client island (`'use client'`).** The only new client boundary. Renders a schematic SVG network, a dispatch strip and a progress indicator, and advances a status sequence on an interval.

## 3. Components retired or retained

| Component | Status |
|---|---|
| `src/components/home/Hero.jsx` | **Retired from the page, retained on disk, unimported.** It is the Phase 2 rollback target — restoring the previous hero is a two-line change in `page.jsx`. Removal is deferred to a later phase, per the implementation plan |
| `src/images/hero-cyclist.jpg` | **Retained.** Still referenced by the retained `Hero.jsx`. Phase 1 explicitly ruled it must not be deleted merely because it is retired from the target design. Tree-shaken out of the build because nothing imports `Hero.jsx` |

No component was rewritten wholesale. The documented decisions in the old hero (the four-stop scrim, the `clamp()` split, the "do not add an `<input>` back here" constraint) are carried forward as an explicit record in `HeroNetwork.jsx`'s header comment, stating what was removed and why, so the reasoning survives even though the code does not.

## 4. Final hero copy

> **H1** — Same-day logistics infrastructure for the GTA
>
> **Sub** — Specimens, filings, business deliveries and parcels — dispatched, tracked and recorded on one platform.
>
> **Categories** — Medical · Legal · Business · Parcel *(plain text, no links)*

**Rule compliance:**

| Rule | Result |
|---|---|
| Does not self-describe as a courier | ✅ the word does not appear |
| No "send anything" thesis | ✅ removed |
| No "everyone else" | ✅ removed |
| No `$8` lead | ✅ no price anywhere in the hero |
| No unverified speed / pickup-time / compliance / custody / performance claims | ✅ none present |
| No drop-off confirmation code | ✅ absent from copy and from the status sequence |
| No claim that simulation is live | ✅ labelled on its face |

### ⚠️ One deliberate word deviation: "recorded", not "evidenced"

The brief's supporting language was *"dispatched, tracked, and evidenced"*. This ships as **"dispatched, tracked and recorded"**.

**Why.** Every job demonstrably produces a timestamped record — the tracking surfaces render a tracking code, `Order Placed`, `On Route To Pickup` and `Package Picked Up`. That is verifiable in this repository, so **"recorded" is a statement of fact.** "Evidenced" implies evidentiary weight, and Phase 0's D10 table lists *"Proof-of-delivery evidentiary claims"* as **blocked pending legal review**, with the note that the evidentiary weight is not established.

Shipping "evidenced" would put a blocked claim in the largest sentence on the site. Reverting this is a one-word change once D10 clears. **Flagged for your override if you disagree.**

## 5. CTA destinations

| CTA | Route | Live? |
|---|---|---|
| **Book a delivery** (primary, filled) | `ROUTES.send.href` → `/send` | ✅ `live: true` |
| **Talk to our team** (secondary, ghost) | `ROUTES.contact.href` → `/contact-us` | ✅ `live: true` |

Both resolve from `src/lib/navigation.js`, not hardcoded. **No dead route was created.** No dedicated business-contact page exists, so the secondary CTA uses the most accurate existing route rather than inventing one.

The secondary is a bordered ghost rather than a second filled button: two solid CTAs of equal weight is how a page ends up with no primary action.

## 6. Network visual architecture

**Server-rendered complete, then animated.** The component's initial state is the **final** step of the sequence, so the server emits a finished, meaningful network state in the HTML. Motion is layered on afterwards. That single decision makes both fallbacks work without a second code path:

- **JavaScript disabled** → the complete state remains
- **`prefers-reduced-motion`** → the complete state remains, no interval starts

**No Google Maps.** A real map would put the Maps SDK on the critical path — forbidden by the performance budget — and would be a heavier way to say the same thing. The visual is a schematic SVG: a diagram that is honest about being a diagram, not an imitation of real streets.

**Composition:** a labelled panel header · a faint control-surface grid · the full route at low opacity · the assigned route drawn with `stroke-dashoffset` · pickup circle and destination square · a job marker moved by `transform` · an HTML route line · a dispatch strip (category + caption + status chip) · a four-segment progress bar.

**Animated properties are `transform`, `opacity`, `stroke-dashoffset` and `background-color` only.** No layout-triggering animation. One `setInterval` at 2200 ms; the full cycle runs ~8.8 s.

**Paused when not visible:** the tick is skipped while `document.hidden`, and an `IntersectionObserver` stops advancement once the hero scrolls out of view.

**Place labels moved out of the SVG into HTML.** In-SVG `<text>` scales with the viewBox — a size that read on desktop shrank to about **9 px** inside the 390 px panel, under the design system's 12 px floor and exactly the "cramped map label" the brief rules out. As HTML they are ordinary `text-sm` and identical at every width. **[measured: 0 elements under 12 px in the hero at all four widths]**

## 7. Status model used

**Real, not invented.** Taken from the backend's authoritative `TaskStatusType`, documented at `src/app/track/[trackingCode]/LiveTracking.jsx:14–23`. The full set is:

`pending` · `assigned` · `ongoing` · `awaiting_seller_confirmation` · `awaiting_handoff` · `delivered` · `cancelled` · `failed` · `refunded`

The demonstration walks the **happy path only** — the four states an ordinary job passes through:

| Step | Status | Displayed label | Caption |
|---|---|---|---|
| 1 | `pending` | Pending | Request received |
| 2 | `assigned` | Assigned | Driver assigned |
| 3 | `ongoing` | Ongoing | In transit |
| 4 | `delivered` | Delivered | Completed |

Labels are title-cased exactly as the product renders them, so a viewer who later reaches a real tracking page meets the same vocabulary. The terminal failure states and the two conditional states are real but not part of a representative journey, so they are excluded.

**Two separate progressions**, because they mean different things: the *route* appears on assignment (a plan now exists); the *marker* sits at pickup when assigned, moves while ongoing, and arrives on delivery. An earlier build collapsed these into one value and drew 12% of a route at "Assigned", which implies a trip 12% complete that has not started. Corrected.

**No drop-off-code step**, per Phase 0 — that capability is unverifiable in this repository.

## 8. How simulation is distinguished from live activity

| Safeguard | Implementation |
|---|---|
| Visible label | **"NETWORK DEMONSTRATION"** in the panel header — adjacent to the visual, not a footnote |
| Visible qualifier | **"Sample data"** chip beside it |
| Screen-reader text | *"…This is an illustration, not live customer activity."* |
| No fetching | The component makes **no network request**. Nothing is retrieved |
| Synthetic endpoints | "Downtown" and "North York" — area names, not addresses. No street, no number |
| No names | No customer, driver or business name appears |
| No metrics | No counts, no times, no percentages, no statistics of any kind |
| No fake notifications | No toasts, no "new job" alerts, no counters |
| Real states only | Every status shown exists in the production model (§7) |

## 9. JavaScript boundary details

| | Before | After |
|---|---|---|
| Client islands on `/` | 1 (`HeaderMobileNav`) | **2** (`HeaderMobileNav`, `NetworkDemo`) |
| Homepage-wide client boundary | none | **none** — `page.jsx` and `HeroNetwork` remain server components |
| Route type | `○ (Static)` | **`○ (Static)`** |

Exactly **one** new island, as permitted. `HeroNetwork` is a server component that renders `NetworkDemo` as a child; the boundary is as narrow as the animation requires.

## 10. Bundle size

| Metric | Before (Phase 1) | After (Phase 2) | Δ |
|---|---|---|---|
| `/` route size | 1.17 kB **[measured]** | **2.73 kB** **[measured]** | +1.56 kB |
| **`/` First Load JS** | 100 kB **[measured]** | **102 kB** **[measured]** | **+2 kB** |
| **Shared JS (all routes)** | 87.2 kB **[measured]** | **87.2 kB** **[measured]** | **0** |
| `/legal` | 96 kB | 96 kB | 0 |
| `/medical` | 96 kB | 96 kB | 0 |

**Budget: ≤ 130 kB First Load JS. Actual: 102 kB.** 28 kB of headroom remains.

## 11. Maps and Places requests

| Route | Before | After |
|---|---|---|
| `/` | 0 **[measured]** | **0** **[measured]** |
| `/medical` | 0 | 0 **[measured]** |
| `/legal` | 0 | 0 **[measured]** |
| `/send` | 6–7 (expected — the address flow) | 7 **[measured]** |

**Zero Maps and zero Places requests on initial homepage load. [measured]**

## 12. Accessibility results

Homepage, production build, 1440×900:

| Check | Result |
|---|---|
| `<h1>` count | **1** **[measured]** |
| Landmarks | header / main / nav / footer **[measured]** |
| Skip link | present and functional **[measured]** |
| Interactive elements without focus treatment | **0** **[measured]** |
| Contrast failures | **0** **[measured]** |
| Text below 12 px in the hero | **0** at 390/768/1024/1440 **[measured]** |
| Targets below WCAG 2.5.8 AA | **0** (the 1×1 result is the `sr-only` skip link before focus) **[measured]** |
| Horizontal overflow | **none** at any width **[measured]** |

**The network visual specifically:**

| Requirement | Result |
|---|---|
| SVG hidden from assistive technology | ✅ `aria-hidden="true"`, `focusable="false"` **[measured]** |
| Decorative markers not focusable | ✅ **0** focusable elements inside the visual **[measured]** |
| No disruptive announcements | ✅ **0** `aria-live` regions **[measured]** |
| Meaningful status text available to screen readers | ✅ a static `sr-only` paragraph naming all four states and the four categories **[measured]** |

The status sequence is deliberately **not** announced: a value changing every 2.2 s would talk over the user for as long as the page is open. The `sr-only` paragraph gives the whole story once instead.

Tab order verified: skip link → wordmark → Medical → Legal → Contact → Send a package → **Book a delivery** → **Talk to our team**, every stop with a visible ring. **[measured]**

## 13. Reduced-motion results **[measured]**

| Check | Result |
|---|---|
| Sequence stops | ✅ state identical across a 3-second window |
| Complete state shown | ✅ renders "Delivered" — the finished journey |
| Product visual retained | ✅ SVG present, not removed |
| Explanatory meaning preserved | ✅ route, pins, marker, dispatch strip, all four progress segments |

All transitions additionally carry `motion-reduce:transition-none`, so even the CSS easing is suppressed.

## 14. JavaScript-disabled results **[measured]**

Rendered in a context with `javaScriptEnabled: false`:

| Check | Result |
|---|---|
| Headline | ✅ "Same-day logistics infrastructure for the GTA" |
| Sub-copy | ✅ present |
| Both CTAs | ✅ "Book a delivery", "Talk to our team" |
| Product visual | ✅ SVG present, height > 50 px — **no empty panel** |
| Complete network state | ✅ full route, marker at destination, "Delivered" |
| Demonstration labelling | ✅ "Network demonstration" + "Sample data" both present |

Screenshot: `hero-js-disabled.png`. The no-JS state is arguably the *clearest* frame — a finished journey rather than a mid-step.

## 15. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Contrast | Notes |
|---|---|---|---|---|---|
| `/` | 200 | 1 | **0** | **0 fails** | skip link ✅, 0 focus gaps, CLS 0.0001 |
| `/medical` | 200 | 1 | **0** | 12 *(known false positives)* | unchanged from Phase 1 |
| `/legal` | 200 | 1 | **0** | 0 | CLS **0** across 3 clean runs |
| `/send` | 200 | 1 | **0** | 2 *(pre-existing, R2/R3)* | Maps 7 — expected |
| `/track/[code]` | 200 | 1 | **0** | 0 | unaffected |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 | unaffected |

**A CLS note, recorded honestly.** The first sequential audit pass reported `/legal` CLS at **0.2234**. Re-measured in isolation across three clean runs it is **0** — the figure was an artifact of navigating six routes in one browser context, not a real shift. Phase 2 touched no file that `/legal` consumes. Homepage CLS is stable at **0.0001** across three runs (Phase 1 measured 0.0059; the hero no longer loads a large photograph).

**No CLS regression. [measured]**

## 16. Screenshots captured

In `scratchpad/phase2/`:

| File | Content |
|---|---|
| `hero-before-390/768/1024/1440.png` | Baseline hero, pre-change |
| `hero-after-390/768/1024/1440.png` | Final hero |
| `hero-reduced-motion.png` | `prefers-reduced-motion: reduce` |
| `hero-js-disabled.png` | JavaScript disabled |
| `hero-cta-focus.png` | Keyboard-focused primary CTA |
| `hero-sequence-frame.png` | One complete frame mid-sequence |

### Geometry comparison **[measured]**

| Width | Hero before | Hero after | Screens after |
|---|---:|---:|---:|
| 390 | 617 px | **1,030 px** | 1.22 |
| 768 | 622 px | **1,113 px** | 1.09 |
| 1024 | 520 px | **767 px** | 0.85 |
| 1440 | 520 px | **675 px** | 0.75 |

No horizontal overflow at any width.

## 17. Five-second internal review

**This is an internal structured design review, not a user test. No participants were recruited. The formal five-second test in `HOMEPAGE.md` has NOT been run and must not be reported as passed.**

Reviewed against the five questions, from the first screen only:

| Question | Desktop (1440) | Mobile (390) |
|---|---|---|
| **1. What does this company do?** | Software that coordinates same-day deliveries — headline says "infrastructure", panel shows a job moving through states | Same, from copy alone; the panel is only partly in the first screen |
| **2. Courier, platform, or something else?** | **Platform.** No vehicle, no parcel, no price. Dispatch panel and status vocabulary are software signals | **Platform**, but on weaker evidence — carried by the word "infrastructure" |
| **3. Who is the customer?** | Two doors are legible: "Medical · Legal · Business · Parcel" reads B2B-first; primary CTA self-serve, secondary sales | Same |
| **4. What action next?** | "Book a delivery" is visually primary | Same, full-width and prominent |
| **5. What drove the conclusion?** | The word "infrastructure"; the dispatch panel; Pending/Assigned/Ongoing/Delivered; the *absence* of price and vehicle imagery | Headline and category row |

**Honest weaknesses found:**

1. **The demo shows one job, not a network.** It communicates *coordination* well and *scale* not at all. A single route reads as "a delivery", where "network" implies concurrency. The strongest available improvement, and it does not require fake data — additional schematic nodes are diagram elements, not claimed jobs.
2. **"Business" is the weakest category label** beside Medical, Legal and Parcel, which name concrete things. It is vague.
3. **"Infrastructure" is asserted, not evidenced.** There is no operational proof on the page yet — that is Phase 3's job, and until it lands the headline is a claim the first screen does not substantiate.
4. **On mobile the product visual is largely below the fold.** The hero is 1.22 screens, so the panel's top edge appears but the sequence does not. The mobile five-second read rests on copy.
5. **Mobile hero grew 67%** (617 → 1,030 px). Justified by adding a product visual that did not previously exist, but it is real added scroll before the rest of the page.

**Conclusion:** the internal review supports that the hero now reads as a technology platform rather than a courier. It does **not** establish that ≥80% of real first-time participants would say so. That requires the actual test.

## 18. Deviations from the implementation plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **"recorded" instead of "evidenced"** | "Evidenced" is a D10-blocked evidentiary claim; "recorded" is verifiable in-repo today. §4 |
| 2 | **Component named `NetworkDemo`, not `NetworkCanvas`** | It is SVG, not canvas. The plan explicitly offered its names as proposals |
| 3 | **No separate static poster asset** | The plan proposed `next/dynamic` + a poster image. Rendering the island's *final state* on the server achieves the same fallback with no second asset, no dynamic import and no flash. Simpler and strictly better |
| 4 | **Place labels in HTML, not SVG** | In-SVG text scaled to ~9 px on mobile, under the 12 px floor |
| 5 | **Route and marker progress split** | Collapsing them misrepresented what "Assigned" means |

## 19. Remaining issues

| # | Item | Status |
|---|---|---|
| R1 | `/medical` + `/legal` page-local CTAs lack focus rings (5 and 4) | Carried from Phase 1, still out of scope |
| R2 | `/send` helper text 3.51:1 | Carried from Phase 1 |
| R3 | `/send` disabled "Continue" 2.43:1 | WCAG-exempt, not a defect |
| R4 | `/send`, `/track*` have no skip link / `<main>` | Own layouts, pre-existing |
| R5 | **LCP / FCP still [not captured]** | Headless environment does not report paint timings |
| R6 | 4 images above the 200 kB source ceiling | Awaiting your downscaling decision |
| R7 | Sub-44 px targets (AAA) | AA met everywhere |
| R8 | **Demo shows one job, not concurrency** | New — see §17 |
| R9 | **Mobile hero at 1.22 screens** | New — see §17 |
| R10 | **Formal five-second test not run** | Requires real participants |

## 20. Acceptance criteria

| Criterion | Status |
|---|---|
| Zero Maps or Places requests on initial homepage load | ✅ **0 / 0** **[measured]** |
| First Load JS within budget | ✅ **102 kB** vs ≤ 130 kB **[measured]** |
| No homepage-wide client boundary | ✅ `page.jsx` and `HeroNetwork` remain server components |
| At most one new client island | ✅ exactly **1** (`NetworkDemo`) |
| JavaScript-disabled fallback complete | ✅ **[measured]** |
| Reduced-motion fallback complete | ✅ **[measured]** |
| No material CLS regression | ✅ home 0.0001, `/legal` 0 **[measured]** |
| No console errors | ✅ **0** on all six routes **[measured]** |
| No accessibility regression | ✅ 0 contrast fails, 0 focus gaps, 1 h1, landmarks intact **[measured]** |
| All listed routes pass regression | ✅ **6/6**, HTTP 200 **[measured]** |
| Production build passes | ✅ **[measured]** |
| Homepage remains static | ✅ `○ (Static)` **[measured]** |
| Lint passes | ✅ no warnings or errors **[measured]** |

**Phase 2 meets its acceptance criteria.**

**Performance is stated conservatively:** homepage JS increased by 2 kB (the island). Homepage CLS improved from 0.0059 to 0.0001, which the measurements do support. **No LCP claim is made — LCP was not captured.**

## 21. Phase 3

**Phase 3 has not begun.** No operational proof bar, no platform showcase, no regulated-vertical redesign, no trust section, no consumer booking form, no address inputs, no Places autocomplete, no price estimation, no `/send` handoff, no reviews or partner movement, no chain-of-custody artifact, no integrations, no new compliance claims, no driver recruitment, no footer restructuring, and no section reordering beyond replacing the hero.

---

# Phase 2.1 Refinement

> Resolves weaknesses **R8** (the demonstration showed one job) and **R9** (the mobile hero was 1.22 viewports) from §17/§19 above. Architecture unchanged: `HeroNetwork` stays server-rendered, `NetworkDemo` remains the only client island, no Maps, no Places, no animation library, no new island.

## Files modified

| File | Change |
|---|---|
| `src/components/home/HeroNetwork.jsx` | Mobile padding and rhythm; category row removed; secondary CTA treatment |
| `src/components/home/NetworkDemo.jsx` | Dispatch queue added; specific category labels; diagram cropped; redundant caption removed |
| `docs/HOMEPAGE_PHASE_2_REPORT.md` | This section |

No other file touched. No shared component, no config.

## Mobile height change

| Width | Phase 2 | Phase 2.1 | Δ |
|---|---:|---:|---:|
| **390** | **1,030 px (1.22 screens)** | **835 px (0.99 screens)** | **−195 px, −19%** |
| 768 | 1,113 px | 1,055 px | −58 px |
| 1024 | 767 px | 714 px | −53 px |
| 1440 | 696 px | 696 px | 0 |

**The 390 hero is now 0.99 of a viewport** — the target was "approximately one". At 1440 the height is unchanged: the queue rows added roughly what the removed category row saved.

### Where the 195 px came from

| Change | Saving |
|---|---:|
| Category row removed (redundant — see below) | ~52 px |
| Section padding `py-16` → `py-10` while stacked | 48 px |
| Sub-copy `text-lg` → `text-base` below sm (4 lines → 3) | ~35 px |
| Secondary CTA: bordered button → text action below sm | ~24 px |
| Diagram viewBox cropped 240 → 210 units (empty band) | ~22 px |
| Panel padding `p-5` → `p-4`, grid gap `10` → `7`, misc rhythm | ~30 px |
| Dispatch queue added (two rows) | **+56 px** |

**Nothing was achieved by shrinking text below the design-system minimum, truncating the proposition, hiding the visual, or removing a CTA.** Measured: **0 elements under 12 px** in the hero at all four widths.

### What is inside the first 390 px viewport **[measured]**

Druppr wordmark · **complete H1** · **complete supporting statement** · **Book a delivery** · **Talk to our team** · **Product demonstration** · **Sample data** · **Medical specimen** · **Assigned** · **Downtown → North York** · **Legal filing**

Panel **95% visible**, route diagram **100% visible**.

## CTA layout change

| | Below `sm` | `sm` and up |
|---|---|---|
| **Book a delivery** | Full-width filled brand-600 button | Auto-width filled button |
| **Talk to our team** | Underlined text action, `min-h-11`, no border | Bordered ghost button |

The primary remains visually dominant at every width. The secondary keeps a **44 px minimum target** (`min-h-11`) and its **focus ring is unchanged** — verified: focused hero CTA reports `ring: true`, `href="/send"`. Gap between the two tightened from `3.5` to `1` while stacked, since a text action does not need button-sized separation.

## Network density change

The panel now shows **one animated job above a two-row queue**:

```
Medical specimen                    [Assigned]
Downtown → North York
▬▬▬▬ ▬▬▬▬ ──── ────
─────────────────────────────────────────────
Legal filing                         Assigned
Business delivery                     Pending
```

- **One orchestrated motion sequence** — unchanged. The queue rows are **inert and muted** (`text-white/50`), so they read as other work in the system rather than a second animation.
- Queue categories are taken from the rotation **after** the active one, so no job is ever listed twice and the visible set changes as the primary cycles — breadth without added motion.
- Queue statuses are **fixed per slot** (`Assigned`, `Pending`), both real values from the production model.
- Three of four categories are on screen at once, never all four — the panel would crowd.

This is the change that moves the panel from *"we track a delivery"* to *"several kinds of job run on one system"*.

## Category label changes

| Phase 2 | Phase 2.1 |
|---|---|
| Medical | **Medical specimen** |
| Legal | **Legal filing** |
| Business | **Business delivery** |
| Parcel | **Same-day parcel** |

`Business` was the weakness named in §17 — a taxonomy label beside three concrete nouns. **`Business delivery`** was chosen over `Scheduled business route`: a business booking a delivery is plainly true, whereas "scheduled route" asserts a scheduling product this repository cannot evidence.

Panel label also changed from `Network demonstration` to **`Product demonstration`**, matching the brief's wording.

### One redundancy removed

The visible step caption was dropped from the primary row. It read `Downtown → North York · Driver assigned` beside a chip reading **Assigned** — a restatement that also wrapped badly at 390. The chip carries the product's own vocabulary and survives; the captions remain in the data and now surface in the screen-reader description, where the plain-English gloss is genuinely useful (*"Assigned — driver assigned"*).

Likewise the standalone category row was removed from the hero: it listed `Medical · Legal · Business · Parcel` four lines under a sentence already reading *"Specimens, filings, business deliveries and parcels"*, and Phase 2.1 puts the same categories a third time in the queue — where they are attached to actual jobs.

## Bundle measurements **[measured]**

| Metric | Phase 2 | Phase 2.1 | Budget |
|---|---:|---:|---|
| `/` route size | 2.73 kB | **2.86 kB** | — |
| **`/` First Load JS** | 102 kB | **102 kB** | ≤ 130 kB ✅ |
| **Shared JS** | 87.2 kB | **87.2 kB** | ~87.2 kB ✅ |
| Route type | `○ (Static)` | **`○ (Static)`** | static ✅ |
| Client islands on `/` | 2 | **2** | no new island ✅ |

## Maps and Places **[measured]**

| Route | Requests |
|---|---|
| `/` | **0** |
| `/medical` | 0 |
| `/legal` | 0 |
| `/send` | 7 (expected — the address flow) |

## Accessibility results **[measured]**

| Check | Result |
|---|---|
| `<h1>` count on `/` | **1** |
| Landmarks | header / main / nav / footer |
| Interactive elements without focus treatment | **0** |
| Contrast failures | **0** |
| Text below 12 px in the hero | **0** at all four widths |
| `aria-live` regions in the hero | **0** |
| SVG hidden from AT | ✅ `aria-hidden="true"` |
| Focusable elements inside the visual | **0** |
| Horizontal overflow | none at any width |
| Focused hero primary CTA | ring present, `href="/send"` |

The screen-reader description now includes the queue and the plain-English step glosses, still as a single static paragraph — no announcement on transition.

## Reduced-motion results **[measured]**

| Check | Result |
|---|---|
| Sequence stops | ✅ state identical across 3 seconds |
| Complete state shown | ✅ "Delivered" |
| Secondary jobs shown | ✅ queue present, no cycling |
| Product visual retained | ✅ |

## JavaScript-disabled results **[measured]**

| Check | Result |
|---|---|
| Headline / sub-copy | ✅ both present |
| Both CTAs | ✅ "Book a delivery", "Talk to our team" |
| Complete route + final status | ✅ "Delivered" |
| Secondary jobs | ✅ queue rendered |
| Demonstration labelling | ✅ "Product demonstration" + "Sample data" |
| Panel not empty | ✅ diagram 247 px tall |

## Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | CLS | Notes |
|---|---|---|---|---|---|
| `/` | 200 | 1 | **0** | **0** | 0 contrast fails, 0 focus gaps, 0 Maps |
| `/medical` | 200 | 1 | **0** | 0.0067 | 12 known false positives, 5 pre-existing focus gaps (R1) |
| `/legal` | 200 | 1 | **0** | 0 | 4 pre-existing focus gaps (R1) |
| `/send` | 200 | 1 | **0** | 0 | 2 pre-existing (R2/R3) |
| `/track/[code]` | 200 | 1 | **0** | 0 | unaffected |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 | unaffected |

**No CLS regression** — homepage CLS is now **0** (was 0.0001).

## Screenshots captured

`p21-after-390.png` · `p21-after-390-full.png` · `p21-after-768.png` · `p21-after-1024.png` · `p21-after-1440.png` · `p21-reduced-motion.png` · `p21-js-disabled.png` · `p21-cta-focus.png` · `p21-active-frame.png`, alongside the Phase 2 `hero-before-*.png` baselines.

## Remaining weaknesses

| # | Item | Status |
|---|---|---|
| R8 | Demo showed one job | ✅ **resolved** — queue added |
| R9 | Mobile hero 1.22 screens | ✅ **resolved** — 0.99 screens |
| **R11** | **768 px hero is 1.03 screens** | New. The stacked layout runs to `lg`, so a tablet gets the mobile stack at a larger type scale. Not a defect, but 768 is now the tallest relative hero |
| R5 | LCP / FCP still not captured | Unchanged — environment limitation |
| R6 | 4 images above the 200 kB ceiling | Unchanged — awaiting downscaling decision |
| R10 | **Formal five-second test not run** | Unchanged. The internal review in §17 is not a substitute, and its conclusions were not re-run for 2.1 |
| R1–R4, R7 | Pre-existing, out of scope | Unchanged |

**"Infrastructure" is still asserted rather than evidenced.** Phase 2.1 improves how coordination *reads*; it adds no proof, because adding metrics is Phase 3's job and Phase 0 gates them. That weakness is unresolved by design.
