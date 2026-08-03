# Homepage Phase 3 — Operational Proof

> **Status: Phase 3 complete, awaiting approval. Phase 4 has not begun.**
>
> Measurement labels as in earlier phases: **[measured]** from a production build, **[observed]** confirmed manually, **[not captured]** unavailable in this environment. Nothing is estimated.
>
> Branch: `homepage-redesign`. Nothing pushed, nothing merged.

---

## 1. Founder confirmations received

All three metrics were confirmed before any code was written. Phase 3 was **held at its stop condition** for one round until they arrived — the values had been named in earlier phases, but the definitions, dates and sources had not, and those determine what the numbers mean.

| | Confirmed |
|---|---|
| **Approver** | Abdul, Founder of Druppr/LegalDrop |
| **Approval date** | 2026-08-03 |
| **Accurate as of** | 2026-08-03 |
| **Next review** | 2026-11-03, or before the next public homepage release, whichever comes first — and immediately if a figure changes |

## 2. Exact metrics published

| Value | Label |
|---|---|
| **50+** | Completed deliveries |
| **5** | Business partners |
| **5** | Onboarded GTA drivers |

Plus one framing line: **"Accurate as of August 2026."**

**Sentence case, not Title Case.** The confirmation wrote the public labels headline-style (`50+ Completed Deliveries`), but the same brief's *Copy principles* section lists them in sentence case, and `VISION.md` → Design Philosophy specifies sentence case throughout. Identical words; house capitalisation.

Month precision on the date, not the day: the figures are not recomputed daily, and a date that ages by the day invites a reader to notice staleness a month does not.

## 3. Definitions used

**Completed deliveries — "50+"**
A delivery request that was accepted, physically carried out, delivered to its intended destination, and recorded as completed in operational records.
*Excludes* cancelled, test, internal demonstration and duplicate records. A refunded job **may** still count if it was physically completed — a refund does not reverse operational completion — but a refunded job that was cancelled or never completed is excluded.
**Must not** be described as current delivery volume, monthly volume, or citywide network density.

**Business partners — "5"**
Businesses with which Druppr has an established working relationship through completed deliveries, an active pilot, an ongoing service arrangement, or an approved logistics collaboration. May include early customers and pilots. **Does not** mean all five are recurring enterprise accounts or signed long-term contracts.
**Must not** be relabelled "enterprise clients", "recurring accounts", "trusted by five companies", or "contracted customers". No names or logos — no written permission exists.

**Onboarded GTA drivers — "5"**
A driver who completed onboarding, submitted the required driver and vehicle information, was reviewed or approved by Druppr, and became eligible to receive delivery requests in the GTA.
**Does not imply** daily activity, availability on any given day, that a delivery has been completed, or employment by Druppr.
**Must not** be relabelled "active drivers", "drivers on the road", "full-time drivers", or "fleet drivers".

## 4. Accurate-as-of dates

All three: **2026-08-03**. Displayed publicly as *"Accurate as of August 2026."*

## 5. Evidence source per figure

| Metric | Source |
|---|---|
| Completed deliveries | Druppr/LegalDrop delivery records, completed-order history, manual operational reconciliation |
| Business partners | Business correspondence, delivery records, pilot arrangements, partnership records, founder-maintained customer records |
| Onboarded GTA drivers | Driver onboarding records, submitted documentation, approval records, founder-maintained driver roster |

## 6. Section type shipped

**A standalone three-metric operational proof section**, per the Phase 0 rule with all three metrics confirmed. The two-metric fallback was not needed and the three-metric gate was not weakened.

## 7. Files modified

| File | Change |
|---|---|
| `src/components/home/OperationalProof.jsx` | **new** — the section |
| `src/app/(main)/page.jsx` | one import + one element + a comment |
| `docs/HOMEPAGE_PHASE_3_REPORT.md` | **new** — this document |

No other application file touched. No shared component, no config, no section reordered.

## 8. Components created

**`OperationalProof.jsx` — server component, zero client JavaScript.** A `<section aria-labelledby>` containing an `<h2>`, an as-of line, and a `<dl>` of three term/value pairs.

**Provenance lives in the file.** A structured `METRICS` array supplies only `value` and `label`; a header comment block carries the full audit trail per metric — definition, exclusions, source, approver, approval date, as-of date, next review date, and the explicit *must not be relabelled* constraints. There are no unexplained magic numbers. Because it is a server component, none of that reaches the browser bundle.

## 9. Section placement

**Immediately after the hero**, before the conditional Reviews section.

```
HeroNetwork  →  OperationalProof  →  [Reviews]  →  Services  →  How it works
             →  Medical  →  Legal  →  Why Druppr  →  Coverage  →  BecomeADriver
```

