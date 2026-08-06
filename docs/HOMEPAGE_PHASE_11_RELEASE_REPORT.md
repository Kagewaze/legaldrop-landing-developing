# Homepage Phase 11 — Release Candidate, Merge Readiness and Deployment Checklist

> **Status: `homepage-redesign` is a release candidate. Merge recommended. Deployment gated on
> operator checks that cannot be performed from this environment.**
>
> **Nothing has been pushed, merged or deployed.** The branch has no upstream and no
> remote-tracking ref exists for it.
>
> Everything below was measured against a production build (`next build` + `next start`,
> Next.js 14.2.18) on **2026-08-05**. Lab measurements are labelled as such and are **not field
> data**.

---

## 1. Preflight

| Check | Result |
|---|---|
| Working directory | `C:\Users\Abdul\LegalDrop\legaldrop-landing-develop\legaldrop-landing-develop` (inner root) |
| `package.json` · `src/` · `public/` · `docs/` · `.git/` | ✅ all present |
| `git status` | clean |
| Branch | `homepage-redesign` ✅ |
| Unrelated changes | none — did not need to stop |
| `9e6ce5c` · `5ac9a6e` present | ✅ both |
| Upstream configured | **none** — `git rev-parse @{u}` fails |
| Remote-tracking ref for this branch | **none exists** (`origin/main` is the only remote ref) |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled, 16/16 static pages |

`origin` is configured as a remote, but **this branch has never been pushed to it** — the only
remote-tracking ref in the repository is `origin/main`.

---

## 2. Branch and commit inventory

**54 commits** on `homepage-redesign` ahead of `main`. `main` has **not moved** since the branch
point.

| Phase | Commits |
|---|---:|
| 1 — Foundation | 5 |
| 2 — Hero and network | 4 |
| 3 — Operational proof | 2 |
| 4 — Platform showcase | 7 |
| 5 — Regulated verticals | 5 |
| 6 — Trust | 4 |
| 7 / 7.1 — Booking entry | 7 |
| 8 — Motion | 3 |
| 9 — Launch readiness | 6 |
| 9.1 — Gate closure | 4 |
| 9.2 — Deferred test | 1 |
| 10 — Partner system | 3 |
| 10.1 — Partner activation | 2 |
| 11 — Release candidate | *this phase* |
| **Total** | **54** |

Most recent first: `5ac9a6e` `9e6ce5c` `1966e25` `4589fcf` `709a459` `d7ddad6` `b75f1f8` `d8b9a30`
`860976c` `c2c2ba8` `7c8c8e5` `bc17b06` `b9e1cc3` `9a6caf6` `3615bc8` `30dd3b9` `2037ca4` `26d2949`
`497c697` `eccc4dd` `39b641e` `3689108` `5babe1e` `7061734` `0befc6d` `a403efe` `d3a40f7` `269eaa3`
`41f385c` `7824607` `fb8f25e` `a3d2440` `c1e8a92` `067740f` `d3ab92f` `cdb7685` `55c73af` `f870aa4`
`3a5aca3` `728fceb` `a8980ee` `e36ee96` `7d2195e` `2e6d539` `2c537fb` `a00b187` `4282f0b` `138da2d`
`0417d67` `2b153ef` `4c90250` `ce6ef57` `8ec6643` `232cea7`

---

## 3. Documentation reconciliation

Swept every authoritative document for statements the later phases made stale. **Historical reports
were not rewritten** — forward references were added at the point of each stale claim.

| Stale statement searched for | Found | Action |
|---|---|---|
| "zero partners approved" / "section does not render" | **1 live instance** — Phase 9.2 §9.2-5, the *authoritative* blocker table | **Corrected** with an explicit superseded note naming Phase 10.1 |
| Partner permission blocked | Phase 10 body §11 | **Superseded note added** |
| Phase 10.1 not begun | none | — |
| Five-second test still a blocker | 2 instances, both in tables **already marked superseded** (§21, §9.1-11) | left as history |
| Client-island decision unresolved | 1 instance, already struck through with *"Done — 2026-08-05, Option A"* | left as history |
| Old site title active | 3 instances, all already carrying superseded notes or recording the *"Was → Now"* change | left as history |
| "Phase N has not begun" | 28 instances | **Correctly historical** per-phase status lines — untouched |

### Authoritative current state

