# Homepage Phase 6 — Trust and Accountability

> **Status: Phase 6 complete, awaiting approval. Phase 7 has not begun.**
>
> **[measured]** from a production build, **[observed]** confirmed manually.
> Nothing estimated. Branch `homepage-redesign`; three commits, nothing pushed,
> nothing merged. Claim decisions from Phases 4.1–4.3 are binding and none was
> reopened.

---

## 1. Preflight results **[measured]**

| Check | Result |
|---|---|
| Branch | `homepage-redesign` |
| Working tree | clean |
| Phase 5 commits `fb8f25e` `a3d2440` `c1e8a92` `067740f` `d3ab92f` `cdb7685` | all present |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled successfully |

**Baseline:**

| Metric | Value |
|---|---|
| `/` route type | `○ (Static)` |
| `/` route size · First Load JS | 2.46 kB · **102 kB** |
| Shared JS | **87.2 kB** |
| Client islands on `/` | ⚠️ **1 reachable (`HeaderMobileNav`) — WRONG, see note below** |

> ⚠️ **SUPERSEDED BY PHASE 7 — the island count in this report is wrong
> throughout.** It records 1; the correct figure at Phase 6 was **2**
> (`HeaderMobileNav` and `NetworkDemo`, added in Phase 2). `NetworkDemo` was
> simply missed. Corrected in `HOMEPAGE_PHASE_7_REPORT.md` §19. Every "1" in the
> island rows of this document should be read as "2".
>
> Running total for the record: Phase 1 **1** · Phase 2 **2** · Phases 3–6 **2**
> · Phase 7 **3** (`HeroAddressEntry`) · Phase 8 **4** when four or more reviews
> render (`ReviewMotion`), otherwise 3. Phase 9 verified 3 on the live page and
> 4 with reviews, and records that 4 now exceeds both documented ceilings — see
> `HOMEPAGE_PHASE_9_REPORT.md`.
| Maps / Places on `/` | **0 / 0** |
| CLS (3 isolated runs) | 0.0001 · 0.0001 · 0.0001 |
| Homepage height | 390 **6,493** · 768 6,219 · 1024 4,558 · 1440 **4,571** |
| Mobile screens (844 px) | **7.69** |
| Section order | Hero → Operational proof → Platform showcase → *(Reviews)* → Medical → Legal → **Why Druppr** → **Coverage** |
| Reviews **with** data | renders after the showcase |
| Reviews **`null`** | `showReviews = reviews !== null && reviews.totalCount > 0`; section simply absent — no skeleton, no placeholder |

---

## 2. Existing trust-content audit

| Statement / section | Classification | Outcome |
|---|---|---|
| `HOME_REASONS` — "Same-day delivery / Request and track a delivery through one platform" | **accurate but duplicated** — the hero already says "dispatched, tracked and recorded"; showcase frame 1 shows the request | removed from `/` |
| `HOME_REASONS` — "Live tracking / A map link for you and your recipient" | **accurate but duplicated** — showcase frame 2 is the tracking surface | removed from `/`; the idea returns, worded more precisely, as pillar 1 |
| `HOME_REASONS` — "Vehicle options for every delivery" | **unique and useful**, but **better placed elsewhere** — the medical vertical frame now carries a Vehicle field, and `/medical`'s reason grid carries all six names | removed from `/`; retained on `/medical` |
| `HOME_REASONS` — "Recorded delivery / Timestamped status from request through completion" | **duplicated** — the legal vertical frame *is* a timestamp trail and showcase frame 3 is a delivery record | removed from `/`; returns as pillar 2, using the product's own labels |
| `Coverage` — "Now serving Toronto and the GTA" | **service-area information** | **retained**, as one line in the new section |
| `Coverage` — eight-neighbourhood list | **generic table stakes / actively harmful** — `HOMEPAGE.md`: "a local-services SEO pattern and the single strongest small-business signal available" | removed from `/` |
| `Coverage` — 377 kB Bay Street photograph | **better placed elsewhere** — decorative on a page whose argument is software | removed from `/` |
| `OperationalProof` — 50+ / 5 / 5, as of August 2026 | **operational proof** | untouched; **not repeated** in the new section |
| `PlatformShowcase` — three frames | **product proof** | untouched |
| Medical / legal vertical frames | **product proof** | untouched |
| `Reviews` | consumer social proof, conditional | untouched |
| Footer support + contact | contact route, live | referenced by the closing CTA |

