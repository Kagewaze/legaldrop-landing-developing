# Homepage Phase 9 — Final Launch Readiness

> **Status: verification complete. Six commits created. Nothing pushed, nothing merged.**
>
> *(Corrected in Phase 9.1: this line and §2 originally said five. Both were
> written before this report was itself committed and counted only the commits
> that existed at the time of writing. The report's own commit is the sixth.
> §23 and §30 already said six. Verified: `git rev-list --count 2037ca4..HEAD`
> = **6**, branch total 44.)*
>
> This phase verified the redesigned homepage as one integrated system rather than as nine
> independently-passed phases. Everything below was measured against a production build
> (`next build` + `next start`, Next.js 14.2.18) on **2026-08-05**. Figures that could not be
> captured reliably are marked as such rather than estimated, and every measurement that had to
> be corrected mid-flight is recorded in §26.
>
> **The headline result:** the page is ready to merge. It is **not** ready to deploy without
> founder action, because three gates are external — the five-second test has no participants,
> the production Google Reviews path has no credentials in this environment, and the privacy
> policy's security sentence is still assigned to counsel. None of those is an engineering
> failure. See §21.

---

## 1. Preflight

| Check | Result |
|---|---|
| `git status` | clean working tree |
| Branch | `homepage-redesign` ✅ |
| Unrelated uncommitted changes | none — did not need to stop |
| Commits since `main` at start | **38** |
| `497c697` present | ✅ `refactor(home): add accessible review motion` |
| `2037ca4` present | ✅ `docs: add Phase 8 motion report` |
| Implementation-plan governance amendment | ✅ present — **but not a separate commit** (see below) |
| Lint | ✅ `next lint` — no warnings or errors |
| Production build | ✅ compiled successfully, 16/16 static pages |
| Previous phase commit amended? | **No** — see below |

**The governance amendment is inside `2037ca4`, not a commit of its own.** The preflight asked
for it as a distinct item. It is not: `2037ca4` changed two files —
`docs/HOMEPAGE_PHASE_8_REPORT.md` (+420) and `docs/HOMEPAGE_IMPLEMENTATION_PLAN.md` (+1/−1), the
latter being the §9 auto-advance amendment. The amendment exists and is correct; the expectation
that it was separately committed was wrong. Recorded rather than glossed.

**No commit was amended.** Author date equals commit date on all 38 commits. That is consistent
with no rewrite after the fact (an amend or rebase normally leaves the two diverging), and it is
the strongest evidence available from the repository itself. Parent chain is linear and
unbroken from `232cea7` to `2037ca4`.

### Baseline recorded at preflight

| Metric | Value |
|---|---|
| `/` route type | **`○ (Static)`** — prerendered |
| `/` route size | **7.09 kB** |
| **`/` First Load JS** | **101 kB** |
| Shared JS (all routes) | **87.2 kB** |
| Client islands on `/` | **3** (4 when ≥ 4 reviews render) |
| Initial Maps requests | **0** |
| Initial Places requests | **0** |
| Initial Google Reviews requests | **0** (no key in this environment) |
| Total image transfer, homepage | **0 kB — the homepage renders no `<img>` at all** |
| Largest local image assets | `legal-courthouse.jpg` 413 kB, `legal-document.jpg` 296 kB (both `/legal` only) |

| Width | Page height | Screens | Hero height | Hero as viewports | CLS |
|---|---:|---:|---:|---:|---:|
| 390 × 844 | 6,223 px | **7.37** | 912 px | 1.08 | 0.0020 |
| 430 × 932 | 6,030 px | 6.47 | 897 px | 0.96 | 0.00003 |
| 768 × 1024 | 5,838 px | 5.70 | 1,098 px | 1.07 | 0.00023 |
| 1024 × 768 | 4,125 px | 5.37 | 773 px | 1.01 | 0.00023 |
| 1440 × 900 | 3,996 px | 4.44 | 696 px | 0.77 | 0.0001 |

*Hero-as-viewports uses each width's own paired height. Phase 7.1 quoted 768 as 1.30 viewports
because it divided by 844 rather than 1024; against a real iPad portrait viewport it is 1.07. Both
are correct arithmetic on different denominators — the number to carry forward is 1,098 px.*

---

## 2. Complete commit inventory

38 commits inherited, **6 created in Phase 9**, **44 total on the branch**.