| Item | State |
|---|---|
| Partner logos | **Six render** |
| Heading | **"Business relationships"** |
| Logo links | **None — zero anchors, zero logos in the tab order** |
| Partner direction | **Right to left** |
| Review direction | **Left to right** |
| Motion controller | **One shared `SocialProofMotion` boundary** |
| Five-second test | **Founder-deferred** post-launch positioning validation |
| Privacy review | **Pending; publication accepted by the founder** 2026-08-05 |
| Production Google Reviews validation | **Deployment check — not performed** |
| Client-island ceiling | **3 normally, 4 with social-proof motion** |

---

## 4. Public-route results

Every route measured on the production build. **A deliberate 404 control was included so the
harness cannot report false success** — and it returned 404.

| Route | HTTP | H1 | `<main>` | Heading skips | Overflow | Clipping | Skip link | Focus rings | Console errors |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 200 | 1 | 1 | none | none | 0 | ✅ first tab stop | 20/20 | 0 |
| `/medical` | 200 | 1 | 1 | none | none | 0 | ✅ first | 15/15 | 0 |
| `/legal` | 200 | 1 | 1 | none | none | 0 | ✅ first | 14/14 | 0 |
| `/contact-us` | 200 | 1 | 1 | none | none | 0 | ✅ first | 20/20 | 0 |
| `/send` | 200 | 1 | 1 | none | none | 0 | ✅ first | 9/9 | 0 |
| `/send/details` | 200 | 1 | 1 | none | none | 0 | ✅ present | 3/3 | 0 |
| `/send/pay` | 200 | 1 | 1 | none | none | 0 | ✅ present | 3/3 | 0 |
| `/track/DRP-RC-TEST-0001` | 200 | 1 | 1 | none | none | 0 | n/a | 0/0 | 0 |
| `/track-partner/rc-test-token-0001` | 200 | 1 | 1 | none | none | 0 | n/a | 0/0 | 0 |
| `/privacy-policy` | 200 | 1 | 1 | none | none | 0 | ✅ first | 12/12 | 0 |
| **`/nonexistent-control-route`** | **404** | 1 | 1 | none | none | 0 | ✅ | 13/13 | 0 |

**Header destinations** — all **200**: `/` · `/medical` · `/legal` · `/contact-us` · `/send`.
**Footer destinations** — all **200**: `/send` · `/medical` · `/legal` · `/contact-us` ·
`/privacy-policy` · `/`.

No header or footer link carries `target` or needs `rel`; **no external link is rendered on the
homepage at all**.

`/track/*` render *"Tracking unavailable — Order not found"* for a fake code: correct degraded
behaviour, one H1, one `<main>`, no chrome by design (they are deep links).

`/send/details` and `/send/pay` client-redirect to step 1 when no booking state exists — correct
guard behaviour. Loaded directly they present 8 focusable elements with the skip link first; the
lower tab count above is the redirect landing mid-sequence.

### ⚠️ Measurement-environment note

The first route pass reported `ERR_INTERNET_DISCONNECTED` on the three `/send` routes and an
anomalous single tab stop. Investigated rather than recorded: **the sandbox network dropped
mid-run** (a later pass failed outright with `ERR_NETWORK_CHANGED`). Re-run with navigation retry
and transport-level errors excluded, all three routes report **zero failed requests and zero
application console errors**. No product defect — recorded so the first numbers are not mistaken
for one.

---

## 5. Partner-strip verification

Against the **real approved records in HEAD**, not stubs.

| Requirement | Result |
|---|---|
| Exactly six semantic source logos | ✅ 6 |
| Heading | ✅ **"Business relationships"** |
| Logo anchors | ✅ **0** at every width, and 0 in the served HTML |
| Logos in tab order | ✅ **0** |
| Six accurate alt texts | ✅ *"General Basket Logistics Services logo"*, *"Haut Logistics logo"*, *"That Local Girl logo"*, *"Can-Anny logo"*, *"Arc Law logo"*, *"The Accelerator Centre logo"* |
| Duplicates `aria-hidden` | ✅ `true` |
| Duplicate images `alt=""` | ✅ all six |
| Direction | ✅ **right to left**, measured **−24.5 px/s** |
| Derived duration | ✅ **54 s** at six logos (216 px × 6 ÷ 24 px/s) |
| Explicit pause | ✅ `aria-pressed="true"`, label → *Resume motion* |
| Resume | ✅ |
| Hover pause | ✅ pauses on enter, resumes on leave |
| Focus pause | ✅ `:focus-within` on the track |
| Explicit pause survives hover leaving | ✅ stays paused, stays `aria-pressed="true"` |
| Reduced motion shows all six | ✅ 6 of 6 at 1440, 390 **and** 320 |
| JavaScript disabled shows all six | ✅ 6 of 6 at 1440, 390 **and** 320 |
| Distortion | ✅ **0** — rendered box ratio matches intrinsic ratio at every width |
| Clipping | ✅ **0** |
| Recolouring | ✅ none — orange and dark fields preserved as supplied |
| Horizontal overflow | ✅ none |