**One item flagged, not changed.** `PlatformShowcase` frame 2's caption reads
*"The sender, the business and the recipient follow the same job on one shared
tracking link."* The link being public and shareable is verifiable; **the product
delivering it to the recipient is not** — there is no notification code in this
repository. The caption is defensible as written (they *do* follow one link, if
it is shared) but it is the loosest phrasing of this fact on the site, and the
new pillar deliberately words it tighter. Recorded for a future pass rather than
edited, since Phase 6 scopes `PlatformShowcase` to audit only.

## 3. Content retained

Service area (one line, read from `SERVICE_AREA`), the tracking/record ideas
re-expressed against verified fields, and the segmented dual CTA. Everything in
`OperationalProof`, `PlatformShowcase`, both verticals and `Reviews` is
untouched.

## 4. Content removed

The homepage rendering of `WhyBrand` (four table-stakes cards) and of `Coverage`
(service line + neighbourhood list + photograph). **Both are the two sections
`HOMEPAGE.md` → Homepage Narrative rules out by name.**

⚠️ **Neither component was deleted or modified.** `/medical` and `/legal` each
render `WhyBrand` with their own reasons and `Coverage` without an image. Only
the homepage's two call sites went. `Coverage`'s early-return branch is
load-bearing for those pages' RSC payloads; its now-unused image branch is left
in place rather than pruned, because removing it would mean restructuring a
component both B2B pages depend on. `HOME_REASONS` stays in `WhyBrand.jsx` as
rollback content **and as the record of the claim history written against each
card in Phases 4.1–4.2** — deleting it would delete that record.

**Verified unaffected [measured]:** `.next/server/app/medical.html` and
`legal.html` are **byte-identical** before and after — same length, single
difference, and that difference is the per-build `buildId`, which changes on
every build regardless of content. Asset hashes normalised alongside it.

## 5. `Why Druppr` replacement · 6. `Coverage` replacement

Both are replaced by one section, `home/TrustAndAccountability.jsx`.

## 7. Final trust-section copy

> ⚠️ **Pillar 1 below was superseded by Phase 6.1** — see that section at the
> foot of this document. It now reads **"Tracking access without an account /
> Open the delivery from its tracking link and share that access with the people
> who need status visibility."** The copy shown here is what Phase 6 shipped.

> **ACCOUNTABILITY BUILT IN**
>
> **Know where the delivery stands**
>
> Every job runs on one tracked record — open from a link, timestamped as it
> moves, and retrievable once it is done.
>
> ---
> **One link, no login**
> Tracking opens from the link alone, so anyone you share it with can follow the
> same job.
>
> **Status recorded as the job moves**
> Order placed, on route to pickup, package picked up and delivered — each one
> timestamped as it happens.
>
> **A record you can return to**
> Delivery information can be retrieved using its tracking code.
>
> ---
> **Now serving Toronto and the GTA**   *[Book a delivery] [Talk to our team]*

## 8. Evidence supporting every statement

| Statement | Evidence |
|---|---|
| "Tracking opens from the link alone" | `/track/[trackingCode]` fetches `${API_BASE_URL}/public/track/{code}`; `/track-partner/[trackingToken]` fetches `/public/track-partner/{token}`. **No session, cookie, `Authorization` header or login gate exists in either route.** The sender receives the code at `send/pay/page.jsx:510` and a link at `:515` |
| "anyone you share it with" | follows from the public endpoint above |
| "Order placed, on route to pickup, package picked up and delivered" | `track/[trackingCode]/page.jsx:149–163` renders Order Placed (`createdAt`), On Route To Pickup and Package Picked Up; `delivered` is a value of the 9-value `TaskStatusType`, `LiveTracking.jsx:14–23`. **The product's own labels, verbatim** |
| "each one timestamped as it happens" | each of those fields renders through `formatDate` as a date and time |
| "can be retrieved using its tracking code" | the tracking page is keyed on the code in the URL and re-fetches per request (`cache: 'no-store'`, `page.jsx:67`) |
| "Now serving Toronto and the GTA" | `SERVICE_AREA`, `navigation.js:269` — founder-confirmed, unchanged since Phase 0 |
| "Book a delivery" → `/send` · "Talk to our team" → `/contact-us` | both `live: true` in `navigation.js` |