*(Corrected in Phase 9.1 — this line originally read "5 created … 43 total",
counting only what existed when the sentence was written. The sixth is this
report's own commit, `7c8c8e5`.)*

### Created by Phase 9

| Commit | Subject |
|---|---|
| `30dd3b9` | `fix(marketing): remove courier self-description from published copy` |
| `3615bc8` | `fix(home): stop reduced motion hiding reviews` |
| `9a6caf6` | `fix(marketing): resolve final accessibility defects` |
| `b9e1cc3` | `fix(send): raise muted text to the AA contrast floor` |
| `bc17b06` | `docs: reconcile homepage phase reports` |

*(`7c8c8e5`, this report, is the sixth.)* No empty commits were created — the brief's suggested
"navigation and footer corrections" commit does not exist because the navigation and footer audit
found nothing to correct (§10, §11).

### Inherited (newest first)

`2037ca4` `26d2949` `497c697` `eccc4dd` `39b641e` `3689108` `5babe1e` `7061734` `0befc6d`
`a403efe` `d3a40f7` `269eaa3` `41f385c` `7824607` `fb8f25e` `a3d2440` `c1e8a92` `067740f`
`d3ab92f` `cdb7685` `55c73af` `f870aa4` `3a5aca3` `728fceb` `a8980ee` `e36ee96` `7d2195e`
`2e6d539` `2c537fb` `a00b187` `4282f0b` `138da2d` `0417d67` `2b153ef` `4c90250` `ce6ef57`
`8ec6643` `232cea7`

---

## 3. Final homepage narrative

Live section order, read from the rendered DOM at all five widths:

| # | Section | Rendered heading | Status |
|---|---|---|---|
| 1 | Hero and booking entry | *Same-day logistics infrastructure for the GTA* (h1) | ✅ |
| 2 | Operational Proof | *Operational record* | ✅ |
| 3 | Platform Showcase | *From request to recorded delivery* | ✅ |
| 4 | Google Reviews | *Rated N on Google* | ✅ **conditional** — absent without live data |
| 5 | Medical vertical | *Medical logistics with the delivery in view* | ✅ |
| 6 | Legal vertical | *Legal delivery with a record at every step* | ✅ |
| 7 | Trust and Accountability | *Know where the delivery stands* | ✅ |
| 8 | Footer | — | ✅ |

**Confirmed absent:** Services · HowItWorks · generic Why Druppr · neighbourhood-heavy Coverage ·
Become a Driver · any partner-logo strip. Verified by rendered text, not by reading `page.jsx`.

**Does the page argue the progression?** Yes, and each step is more concrete than the one above
it, which is the actual test in `HOMEPAGE.md`:

*What Druppr is* — a category headline with no verb, beside a labelled working demonstration →
*evidence it operates* — three dated founder-confirmed figures → *evidence of the software* —
three product frames showing request, tracking and the record → *real customer feedback* —
Google's own rating, or nothing → *regulated use cases* — medical then legal, each with a frame
drawn from the real field set → *accountability* — three capabilities the tracking surfaces
actually render → *action* — the closing dual CTA inside the trust section.

**Duplicated or contradictory sections: none found.** Two things were checked specifically
because they are the likely failure modes here, and both are clean:

- The medical and legal sections use the same component and could read as one idea twice. They do
  not: the eyebrows, headings, body copy and product frames all differ, and the frames show
  *different artifacts* (a delivery request vs. a delivery record). Ground alternates page → tint.
- "Tracking" appears in the Platform Showcase, the legal vertical and the Trust section. Each says
  something different — the surface, the retained record, the access model — rather than restating
  one claim three times.

**No copy was rewritten for the sake of difference.** The only copy changed in Phase 9 was
factually wrong (§8).

---

## 4. Five-second test — **NOT RUN. GATE REMAINS OPEN.**

**No test participants are available in this environment, so the threshold is not claimed and
cannot be.** This gate has been open since Phase 0 and it is still open.

To be explicit about what is *not* being asserted: I did not run the test, I did not simulate
participants, and an AI reading of the page is **not** a substitute and is not offered as one.
`HOMEPAGE.md` makes this the *primary hard gate* — the single measure the whole redesign is
subordinate to — and it is the one thing Phase 9 could not close.

### Founder-run test script

Everything below is ready to execute as written. Estimated 25–40 minutes total.

**Recruit.** 8–10 people; **5 is the floor** if that is all that is practically available. Draw
from the target segments: clinic or lab operations staff, legal operations or law-firm office
managers, SMB owners. **Exclude anyone who has seen the redesign** — not the founder, developer,
designer, or anyone shown a comp.

**Material.** The live homepage first viewport, nothing below the fold. Test both:
`1440 × 900` (desktop) and `390 × 844` (mobile). Use `docs`-adjacent captures
`home-firstviewport-1440` and `home-firstviewport-390` if live loading is impractical, but a live
page is preferred.

**Procedure.** Show the screen for **five seconds exactly**, then hide it. Do not let the
participant scroll. Do not let them see it again before answering. Then ask, in this order:

1. What does this company do?
2. What type of company is it?
3. Who do you think it serves?
4. What part of the page led you to that conclusion?

**Do not use the words "software", "platform", "network" or "technology" at any point** — not in
the intro, not in a follow-up, not in a clarification. Those words are the thing being measured;
saying them invalidates the response. Record answers verbatim.

**Scoring.** Score question 1 and 2 together, per `HOMEPAGE.md`:

| Bucket | Counts as |
|---|---|
| **PASS** | technology-enabled logistics platform · logistics software · delivery coordination network · a platform for booking and tracking deliveries · a logistics operating layer. *"They deliver medical samples and you track it through their system"* **passes** — recognising that deliveries happen is accurate and is not a failure. |
| **COURIER-ONLY** | a courier · a bike messenger · a generic local delivery company · a legal-document delivery firm only — **with no mention** of software, coordination, tracking or a platform. |

| Measure | Threshold |
|---|---|
| PASS | **≥ 80%** |
| COURIER-ONLY | **≤ 20%** |
| Names a regulated vertical (medical/legal/specimens/filings) | ≥ 60% |
| Can state a next action | ≥ 80% |

**Report:** participant count · device condition per participant · verbatim answers · the
bucketing decision for each · percentage passing · recurring confusion · **whether mobile and
desktop differ**, which matters here because the 390 first viewport carries less of the
demonstration than 1440 does (§13).

**If the test fails**, the likely lever is the first viewport at 390, not the copy: the headline
and subheadline already name the category and the domain without a send-verb, but at 390 the
demonstration's route line falls below the fold, so a mobile participant sees less evidence of a
system operating than a desktop one.

---

## 5. Production Google Reviews validation — **DEPLOYMENT GATE, NOT VERIFIED**

**No `GOOGLE_PLACES_API_KEY` is present in this environment** (no `.env` file exists in the
repository, and the variable is unset in the shell). The production review path therefore **was
not verified and is not claimed to be.**

What *was* verified, using a local stub that was reverted and never committed:

| Behaviour | Result |
|---|---|
| 0 reviews → no section at all | ✅ no heading, no skeleton, no "coming soon" |
| 1 review | ✅ static grid, no track, no pause control, singular *"based on 1 review"* |
| 3 reviews | ✅ static grid, no track, no pause control |
| 4 reviews | ✅ motion activates, duration 42 s |
| 5 reviews | ✅ motion, duration 53 s — same 34 px/s speed, not the same duration |
| Rating renders | ✅ *Rated 4.8 on Google*, and stars reflect the real per-review value (a 4-star review rendered 4 filled + 1 grey, not 5) |
| Total count renders | ✅ *based on 27 reviews*, pluralised correctly |
| Real review text renders | ✅ verbatim, full string in the DOM; `line-clamp` bounds the box only |
| Missing text handled | ✅ card renders header + rating + relative time, no empty paragraph |
| Reviewer initials render | ✅ *AO*, *JP*, *MT*, *S*, *DR* — including a single-word name |
| Google attribution renders | ✅ visible, and states that Google selects which reviews are shown |
| "See all reviews" destination | ✅ `google.com/maps/place/?q=place_id:…`, `target="_blank" rel="noreferrer"` |
| API failure removes the section cleanly | ✅ `getGoogleReviews()` returns `null` on every failure path; page renders 6 sections with no gap |

**Exact verification procedure for deployment** — run once, after the key is set:

1. Confirm `GOOGLE_PLACES_API_KEY` is set in the deploy environment. It must **not** be
   `NEXT_PUBLIC_`-prefixed; `src/lib/google-reviews.js` imports `server-only` so a client leak
   fails the build rather than shipping.
2. Confirm **Places API (New)** is enabled in Google Cloud Console. It is a *separate product*
   from the legacy "Places API" — enabling one does not enable the other. A 403 with
   `SERVICE_DISABLED` means exactly this.
3. Confirm the place identifier still resolves: `ChIJ6bQwlukxK4gRFaB2nvrNqWw`.
   Reviews are filed under **LegalDrop**, not Druppr — the footer's "formerly LegalDrop" line is
   what connects them for a visitor.
4. Load `/` and confirm the section appears between the Platform Showcase and the medical
   vertical.
5. Check the rendered rating and count against the live Google listing. They must match exactly.
6. Confirm reviews are verbatim and unfiltered — no reordering, no 5-star-only selection. This is
   a Google Terms requirement, not a preference.
7. Count the reviews rendered. **≥ 4 → the track must move and a Pause control must be present.
   1–3 → static grid and no control.**
8. Press Pause, move the pointer over a card, move it away. The track must stay paused.
9. Follow "See all reviews" and confirm it lands on the correct Google listing.
10. Re-check 24 h later: the section is cached with `revalidate: 86400`, so a stale rating is a
    false claim once the live one moves.

**Do not treat this section as verified until step 5 has been done against live data.**

---

## 6. Review-motion governance

`HOMEPAGE_IMPLEMENTATION_PLAN.md` §9 **does** now record the approved exception, added in
`2037ca4`. It states the previous prohibition verbatim, records that the Phase 8 brief approved a
moving track, lists the conditions attached, and notes that the static grid remains the behaviour
below four reviews. **The implementation and the governing document agree.** No contradictory
instruction remains in the repository.

All twelve behaviours verified against a five-review stub:

| Requirement | Result |
|---|---|
| Motion is left to right | ✅ `translateX` **−1411.5 → −1376.0 over 1 s = +35.4 px/s** against a 34 px/s target |
| Partner motion absent | ✅ no partner track exists at all |
| Explicit pause works | ✅ `animation-play-state: paused`, `aria-pressed="true"`, label → *Resume motion* |
| Resume works | ✅ back to `running`, `aria-pressed="false"` |
| Hover pause works | ✅ paused on hover, resumes on leave |
| `focus-within` pause works | ✅ paused when focus enters the track |
| Explicit pause authoritative after hover leaves | ✅ still `paused`, still `aria-pressed="true"` |
| Reduced motion is static | ✅ `animation-name: none`, `transform: none`, control `display: none` |
| JavaScript-disabled is static | ✅ identical declarations via `<noscript>` |
| Duplicates hidden from assistive tech | ✅ `aria-hidden="true"`; cards hold no links, so no duplicate tab stop |
| Pause control absent below four reviews | ✅ verified at 1 and 3 |
| Zero reviews produce no section | ✅ |

Keyboard: the control is a real `<button>`, reachable, and toggles on <kbd>Enter</kbd>. It is
rendered **before** the track, so a keyboard user meets it before entering the moving region.

**One defect was found here and fixed** — see §8 and `3615bc8`. The suppressed state was hiding
reviews rather than stopping motion.

---

## 7. Partner-logo gate

Recorded exactly as the brief requires:

- **No company logo is currently approved for homepage use.** No permission evidence has been
  supplied for any partner.
- **The "5 Business Partners" metric is a count, not permission.** It does not license displaying
  any name or mark, and no inference in that direction has been drawn.
- **Partner motion remains deferred.** It is not required for launch.
- **At least three approved logos are required** before any moving treatment is considered.
- **Each partner requires all eight approval fields** from the Phase 0 D8 checklist — legal name,
  display name, approved asset with clear-space rules, permission status (**written** only),
  approved description, approval date, approving person and role, and any review date.

**Verified absent from the repository:** no partner-logo directory, no empty directories, no
placeholder assets, no commented-out logo data, no dormant public component, no temporary company
names. `src/images/logos/logo.svg` is Druppr's *own* wordmark, unused and pre-dating this project.

The only `marquee` strings in the repo are the Phase 8 `review-marquee` keyframe and a comment in
`tailwind.config.js` recording that the old unused marquee config was **removed** in Phase 1 —
a comment documenting a removal, not a dormant feature.

**This gate is a documented future option. It is not launch debt in the rendered page.**

---

## 8. Final claim and terminology sweep

Swept every public marketing route and shared rendered component for all 37 listed terms.

**Method, and why the earlier method was insufficient.** Terms were matched against **rendered
text** — `document.body.innerText` plus `alt`, `aria-label`, `title`, and `<head>` metadata —
rather than against source, because a source grep cannot distinguish a comment from a claim.
Word-boundary matching was used: a raw substring search reports 334 hits for `SLA` by matching
`slate-500`, which is noise, not evidence.

**Positive controls fired on every route** (e.g. *Same-day logistics infrastructure*, *Druppr*,
*Medical* on `/`; *Privacy* on `/privacy-policy`). Two routes initially returned 37 characters and
were flagged **EXTRACTION VOID** rather than "clean" — investigation showed `/track/DEMO123` and
`/track-partner/demo` legitimately render only *"Tracking unavailable / Order not found"* for a
fake code. An empty extraction was never accepted as evidence of a clean page.

### Surviving occurrences, classified

| Term | Where | Classification |
|---|---|---|
| `security`, `restricted access`, `encryption` | `/privacy-policy` body | **Legal-document wording awaiting counsel** — §9. Untouched. |
| `marquee` | `tailwind.config.js` comment | **Internal comment documenting removed language** — records a Phase 1 deletion; does not state it as current |
| `courier`, `drop-off code`, `chain of custody`, `TDG`, `fully insured`, `temperature controlled`, `standing routes`, `monthly invoicing` | source comments only | **Internal comments documenting removed claims.** Each records what was removed and why. None asserts the claim as a current fact. |

**Unsupported public claims remaining: zero.**

### Two live defects found and fixed — `30dd3b9`

Both were published text that eight phases of sweeps had missed, because every previous sweep read
the rendered `<body>` and neither of these is body copy.

**1. The site-wide meta description self-described Druppr as a courier — on all six public
routes.** It read:

> *"Same-day courier and delivery across Toronto and the GTA — with more cities coming soon. See
> your price before you book."*

This is emitted into `<head>` on every route, so it is the copy that appears in search results,
link previews and bookmarks — read *before* the page, by people who may never scroll. Two defects
in one string: **"Same-day courier"** violates content gate **C1** and `VISION.md`'s unconditional
rule that Druppr is never described as a courier "internally or externally"; **"more cities coming
soon"** is an unsupported forward-looking claim (no second city is evidenced anywhere, and Phase 0
D7 rules out "coming soon" framing).

Replaced with the h1 and subheadline from `HeroNetwork.jsx` — already vetted in Phase 2 — so the
description and the page now make the same claim in the same words.

**2. `/medical` alt text called the subject a courier.** *"A courier moving boxes on a hand truck
from a delivery van."* The same file's Phase 5 note explains that it gave up the higher-volume
"medical courier" search term in its `<title>` precisely because of this rule — and then said the
word anyway, two blocks below. Alt text is announced by screen readers and indexed. Now *"A person
moving boxes on a hand truck from a delivery van"*, which also assigns no job title the photograph
does not support.

**Verified:** occurrences of "courier" in served HTML went **6 → 0** across `/`, `/medical`,
`/legal`, `/contact-us`, `/send`, `/privacy-policy`.

**Deliberately not changed:** the site title *"Druppr — Your city's same-day delivery network"*.
"Delivery network" is a rung above courier and sits inside the five-second test's accepted
answers; it is also the established brand tagline in `config.js`. Changing it is a wording
decision for the founder, not a defect. **Flagged, not touched.**

> ⚠️ **SUPERSEDED BY PHASE 9.1 (Gate 6).** The founder approved replacing it with
> *"Druppr — Same-day logistics infrastructure for the GTA"* on 2026-08-05. See the
> Phase 9.1 appendix, §9.1-9.

---

## 9. Privacy-policy status — **PROFESSIONAL REVIEW REQUIRED**

The policy body states:

> *"We implement security measures to protect your information, including encryption and
> restricted access."*

**Confirmed still present and deliberately unedited.** No engineering judgement was applied to it.
It remains assigned to privacy counsel, exactly as Phase 0 D10 left it.

**Launch decision required — pick one, none can be made by engineering:**

| Option | Consequence |
|---|---|
| **Counsel approves the wording** | Ships as written. Requires evidence of the review. |
| **Founder explicitly accepts publishing pending review** | Ships with the risk accepted and recorded. |
| **Page temporarily withheld** | Removes the footer's only Support link and the site's only privacy disclosure. Not recommended. |
| **Wording remains a legal blocker** | Site does not launch until resolved. |

**The site is not claimed to be legally reviewed.** No evidence of any legal review exists in this
repository, and none is asserted.

**Two further privacy-policy observations, reported rather than actioned** — both are content
questions for counsel, not defects I should fix:

1. The page hardcodes `legaldropeng@gmail.com` and `+13435984928`. `src/lib/navigation.js`
   deliberately holds `SUPPORT_PHONE` and `SUPPORT_EMAIL` at `null` because neither has been
   verified as a monitored channel, and its comment says contact details must not be reintroduced
   at a call site. The privacy policy is the one surface still doing so. If those channels are not
   monitored, a privacy page is the worst place to publish them.