### Across every width

| Width | Overflow | Rows | Tiles | Anchors | Distorted | Clipped | Tile |
|---|---|---|---|---|---|---|---|
| 320 · 360 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920 | none | **1** | 6 | **0** | **0** | **0** | 200×80 |
| **200% zoom** (720×450 @ DPR 2) | none | **1** | 6 | **0** | **0** | **0** | 200×80 |

Static fallbacks wrap cleanly: 2 rows at 1440, 6 rows at 390 and 320, all six on screen, no
overflow.

---

## 6. Review verification — **CONTRACT VERIFICATION, NOT PRODUCTION VERIFICATION**

**No production credentials are available in this environment.** These results come from a local
stub that was **reverted and never committed**, and they verify the integration *contract* only.
They are **not** evidence that the production review path works.

| State | Result |
|---|---|
| 0 reviews | ✅ **no section at all** |
| **API failure** | ✅ **section removed cleanly**, page renders 7 sections with no gap |
| 1 review | ✅ static, no track, no duplicate |
| 3 reviews | ✅ static, no track, no duplicate |
| 4 reviews | ✅ moves **left to right**, measured **+35.4 px/s** |
| 5 reviews | ✅ moves left to right, **+35.0 px/s** |
| Missing review text | ✅ handled — card renders without an empty paragraph |
| Attribution | ✅ *"Reviews from Google, based on 27 reviews."* |
| Source link | ✅ present, to the Google Maps place URL |
| Reduced motion | ✅ every review displayed — 4 of 4, 5 of 5 |
| JavaScript disabled | ✅ every review displayed — 4 of 4, 5 of 5 |
| **Pause control names what is moving** | ✅ *"Pause motion for partner logos"* when only partners move; ***"Pause motion for customer reviews and partner logos"*** when both do |

**No fake review data remains.** Verified after reverting: zero occurrences of `REVIEW_STUB`,
`force-dynamic` or any stub marker in `src/`, and the working tree showed only the intended
documentation edits.

### Production deployment checklist — Reviews

- [ ] `GOOGLE_PLACES_API_KEY` configured in the deployment environment (**not** `NEXT_PUBLIC_`-prefixed)
- [ ] **Places API (New)** enabled in Google Cloud Console — a *separate product* from the legacy Places API; a 403 `SERVICE_DISABLED` means exactly this
- [ ] Place ID `ChIJ6bQwlukxK4gRFaB2nvrNqWw` resolves to the correct listing
- [ ] Key restrictions permit the production domain
- [ ] Live rating renders and **matches the live Google listing**
- [ ] Live review count renders and matches
- [ ] Attribution line visible
- [ ] "See all reviews" reaches the correct listing
- [ ] API failure removes the section cleanly in production
- [ ] Re-check after 24 h — the response is cached with `revalidate: 86400`, so a stale rating becomes a false claim once the live one moves

No secret value appears anywhere in this report.

---

## 7. Booking verification

All 18 steps against **live Google Places**, using generic public landmarks only.