Nothing else moved. Section order is otherwise byte-identical to Phase 2.1.

## 10. Visual design decisions

- **Continues the hero's ground** (`surface-ink`) rather than introducing a third surface in four sections. Hero and evidence read as one console: the claim, then what backs it.
- **Hairline on the content column**, not full-bleed — a dashboard divider, not a page seam.
- **Large tabular numerals** (`font-display`, `tabular-nums`, 38px mobile / 48px from sm) over short labels. The h1 is 60px, so the numerals stay subordinate and do not compete with the hero.
- **Three columns at every width.** The values are two or three characters and never wrap; labels wrap to two lines at 390 without crowding, which costs less vertical space than stacking.
- **No decoration**: no illustration, no photography, no icons, no gradient, no "live" indicator, no animated background, no counter.
- **Restraint over drama.** Section height is **251 px at 390** and **259 px** at every larger width — deliberately shallow so it reads as a factual strip rather than a claim to scale.
- **`py-10 sm:py-12`**, tighter than the site's `py-16 sm:py-24` rhythm, specifically because the hero above it already runs ~1.0–1.03 viewports at 390 and 768.

## 11. Client-side JavaScript added

**None.** The section is a server component and ships as HTML.

**Count-up animation was considered and rejected**, per the brief's default recommendation. Animating 50 up from 0 makes a modest true number perform as though it were a large one — the opposite of this section's purpose — and it would have cost a second client island. A static proof section is preferable to unnecessary JavaScript.

## 12. Bundle measurements **[measured]**

| Metric | Phase 2.1 | Phase 3 | Δ |
|---|---:|---:|---:|
| `/` route size | 2.86 kB | **2.86 kB** | **0** |
| **`/` First Load JS** | 102 kB | **102 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| Route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| Client islands on `/` | 2 | **2** | **0 added** |

## 13. Maps and Places requests **[measured]**

| Route | Requests |
|---|---|
| `/` | **0** |
| `/medical` | 0 |
| `/legal` | 0 |
| `/send` | 7 (expected — the address flow) |
| `/track/[code]`, `/track-partner/[token]` | 0 |

## 14. Accessibility results **[measured]**

| Check | Result |
|---|---|
| Semantic section heading | `<h2 id="operational-proof">`, section `aria-labelledby` matches |
| Heading order on `/` | `H1 H2 H2 H2 H2 H2 H2` — no skips |
| `<h1>` count | 1 |
| Structure | `<dl>` with **3 `<dt>` / 3 `<dd>`** |
| Linear reading order | *"Completed deliveries \| 50+ \| Business partners \| 5 \| Onboarded GTA drivers \| 5"* — each pair reads as a sentence |
| Information conveyed by layout alone | none — every value has a programmatic label |
| `aria-live` | **0** (correct: these are static) |
| Focusable elements in the section | **0** |
| Text below 12 px | **0** at all four widths |
| Numbers wrapping | **0** at all four widths |
| Horizontal overflow | none at any width |

**Contrast, composited over `rgb(26,20,33)` [measured]:**

| Element | Alpha | Ratio | Required | |
|---|---|---:|---|---|
| `h2` heading, 14 px | 0.7 | **9.20:1** | 4.5 | ✅ |
| As-of line, 14 px | 0.6 | **7.05:1** | 4.5 | ✅ |
| `dt` labels, 14 px | 0.7 | **9.20:1** | 4.5 | ✅ |
| `dd` numerals, 48 px | 1.0 | **18.01:1** | 3 | ✅ |

*A note on method:* my first probe reported 18.01:1 for all four because it read `rgba(...)` without compositing the alpha. Re-measured with proper compositing — the corrected figures are above. Every pair still passes with margin, but the first numbers were wrong and are not the ones recorded here.

**DOM order is `<dt>` then `<dd>`** so the reading order is a sentence; `flex-col-reverse` puts the numeral on top visually without disturbing it. Layout does not carry meaning.

## 15. Reduced-motion results **[measured]**

| Check | Result |
|---|---|
| Content identical across 2.5 s | ✅ |
| All three values present | ✅ |
| Same final information as default | ✅ — there is no other state; nothing animates |

## 16. JavaScript-disabled results **[measured]**

| Check | Result |
|---|---|
| Heading | ✅ "Operational record" |
| As-of line | ✅ present |
| Values | ✅ `50+`, `5`, `5` |
| Labels | ✅ all three, complete |

Identical to the JavaScript-enabled render, because the values are literals in the server HTML.

## 17. CLS results **[measured]**