2. The page uses `next/head`, which is a **Pages Router API and a no-op in the App Router**. Its
   `<title>` ("Privacy Policy | LegalDrop") and description ("…for secure, compliant delivery
   solutions") therefore **never render** — the route serves the site-wide default instead. The
   dead description contains "secure, compliant", which would become an unsupported public claim
   the moment anyone "fixed" the metadata by migrating it. Left in place; flagged loudly.

*(The page's nested `<main>` was an accessibility defect and was fixed — §14. That changed an
element name, not one word of policy text.)*

---

## 10. Navigation and CTA results

Every visible link and button on `/`, `/medical`, `/legal`, `/contact-us`, `/send` and
`/privacy-policy` was enumerated from the rendered DOM and every distinct destination resolved.

**No visible link returns 404. No visible link points at an unlaunched page. No dead routes. No
sensitive state in any URL.** A `/nonexistent-route` control returned **404**, confirming the 200s
are meaningful rather than a catch-all.

| Area | Links | Result |
|---|---|---|
| **Header** | logo → `/`, Medical → `/medical`, Legal → `/legal`, Contact → `/contact-us`, CTA *Send a package* → `/send` | all **200** |
| **Header — Track** | — | **correctly absent.** `ROUTES.track.live === false`; `/track` exists only as `/track/[code]`. Rendering it would be a dead link (gate C5). The `live` flag is doing its job. |
| **Mobile navigation** | same five, in a disclosure | ✅ opens, traps nothing, closes |
| **Hero** | pickup + drop-off fields, *Continue to booking*, *Talk to our team* → `/contact-us` | ✅ all functional — §12 |
| **Hero — no-JS** | *Book a delivery* → `/send`, *Talk to our team* → `/contact-us` | ✅ both present and correct only when scripting is off |
| **Hero — degraded Places** | *Continue on the full booking page* → `/send` | ✅ appears only when lookup is degraded |
| **Verticals** | *See medical delivery* → `/medical`, *See legal delivery* → `/legal` | **200** |
| **Trust section** | *Book a delivery* → `/send`, *Talk to our team* → `/contact-us` | **200** |
| **Google Reviews** | *See all reviews* → Google Maps place URL | external, `target="_blank"`, **`rel="noreferrer"`** ✅ |
| **Partner signup CTAs** | `/medical` ×3, `/legal` ×2, `/contact-us` ×1 → `partner.legaldrop.ca/signup` | **200** |
| **Footer** | Send a package, Medical delivery, Legal documents, Contact, Privacy policy, wordmark → `/` | all **200** |

**Labels match destinations, and the login/signup trap is closed.** Every account-creation CTA
targets `PARTNER_SIGNUP_URL` (`/signup`), not the bare origin — which redirects to `/login`. A
clinic clicking *"Set up your clinic account"* reaches an account-creation form, not a password
field. This was Phase 5's fix and it holds.

**`rel` on external links:** the partner signup links open in the **same tab**, so no `rel` is
required. The single `target="_blank"` link (Google reviews) carries `rel="noreferrer"`, which
implies `noopener`. Correct as-is.

**No dashboard is promised.** Nothing on the homepage offers a dashboard, portal or live view that
does not exist.

---

## 11. Footer corrections — **none required**

The footer was audited and **no change was needed**, so no commit was created for it.

`FOOTER_SECTIONS` in `src/lib/navigation.js` still *defines* 19 destinations, but `Footer.jsx`
filters on `item.live` and drops any section left empty. What actually renders:

| Column | Rendered | Suppressed (`live: false`) |
|---|---|---|
| **Services** | Send a package · Medical delivery · Legal documents | Request a ride · Marketplace · Drop Batch · Tow truck · Designated driver · Pet transport · Rent a car · Training hub |
| **Company** | Contact | About · **Become a driver** · Careers |
| **Support** | Privacy policy | Track a delivery · Help centre · Terms of service |

This already satisfies every requirement: **three live service categories**, no inactive routes,
no future services, no unsupported capabilities, **no driver recruitment**, no unapproved
integrations, no unlaunched product pages. Shared legal and contact links are retained and valid.

**One open item, and it is a founder decision, not a defect.** Phase 0 **OQ-3** approved the
category names *Same-day delivery · Medical logistics · Legal delivery*; the footer renders
*Send a package · Medical delivery · Legal documents*. Phase 0 recorded adopting the approved
names as **"recommended"**, not binding, and noted the current labels match the destination pages
and the nav CTA vocabulary. Neither set is inaccurate. Renaming is a copy decision — listed in §21
rather than made here.

---

## 12. Booking-flow end-to-end results

All 18 steps run against the final integrated homepage using **generic public landmarks only** —
Toronto City Hall and Toronto Pearson International Airport. No personal address was entered, and
no committed screenshot contains one.

| # | Step | Result |
|---:|---|---|
| 1 | Fresh homepage load | ✅ |
| 2 | Zero Maps/Places requests before interaction | ✅ **0 / 0** |
| 3 | Focus pickup | ✅ |
| 4 | One library bootstrap | ✅ **one** `maps/api/js` request; `places.js` / `main.js` are that bootstrap's own modules, not a second loader |
| 5 | Select a generic public pickup | ✅ 5 suggestions → `100 Queen St W, Toronto, ON M5H 2N1, Canada` |
| 6 | Select a generic public destination | ✅ 5 suggestions → `6301 Silver Dart Dr, Mississauga, ON L5P 1B2, Canada` |
| 7 | Submit enables only after **both** valid selections | ✅ disabled with one, enabled with two |
| 8 | Edit a selected address | ✅ |
| 9 | Coordinates invalidate | ✅ submit returns to disabled |
| 10 | Re-select | ✅ submit re-enables |
| 11 | Submit | ✅ navigates to `/send` |
| 12 | Session storage uses `legaldrop.send-flow.v1` | ✅ shape `{address, lat, lng}` per `pickup`/`dropoff`, all four coordinates finite |
| 13 | No addresses or coordinates in the URL | ✅ query and hash both empty |
| 14 | `/send` loads both addresses | ✅ both fields populated; map rendered a **34.2 km trip**; Continue enabled |
| 15 | Unrelated valid booking state preserved | ✅ seeded `packageCount: 3`, `weight`, `vehicle` all survived — the write merges, never replaces |
| 16 | Malformed state does not crash | ✅ five payloads (`{not json`, half-record, `null`, `[]`, non-finite coords) — page rendered every time, fields empty, submit disabled, **zero page errors** |
| 17 | Google failure exposes the `/send` escape path | ✅ *Continue on the full booking page* → `/send`; typed text preserved; no key or config name exposed |
| 18 | JavaScript-disabled fallback links work | ✅ form hidden, fallback revealed, *Book a delivery* → `/send`, *Talk to our team* → `/contact-us` |

**Zero console errors** across the happy path.

---

## 13. Responsive results

Nine widths. **No horizontal overflow at any width. No clipped content at any width. No element
extends past the viewport at any width.** `sr-only` content was excluded before reporting, and the
review track's deliberate `overflow-hidden` was excluded from clipping counts.

| Width | Page height | Screens | Hero | Overflow | Clipped |
|---|---:|---:|---:|---|---|
| 320 × 568 | 6,728 | 11.85 | 968 | none | none |
| 360 × 740 | 6,325 | 8.55 | 906 | none | none |
| 390 × 844 | 6,223 | **7.37** | 912 | none | none |
| 430 × 932 | 6,030 | 6.47 | 897 | none | none |
| 768 × 1024 | 5,838 | 5.70 | **1,098** | none | none |
| 1024 × 768 | 4,125 | 5.37 | 773 | none | none |
| 1280 × 800 | 3,996 | 5.00 | 696 | none | none |
| 1440 × 900 | 3,996 | 4.44 | 696 | none | none |
| 1920 × 1080 | 3,996 | 3.70 | 696 | none | none |

Also verified at every width: headings wrap deliberately (`text-balance` on the h1); address
suggestions stay within the viewport; the review track does not widen the page; the pause control
stays inside the 1200 px column rather than following the full-bleed track to the viewport edge;
product frames remain readable; medical and legal remain visually distinct via alternating
grounds; the trust section stays compact; the footer collapses 3 → 2 → 1 columns and stays usable.

### Mobile first viewport at 390 — **8 of 10 required items present**

| Item | 390 | 430 | 768 |
|---|---|---|---|
| Complete H1 | ✅ | ✅ | ✅ |
| Complete supporting statement | ✅ | ✅ | ✅ |
| Both address fields | ✅ | ✅ | ✅ |
| Primary action | ✅ | ✅ | ✅ |
| Business action | ✅ | ✅ | ✅ |
| Demonstration labels | ✅ | ✅ | ✅ |
| **Complete route** | ❌ **below fold** | ✅ | ✅ |
| **Active dispatch status** | ⚠️ **partial** | ✅ | ✅ |

The hero is 912 px against an 844 px viewport, so it overruns by 68 px and the route line
(*Downtown → North York*) falls just below. **This was not "fixed" by compressing further**: the
brief is explicit that product evidence must not be hidden to meet a screen-count target, and
Phase 7.1 already rebalanced this hero once. Reported as a measured gap (§21), not papered over.

### 768 px hero height, stated honestly

**1,098 px — the tallest hero at any width**, and 1.07 × a 768 × 1024 viewport. It is taller in
absolute pixels than at 390 (912 px) because the layout is still single-column at 768 while the
demonstration panel has grown to its 520 px cap. This remains the honest weak point Phase 7.1
identified; it is improved but not resolved.

### Mobile scroll length

**7.37 screens at 390** against `HOMEPAGE.md` **E1 ≤ 5 phone screens** — the gate is **missed**.
`HOMEPAGE.md` §12 anticipates exactly this and rules that "trust and conversion content is never
cut to hit the scroll number; if the two conflict, the scroll target yields and the reason is
recorded." The reason is recorded here: the remaining length is the hero, three product frames,
two verticals and the trust section — all evidence, none of it removable without weakening the
argument the page exists to make. Listed in §21 as a founder decision.

---

## 14. Accessibility results

Audited all eight public routes as one system.

| Check | Result |
|---|---|
| Exactly one `<h1>` per route | ✅ 8/8 |
| No heading-level skips | ✅ 8/8 |
| Valid landmark structure | ✅ **after two fixes** — see below |
| Skip link works | ✅ **after one fix** — first tab stop on every route with chrome |
| Visible labels | ✅ no placeholder-as-label anywhere |
| Autocomplete combobox semantics | ✅ `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`, `role="listbox"`/`option` |
| Unique IDs | ✅ zero duplicates on every route, including the duplicated review set (keys namespaced) |
| Visible focus | ✅ every tab stop |
| No focus trap | ✅ |
| Logical tab order | ✅ skip link → header → content → footer |
| Minimum target sizes | ✅ **after one fix** — zero targets < 24 px on any route |
| Pause control semantics | ✅ real `<button>`, `aria-pressed`, visible word carries state |
| Pause state via `aria-pressed` | ✅ flips `false` ↔ `true` |
| Motion pauses on focus | ✅ `:focus-within` on the track |
| Reduced-motion static state | ✅ **after one fix** — §8 / `3615bc8` |
| Review duplicates hidden | ✅ `aria-hidden="true"` |
| Rating expressed in text | ✅ `aria-label="N out of 5"`; glyphs `aria-hidden` |
| No static content in `aria-live` | ✅ the hero's suggestion status is `aria-describedby`, deliberately **not** live, so it does not announce on every keystroke |
| Images have appropriate alt | ✅ 5/5; homepage has none |
| Decorative SVGs hidden | ✅ 0 exposed of 2 on `/`, 3 on `/medical` and `/legal` |
| No false buttons | ✅ zero clickable non-interactive elements |
| No colour-only status | ✅ the autocomplete's active option carries a brand rule on its leading edge as well as a tint |
| No visible clipping at 200% zoom | ✅ verified at 720 × 450 CSS (≈ 1440 at 200%) |
| No horizontal overflow | ✅ 320 → 1920 |
| Contrast (composited) | ✅ **after one fix** — §16 |
| JavaScript disabled | ✅ page fully readable; hero swaps to link pair; reviews static |

**`sr-only` content was excluded from clipping and target-size findings**, per protocol. The
homepage's four `sr-only` nodes — the skip link, two field hints and the demonstration's text
equivalent — are intentionally clipped and are **not** defects.

### Three defects found and fixed — `9a6caf6`

1. **`/send`, `/send/details`, `/send/pay` had no `<main>` landmark and no skip link.** The only
   routes on the site with neither: they use their own chrome rather than
   `components/Layout.jsx`. WCAG **2.4.1** and **1.3.1**. This matters most precisely here —
   `/send` is where the hero hands a visitor off, so a keyboard user starting a booking on the
   homepage landed on the one route that made them tab the whole nav again.
2. **`/privacy-policy` had two `<main>` landmarks.** It renders `<Layout>` (which supplies
   `<main id="main-content">`) and then opened a second inside it. Measured 2 against 1 on every
   other route. Now a `<div>`; classes unchanged, nothing moved, **no policy text touched**.
3. **`/contact-us` had two targets at 20 px.** The last sub-24 px targets on any public route,
   against WCAG **2.5.8**. The criterion's inline exception does not apply — each is a standalone
   block link heading its own list item, not a link inside a sentence.

---

## 15. Core Web Vitals

**Lab measurements. These are not field data and must not be reported as such.** Seven isolated
browser contexts per profile; median reported.

### Desktop 1440 × 900, unthrottled

| Metric | min | **p50** | max |
|---|---:|---:|---:|
| **LCP** | 1,520 ms | **1,900 ms** | 2,504 ms |
| FCP | 1,520 ms | 1,900 ms | 2,504 ms |
| **CLS** | 0.0001 | **0.0001** | 0.0001 |
| TBT | 0 ms | **0 ms** | 82 ms |

Transfer **212 kB at load**, 296 kB after 3 s idle (the difference is Next's `<Link>` prefetch of
other routes, which happens after load and blocks nothing).

### Mobile 390 × 844, 1.6 Mbps / 150 ms RTT, 4× CPU throttle

| Metric | min | **p50** | max |
|---|---:|---:|---:|
| **LCP** | 2,044 ms | **2,176 ms** | 3,336 ms |
| FCP | 2,044 ms | 2,176 ms | 3,336 ms |
| **CLS** | 0.002 | **0.002** | 0.002 |
| TBT | 15 ms | **95 ms** | 476 ms |

Transfer **248 kB at load**, 263 kB total.

| Target | Result |
|---|---|
| LCP ≤ 2.5 s | ✅ **1,900 ms desktop, 2,176 ms mobile** |
| *(plan's stricter ≤ 2.0 s)* | ⚠️ **missed on mobile** at p50 2,176 ms |
| CLS ≤ 0.05 | ✅ **0.0001 / 0.002** — 25× inside budget |
| No major long tasks from homepage code | ✅ TBT p50 0 ms desktop, 95 ms mobile |
| Zero Maps/Places before address interaction | ✅ **0** |
| No unexplained JS growth | ✅ First Load JS **101 kB**, unchanged from Phase 8 |
| No render-blocking third-party animation library | ✅ none — all motion is CSS |
| Transfer ≤ 600 kB desktop / ≤ 400 kB mobile | ✅ **296 kB / 263 kB** |

**LCP equals FCP on every run, and the LCP element is the `<h1>` text.** The homepage ships no
images at all, so nothing competes with text for the largest paint — the best available shape for
this metric.

**Interaction:** no INP measurement is claimed. INP requires real interactions over a session;
the available proxy (focus the pickup field → two frames) ran **48–86 ms**, which indicates the
first interaction is not blocked but is **not an INP figure**.

### ⚠️ Environment limitation, stated plainly

These come from a **local loopback server on a developer workstation**, throttled through CDP.
Loopback has no real DNS, TLS, TCP slow-start or contention, and the machine was concurrently
running builds. The desktop LCP spread (1,520–2,504 ms **unthrottled**, a 1-second range on a
localhost text paint) is measurement noise, not page behaviour. **Treat the CLS and request-count
figures as reliable and the LCP/FCP figures as indicative only.** Real-user Core Web Vitals must
be collected after deployment — §21.

---

## 16. Image audit and optimizations

**Resolution: no downscaling was performed, because measurement showed it would not reduce
transfer.** That is a closeout, not a deferral.

### Inventory

| Asset | Source | Size | Ships? | Used by |
|---|---|---:|---|---|
| `legal-courthouse.jpg` | 2000×1500 | 413 kB | ✅ | `/legal` |
| `legal-document.jpg` | 2000×1500 | 296 kB | ✅ | `/legal` |
| `legal-lawoffices.jpg` | 2000×1500 | 199 kB | ✅ | `/legal` |
| `medical-pharma.jpg` | 2000×1500 | 168 kB | ✅ | `/medical` |
| `medical-specimen.jpg` | 2000×1500 | 139 kB | ✅ | `/medical` |
| `hero-cyclist.jpg` | 2400×1400 | 294 kB | ❌ | rollback only (`Hero.jsx`, unimported) |
| `home-coverage-baystreet.jpg` | 2400×900 | 232 kB | ❌ | unimported |
| `medical-temp.jpg` | 2000×1500 | 161 kB | ❌ | unimported |
| `logo.png` / `logo.jpg` / `logos/logo.svg` / `track.jpg` | — | 130/47/79/89 kB | ❌ | unimported |

**The homepage, `/contact-us` and `/send` render zero images.** Only five assets reach the build,
confirmed against `.next/static/media`.

### Rendered vs. delivered

| Asset | Rendered (1440) | Rendered (390, DPR2) | `sizes` | AVIF served |
|---|---|---|---|---|
| `medical-pharma` | 560×400 css | 326×320 css | `(min-width:1024px) 33vw, (min-width:640px) 50vw, calc(100vw - 4rem)` | **11 kB** / 14 kB |
| `medical-specimen` | 560×400 | 326×320 | same | **6 kB** / 8 kB |
| `legal-courthouse` | 368×400 | 326×320 | same | **56 kB** / 79 kB |
| `legal-document` | 368×400 | 326×320 | same | **18 kB** / 24 kB |
| `legal-lawoffices` | 368×400 | 326×320 | same | **19 kB** / 27 kB |

All five are `loading="lazy"`, all carry intrinsic dimensions (static imports, so no layout
shift), all have correct responsive `sizes`, and **all are delivered as AVIF** —
`next.config.js` already sets `formats: ['image/avif','image/webp']`.

### Why no downscaling

Next resamples every source to `w=640` (desktop) or `w=750` (mobile DPR2) and re-encodes to AVIF
**before** it reaches a browser. `legal-courthouse.jpg` is a 413 kB source that transfers as
**56 kB**. Shrinking the source would therefore change the *repository and build artifact* size,
not user-facing transfer — and the brief's own criterion is that downscaling must "reduce actual
transfer or build output". Against that test:

- **Transfer: no benefit.** Already resampled and AVIF-encoded.
- **Quality: a real risk.** Max plausible rendered need is 1120 px (560 css × DPR2). A 2000 px
  source has genuine headroom; cutting toward 1400 px narrows it for future layouts.
- **These were already optimized in Phase 1** (`4c90250`), and the brief says not to repeatedly
  recompress already-optimized assets.

**One residual, reported not actioned:** the original JPEGs remain the final fallback for browsers
supporting neither AVIF nor WebP (~2–3% of traffic). Such a browser would download the full
413 kB. Given the share and that AVIF/WebP negotiation is automatic, this does not justify
degrading the source for everyone else.

**Unused rollback assets were not touched**, per the brief — they do not ship.

**No image was modified, so there are no before/after transfer measurements to report.**

---

## 17. Client-island inventory

| Island | File | Why it must be client | Present on `/` |
|---|---|---|---|
| `HeaderMobileNav` | `src/components/HeaderMobileNav.jsx` | mobile nav disclosure state | **always** (shared header) |
| `NetworkDemo` | `src/components/home/NetworkDemo.jsx` | advances the demonstration status sequence | **always** |
| `HeroAddressEntry` | `src/components/home/HeroAddressEntry.jsx` | Places lookup, selection state, sessionStorage write | **always** |
| `ReviewMotion` | `src/components/home/ReviewMotion.jsx` | owns one boolean — whether the visitor explicitly paused | **only when ≥ 4 reviews render** |

**Count: 3 on the live page today; 4 when Google returns four or more reviews.** Verified from the
rendered DOM, not by reading imports.

| Confirmation | Result |
|---|---|
| No homepage-wide provider | ✅ no `SendFlowProvider` on `/` — it would convert the page to a client boundary |
| No duplicate Maps loader | ✅ one `maps/api/js` request, from `src/lib/maps-loader.js` |
| No full send-flow context | ✅ |
| No third-party marquee package | ✅ all motion is CSS in `src/styles/tailwind.css` |
| No unnecessary client component | ✅ each of the four owns interaction that cannot be server-rendered |
| Reviews remain server-fetched | ✅ `google-reviews.js` imports `server-only` |
| Review cards remain server-rendered | ✅ they reach `ReviewMotion` as `children`, so no review data enters the client bundle |

**The count is reconciled across all reports** — see §20. The Phase 6 report's "1 island" was
wrong (it missed `NetworkDemo`); a superseded-by note now sits in Phase 6 carrying the full
running total, so the earlier one-vs-two documentation error is not repeated here.

**⚠️ The count now exceeds both documented ceilings** — `HOMEPAGE.md` E5 says ≤ 2 (a hard gate),
the implementation plan §10 says ≤ 3. The two have disagreed since they were written. Recorded in
the plan and escalated in §21 rather than resolved in code, because raising a hard gate is a
founder decision. Every island traces to an approved decision (D4, D5, Phase 8), and the budget
the ceiling protects is still met: `/` is static and First Load JS is 101 kB against a 130 kB cap.

---

## 18. Failure-state results

| State | Result |
|---|---|
| Google Places key missing / referrer-rejected | ✅ *"Address suggestions are unavailable right now."* · typed text kept · submit stays disabled · `/send` escape link appears · **no key or config name exposed** |
| Google Places request failure | ✅ identical path; verified by aborting every Google request at the network layer |
| No address results | ✅ *"No matching addresses."* visible + `sr-only` status; submit disabled |
| Malformed session storage | ✅ five payloads, page rendered every time, **zero page errors** |
| Session storage unavailable | ✅ `getItem`/`setItem` made to throw `SecurityError` — homepage rendered all 6 sections, both fields present, **zero page errors** |
| Google Reviews API failure | ✅ `null` → section absent entirely; page renders 6 sections with no gap |
| Zero reviews | ✅ no section |
| One review | ✅ static grid, no control, **singular** "1 review" |
| Three reviews | ✅ static grid, no control |
| Four reviews | ✅ track moves, control present |
| Missing review text | ✅ card renders without an empty paragraph |
| Missing profile image | ✅ **not applicable by design** — initials are always used; `profile_photo_url` is never requested, so there is no image to be missing |
| Slow network | ✅ 1.6 Mbps / 150 ms / 4× CPU — LCP p50 2,176 ms, no layout shift |
| JavaScript disabled | ✅ hero form hidden, link pair revealed, reviews static, page fully readable |
| Reduced motion | ✅ **after the fix in `3615bc8`** — all reviews readable and no motion anywhere |

**The page remains useful and truthful in every state.** In no failure state does it claim
something untrue, and in no state is the visitor left without a route into the product.

**No test stub was committed.** The review stub was applied, measured, and reverted; the working
tree was verified clean of `REVIEW_STUB`, `force-dynamic` and stub markers before every commit.

---

## 19. Screenshot inventory

**41 deterministic captures**, all with animations paused and transitions settled first. Held in
the working scratchpad, **not committed** — they contain stub review data in the review states,
and the brief prohibits committing temporary review stubs. Committing them is a one-command step
once live review data exists.

| Group | Captures |
|---|---|
| Full homepage | 390 · 430 · 768 · 1024 · 1440 |
| First mobile viewport | 390 · 430 · 768 · 1024 · 1440 |
| Hero — empty fields | 390 · 1440 |
| Hero — selected addresses | 390 · 1440 *(generic public landmarks only)* |
| Hero — autocomplete open | 390 · 1440 |
| Hero — degraded Places | 390 · 1440 |
| Platform Showcase | 390 · 1440 |
| Operational Proof | 390 · 1440 |
| Medical vertical | 390 · 1440 |
| Legal vertical | 390 · 1440 |
| Trust section | 390 · 1440 |
| Footer | 390 · 1440 |
| No-JavaScript homepage | 390 · 1440 |
| Reduced-motion homepage | 1440 |
| `/medical` · `/legal` · `/contact-us` · `/send` | 390 · 1440 each |
| Reviews — running / paused / reduced-motion / no-JS | 1440 (+390 running) — **stub data** |
| `/send` after successful handoff | 1440 |

**No real private address, customer data, partner mark or personal information appears in any
capture.** The only addresses shown are Toronto City Hall and Toronto Pearson International
Airport.

---

## 20. Documentation reconciliation

Committed in `bc17b06`. Forward pointers were added **at the point of each stale claim**; nothing
historical was rewritten, so a reader still sees the original conclusion *and* what superseded it.
Previously every correction lived only in the later report, where a reader of the earlier one
would never find it.

| Item | Status |
|---|---|
| **Phase 2.1 contrast correction** | ✅ **Phase 2's "0 contrast failures" row now marked superseded**, pointing at the Phase 4 account. The probe compared raw `rgba()` as opaque; three elements actually failed. |
| **Phase 4 gallery measurement correction** | ✅ already self-contained in Phase 4 (§7 and the `ExpandingGallery` computed-style artifact). No pointer needed. |
| **Phase 6 tracking-link wording correction** | ✅ already self-contained — Phase 6.1 corrects "shared" → "shareable" in the same document, including the rationale comments. |
| **Client-island counts** | ✅ **Phase 6's "1 island" marked wrong** (missed `NetworkDemo`), with the full running total across all nine phases in one place. |
| **Current First Load JavaScript** | ✅ 101 kB, recorded here and in the plan's new §10 note. |
| **Current section order** | ✅ §3 above, read from the rendered DOM. |
| **Current claim status** | ✅ §8 above — zero unsupported public claims. |
| **Review-motion governance amendment** | ✅ verified present in the plan §9 (`2037ca4`); implementation and document agree. |
| **Partner gate status** | ✅ §7 above — unmet, deferred, no scaffolding. |
| **Island ceiling conflict** | ✅ **newly recorded** in the plan §10: `HOMEPAGE.md` E5 (≤ 2) and the plan (≤ 3) disagree, and both are now exceeded. Escalated, not silently re-baselined. |

---

## 21. Launch-blocker table

> ⚠️ **SUPERSEDED — first by Phase 9.1 (§9.1-11), then by PHASE 9.2 (§9.2-5), which is now the
> authoritative blocker table.** The table below is retained as the Phase 9 record.

| # | Item | Classification | Detail |
|---|---|---|---|
| 1 | **Formal five-second test** | 🔴 **Blocker** | The primary hard gate in `HOMEPAGE.md`. Never run. No participants available. Script ready in §4. **This is the one item that should stop a deploy**, because it is the measure the entire redesign is subordinate to. |
| 2 | **Privacy-policy security wording** | ⚖️ **Professional review required** | Counsel must approve, or the founder must explicitly accept publishing pending review. Untouched by engineering. §9. |
| 3 | **Production Google Reviews validation** | 🟡 **Founder decision required** | No credentials in this environment; contract verified against stubs. Ten-step procedure in §5. Does not block the build — the section is absent without data. |
| 4 | **Partner-logo permission** | ✅ **Closed for launch** | Gate unmet, treatment deferred, **not required for launch** and correctly not treated as a blocker. No scaffolding in the repo. §7. |
| 5 | **Live insurance status** | ⚖️ **Professional review required** | No policy evidence in the repo. All insurance claims already removed (Phase 4.3). Nothing on the site depends on this — it blocks only *restoring* such a claim. |
| 6 | **App store badges and URLs** | 🟡 **Founder decision required** | No store reference exists anywhere in the codebase. Phase 0 assigned badges to the Platform Showcase pending live status, URLs and official artwork. Not required for launch. |
| 7 | **Metric review date** | 🟡 **Founder decision required** | The proof section renders *"Accurate as of August 2026."* A stale metric is a false claim, so a re-confirmation date must be set. **Time-bounded: this expires.** |
| 8 | **768 px hero height** | 🟠 **Post-launch improvement** | 1,098 px, 1.07 viewports — the tallest hero at any width. Improved in Phase 7.1, not resolved. §13. |
| 9 | **Mobile page length** | 🟡 **Founder decision required** | 7.37 screens at 390 against E1's ≤ 5. `HOMEPAGE.md` §12 permits the target to yield to trust content, which is what happened. Closing it means removing evidence. |
| 10 | **Real-user Core Web Vitals** | 🟠 **Post-launch improvement** | Lab figures pass (LCP p50 1.9 s / 2.2 s, CLS ≤ 0.002) but are loopback-derived. Field data required after deploy. §15. |
| 11 | **External partner signup availability** | ✅ **Closed** | `partner.legaldrop.ca/signup` returns **200** and is a real self-serve account-creation form. All six CTAs point at it, not at `/login`. |
| 12 | **Client-island ceiling exceeded** | 🟡 **Founder decision required** | *(added by Phase 9)* 3 islands now, 4 with reviews, against E5's ≤ 2 and the plan's ≤ 3. Either raise the gate or drop an island. §17. |
| 13 | **Footer service category names** | 🟡 **Founder decision required** | *(added by Phase 9)* OQ-3 approved *Same-day delivery / Medical logistics / Legal delivery*; the footer renders *Send a package / Medical delivery / Legal documents*. Neither is inaccurate. §11. |
| 14 | **Privacy-policy dead `next/head`** | 🟠 **Post-launch improvement** | *(added by Phase 9)* Pages-Router API, a no-op here, so the route has no page-specific title. Its dormant description says "secure, compliant" — an unsupported claim that would go live if anyone "fixed" the metadata. §9. |
| 15 | **Site title wording** | 🟡 **Founder decision required** | *(added by Phase 9)* *"Your city's same-day delivery network"*. Not a C1 violation and inside the five-second test's accepted answers, but it is the last place the brand describes itself in delivery rather than platform terms. §8. |
| 16 | **Dormant rollback components** | 🟠 **Post-launch improvement** | `BecomeADriver`, `Hero`, `HowItWorks`, `Services` are unimported. **Deliberately retained** — their comments carry the claim history for language removed in Phases 4.1–4.3, and the plan says deleting a comment that records a measurement deletes the measurement. `Coverage` and `WhyBrand` are still live on `/medical` and `/legal` and **must not** be deleted. |

**No professional-review item is marked closed** — items 2 and 5 have no supporting evidence and
are labelled accordingly.

---

## 22. Files modified

| File | Change |
|---|---|
| `src/app/layout.jsx` | site-wide meta description — removed courier self-description and the unsupported expansion claim |
| `src/app/(main)/medical/page.jsx` | alt text — removed "courier" |
| `src/styles/tailwind.css` | reduced-motion review suppression — released the track width so wrapping works |
| `src/components/home/Reviews.jsx` | matching `<noscript>` suppression copy |
| `src/app/send/layout.jsx` | added skip link + `<main>` landmark |
| `src/app/privacy-policy/page.jsx` | nested `<main>` → `<div>` (**no policy text touched**) |
| `src/app/contact-us/page.jsx` | two 20 px targets → 24 px; extracted the duplicated class string |
| `src/app/send/page.jsx` | three muted-text contrast corrections |
| `src/components/send/AddressAutocomplete.jsx` | loading-indicator contrast (colour only) |
| `docs/HOMEPAGE_PHASE_2_REPORT.md` | superseded-by note on the contrast row |
| `docs/HOMEPAGE_PHASE_6_REPORT.md` | superseded-by note on the island count |
| `docs/HOMEPAGE_IMPLEMENTATION_PLAN.md` | recorded the island-ceiling conflict |
| `docs/HOMEPAGE_PHASE_9_REPORT.md` | this report |

**Not touched:** the privacy policy's text · `/medical` and `/legal` claim copy · every homepage
section component · `navigation.js` · `google-reviews.js` · `maps-loader.js` ·
`AddressAutocomplete`'s internals, event handling or Google contract · unused rollback assets and
components.

---

## 23. Commits created

| Commit | Reversible unit |
|---|---|
| `30dd3b9` | `fix(marketing): remove courier self-description from published copy` |
| `3615bc8` | `fix(home): stop reduced motion hiding reviews` |
| `9a6caf6` | `fix(marketing): resolve final accessibility defects` |
| `b9e1cc3` | `fix(send): raise muted text to the AA contrast floor` |
| `bc17b06` | `docs: reconcile homepage phase reports` |
| *(this report)* | `docs: add Phase 9 launch readiness report` |

Each is independently revertable. **No previous commit was amended. Nothing was pushed or
merged.** No empty commit was created for the navigation/footer category, which needed no changes.

---

## 24. Bundle measurements

| Metric | Phase 8 | **Phase 9** | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 7.09 kB | **7.09 kB** | 0 |
| **`/` First Load JS** | 101 kB | **101 kB** | **0** |
| Shared JS | 87.2 kB | **87.2 kB** | **0** |
| `/medical` | 952 B · 93.2 kB | **952 B · 93.2 kB** | 0 |
| `/legal` | 1.13 kB · 93.4 kB | **1.13 kB · 93.4 kB** | 0 |
| `/contact-us` | 33.4 kB · 154 kB | **33.4 kB · 154 kB** | 0 |
| `/send` | 6.13 kB · 102 kB | **6.12 kB · 102 kB** | −0.01 kB |
| `/privacy-policy` | 732 B · 121 kB | **732 B · 121 kB** | 0 |

Every Phase 9 change was CSS, copy, markup semantics or a colour value. **No JavaScript was added
to any route**; the `/send` route shrank marginally through the class-string extraction.

---

## 25. Maps and Places counts

| Point | Maps | Places |
|---|---:|---:|
| Homepage load, all five widths | **0** | **0** |
| After focusing the pickup field | 1 bootstrap (+ its own modules) | 1 per debounced query |
| After selecting a suggestion | 0 additional | 1 `fetchFields` per selection |
| Google Reviews (server-side) | 0 | ≤ 1 per 24 h, shared across all visitors |

The bootstrap is one `maps/api/js` request; `places.js`, `main.js`, `common.js` etc. are that
bootstrap's own modules, not a second loader. Both hero fields share one cached promise, so
focusing the second field starts no new import.

---

## 26. CLS results, and corrected measurements

### CLS — isolated contexts, outliers re-run

| Width | CLS | Budget |
|---|---:|---|
| 390 | 0.0020 | ≤ 0.05 ✅ |
| 430 | 0.00003 | ✅ |
| 768 | 0.00023 | ✅ |
| 1024 | 0.00023 | ✅ |
| 1440 | 0.0001 | ✅ |

The 390 figure moved between 0 and 0.0020 across runs and was re-run before being recorded; 0.0020
matches Phase 7.1's measurement and is reported as the honest worst case. **25× inside budget.**

### Corrected measurements and harness errors — seven

Documented in full because each one would have produced a false finding, and two of them
reproduce failure modes earlier phases already hit.

1. **`/medical` captions reported 1.04:1 — twice wrong, actually ≥ 9.12:1.** First the probe
   composited against the computed *ancestor* background and ignored the photograph the text sits
   on. Re-sampling rendered pixels then reported 1.20:1, because the sampled strip included the
   white glyphs' own antialiasing fringe. Only after hiding the glyphs and re-shooting the same
   rect did the true backdrop appear: median 12.6–16.3:1, **worst-case lightest pixel 9.12:1**
   against a 3:1 requirement. **All four captions pass comfortably.**
2. **Hover probe threw "Node is either not clickable".** `page.hover('[data-review-track] article')`
   targeted the *first* card, whose bounding box is off-viewport while the track is translated —
   the exact error Phase 8's report warned about. Corrected to select a card whose rect is fully
   inside the viewport.
3. **The pause-control selector matched a `<div>`, not the button.** `[data-review-motion-control]`
   is the wrapper; the control is `button[aria-pressed]` inside it. The first run therefore
   reported explicit pause and focus-within as *not working* when both work.
4. **`/send` reported two tab stops with no focus ring.** The indicator is a border rendered
   *inside* Google's `gmp-place-autocomplete` shadow DOM, not an outline on the host. Confirmed
   visible by screenshot. **Not a defect.**
5. **`/send` handoff reported "(no shadow input)".** The shadow root is **closed**, so it cannot be
   read from the page. The host element's `value` property carries both addresses, and the map
   rendered a 34.2 km trip — the handoff works.
6. **Places reported as degraded on port 3220.** Google returned
   `API_KEY_HTTP_REFERRER_BLOCKED` — the browser key's referrer allowlist excludes that port.
   Re-run on port 3000 (allowlisted) the full path works. **A test-environment limitation, not a
   product defect** — and it incidentally exercised the degraded path for real.
7. **Homepage transfer first reported as 853 kB.** That summed uncompressed `content-length`
   including Next's post-load `<Link>` prefetch of other routes. Corrected using `transferSize`
   and split at the `load` event: **212 kB at load, 296 kB after idle.**

**A process note worth carrying forward:** twice, a stale `next start` process kept holding the
port and served a **pre-fix build**, making a verified fix look like it had not worked.
`pkill -f "next start"` does not match on Windows. Both times this was caught by checking the
*served HTML* rather than trusting that a rebuild had taken effect. Verify the response, not the
build log.

---

## 27. Remaining weaknesses

| # | Weakness | Severity |
|---|---|---|
| W1 | **The five-second test has never been run.** The redesign's primary hard gate is unverified. | **High** |
| W2 | **The production Reviews path is unverified.** The contract is tested; live data is not. | Medium |
| W3 | **Mobile is 7.37 screens at 390** against a ≤ 5 gate; 11.85 at 320. | Medium |
| W4 | **At 390 the demonstration's route line falls below the fold**, so a mobile visitor sees less evidence of a live system than a desktop one in the first five seconds — which bears directly on W1. | Medium |
| W5 | **768 px hero is 1,098 px**, the tallest at any width. | Low–Medium |
| W6 | **Island count exceeds both documented ceilings.** A governance gap, not a performance one. | Low–Medium |
| W7 | **LCP/FCP figures are loopback-derived** and cannot substitute for field data. | Low–Medium |
| W8 | **Google reviews are a single point of failure for social proof.** Absent by design when the API fails — correct, but it means the page's only customer-voice evidence can vanish. | Low |
| W9 | **The privacy policy's dead `next/head`** leaves the route without a page-specific title and holds a dormant "secure, compliant" claim. | Low |
| W10 | **Four dormant rollback components** remain on disk, deliberately, for their recorded claim history. | Low |
| W11 | **`maps-loader.js` still carries a hardcoded browser-key literal.** Public by nature and referrer-restricted, and flagged in-file for deletion once the env var is deployed — but it should be deleted then. | Low |

---

## 28. Merge recommendation

**Recommend merging `homepage-redesign` into `main`.**

The branch is coherent, every commit is independently revertable, lint and the production build
are clean, and the integrated page holds up under measurement rather than only per-phase:

- Section order matches the target exactly; no removed section returned.
- **Zero unsupported public claims** across every public route, verified with positive controls.
- **Zero 404s, zero dead links, zero mislabelled destinations.**
- All 18 booking steps pass end to end against live Google Places.
- **Zero horizontal overflow and zero clipped content** from 320 px to 1920 px.
- One `<h1>`, one `<main>`, a working skip link, visible focus and ≥ 24 px targets on all
  **eight** routes.
- **Zero contrast failures** on every public route, composited against the real ground.
- CLS ≤ 0.002 everywhere; First Load JS unchanged at 101 kB; **0 Maps and 0 Places on load**.
- Every failure state leaves the page useful and truthful.

Phase 9 found and fixed five real defects that per-phase testing had missed — a courier
self-description on every route, reviews hidden under reduced motion, two broken landmark
structures, undersized targets, and four sub-floor contrast pairs. That is the argument for having
run this phase, and it is also why the remaining open items are external rather than technical.

## 29. Deployment recommendation

**Do not deploy yet.** One blocker and one professional review stand between merge and deploy:

1. 🔴 **Run the five-second test** (§4). It is the gate the whole redesign is measured against, and
   it is the only item classified as a blocker. If it fails, the likely lever is the 390 first
   viewport, not the copy.
2. ⚖️ **Resolve the privacy-policy security sentence** (§9) — counsel approval, or an explicit,
   recorded founder decision to publish pending review.

Then, at deploy time:

3. Set `GOOGLE_PLACES_API_KEY` and walk the ten-step Reviews verification (§5).
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and confirm the production domain is on the browser key's
   HTTP-referrer allowlist — **the homepage address entry silently degrades if it is not**, which
   is exactly what happened in testing on the wrong port. Then delete the key literal in
   `maps-loader.js` (W11).
5. Confirm the metric as-of date (§21 item 7) is still accurate on the day you ship.
6. Begin collecting real-user Core Web Vitals; the lab figures are indicative only.

Merging is safe now and does not commit anyone to deploying. Nothing about the merge forces the
external gates.

## 30. Confirmation

**Nothing has been pushed. Nothing has been merged. No previous commit was amended. No test stub
was committed.** Six commits exist on `homepage-redesign` from Phase 9 and remain local, awaiting
approval.

---

**Phase 9 complete. Stopping here for review.**

---
---

# Phase 9.1 — External Launch-Gate Closure

> **Status: four gates closed by founder decision, two remain open because no input exists to
> close them. Four commits created. Nothing pushed, nothing merged. Partner-logo implementation
> has not begun.**
>
> Phase 9.1 exists only to close or accurately record the external gates Phase 9 identified. No
> new homepage functionality, integrations, claims, booking changes, footer redesign or visual
> redesign was undertaken. Decisions recorded here were made by the founder on **2026-08-05**;
> none was made on his behalf.

## 9.1-1. Preflight

| Check | Result |
|---|---|
| `git status` | clean |
| Branch | `homepage-redesign` ✅ |
| Unrelated changes | none — did not need to stop |
| `7c8c8e5` (Phase 9 report) present | ✅ |
| All Phase 9 fix commits present | ✅ `30dd3b9` `3615bc8` `9a6caf6` `b9e1cc3` `bc17b06` |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled, 16/16 static pages |
| Pushed or merged? | **No** — `git rev-parse @{u}` returns *"no upstream configured"*, so the branch has never been pushed |

## 9.1-2. Phase 9 commit count — corrected

**The report was internally inconsistent: the header and §2 said five, §23 and §30 said six.
The correct figure is SIX.**

Verified: `git rev-list --count 2037ca4..HEAD` = **6** at the time of the Phase 9 handover;
`git rev-list --count main..HEAD` = **44**.

| # | Hash | Subject |
|---|---|---|
| 1 | `30dd3b9` | `fix(marketing): remove courier self-description from published copy` |
| 2 | `3615bc8` | `fix(home): stop reduced motion hiding reviews` |
| 3 | `9a6caf6` | `fix(marketing): resolve final accessibility defects` |
| 4 | `b9e1cc3` | `fix(send): raise muted text to the AA contrast floor` |
| 5 | `bc17b06` | `docs: reconcile homepage phase reports` |
| 6 | `7c8c8e5` | `docs: add Phase 9 launch readiness report` |

**Cause:** the header and §2 were written before the report was itself committed, and counted only
the commits that existed while the sentence was being typed. The report's own commit is the sixth.
Both statements are corrected in place, each carrying a note saying what it used to read — the
error is recorded, not erased.

**Branch totals:** 38 inherited + 6 Phase 9 + **4 Phase 9.1** = **48 commits ahead of `main`.**

## 9.1-3. Gate 1 — Formal five-second test — **OPEN**

**No participant results were supplied, so the gate does not pass and is not claimed to.**

- Participants: **none supplied**
- Familiarity: n/a
- Device conditions: n/a
- Responses: **none** — no participant has been shown the page
- Classification: n/a
- Desktop vs mobile: n/a
- **Pass percentage: not calculable**

**No participants, responses or results were fabricated. No copy or composition change was made
on the basis of imagined feedback.** The Phase 9 §4 script is unchanged and ready to run.

**Exact remaining action for the founder:**

1. Recruit **5 minimum, 8–10 preferred**, from clinic/lab operations, legal operations, or SMB
   owners. Exclude anyone who has seen the redesign.
2. Show the **first viewport only**, five seconds, no scrolling, at **both** 1440×900 and 390×844.
3. Ask the four questions in order. **Never say "software", "platform", "network" or
   "technology"** — those words are the thing being measured.
4. Record answers verbatim, then classify each against the two buckets in §4.
5. Return the results and they will be recorded verbatim in an appendix, with the pass percentage
   calculated and recurring confusion identified.

**A commitment about scoring, stated before any result exists:** an unambiguously courier-only
answer will be counted as courier-only. It will not be reinterpreted as a platform answer because
the participant happened to mention tracking in a later question.

**This remains the one item classified as a blocker.**

## 9.1-4. Gate 2 — Privacy-policy decision — **DECIDED**

| Field | Value |
|---|---|
| **Sentence** | *"We implement security measures to protect your information, including encryption and restricted access."* |
| **Decision** | **Option 4 — founder accepts publication pending professional review** |
| **Decision date** | 2026-08-05 |
| **Decision-maker** | Abdul (founder) |
| **Counsel name** | none — no professional review has taken place |
| **Approved wording supplied** | none — the sentence ships **unchanged** |
| **Route remains public** | **Yes.** `/privacy-policy` is not withheld |

**The site is NOT marked legally reviewed.** No professional-review evidence exists in this
repository and none is asserted. This is a recorded acceptance of risk by the founder, not a
clearance. If counsel later revises the wording, that is a separate commit applying counsel's text
verbatim — engineering does not draft it.

**No policy text was edited.** Verified: the rendered policy body is **2,741 characters**, the
identical figure the Phase 9 claim sweep recorded, and the security sentence is present and
unaltered.

### Dormant `next/head` block — removed

Phase 9 flagged a `<Head>` block declaring `"Privacy Policy | LegalDrop"` and a description
reading *"Privacy Policy of LegalDrop for **secure, compliant** delivery solutions."* Gate 2
authorises removing dead code **only if it cannot affect the live policy and the change is
independently reversible.** Both conditions were verified before the edit, not assumed:

| Property | Before | After |
|---|---|---|
| Rendered `<title>` | site-wide default | **identical** |
| Rendered description | site-wide default | **identical** |
| Policy body `innerText` | 2,741 chars | **2,741 chars** |
| Security sentence present | yes | **yes, unedited** |
| `<h1>` / `<main>` count | 1 / 1 | **1 / 1** |
| `"secure, compliant"` in response | 0 | **0** |

Removed rather than migrated, because the dormant description asserts two claims Phase 0 (D10)
gates on professional review and Phases 4.2/4.3 stripped from `/medical`. Anyone "fixing" the
broken metadata by porting it into `export const metadata` would have published both while
believing they were tidying up. Committed separately as `860976c` and independently revertable.

*A measurement note:* hashing the raw HTML with tags stripped **did** change, which briefly looked
like a regression. It was not — that stripper includes the RSC flight payload, which legitimately
shrinks when a component leaves the tree. The rendered `innerText`, which is what a visitor and a
screen reader actually receive, is identical.

## 9.1-5. Gate 3 — Production Google Reviews validation — **OPEN DEPLOYMENT GATE**

**Production credentials and deployment access are not available in this environment, so the
production path was not validated and is not claimed to be.**

No secret value is printed or recorded anywhere in this document.

| Check | Status |
|---|---|
| Places API key exists in the deployment environment | ⬜ **cannot verify — no deployment access** |
| Place ID correct | ⚪ constant is `ChIJ6bQwlukxK4gRFaB2nvrNqWw`; correctness against the live listing unverified |
| Production domain permitted by key restrictions | ⬜ **cannot verify** |
| Request succeeds from the production domain | ⬜ **cannot verify** |
| Rating renders correctly | ✅ *contract only* |
| Total review count renders correctly | ✅ *contract only* |
| Review text renders | ✅ *contract only* |
| Missing review text is safe | ✅ *contract only* |
| Google attribution renders | ✅ *contract only* |
| "See all reviews" reaches the correct listing | ✅ *contract only* |
| 0 reviews → no section | ✅ *contract only* |
| 1–3 reviews → static cards | ✅ *contract only* |
| 4–5 reviews → movement | ✅ *contract only* |
| Pause / resume | ✅ *contract only* |
| Hover and focus pause | ✅ *contract only* |
| Reduced motion shows **every** review | ✅ *contract only* — the Phase 9 fix (`3615bc8`) |
| JavaScript disabled shows **every** review | ✅ *contract only* — same fix |
| API failure removes the section cleanly | ✅ *contract only* |

***Contract only*** means verified in Phase 9 against a local stub that was reverted and never
committed. **It is not production validation.** The ten-step deployment checklist in §5 is
retained verbatim and unchanged; run it once the key is set.

**One item deserves emphasis at deploy time.** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is a *separate*
browser key from the server-side Places key, and the production domain must be on its
HTTP-referrer allowlist. If it is not, the homepage address entry **degrades silently** into
"Address suggestions are unavailable right now" — which is exactly what Phase 9 reproduced by
testing on a non-allowlisted port. The page stays honest and offers the `/send` escape hatch, so
nothing breaks visibly, and that is precisely why it could ship unnoticed.

## 9.1-6. Gate 4 — Client-island ceiling — **DECIDED: OPTION A**

| Field | Value |
|---|---|
| **Decision** | **Option A — approve the implemented architecture** |
| **Decision date** | 2026-08-05 |
| **Decision-maker** | Abdul (founder) |

**Updated ceiling, now identical in both governing documents:**

> **≤ 3 client islands, or ≤ 4 while the verified Google Reviews motion wrapper renders.**

`HOMEPAGE.md` E5 raised from ≤ 2; `HOMEPAGE_IMPLEMENTATION_PLAN.md` §10 aligned from ≤ 3. The
authoritative statement lives in `HOMEPAGE.md` → *Experience gates* → *E5 was raised on
2026-08-05*; the plan cites it rather than restating it, so the two cannot drift apart again.

**The record does not pretend the former gate was never exceeded.** Stated in both documents:
E5 said ≤ 2 while the page ran 3 (4 with reviews); the two documents disagreed from the day they
were written; the real count passed **both** numbers without either being cited in a phase
acceptance check; Phase 8 recorded "3 → 4" honestly but did not flag the crossing; Phase 9 found
it and escalated rather than re-baselining.

**Why approved** — measured on a production build at the time of decision:

| Property | Measured |
|---|---|
| `/` rendering | **`○ (Static)`** |
| First Load JS `/` | **101 kB** (ceiling 130 kB) |
| Shared JS | **87.2 kB** |
| Maps / Places before address interaction | **0 / 0** |
| CLS | ≤ 0.002 at every tested width |
| Reviews | **server-fetched and server-rendered** |
| `ReviewMotion` scope | owns **only** the pause boolean; cards arrive as `children` |

Each island implements an independently approved function: `HeaderMobileNav` (pre-existing shared
header), `NetworkDemo` (Phase 0 **D4**), `HeroAddressEntry` (Phase 0 **D5**), `ReviewMotion`
(Phase 8 motion approval).

**What the new ceiling does not license**, recorded in `HOMEPAGE.md` so it is not read as
headroom: it counts *approved* islands, not a budget to spend. A fifth island, or a fourth that is
not the review wrapper, requires its own decision — and the properties above are the conditions
the approval rests on. If any regresses, the approval does not carry.

## 9.1-7. Gate 5 — Operational metric review

| Field | Value |
|---|---|
| **Metrics** | 50+ completed deliveries · 5 business partners · 5 onboarded GTA drivers |
| **Displayed as-of** | *Accurate as of August 2026* |
| **Owner** | **Abdul (founder)** |
| **Next review date** | **2026-11-03**, or before the next public release — whichever comes first |
| **Deadline confirmed** | ✅ 2026-08-05 |
| **Source of truth** | Founder-confirmed operational records. Not a system query — there is no metrics endpoint in this repository, which is itself why a human owner and a date exist |

**Removal procedure if the figures become stale.** Per `HOMEPAGE.md` → *Operational Proof*, rule
4: a metric that cannot be re-confirmed is **removed, never frozen at its last good value.**

1. Re-confirm each figure against operational records on or before 2026-11-03.
2. Any figure that cannot be confirmed is **deleted from `OperationalProof.jsx`**, not carried
   forward and not softened with an adjective.
3. If fewer than three remain, **the section does not ship** — the three-metric gate is not
   lowered (Phase 0, OQ-1). The two survivors move into the Trust section.
4. Update the displayed as-of date only when the figures behind it were actually re-checked.
5. **No number is revised upward without founder-supplied operational evidence.** None was
   supplied in Phase 9.1, so no figure changed.

## 9.1-8. Gate 6 — Site title — **DECIDED**

| Field | Value |
|---|---|
| **Was** | `Druppr - Your city's same-day delivery network` |
| **Now** | **`Druppr - Same-day logistics infrastructure for the GTA`** |
| **Decision date** | 2026-08-05 |
| **Decision-maker** | Abdul (founder) |

Never a content-gate violation — which is why Phase 9 flagged it and deliberately did not touch
it. Escalated for two softer reasons: **"your city"** understates a service area that is
specifically Toronto and the GTA, and `HOMEPAGE.md` → *Hero Philosophy* holds that vague geography
is a liability rather than a growth story; and **"delivery network"** was the last place the brand
described itself in delivery rather than platform terms.

The replacement is the h1 from `HeroNetwork.jsx` and the opening of the meta description, so tab,
search result and page now say the same thing in the same words. 53 characters.

**Only the default changed.** The `%s` template is untouched, so `/medical`, `/legal` and `/send`
keep their own segment titles.

| Route | Rendered `<title>` |
|---|---|
| `/` | Druppr - Same-day logistics infrastructure for the GTA |
| `/contact-us` | Druppr - Same-day logistics infrastructure for the GTA |
| `/privacy-policy` | Druppr - Same-day logistics infrastructure for the GTA |
| `/medical` | Medical logistics - Druppr *(unchanged)* |
| `/legal` | Legal document delivery - Druppr *(unchanged)* |
| `/send` | Send a package - Druppr *(unchanged)* |

**Avoided, as required:** no "courier", no "delivery app", no national or multi-city positioning,
and "your city" is gone. Verified across all six public routes: **courier 0 · delivery app 0 ·
coming soon 0 · your city 0 · "secure, compliant" 0.**

A consequence worth recording: `SERVICE_AREA_PHRASE` in `navigation.js` justified its city-less
value by citing the old tagline, a string that now exists nowhere. The **comment** was corrected;
the **value was not**, because it is rendered by nothing — its only consumer is the unimported
Phase 2 rollback `Hero.jsx`.

## 9.1-9. Gate 7 — Optional launch items

### Partner logos — **NOT A LAUNCH BLOCKER. Deferred. Implementation has not begun.**

**No logo asset, directory, placeholder, commented-out data, dormant component or temporary
company name was added in Phase 9.1.** Re-verified after all Phase 9.1 changes.

Remains deferred until **all** of the following exist:

1. official assets supplied;
2. relationship type documented;
3. public display permission documented **in writing** — verbal is not sufficient;
4. approval date and named approver recorded;
5. **at least three distinct approved logos** before any moving strip is considered.

The "5 Business Partners" metric remains a **count**, not permission to name or display anyone.

### App Store and Google Play badges — **NOT A LAUNCH BLOCKER**

The homepage makes no app promise anywhere, so nothing is unfulfilled. There is still **no
reference to the App Store, Google Play, Apple or any download link in `src/` or `public/`.**

Add later only with a confirmed live listing, a confirmed public URL, approved official badge
artwork, and a verified destination. Per Phase 0 (D1) they belong in the Platform Showcase, never
the proof bar, and **never count toward the three-metric gate.**

### Insurance — **PROFESSIONAL REVIEW / FOUNDER DOCUMENTATION REQUIRED**

**No insurance claim appears anywhere on the site.** Phase 4.3 removed "Fully insured" from
`/medical` because no policy, effective dates, insured entity, covered operations or exclusions
were produced.

**Nothing on the site depends on this**, so it blocks nothing at launch — it blocks only the
*restoration* of such a claim. Publishing one requires active policy evidence **and** approved
wording. It must not be softened into "protected", "covered" or "medical-grade" in the meantime.

### Mobile page length and 768 px hero height — **POST-LAUNCH IMPROVEMENT**

Classified as post-launch, not blockers, and **no product evidence was cut to satisfy a screen
count.**

- Mobile length **7.37 screens at 390** against E1's ≤ 5. `HOMEPAGE.md` §12 already rules that the
  scroll target yields to trust and conversion content; the reason is recorded in Phase 9 §13.
- **768 px hero 1,098 px**, the tallest at any width. Improved in Phase 7.1, not resolved.

Revisit only if real user testing demonstrates a conversion or comprehension problem. The
five-second test (Gate 1) is the instrument most likely to surface one, since at 390 the
demonstration's route line falls below the fold.

## 9.1-10. Testing

Documentation and two small metadata/dead-code changes only. All required checks run against a
production build.

| Check | Result |
|---|---|
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled, 16/16 static pages |
| Homepage remains static | ✅ **`○ (Static)`** |
| First Load JS ≈ 101 kB | ✅ **101 kB**, unchanged |
| Shared JS ≈ 87.2 kB | ✅ **87.2 kB**, unchanged |
| Zero Maps / Places before address interaction | ✅ **0 / 0** at all five widths |
| All public routes HTTP 200 | ✅ 10/10 — and `/nonexistent-control` returns **404**, confirming the 200s mean something |
| Zero application console errors | ✅ at 390, 430, 768, 1024, 1440 |
| CLS | ✅ 0.0020 / 0.00003 / 0.00023 / 0.00023 / 0.0001 — unchanged |

Because metadata changed, the **rendered claim sweep was re-run including `<head>`**, with
positive controls firing on every route. Result: the only listed term surviving anywhere is
`security` / `restricted access` on `/privacy-policy` — the counsel-assigned sentence, which now
carries an explicit founder disposition (§9.1-4). **No new unsupported claim was introduced.**
`/privacy-policy` was verified directly and the search-description output confirmed on all six
public routes.

## 9.1-11. Final blocker table

**This supersedes the Phase 9 table in §21.**

> ⚠️ **IN TURN SUPERSEDED BY §9.2-5**, after the founder deferred the five-second test on
> 2026-08-05. Retained as the Phase 9.1 record.

| # | Item | Classification | State |
|---|---|---|---|
| 1 | **Formal five-second test** | 🔴 **Blocker** | **OPEN.** No participants supplied. Script ready (§4). The only item that should stop a deploy. |
| 2 | **Privacy-policy security wording** | ✅ **Decided** | Founder accepts publication pending professional review, 2026-08-05. Route stays public. **Site not claimed legally reviewed.** |
| 3 | **Production Google Reviews validation** | 🟡 **Open deployment gate** | No credentials or deployment access. Contract verified; production not. Ten-step checklist retained (§5). |
| 4 | **Client-island ceiling** | ✅ **Closed** | Option A. E5 raised to ≤ 3 / ≤ 4 with reviews; both documents aligned. |
| 5 | **Site title wording** | ✅ **Closed** | *"Same-day logistics infrastructure for the GTA"* shipped. |
| 6 | **Metric review date** | ✅ **Closed** | Owner Abdul; next review **2026-11-03** or before next release; removal procedure recorded. **Time-bounded — this expires.** |
| 7 | **Privacy-policy dead `next/head`** | ✅ **Closed** | Removed; latent "secure, compliant" claim eliminated. Policy text untouched. |
| 8 | **Partner-logo permission** | ✅ **Closed for launch** | Deferred, not a blocker. **Implementation has not begun.** |
| 9 | **Insurance** | ⚖️ **Professional review required** | No claim on the site; blocks nothing at launch. |
| 10 | **App store badges and URLs** | 🟠 **Optional, post-launch** | No app promise on the site; nothing unfulfilled. |
| 11 | **Mobile page length (7.37 screens)** | 🟠 **Post-launch improvement** | Scroll target yields to evidence, per `HOMEPAGE.md` §12. |
| 12 | **768 px hero height (1,098 px)** | 🟠 **Post-launch improvement** | Improved in Phase 7.1, not resolved. |
| 13 | **Real-user Core Web Vitals** | 🟠 **Post-launch** | Lab figures pass; loopback-derived. Collect field data after deploy. |
| 14 | **External partner signup availability** | ✅ **Closed** | `partner.legaldrop.ca/signup` returns 200; all six CTAs point at it. |
| 15 | **Browser Maps key referrer allowlist** | 🟡 **Deploy-time check** | Production domain must be allowlisted or hero address entry **degrades silently**. |
| 16 | **Dormant rollback components** | 🟠 **Post-launch** | Deliberately retained for their recorded claim history. `Coverage` and `WhyBrand` are still live on `/medical` and `/legal` and **must not** be deleted. |

**Blockers: 1.** Founder decisions outstanding: **0.** Professional review outstanding: **2**
(privacy — accepted pending; insurance — only if a claim is ever restored).

## 9.1-12. Merge recommendation

**Recommend merging `homepage-redesign` into `main`, unchanged from Phase 9.**

Phase 9.1 added no functionality and changed no measured property: `/` is still statically
prerendered, First Load JS is still 101 kB, shared JS still 87.2 kB, still zero Maps and Places
before interaction, CLS unchanged, every public route 200, zero console errors, and the claim
sweep is clean with positive controls.

Four of the six open gates are now closed by explicit, dated, attributed founder decisions, and
the two that remain open are external and cannot be closed from inside the repository.

## 9.1-13. Deployment recommendation

**Do not deploy until Gate 1 is closed.** It is now the *only* blocker.

1. 🔴 **Run the five-second test** (§4). Report the results and they will be recorded verbatim
   with the pass percentage calculated. If it fails, the likely lever is the 390 first viewport,
   not the copy — the route line falls below the fold there.
2. 🟡 At deploy: set `GOOGLE_PLACES_API_KEY`, confirm **Places API (New)** is enabled, and walk the
   ten-step Reviews checklist (§5).
3. 🟡 At deploy: set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and **confirm the production domain is on
   the browser key's HTTP-referrer allowlist** — the hero degrades silently otherwise. Then delete
   the transitional key literal in `maps-loader.js`.
4. ⏰ Diarise **2026-11-03** for the metric review. A stale metric is a false claim.
5. 📊 Begin collecting real-user Core Web Vitals; the lab figures are indicative only.

The privacy policy ships as-is under the founder's recorded acceptance. That is a decision on
record, not a clearance — if counsel later revises the wording, it applies verbatim in its own
commit.

## 9.1-14. Confirmations

- **Partner-logo implementation has NOT begun.** No asset, directory, placeholder, commented data,
  dormant component or temporary company name was added. Re-verified after every Phase 9.1 change.
- **Nothing has been pushed. Nothing has been merged.** The branch has no upstream configured.
- **No previous commit was amended.**
- **No test stub was committed.**
- **No policy body text was edited.**
- **No metric was changed** — no operational evidence was supplied, so no figure moved.
- **No participants, responses or five-second-test results were fabricated.**

## 9.1-15. Commits created in Phase 9.1

| # | Hash | Subject |
|---|---|---|
| 1 | `c2c2ba8` | `fix(metadata): align site title with logistics positioning` |
| 2 | `860976c` | `fix(privacy): remove dead next/head metadata block` |
| 3 | `d8b9a30` | `docs: resolve homepage client-island budget` |
| 4 | *(this appendix)* | `docs: reconcile Phase 9 launch gates` |

Each is independently revertable. No code commit was created where no code changed, and no commit
was created for a gate that produced no change.

---

**Phase 9.1 complete. Stopping here for review.**

---
---

# Phase 9.2 — Founder-Deferred Five-Second Test

> **The formal five-second test is deferred until after launch by founder decision. It was not
> run. It did not pass and it did not fail. No result was fabricated.**

## 9.2-1. The decision

| Field | Value |
|---|---|
| **Decision** | The formal five-second test is **deferred until after launch** |
| **Decision date** | 2026-08-05 |
| **Decision-maker** | Abdul, founder |
| **Participant responses available** | **None** |
| **Was the test run?** | **No** |
| **Did it pass?** | **No — and it did not fail either.** An unrun test has no result |
| **Was any result fabricated?** | **No.** No participants, responses, percentages or conclusions were invented |
| **May development and merge proceed?** | **Yes** |
| **Status going forward** | **Post-launch positioning-validation task** |

## 9.2-2. What this does and does not change

**What changes:** the five-second test is no longer classified as a launch blocker. It moves from
🔴 *Blocker* to a founder-deferred post-launch validation task. Merge and deployment may proceed
without it.

**What does not change:** the page's positioning claims are unverified by real users. Nothing about
this deferral makes them verified. `HOMEPAGE.md` still describes this test as the primary measure
of the redesign's central objective, and that objective — *"a first-time visitor should understand
within five seconds that Druppr is a technology-enabled logistics platform"* — remains **asserted
rather than demonstrated**.

This is a deliberate, recorded acceptance of that gap by the founder. It is not evidence that the
gap does not exist.

**No copy or composition was changed on the basis of imagined feedback**, in this phase or any
earlier one.

## 9.2-3. Scoring commitment for the deferred test

Recorded **before** any result exists, so it cannot be adjusted afterwards to suit an outcome:

- A response that identifies Druppr **only** as a courier, local delivery company, messenger
  service or legal-document courier **will be scored courier-only.** It will not be reinterpreted
  as a platform answer because the participant mentioned tracking, an app, or a website in a later
  question.
- The thresholds do not move: **≥ 80% platform-or-equivalent, ≤ 20% courier-only.**
- The four questions are asked in order, and the words *"software"*, *"platform"*, *"network"* and
  *"technology"* are never spoken to a participant — they are the thing being measured.
- Desktop (1440×900) and mobile (390×844) results are reported **separately**, because the 390
  first viewport carries less of the demonstration than 1440 does: the route line falls below the
  fold there (Phase 9 §13).

The full protocol is unchanged in Phase 9 §4. When results exist they will be recorded verbatim in
an appendix, with the pass percentage calculated and recurring confusion identified.

## 9.2-4. Production Google Reviews validation — still a deployment check

Unchanged by this decision. Production credentials and deployment access remain unavailable, so
the production review path **has not been validated and must not be described as completed.** The
contract is verified against a reverted local stub; that is not the same thing. The ten-step
deployment checklist in Phase 9 §5 stands.

## 9.2-5. Authoritative blocker table

**This supersedes both the Phase 9 table (§21) and the Phase 9.1 table (§9.1-11).**

| # | Item | Classification | State |
|---|---|---|---|
| 1 | **Formal five-second test** | 🟣 **Founder-deferred** | **Post-launch positioning validation.** Not run, no result, nothing fabricated. Deferred 2026-08-05 by Abdul. Protocol ready in §4; scoring commitment in §9.2-3 |
| 2 | **Production Google Reviews validation** | 🟡 **Deployment verification** | No credentials or deployment access. Contract verified; **production not validated**. Ten-step checklist in §5 |
| 3 | **Privacy-policy security wording** | ✅ **Decided** | Founder accepts publication pending professional review, 2026-08-05. Route public, sentence unchanged. **Site not claimed legally reviewed** |
| 4 | **Partner logos** | 🔒 **Permission-gated** | Engineering complete (Phase 10); **zero partners approved**, so the section does not render. See `HOMEPAGE_PHASE_10_REPORT.md` |
| 5 | **Client-island ceiling** | ✅ **Closed** | Phase 9.1, Option A. E5 raised to ≤ 3, or ≤ 4 with the shared social-proof motion wrapper |
| 6 | **Site title wording** | ✅ **Closed** | *"Same-day logistics infrastructure for the GTA"* |
| 7 | **Metric review date** | ✅ **Closed** | Owner Abdul; next review **2026-11-03** or before the next release. **Time-bounded — this expires** |
| 8 | **Insurance** | ⚖️ **Professional review required** | No claim on the site; blocks only the restoration of one |
| 9 | **App store badges** | 🟠 **Optional, post-launch** | No app promise anywhere on the site |
| 10 | **Mobile page length (7.37 screens)** | 🟠 **Post-launch improvement** | Scroll target yields to evidence, per `HOMEPAGE.md` §12 |
| 11 | **768 px hero height (1,098 px)** | 🟠 **Post-launch improvement** | Improved in Phase 7.1, not resolved |
| 12 | **Real-user Core Web Vitals** | 🟠 **Post-launch** | Lab figures pass; loopback-derived |
| 13 | **Browser Maps key referrer allowlist** | 🟡 **Deploy-time check** | Production domain must be allowlisted or hero address entry **degrades silently** |
| 14 | **External partner signup availability** | ✅ **Closed** | `partner.legaldrop.ca/signup` returns 200 |
| 15 | **Dormant rollback components** | 🟠 **Post-launch** | Deliberately retained for their recorded claim history |

**Launch blockers: 0.** Deployment verification items: **2** (production Reviews, Maps referrer
allowlist). Professional review outstanding: **2** (privacy — accepted pending; insurance — only
if a claim is restored). Founder decisions outstanding: **0**.

## 9.2-6. Historical sections are unchanged

No earlier section of this report was rewritten to suggest the test occurred. Phase 9 §4 still
reads *"NOT RUN. GATE REMAINS OPEN."* and Phase 9.1 §9.1-3 still reads *"OPEN"*, because that is
what was true when each was written. This section records what changed afterwards and why, which
is the point of keeping them.

---

**Phase 9.2 complete.**