| # | Step | Result |
|---:|---|---|
| 1 | Fresh homepage load | ✅ |
| 2 | Zero Maps/Places before interaction | ✅ **0 / 0** |
| 3 | Focus pickup | ✅ |
| 4 | One loader bootstrap | ✅ one `maps/api/js`; `places.js` / `main.js` are its own modules |
| 5 | Select generic public pickup | ✅ `100 Queen St W, Toronto, ON M5H 2N1, Canada` |
| 6 | Select generic destination | ✅ `6301 Silver Dart Dr, Mississauga, ON L5P 1B2, Canada` |
| 7 | Submit enables only after two valid selections | ✅ disabled with one, enabled with two |
| 8–9 | Edit an address → coordinates invalidate | ✅ submit returns to disabled |
| 10 | Re-select | ✅ submit re-enables |
| 11 | Submit | ✅ navigates to `/send` |
| 12 | Storage key `legaldrop.send-flow.v1` | ✅ shape `{address, lat, lng}`, all four coordinates finite |
| 13 | No address or coordinates in the URL | ✅ query and hash both empty |
| 14 | `/send` renders both addresses | ✅ both fields populated |
| 15 | Unrelated booking state preserved | ✅ `packageCount`, `weight`, `vehicle` all survived |
| 16 | Malformed storage does not crash | ✅ five payloads, page rendered every time, **zero page errors** |
| 17 | Blocked Google exposes the `/send` fallback | ✅ *"Address suggestions are unavailable right now."* + *Continue on the full booking page* → `/send`; typed text kept; no key or config name exposed |
| 18 | JavaScript-disabled links work | ✅ form hidden, fallback revealed, `/send` and `/contact-us` |

Zero console errors on the happy path.

---

## 8. Final claim sweep

Swept **rendered body text, `<head>` metadata, `alt` attributes and accessible names** across all
eight public routes, for all 35 listed terms. Word-boundary matching; positive controls fired on
every route.

**Result: no unsupported rendered claim remains.**

| Route | Terms found |
|---|---|
| `/` · `/medical` · `/legal` · `/contact-us` · `/send` · `/track/*` · `/track-partner/*` | **none** |
| `/privacy-policy` | `restricted access` ×1, `secure` ×1 |

Both `/privacy-policy` hits are in the **policy body**: the security-controls sentence assigned to
counsel, and *"Secure payment details processed through third-party providers."* Classified as
**legal-document wording pending professional review**, with publication accepted by the founder
(2026-08-05). **The policy body was not edited** — no counsel-supplied wording exists.

Specifically checked because the partner section is now live: **`trusted by`, `enterprise
customers` and `leading companies` return zero occurrences anywhere.** The only claim the section
makes is its heading.

Source comments referencing removed claims are classified separately and are **not rendered**; each
records what was removed and why, and none states a removed claim as a current fact.

---

## 9. Accessibility verification

| Check | Result |
|---|---|
| Exactly one `<h1>` per route | ✅ 11/11 including the 404 |
| Exactly one `<main>` per route | ✅ 11/11 |
| No heading-level skips | ✅ every route |
| Skip link present and first tab stop | ✅ every route with chrome |
| Visible focus on every tab stop | ✅ 20/20 on `/`, and on every other route |
| No focus trap | ✅ |
| Minimum target sizes | ✅ zero targets < 24 px on any route |
| No duplicate IDs | ✅ every route |
| Pause control semantics | ✅ real `<button>`, `aria-pressed`, state carried by a visible word |
| Duplicates hidden from assistive tech | ✅ `aria-hidden` + `alt=""` |
| Each company announced once | ✅ |
| No logo is interactive | ✅ 0 anchors, no `tabindex`, no role |
| No false interactive affordances | ✅ 0 false buttons |
| Reduced motion static, all content exposed | ✅ reviews and partners |
| JavaScript disabled static, all content exposed | ✅ reviews and partners |
| No clipping at 200% zoom | ✅ |
| No horizontal overflow 320 → 1920 | ✅ |

**Known measurement artifact, unchanged since Phase 9:** `/send` reports two tab stops without a
focus ring. The indicator is a border rendered inside Google's `gmp-place-autocomplete` **closed**
shadow root, confirmed visible by screenshot. **Not a defect.**

---

## 10. Responsive results

| Width | Page overflow | Partner strip | Distortion | Clipping |
|---|---|---|---|---|
| 320 · 360 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1920 | **none** | 1 row, 6 tiles | **0** | **0** |
| 200% zoom | **none** | 1 row, 6 tiles | **0** | **0** |

Hero heights — **identical to Phase 9 and Phase 10, so Phase 7.1 is intact**: 968 / 906 / 912 / 897
/ 1,098 / 773 / 696 / 696 / 696 px at 320 / 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920.

---

## 11. Performance results