### Two wordings deliberately narrower than the brief's suggestion

1. **"anyone you share it with", not "the recipient".** The order payload
   requires a recipient name plus a phone or email (`send-flow.js:47–61`), but
   **nothing in this repository sends that recipient a tracking link** — there is
   no notification code here at all. A public, shareable link is verifiable; the
   product delivering it is not.
2. **"can be retrieved", not "remains available".** Retrieval is verifiable.
   **Retention is not** — how long the backend keeps a completed order is a
   property of a service outside this repository, and no evidence was produced.
   The brief anticipates exactly this and supplies the narrower wording, which is
   what shipped.

**PROOF, CUSTODY and VERIFICATION are absent from the pillar copy by design.**
What the product makes is a record, and that is what it is called.

## 9. Google Reviews **with** data **[measured]**

Verified with a temporary local stub of `getGoogleReviews`, **reverted
immediately and never committed** (working tree confirmed clean afterwards).

| Check | Result |
|---|---|
| Section renders | ✅ "Rated 4.8 on Google" |
| Position | **4th** — after the showcase, before the verticals |
| `<h1>` count | 1 |
| Heading order | `H1 H2×6 H3×3 H2×3` — no skips |
| Console errors | 0 |
| Horizontal overflow | none |
| Page height at 1440 | 4,444 px (+448 px over the no-reviews render) |

## 10. Google Reviews **without** data **[measured]**

`getGoogleReviews()` returns `null` on a missing key, a non-OK response, a
malformed payload, zero usable reviews, or any thrown error — seven `return
null` paths plus a catch-all. `showReviews = reviews !== null && reviews.totalCount > 0`,
and the section is simply not rendered.

**The section is absent, not empty.** No skeleton, no placeholder rating, no
fallback quotes. This is the state the site ships in locally, so every other
measurement in this report was taken against it — the trust layer is complete
and the page ends correctly with no review data at all. **No external API
response is load-bearing for the new section**, which contains no review content.

## 11. Closing CTA decisions

`Book a delivery` → `/send`; `Talk to our team` → `/contact-us`. Both live, both
segmented — consumers to the booking flow, businesses to a human.

They repeat the hero's two CTAs, deliberately and only here: this is the page's
last section, and `HOMEPAGE.md` → Homepage Narrative ships a closing dual CTA
"Always". Placed in the closing row rather than as a separate block, so the page
ends on an action rather than on a photograph. **No address form, no pricing, no
Places** — those are Phase 7.

## 12. Section order, before and after

| # | Before | After |
|---|---|---|
| 1 | Hero | Hero |
| 2 | Operational proof | Operational proof |
| 3 | Platform showcase | Platform showcase |
| 4 | *(Reviews, conditional)* | *(Reviews, conditional)* |
| 5 | Medical vertical | Medical vertical |
| 6 | Legal vertical | Legal vertical |
| 7 | **Why Druppr** | **Trust and accountability** |
| 8 | **Coverage** | — |

Matches the target order exactly. `Services`, `HowItWorks` and `BecomeADriver`
remain unimported; the verticals did not move.

## 13. Files modified

| File | Change |
|---|---|
| `src/components/home/TrustAndAccountability.jsx` | **new** |
| `src/app/(main)/page.jsx` | swap `WhyBrand` + `Coverage` for the new section; five imports removed |

## 14. Components created

`TrustAndAccountability` — server component; no state, no motion, no icons, no
images, no client JavaScript.

## 15. Shared components retained

`home/WhyBrand.jsx` (`/medical`, `/legal`) and `home/Coverage.jsx` (`/medical`,
`/legal`) — **neither modified**. `HOME_REASONS` retained unused, as rollback and
as the Phase 4.1–4.2 claim record.