| Width | Phase 2.1 | Phase 3 |
|---|---:|---:|
| 390 | 0.0007 | **0.0008** |
| 768 | 0.0002 | **0.0003** |
| 1024 | 0.0002 | **0.0002** |
| 1440 | 0.0001 | **0.0001** |

**No CLS regression.** All values are ~60× inside the 0.05 budget.

## 18. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps | CLS |
|---|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 | 0.0001 |
| `/medical` | 200 | 1 | **0** | 0 | 0 |
| `/legal` | 200 | 1 | **0** | 0 | 0 |
| `/send` | 200 | 1 | **0** | 7 (expected) | 0 |
| `/track/[code]` | 200 | 1 | **0** | 0 | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 | 0 |

Page scroll height grew by the section's own height only: 390 `7,184 → 7,520`, 1440 `4,920 → 5,179`.

## 19. Screenshots captured

In `scratchpad/phase3/`:

| File | Content |
|---|---|
| `p3-before-390/768/1024/1440.png` | Full-page baseline, pre-change |
| `p3-after-390/768/1024/1440.png` | Hero → proof transition |
| `p3-js-disabled.png` | JavaScript disabled |
| `p3-reduced-motion.png` | `prefers-reduced-motion: reduce` |

## 20. Deviations from the implementation plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **Sentence case labels**, not the Title Case in the confirmation | The brief's own *Copy principles* examples are sentence case, and `VISION.md` requires it. Same words |
| 2 | **Section ground is `surface-ink`**, not a light surface | Continues the hero rather than adding a third ground in four sections; supports the "one console" reading. The plan did not specify a ground |
| 3 | **Public as-of line added** | The plan required an *internal* as-of date; `HOMEPAGE.md` → Operational Proof separately requires a published metric to carry its window. Both satisfied: full date internally, month publicly |
| 4 | **No count-up** | The brief's default recommendation, taken deliberately rather than by omission — see §11 |

## 21. Remaining weaknesses

| # | Item | Status |
|---|---|---|
| **W1** | **"50+" is a floor, not a count.** It is honest and confirmed, but a reader cannot tell whether it means 51 or 500. A precise number would be stronger evidence — worth revisiting when the figure is large enough to state exactly | New |
| **W2** | **Three numbers, three different units, one date.** Deliveries are cumulative; partners and drivers are point-in-time roster counts. The single "Accurate as of" line is true for all three but flattens that distinction | New |
| **W3** | **No source is visible to the reader.** The provenance is thorough in the repository and invisible on the page. Enterprise buyers may want a "how we count" note; that is a Phase 6 trust-section question, not this section's | New |
| R5 | LCP / FCP still **[not captured]** | Unchanged — environment limitation |
| R6 | 4 images above the 200 kB source ceiling | Unchanged — awaiting downscaling decision |
| R10 | **Formal five-second test not run** | Unchanged. No participants recruited in any phase |
| R11 | 768 hero at 1.03 viewports | Unchanged |
| R1–R4, R7 | Pre-existing, out of scope | Unchanged |

## 22. Acceptance criteria

| Criterion | Status |
|---|---|
| Homepage remains statically rendered | ✅ `○ (Static)` **[measured]** |
| Shared JS ≈ 87.2 kB | ✅ **87.2 kB, unchanged** **[measured]** |
| First Load JS does not materially exceed 102 kB | ✅ **102 kB, unchanged** **[measured]** |
| No new Maps or Places requests | ✅ **0 on `/`** **[measured]** |
| No new client island | ✅ **0 added** — zero client JS |
| No material CLS regression | ✅ **[measured]** |
| No console errors | ✅ **0 on six routes** **[measured]** |
| Production build passes | ✅ **[measured]** |
| Lint passes | ✅ **[measured]** |
| Metrics factual, current, sourceable, modest | ✅ all three founder-confirmed with definitions |
| Capability claims kept out | ✅ no App Store/Play, tracking, vehicle types, coverage, "fast/reliable/same-day" |

**Phase 3 meets its acceptance criteria.**

Nothing was published that implies citywide scale, enterprise dominance, thousands of deliveries, active delivery density, guaranteed availability, live network volume, regulated compliance, or medical/legal credentials.

## 23. Phase 4

**Phase 4 has not begun.** No platform showcase, no regulated-vertical redesign, no trust and compliance section, no consumer booking form, no reviews or partner movement, no chain-of-custody artifact, no integrations, no App Store or Google Play badges, no customer logos, no testimonials, no case studies, no insurance/TDG/PHIPA/security/SLA claims, no address inputs, no price calculation, no driver recruitment, no footer restructuring, and no broader motion work.