**LAB MEASUREMENTS ON A LOCAL LOOPBACK SERVER. THESE ARE NOT FIELD DATA.** Seven isolated browser
contexts per profile; median reported.

| Metric | Value |
|---|---|
| Route type | **`○ (Static)`** — prerendered |
| Route size `/` | **7.09 kB** |
| **First Load JS `/`** | **101 kB** |
| **Shared JS** | **87.2 kB** |
| **Client islands** | **4** (HeaderMobileNav, NetworkDemo, HeroAddressEntry, SocialProofMotion) |
| Total homepage transfer | **212 kB at load**, 296 kB after idle (difference is Next `<Link>` prefetch) |
| **Partner-logo transfer** | **55.5 kB**, 6 requests, 6 unique files, all `image/webp` |
| Maps / Places before interaction | **0 / 0** |
| Requests after focus | 4 Maps (one bootstrap + its modules), 0 Places |
| Requests after a typed query | 9 Maps, 2 Places |
| Console errors | **0** |

### Core Web Vitals

| Profile | LCP (min / **p50** / max) | FCP p50 | CLS | TBT p50 |
|---|---|---|---|---|
| Desktop 1440, unthrottled | 648 / **1,016** / 2,072 ms | 1,016 ms | **0.0001** | 0 ms |
| Mobile 390, 1.6 Mbps / 150 ms / 4× CPU | 1,052 / **1,176** / 4,736 ms | 1,176 ms | **0.002** | 105 ms |

LCP equals FCP on every run and the LCP element is the `<h1>` — the homepage ships no images above
the fold, so nothing competes with text for the largest paint.

### Acceptance

| Expectation | Result |
|---|---|
| Homepage remains static | ✅ |
| First Load JS ≈ 101 kB | ✅ **101 kB**, unchanged |
| Shared JS ≈ 87.2 kB | ✅ **87.2 kB**, unchanged |
| Client islands ≤ 4 | ✅ **4** |
| Partner logos ≈ 55.5 kB | ✅ **55.5 kB** |
| Zero initial Maps/Places | ✅ |
| CLS ≤ 0.05 | ✅ **0.0001 / 0.002** — 25× inside budget |
| No unexplained regression | ✅ every figure matches Phase 10.1 |

**Variance disclosure:** desktop LCP spans 648–2,072 ms *unthrottled on localhost*, and mobile
spans 1,052–4,736 ms. That spread is the sandbox's unstable network (§4), not page behaviour.
**Treat CLS, byte counts and request counts as reliable; treat LCP/FCP as indicative only.**
Real-user Core Web Vitals must be collected after deployment.

---

## 12. Production environment checklist

**For the deployment operator. Nothing here was verified — deployment access is unavailable, and
no item below is claimed as done.**

- [ ] **Browser Maps key** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` configured
- [ ] **Production domain included in the browser key's HTTP-referrer restrictions** — ⚠️ if it is not, the homepage address entry **degrades silently** to *"Address suggestions are unavailable right now"* with a working `/send` fallback. Nothing looks broken, which is exactly why it can ship unnoticed. This was reproduced deliberately during testing on a non-allowlisted port
- [ ] Delete the transitional hardcoded browser-key literal in `src/lib/maps-loader.js` once the env var is confirmed live
- [ ] **Server Places key** `GOOGLE_PLACES_API_KEY` configured — server-only, **never** `NEXT_PUBLIC_`-prefixed
- [ ] **Places API (New)** enabled (separate product from legacy Places API)
- [ ] **Google place ID** `ChIJ6bQwlukxK4gRFaB2nvrNqWw` verified against the live listing
- [ ] **Contact form destination** verified — `POST ${NEXT_PUBLIC_API_BASE_URL}/contact-form` reachable and monitored
- [ ] **Partner signup destination** verified — `https://partner.legaldrop.ca/signup` returns 200 and is a real self-serve signup (it was 200 at test time)
- [ ] **Tracking API base URL** verified — `NEXT_PUBLIC_API_BASE_URL`; note it is **inlined at build time**, so changing it requires a rebuild, not a restart
- [ ] **`/privacy-policy` route public** — required; it is the footer's only Support link and the site's only privacy disclosure
- [ ] **App-store badges still absent** — confirm no badge was added; none may appear without a live listing, a public URL and official artwork
- [ ] **No source maps or secrets exposed** in the production bundle
- [ ] Environment variables present **at build time** for `NEXT_PUBLIC_*` and **at runtime** for `GOOGLE_PLACES_API_KEY`
- [ ] Metric review diarised for **2026-11-03** — *"Accurate as of August 2026"* is published on the homepage and a stale metric is a false claim