## 16. Client-side JavaScript added

**None.** No new island; the homepage's only reachable client component remains
`HeaderMobileNav`.

## 17. Bundle measurements **[measured]**

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 2.46 kB | **1.98 kB** | −0.48 kB |
| **`/` First Load JS** | 102 kB | **96 kB** | **−6 kB** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| Client islands on `/` | 1 | **1** | 0 |
| `/medical` | 952 B · 93.2 kB | unchanged | 0 |
| `/legal` | 1.13 kB · 93.4 kB | unchanged | 0 |

First Load fell because **`Coverage` was the homepage's only `next/image` call
site**; removing it takes the `Image` component out of the route's chunk graph.
The target was "close to 102 kB"; 96 kB is below it, which is a gain, not a
regression.

## 18. Maps and Places **[measured]**

`/` **0 / 0**. `/medical`, `/legal`, `/contact-us` 0 / 0. `/send` 6 Maps
(expected — the address flow). Both tracking routes 0 / 0.

## 19–20. Section and page heights **[measured]**

Live DOM dimensions, recorded independently of any screenshot.

| Width | Removed (WhyBrand + Coverage) | New trust section | Section Δ | Page before → after | Mobile screens |
|---|---:|---:|---:|---|---|
| 390 | 968 + 361 = **1,329** | **969** | **−360** | 6,493 → **6,133** | 7.69 → **7.27** |
| 768 | 657 + 545 = **1,202** | **787** | **−415** | 6,219 → **5,804** | 7.37 → **6.88** |
| 1024 | 481 + 641 = **1,122** | **612** | **−510** | 4,558 → **4,048** | 5.40 → **4.80** |
| 1440 | 481 + 707 = **1,188** | **612** | **−576** | 4,571 → **3,996** | 5.42 → **4.73** |

**The homepage is shorter at every width.** At 1024 and 1440 it now sits **under
five screens** for the first time in this project. At 390 it is 7.27 — still
above E1, but 0.42 screens closer, and the reduction came from deleting
duplicated content, **not** from hiding anything behind JavaScript.

The trust section is **969 px at 390 against the Platform Showcase's 1,677 px** —
materially shorter, as required. At 390 it renders as three compact stacked rows
separated by hairlines, not four tall equal cards.

## 21. Accessibility results **[measured]**

| Check | `/` |
|---|---|
| `<h1>` count | **1** |
| Heading order | `H1 H2 H2 H2 H2 H2 H3 H3 H3 H2 H2 H2` — no skips |
| Semantic section heading | `<h2 id="trust-accountability">`, section `aria-labelledby` matches |
| **Contrast failures (alpha-composited)** | **0** |
| **Focus treatment missing** | **0 / 19** |
| Text below 12 px | **0** |
| Horizontal overflow | none at 390/768/1024/1440 |
| **Visible-content clipping at 200 % zoom** | **0** |
| Icons | **none in the section** — nothing is communicated by icon alone |
| False affordances | none — the only focusable elements are the two CTAs, both of which navigate |
| `aria-live` | none |

The section contains **no images and no text over images**, so contrast is fully
resolved by computed style with alpha compositing; no pixel sampling was needed
here. `/medical`'s 4 raw failures are the known white-on-photograph artifact
(pixel-sampled 9.52–17.26:1 in Phase 5) and are unchanged by this phase.