---

## 13. Merge-risk assessment

**Risk: LOW. This is a fast-forward merge with no conflicts.**

| Property | Value |
|---|---|
| Merge base | `318e61f6` |
| `main` tip | `318e61f6` — **identical** |
| Commits on `main` not in the branch | **0** |
| `origin/main` ahead of local `main` | **0** |
| **Conflict risk** | **None — `main` has not moved since the branch point** |

### Change surface

| Category | Count / detail |
|---|---|
| Files added | **31** |
| Files modified | **32** |
| Files removed | **0** |
| Files renamed | **0** |
| Total | 63 files, +13,734 / −355 |
| `src/` only | 40 files, +4,196 / −349 |
| `docs/` only | 14 files, +9,504 (documentation is ~69% of the diff) |

**Major component replacements** — old components retained on disk, unimported, as rollback
targets: `Hero.jsx` → `HeroNetwork.jsx` + `HeroAddressEntry.jsx` + `NetworkDemo.jsx`;
`Services.jsx` + `HowItWorks.jsx` → `PlatformShowcase.jsx`; `WhyBrand.jsx` + `Coverage.jsx`
(homepage call sites only) → `TrustAndAccountability.jsx`; `BecomeADriver.jsx` removed from the
page. `ReviewMotion.jsx` → `SocialProofMotion.jsx` (created and superseded within the branch, so it
does not appear in the `main..HEAD` diff).

⚠️ **`WhyBrand.jsx` and `Coverage.jsx` are still live on `/medical` and `/legal` and must not be
deleted.**

**Routing changes: none.** Seven existing route files modified; **no route added, removed or
renamed**.

**Data-contract changes:** the send-flow storage key is **unchanged at `legaldrop.send-flow.v1`**,
now centralised in the new `src/lib/send-flow-contract.js` so the homepage and `/send` cannot drift.
`src/lib/config.js` is **untouched** — no API contract change.

**Environment-variable dependencies: no new ones.** All three (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
`GOOGLE_PLACES_API_KEY`, `NEXT_PUBLIC_API_BASE_URL`) already exist on `main`.

**Dependencies: none added.** `package.json` and `package-lock.json` are unchanged.

**CSS additions:** +171 lines in `src/styles/tailwind.css` (two marquee keyframes, hover/focus
pause, shared explicit-pause selector, two suppression blocks) and +15/−6 in `tailwind.config.js`.

**Image assets:** 6 partner WebP added (55 kB total); 8 existing JPEGs re-encoded smaller
(e.g. `legal-courthouse.jpg` 629 kB → 423 kB). No image grew.

### Confirmations

| Check | Result |
|---|---|
| Database migration | **none** |
| Backend migration | **none** |
| API contract modification | **none** — `config.js` unchanged, no API routes added |
| Send-flow storage contract | **`legaldrop.send-flow.v1`**, unchanged |
| Addresses in URLs | **none** — query and hash empty after handoff |
| Partner website links | **none** — all six `website: null`, zero anchors, and **zero external hrefs render on the homepage** |

---

## 14. Rollback procedure

Every commit is independently revertable and the branch has no dependency on external state.

**Whole release:** `git revert --no-commit 232cea7..HEAD && git commit`, or simply do not merge —
nothing is pushed.

**Targeted rollbacks, in increasing blast radius:**

| To undo | Revert | Effect |
|---|---|---|
| Partner logos only | `4589fcf` + `709a459` | Section disappears; nothing else changes |
| Partner approval only | `9e6ce5c` | Records return to `pending`; section hides itself with **no code change** |
| Partner motion only | set any record's `permission.displayAllowed` to `false` | That partner drops out; below three the strip reverts to a static row automatically |
| Review motion | `26d2949` + `497c697` | Static review grid returns beneath, untouched |
| Site title | `c2c2ba8` | Previous title restored |
| Booking entry | `7061734` + `0befc6d` | Hero reverts to CTA buttons |

**Runtime kill switches requiring no deploy:** unset `GOOGLE_PLACES_API_KEY` → the reviews section
disappears cleanly. Set every partner's `displayAllowed` to `false` → the partner section
disappears cleanly. Both are graceful, tested paths, not failure modes.

**Rollback assets retained on disk:** `Hero.jsx`, `Services.jsx`, `HowItWorks.jsx`,
`BecomeADriver.jsx` — unimported, kept deliberately because their comments carry the claim history
for language removed across Phases 4.1–4.3.

---

## 15. Open deployment checks

| # | Item | Type |
|---|---|---|
| 1 | Production Google Reviews validation | 🟡 **Deployment verification** — contract verified, production **not** |
| 2 | Browser Maps key referrer allowlist for the production domain | 🟡 **Deployment check** — silent degradation if missed |
| 3 | Privacy-policy security wording | ⚖️ **Professional review** — founder accepted publication pending review |
| 4 | Five-second positioning test | 🟣 **Founder-deferred** to post-launch |
| 5 | Real-user Core Web Vitals | 🟠 **Post-launch** — lab figures only |
| 6 | Metric review by **2026-11-03** | ⏰ **Time-bounded** — this expires |
| 7 | Insurance claims | ⚖️ **Professional review** — no claim on the site; blocks only restoring one |
| 8 | Mobile page length (7.37 screens at 390) · 768 px hero (1,098 px) | 🟠 **Post-launch improvement** |

**Launch blockers: 0.**

---

## 16. Files modified in Phase 11

| File | Change |
|---|---|
| `docs/HOMEPAGE_PHASE_9_REPORT.md` | authoritative blocker table row 4 corrected — partners now approved and rendering |
| `docs/HOMEPAGE_PHASE_10_REPORT.md` | superseded note on the "section stays hidden" wording claim |
| `docs/HOMEPAGE_PHASE_11_RELEASE_REPORT.md` | this report |

**No source file changed in Phase 11.** The release candidate is the code as it stood at
`5ac9a6e`; this phase verified it and reconciled documentation.

---

## 17. Commits created

| Commit | Subject |
|---|---|
| `f44806f` | `docs: reconcile final homepage state` |
| *(this report)* | `docs: add homepage release report` |

**No `fix(marketing)` commit was created** — the release-candidate verification found no defect to
fix, and an empty commit is worse than an absent one.

---

## 18. Merge recommendation

**Recommend merging `homepage-redesign` into `main`.**

- Fast-forward, **zero conflict risk** — `main` has not moved.
- No migrations, no backend change, no API contract change, no new dependency, no new environment
  variable, no route added or removed.
- Lint and production build clean; every public route 200 with a 404 control proving the harness.
- Zero unsupported rendered claims; zero application console errors on any route.
- Accessibility floors met on all routes; zero horizontal overflow 320 → 1920 and at 200% zoom.
- Performance budgets held exactly: static, 101 kB First Load JS, 87.2 kB shared, 4 islands,
  0 Maps/Places before interaction, CLS ≤ 0.002.
- Every risky surface has a graceful, tested absence: no key → no reviews; no approval → no
  partners; no JavaScript → static content; no Google → a working `/send` fallback.

## 19. Deployment recommendation

**Deploy only after the operator checklist in §12 is completed — and treat two items as
must-do-before-traffic:**

1. **Browser Maps key referrer allowlist must include the production domain.** Miss it and the
   homepage address entry degrades silently — the page still looks correct, which is why it needs
   deliberate verification rather than a glance.
2. **`GOOGLE_PLACES_API_KEY` + Places API (New) enabled**, then walk the ten-step Reviews check.
   Until then the reviews section is simply absent, which is honest but is not the intended
   launch state.

Then: diarise the **2026-11-03** metric review, begin collecting real-user Core Web Vitals, and
schedule the founder-deferred five-second test.

The privacy policy ships under the founder's recorded acceptance — a decision on record, not a
clearance.

## 20. Confirmation

- **Nothing has been pushed.** The branch has no upstream and no remote-tracking ref exists for it;
  `origin/main` is the only remote ref in the repository.
- **Nothing has been merged.**
- **Nothing has been deployed.**
- **No previous commit was amended.**
- **No test stub, fake approval or fabricated data was committed** — the review stub used for
  contract verification was reverted and verified absent.

---

**Phase 11 complete. Stopping here for explicit founder approval.**