**200 % zoom** reports 2 "clipped" nodes on `/`; **both are `sr-only`** (the skip
link and `NetworkDemo`'s screen-reader description), which clip by design.
Visible-content clipping is **0**, verified by excluding `sr-only` explicitly.

## 22. Keyboard results **[measured]**

First 12 stops on `/`: skip link → wordmark → Medical → Legal → Contact → Send a
package → Book a delivery → Talk to our team → See medical delivery → See legal
delivery → Book a delivery (trust) → … Every stop shows a visible indicator; no
trap; no hover-only content. The closing CTAs are reachable and focus-visible —
captured in `after-trust-focus-cta.png`.

## 23. JavaScript-disabled results **[measured]**

`/` renders **3,594 characters** of body text with JS disabled — hero,
operational proof, showcase, both verticals and the complete trust section
including all three pillars, the service-area line and both CTAs. Nothing in the
section depends on hydration.

## 24. Reduced-motion results **[measured]**

Content identical across 2.5 s on `/`, `/medical` and `/legal`. The trust section
has no transitions at all; its CTAs carry `motion-reduce:transition-none` on the
colour transition they share with every other button on the site.

## 25. CLS results **[measured]**

Three isolated browser contexts, per the measurement protocol.

| Route | Before | After | Budget |
|---|---|---|---|
| `/` | 0.0001 · 0.0001 · 0.0001 | **0.0001 · 0.0001 · 0.0001** | ≤ 0.05 |

No regression; ~500× inside budget. Removing the Bay Street image removed the
last below-fold image from the homepage.

## 26. Regression-test results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/contact-us` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

**Prohibited-claim sweep**, rendered text of `/`, `/medical`, `/legal`, against
33 terms — insurance, insured, TDG, certified, certification, confidentiality,
PHIPA, security, encryption, restricted access, SLA, guarantee, within the hour,
chain of custody, drop-off code, signature, photo, proof of service, court-ready,
evidentiary, proof, custody, verification, verified, temperature, cold chain,
scheduled/standing route, monthly invoicing, per-location, fleet: **zero hits on
all three routes.**

## 27. Screenshots captured

In `scratchpad/phase6/before/` and `after/`: complete homepage and trust section
at **390 / 768 / 1024 / 1440**; homepage **with** review data; homepage
**without**; JavaScript-disabled; reduced-motion; 200 % zoom; keyboard-focused
closing CTA.

## 28. Measurement-protocol corrections applied

| Protocol | Applied |
|---|---|
| **Layout screenshots** | Every `fullPage` capture emulates `prefers-reduced-motion`, and the reason is written at the top of `shoot6.js`. **Live DOM dimensions are recorded separately** from screenshots and are the numbers quoted in §19–20 |
| **Contrast** | Alpha composited over the resolved ground; the section has no text over images, so no pixel sampling was required — and that is stated rather than assumed |
| **Text sweeps** | The extractor was validated against **8 positive controls** before any negative result was trusted |
| **CLS** | Three isolated browser contexts, not a sequential multi-route run |
| **Clipping** | `sr-only` excluded explicitly; the 2 reported nodes on `/` are both `sr-only` and visible clipping is 0 |
| **B2B regression** | Compared prerendered HTML with asset hashes **and the per-build `buildId`** normalised, rather than reporting a raw diff as a change |

One correction was needed during the phase: the first B2B comparison reported
`medical.html` and `legal.html` as differing. Both files were the **same length**
and the sole difference was the `buildId`, which changes on every build. Once
normalised, both are identical. Reporting the raw diff would have been a false
regression of exactly the kind this protocol exists to prevent.

## 29. Deviations from the plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **Pillar 1 says "anyone you share it with", not "the recipient"** | The brief's suggested "One status link for both sides" implies the product reaches the recipient. It does not, verifiably — no notification code exists here |
| 2 | **Pillar 3 uses the brief's fallback wording** | Retention is unverifiable, and the brief supplies the narrower phrasing for exactly that case |
| 3 | **No fourth element as a card** | The service area and both CTAs share one closing row instead, per the brief's own instruction not to add a fourth card for symmetry |
| 4 | **No icons at all** | With shields, padlocks, badges, rosettes and seals prohibited, a remaining icon set is decoration rather than meaning |

## 30. Remaining weaknesses

| # | Item | Status |
|---|---|---|
| **W11** | **`/` is 7.27 mobile screens.** E1 (≤ 5) still unmet at 390, though met at 1024 and 1440. Closing it further means cutting evidence, not padding | Improved from 7.69 |
| **W12** | `PlatformShowcase` frame 2's caption is the loosest phrasing of the shared-link fact on the site (§2). Not edited — `PlatformShowcase` is audit-only this phase | ✅ **CLOSED by Phase 6.1**, along with three further statements the sweep found with it |
| W10 | Both vertical frames still use synthetic values, labelled "Sample" | Unchanged |
| W6 | Insurance, PHIPA, security, SLA, TDG — excluded, unreviewed | Unchanged |
| — | `/privacy-policy` security-controls sentence | Unchanged — privacy counsel |
| R5 | LCP / FCP **[not captured]** | Unchanged |
| R6 | 4 images above the 200 kB source ceiling — **one fewer now renders on `/`** | Improved |
| R10 | Formal five-second test not run | Unchanged — out of scope |

## 31. Acceptance criteria

| Criterion | Status |
|---|---|
| Generic `Why Druppr` grid removed from `/` | ✅ |
| Neighbourhood-heavy `Coverage` removed from `/` | ✅ |
| Shared components not deleted; B2B pages unaffected | ✅ **byte-identical** |
| Every trust statement traced to rendered product behaviour | ✅ §8 |
| No prohibited claim restored or implied | ✅ 33-term sweep, 0 hits |
| Reviews preserved; not load-bearing | ✅ both paths tested |
| Homepage structurally complete when reviews are `null` | ✅ that is the measured default |
| No review animation, marquee, carousel or fabricated content | ✅ |
| Section order matches the target | ✅ |
| Homepage remains static | ✅ `○ (Static)` |
| First Load ≈ 102 kB · shared ≈ 87.2 kB | ✅ **96 kB / 87.2 kB** |
| **Zero client JavaScript added** | ✅ |
| Zero Maps/Places on `/` | ✅ |
| No material CLS regression | ✅ 0.0001 |
| Zero console errors | ✅ seven routes |
| Trust section materially shorter than the showcase at 390 | ✅ 969 vs 1,677 px |
| No content hidden to reduce height | ✅ reduction came from deleting duplication |

**Phase 6 meets its acceptance criteria.**

## 32. Phase 7

**Phase 7 has not begun.** No homepage address fields, no Places autocomplete, no
quote calculation, no pricing display, no `/send` state handoff, no insurance,
TDG, PHIPA, security or SLA claims, no privacy-policy edits, no customer or
partner logos, no case studies or testimonials, no reviews or partner movement,
no chain-of-custody artifact, no integrations, no driver recruitment, no footer
restructuring, no five-second testing and no broader motion system.

---

# Phase 6.1 — Tracking-Link Wording Alignment

> Corrects the statement Phase 6 flagged as **W12** and three others the sweep
> found alongside it. **Phase 7 has not begun.**
>
> **[measured]** from a production build. Nothing estimated.

## 1. Preflight **[measured]**

| Check | Result |
|---|---|
| Branch | `homepage-redesign` |
| Working tree | clean |
| Phase 6 commits `7824607` `41f385c` `269eaa3` | all present |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled successfully |

## 2. Tracking routes inspected **[measured]**

### `/track/[trackingCode]`

Fetches `${API_BASE_URL}/public/track/{code}` with `cache: 'no-store'`.
Renders: **Tracking Code · Category · Vehicle · Order Placed · On Route To
Pickup · Package Picked Up**, plus live status, driver location and ETA through
`LiveTracking` (6 s poll, terminal-status allowlist), and a driver **initial**
only.

### `/track-partner/[trackingToken]`

Fetches `${API_BASE_URL}/public/track-partner/{token}` with `cache: 'no-store'`.
Renders everything above **plus Route Distance, the Sender's name, the Pickup
Address and a numbered receivers list.**

**The two views are not equivalent.** The partner view exposes strictly more,
including sender identity and the pickup address.

## 3. Same or different identifiers

**Different.** Two routes, two endpoints, two parameters:

| | Route | Endpoint | Param |
|---|---|---|---|
| Consumer | `/track/[trackingCode]` | `/public/track/{code}` | `trackingCode` |
| Partner | `/track-partner/[trackingToken]` | `/public/track-partner/{token}` | `trackingToken` |

Both describe the same underlying delivery — the partner payload carries a
`trackingCode` field, rendered with a `trackingCode ?? trackingToken` fallback —
but **they are reached by different URLs holding different identifiers.**

The partner token is **never generated, displayed or linked anywhere in this
repository.** It only ever arrives in the URL.

## 4. Login requirements

**Neither route requires a login.** No session, cookie, `Authorization` header,
auth redirect or guard exists in either route, and **there is no middleware file
in the project at all**. Both endpoints are named `/public/…`. Anyone holding a
valid identifier can open the corresponding view.

## 5. Notification behaviour

**None found in this repository.** A search for `mailto:`, `sms:`, `nodemailer`,
`twilio`, `sendgrid`, `notify`, `notification`, `sendEmail`, `sendSms` and
`webhook` across `src/` returns exactly one hit: the support `mailto:` on
`/contact-us`. **There is no email, SMS, push or webhook code here.**

| Party | How they get a link, in this repository |
|---|---|
| **Sender** | Shown the code on the payment step — `send/pay/page.jsx` prints it under "TRACKING CODE" and links to `/track/{code}` |
| **Recipient** | **Nothing.** No code path sends them anything |
| **Business** | **Nothing.** The partner token is never produced here |

**Link delivery outside this repository is unknown.** The backend may or may not
send anything; there is no evidence either way, and **absence of evidence was
not treated as evidence of absence — it was treated as grounds for not
claiming it.**

⚠️ Per the brief: notification behaviour was **not** inferred from the presence
of recipient contact fields. `send-flow.js:44–46` documents why they are
collected — *"POST /order needs a name and phone for both ends, and at least one
of receiverPhone / receiverEmail"* — a backend payload requirement, not a
notification feature.

## 6. Wording removed and replaced

The sweep found **four** rendered statements, not one.

### 6.1 `PlatformShowcase` frame 2 caption — the flagged statement

| | |
|---|---|
| **Was** | "The sender, the business and the recipient follow the same job on **one shared tracking link**." |
| **Now** | **"Tracking views keep the delivery status accessible to the people who have the relevant link."** |

Wrong twice: there are **two** links, not one, and they are not interchangeable;
and **nothing sends a link to the recipient.**

### 6.2 `TrustAndAccountability` pillar 1 — label and body

| | |
|---|---|
| **Was** | **One link, no login** — "Tracking opens from the link alone, so anyone you share it with can follow the same job." |
| **Now** | **Tracking access without an account** — **"Open the delivery from its tracking link and share that access with the people who need status visibility."** |

The no-login half was already verified. **"One link" was not**: with two routes
carrying two identifiers and two payloads, it could be read as one identical URL
every party opens. The label now names the property that *is* verified, and the
body makes sharing something the holder does rather than something the product
does.

### 6.3 `VerticalSection` legal frame note

| | |
|---|---|
| **Was** | "Every job leaves this trail, retrievable from its tracking code — **on one link your firm and the recipient both read**." |
| **Now** | **"Every job leaves this trail, retrievable from its tracking code and shareable with whoever needs to see it."** |

The same two errors, in copy written during Phase 5.

### 6.4 `/medical` and `/legal` credential chip

| | |
|---|---|
| **Was** | `Shared tracking link` |
| **Now** | **`Shareable tracking link`** |

One word. *Shared* asserts a distribution that was never evidenced; *shareable*
states the capability that follows from a public, login-free URL.

The rationale comments above both chips were corrected too — each claimed the
two routes *"serve the same job to the sender, the business and the recipient"*.
A comment that states a removed claim as fact is how the claim returns.

## 7. Files modified

| File | Change |
|---|---|
| `src/components/home/PlatformShowcase.jsx` | frame 2 caption |
| `src/components/home/TrustAndAccountability.jsx` | pillar 1 label + body |
| `src/components/home/VerticalSection.jsx` | legal frame note |
| `src/app/(main)/medical/page.jsx` | chip + rationale comment |
| `src/app/(main)/legal/page.jsx` | chip + rationale comment |

No route, endpoint, identifier, API or architecture was touched. No notification
was added. No client JavaScript was added.

## 8. Site-wide consistency sweep **[measured]**

Rendered text of `/`, `/medical`, `/legal`, `/contact-us`. Extractor validated
against **6 positive controls** before any negative result was trusted.

| Statement | Where | Classification |
|---|---|---|
| "Tracking views keep the delivery status accessible to the people who have the relevant link." | Platform Showcase | **corrected** — exact and verified |
| "Tracking access without an account" / "Open the delivery from its tracking link and share that access…" | Trust and Accountability | **corrected** — exact and verified |
| "…retrievable from its tracking code and shareable with whoever needs to see it." | legal vertical frame | **corrected** — exact and verified |
| `Shareable tracking link` | `/medical`, `/legal` chips | **corrected** — exact and verified |
| "Specimens, filings, business deliveries and parcels — dispatched, tracked and recorded on one platform." | homepage hero | **exact and verified** — "one platform", not one link; no tracking-link claim |
| "with route and status visibility from pickup through completion" | medical vertical | **exact and verified** — no link claim |
| "Follow the job from pickup through completion." | `/legal` record card | **exact and verified** |
| "Every job's record is retrievable from its tracking code." | `/legal` record card | **exact and verified** |
| "A record you can return to" / "Delivery information can be retrieved using its tracking code." | Trust and Accountability | **exact and verified** |
| `/contact-us` | — | no tracking-link statement present |
| `/track/*`, `/track-partner/*` | product surfaces | no marketing claim; they *are* the artifact |

**Zero statements remain in the "implies automatic notification", "implies one
identical URL" or "implies a portal or account" categories.**

Removed-wording check across all four routes — *one shared tracking link*,
*Shared tracking link*, *the same job on*, *One link, no login*, *anyone you
share it with*, *the recipient both read*, *sender, the business and the
recipient*: **zero hits.**

## 9. Bundle measurements **[measured]**

| Metric | Phase 6 | Phase 6.1 | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 1.98 kB | **1.98 kB** | **0** |
| **`/` First Load JS** | 96 kB | **96 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| `/medical` | 952 B · 93.2 kB | **952 B · 93.2 kB** | **0** |
| `/legal` | 1.13 kB · 93.4 kB | **1.13 kB · 93.4 kB** | **0** |
| Client islands on `/` | 1 | **1** | **0** |

A copy-only change; nothing moved.

## 10. Maps and Places **[measured]**

`/` **0 / 0**. `/medical`, `/legal`, `/contact-us` 0 / 0. `/send` 6 Maps
(expected). Both tracking routes 0 / 0.

## 11. Accessibility results **[measured]**

| Check | `/` | `/medical` | `/legal` | `/contact-us` |
|---|---|---|---|---|
| `<h1>` count | 1 | 1 | 1 | 1 |
| Heading order | `H1 H2×5 H3×3 H2×3` | `H1 H2 H3 H3 H2×4` | `H1 H2×7` | `H1 H2×4` |
| Heading skips | none | none | none | none |
| **Contrast (off-image)** | **0** | **0** | **0** | **0** |
| **Focus treatment missing** | **0 / 19** | **0 / 16** | **0 / 15** | **0 / 21** |
| Text below 12 px | 0 | 0 | 0 | 0 |
| Horizontal overflow | none | none | none | none |
| Visible clipping at 200 % zoom | **0** | 0 | 0 | 0 |

All identical to Phase 6. `/medical`'s 4 raw contrast entries remain the known
white-on-photograph artifact (pixel-sampled 9.52–17.26:1 in Phase 5); `sr-only`
elements were excluded before reporting clipping.

**CLS [measured], three isolated contexts:** `0.0001 · 0.0001 · 0.0001` —
unchanged.

**Keyboard:** first 12 stops on `/`, `/medical`, `/legal` all show a visible
indicator; no trap.

**JavaScript disabled:** the new wording renders on all three routes —
`/` 3,620 chars, `/medical` 1,331, `/legal` 1,428 — verified per string, not by
length alone. **Reduced motion:** content identical across 2.5 s on all three.

## 12. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | 0 |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/contact-us` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

## 13. Weakness closed

**W12 is closed.** The Phase 6 report flagged the Platform Showcase caption as
"the loosest phrasing of the shared-link fact on the site". It, and three
statements the sweep found with it, now describe one architecture consistently:
two public tracking views, reached by different links, neither requiring an
account, neither distributed by the product.

**Phase 7 has not begun.** No homepage booking form, Places integration, price
estimation, address handoff, reviews motion, partner motion, integrations or
broader motion work.
