# Homepage Phase 8 — Purposeful Social-Proof Motion

> **Status: Phase 8 complete, awaiting approval. The next phase has not begun.**
>
> **[measured]** from a production build. Nothing estimated. Branch
> `homepage-redesign`; three commits, nothing pushed, nothing merged.
>
> **Gate A (reviews): met** — the existing integration returns real data and the
> track is built on it. **Gate B (partner logos): NOT met** — no permission
> evidence was supplied, so no partner work was done and no placeholder exists.

---

## ⚠️ 0. A governing-document conflict, and how it was resolved

`HOMEPAGE_IMPLEMENTATION_PLAN.md` §9 read:

> **Review movement** — permitted only as a static grid or a
> **manually-controlled** scroller. Auto-advance is prohibited.

`HOMEPAGE.md` → *Prohibited motion* also lists "**Auto-advancing carousels**".

The Phase 8 brief approves a continuously moving review track. **That is a
direct conflict**, and the plan itself says such a conflict must be *"resolved in
the document, then build. Do not resolve it silently in code."*

So the plan line was **amended to record the approval**, citing the conditions
that did not exist when the prohibition was written: a visible pause/resume
control, hover and focus pausing, explicit pause outranking both, full
suppression under reduced motion and without JavaScript, an `aria-hidden`
duplicate, and a count threshold below which the static grid still renders.

**The founder's approval is the authority; this report records it rather than
inventing it.** If the intent was to keep the prohibition, revert commit
`26d2949` and the plan amendment — the static grid is untouched beneath.

## 1. Preflight results **[measured]**

| Check | Result |
|---|---|
| Branch · working tree | `homepage-redesign` · clean |
| Phase 7.1 commits `39b641e` `eccc4dd` | both present |
| Lint · production build | ✅ both clean |
| `/` route type · size · First Load JS | `○ (Static)` · 6.85 kB · **101 kB** |
| Shared JS | **87.2 kB** |
| Client islands | **3** (`HeaderMobileNav`, `NetworkDemo`, `HeroAddressEntry`) |
| Maps / Places before interaction | **0 / 0** |
| CLS | 390 0.002 · 1440 0.0001 |
| Homepage height (no reviews) | 3,996 px at 1440 |
| Reviews with `null` | section absent entirely |
| **Reviews section height, 5 reviews** | 390 **1,653** · 768 1,277 · 1024 1,149 · 1440 **1,047** |

## 2. Existing Reviews architecture (Task 1 audit)

**Server component.** Header (`h2` "Rated X on Google" + "See all reviews" →
`GOOGLE_PLACE_URL`), a `grid-cols-1 sm:grid-cols-2` of `<article>` cards, and a
required attribution line. Card = initials avatar, author name, `Stars`, verbatim
text, relative time. No empty state by design — the caller gates on non-null.

**What becomes harder to read when moved:** review bodies are **verbatim and
variable length**. A seamless loop needs predictable card widths, so a long
review must be bounded — and `google-reviews.js` records that editing or
truncating review text breaks Google's terms. That tension is resolved in §15.

## 3. Review-data fields verified (Gate A)

| Question | Finding |
|---|---|
| Source function | `getGoogleReviews()`, `src/lib/google-reviews.js`, `server-only`, Places API (New), `revalidate: 86400` |
| Returned fields | `{ rating, totalCount, reviews[] }`; each review `{ authorName, rating, text, relativeTime }` |
| Review count | **at most 5** — `slice(0, 5)`; the API returns no more |
| Duplicates possible | No — no duplication logic; Google returns distinct reviews |
| Profile images remote | **No.** Not in the field mask, not normalised, not rendered — initials only, so no third-party image requests |
| Text can be missing | **Yes** — text-less reviews are deliberately kept (dropping them would be filtering); the card renders the quote only when present |
| Source / attribution link | Yes — "See all reviews" → `GOOGLE_PLACE_URL`, plus a required visible attribution line |
| API-failure behaviour | `null` on **every** path — missing key, non-200, error body, malformed body, zero usable reviews, thrown error |

**No fallback testimonial, sample quote, invented name, date or rating exists
anywhere.** Test stubs were applied locally and **fully reverted**; none is
committed.

## 4. Review-count rules **[measured]**

A seamless loop needs the source set to be **wider than the viewport**, or the
duplicate that makes it seamless sits on screen beside the original and the
visitor simply sees the same reviews twice. Against the widest layout this page
has, a 1200 px content column:

```
3 cards × 380px (340 card + 40 gap) = 1,140px  <  1,200px   duplicate visible
4 cards × 380px                      = 1,520px  >  1,200px   reads as one strip
```

**Threshold: four.** Verified by building each state:

| Reviews | Section | Track | Static grid | Pause control | Cards (aria-hidden) | Height |
|---:|---|---|---|---|---|---:|
| **0** | **absent** | — | — | — | 0 | — |
| **1** | present | ❌ | ✅ | ❌ | 1 (0) | 457 |
| **2** | present | ❌ | ✅ | ❌ | 2 (0) | 482 |
| **3** | present | ❌ | ✅ | ❌ | 3 (0) | 633 |
| **4** | present | ✅ | — | ✅ | 8 (4) | 623 |
| **5** | present | ✅ | — | ✅ | 10 (5) | 623 |

Zero horizontal overflow and zero console errors in every state. **Nothing is
duplicated to simulate volume** — the duplicate is exactly one copy and only
exists when the loop is real.

## 5. Motion architecture

CSS transforms plus one small client island. **No marquee package, no carousel
package, no animation dependency.**

| Piece | Where |
|---|---|
| Keyframe, hover/focus pause, explicit-pause precedence, both suppression cases | `src/styles/tailwind.css` |
| Explicit pause state + the button | `home/ReviewMotion.jsx` — **client**, a few hundred bytes |
| Cards, data, thresholds, duration | `home/Reviews.jsx` — **server**, passed as `children` |

The review cards never enter the client bundle.

## 6. Review direction

**Left to right.** The track is the source set followed by an `aria-hidden`
duplicate — exactly twice one set's width — animating `translateX(-50%) → 0`.
Because the halves are identical the wrap is invisible: no reset flash, no
acceleration, `linear`, one speed.

**Duration is derived, not chosen.** 34 px/second, so a 340 px card takes ten
seconds to pass a fixed point. The cycle length is computed from the card count
and passed as a CSS custom property, so four reviews and five move at the *same
speed* rather than in the same time. Measured with five: **53 s** for a 3,644 px
track.

## 7. Partner permission status — **GATE B NOT MET**

None of the eight required items was supplied for any partner: public company
name, approved logo asset, permission to display, relationship definition,
permission date, approver name and role, link permission, brand-use
restrictions.

**No inference was made** from the "5 business partners" metric, from completed
deliveries, from repository filenames, or from any other source — the brief
forbids exactly that, and the metric is a count, not a consent record.

**Therefore: no partner section, no placeholder strip, no dead component, no
unused public section, and no partner commit.** The homepage order is unchanged
and contains no gap where partners would go.

## 8–9. Approved partner list · partner direction

**Not applicable.** Nothing supplied. The approved direction (right to left)
is recorded for whenever the gate is met; a moving strip additionally requires
**at least three** distinct approved logos, and one or two would take a static
treatment rather than a duplicated marquee.

## 10. Pause-control implementation

A real `<button type="button">` with `aria-pressed`, a **visible word** that
changes between *Pause motion* and *Resume motion*, an `sr-only` suffix naming
the region ("for customer reviews"), and the site's focus treatment. The play and
pause glyphs are `aria-hidden` — **state is never carried by an icon alone.**

Rendered **before** the track, so a keyboard user reaches the control before
entering the moving region rather than after traversing it.

| Action | `animation-play-state` | `aria-pressed` |
|---|---|---|
| Initial | `running` | `false` |
| Press | **`paused`** | **`true`** |
| Press again | **`running`** | **`false`** |

## 11. Hover and focus behaviour **[measured]**

| State | Result |
|---|---|
| Pointer over a card | **`paused`** — `[data-review-track]:hover` matches |
| Pointer leaves | `running` |
| Keyboard focus **inside** the track | **`paused`** |
| Focus outside the track | `running` |
| **Explicit pause, then pointer enters and leaves** | **stays `paused`, `aria-pressed` stays `true`** |

That last row is the important one: the explicit rule is declared last in the
stylesheet and is therefore unconditional. Without it, moving the mouse away
would silently restart motion the visitor had deliberately stopped.

⚠️ **A harness error worth recording.** An earlier hover test reported
`running` and looked like a defect. It was measuring the wrong point: the track
is translated ~1,749 px left, so its bounding rect starts off-screen and
`rect.x + 200` landed outside the viewport. A control test proved headless
Chrome *does* apply `:hover` (a link's colour changed), and re-testing against a
card actually inside the viewport showed `[data-review-track]:hover` matching
with play-state `paused`. **This is the fourth measurement-harness error in this
project, and the same lesson each time: verify the probe before believing the
finding.**

## 12. Reduced-motion behaviour **[measured]**

`animation: none`, `transform: none`, `flex-wrap: wrap`. The `aria-hidden`
duplicate is `display: none` — with no motion it is not making a loop seamless,
it is the same reviews printed twice. The pause control is `display: none`,
because a button offering to pause motion that does not exist is an inert
control.

Result: a static, wrapped, fully readable set of the real reviews, with
attribution and reading order preserved. **No fading slideshow, no slow drift,
no hidden reviews.**

## 13. JavaScript-disabled behaviour **[measured]**

Identical suppression, applied by a `<noscript><style>` block. Without it the
CSS animation would keep running with no way to stop it — the only control is
inert without JavaScript — leaving moving content a visitor cannot pause.

All reviews visible, none dependent on hydration, no track translated
off-screen, no inert control. Body text 3,620 → **4,633** characters with reviews
present.

## 14. Duplicate-content accessibility **[measured]**

| Check | Result |
|---|---|
| Semantic source sets | **1** |
| Duplicate `aria-hidden="true"` | ✅ |
| **Review cards exposed to assistive technology** | **5 of 10** — the source set only |
| Focusable elements inside the track | **0** — cards carry no links, so no duplicate tab stop |
| Duplicate DOM ids | **0** — React keys namespaced `dup-…` |

## 15. Review truncation rule

**The string is never cut.** `google-reviews.js` records that reviews pass
through verbatim because a trimmed or hand-picked presentation misrepresents the
rating and breaks Google's terms.

So truncation is **CSS only**: `line-clamp-5` bounds the visual box inside the
track while the full verbatim text stays in the DOM — read in full by a screen
reader, selectable and copyable. The clamp's ellipsis signals there is more, and
the existing "See all reviews" link goes to the source. **The static grid is
unclamped**, exactly as before.

## 16. Missing-data behaviour **[measured]**

| Case | Result |
|---|---|
| Review with no text | Card renders author, rating and time; quote omitted — no empty quote block |
| Review with no profile image | N/A by design — initials always, no remote images |
| Very long review | Bounded by `line-clamp-5`; full text in the DOM |
| API failure / missing key | `null` → **section absent** |

## 17. Count behaviour

See §4. Zero → no section; one to three → static grid, no control; four or more
→ track with control.

## 18. Mobile behaviour **[measured]**

**The track is dramatically shorter than the grid it replaces**, which is the
strongest argument for it beyond aesthetics:

| Width | Static grid (before) | Track (after) | Δ |
|---|---:|---:|---:|
| **390** | **1,653** | **630** | **−1,023** |
| 768 | 1,277 | 623 | −654 |
| 1024 | 1,149 | 623 | −526 |
| 1440 | 1,047 | 623 | −424 |

Cards are a fixed 340 px — readable, not slivers. No horizontal page overflow at
any width. The pause control is a 44 px-minimum target aligned to the content
column at every width. **Phase 7.1's first-viewport work is untouched** — the
hero is unchanged and reviews sit below the Platform Showcase.

## 19. Files modified

| File | Change |
|---|---|
| `src/components/home/ReviewMotion.jsx` | **new** — client pause wrapper |
| `src/components/home/Reviews.jsx` | threshold, track, clamp, `<noscript>`, duplicate |
| `src/styles/tailwind.css` | keyframe + pause/suppression rules |
| `docs/HOMEPAGE_IMPLEMENTATION_PLAN.md` | §9 review-movement line amended (§0) |

## 20–21. Components and client islands

Created `ReviewMotion` (client). `Reviews` stays a **server** component.
**Client islands 3 → 4.** The addition is one small control wrapper; the review
data and cards remain server-rendered.

## 22. Bundle measurements **[measured]**

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 6.85 kB | **7.09 kB** | +0.24 kB |
| **`/` First Load JS** | 101 kB | **101 kB** | **0** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| Client islands | 3 | **4** | +1 |

Growth by module: `ReviewMotion.jsx` (one `useState`, one button) plus the track
markup in `Reviews.jsx`. The CSS lives in the existing stylesheet. **No new
dependency.**

## 23. Maps and Places **[measured]**

`/` **0 / 0** before address interaction — unchanged. `/medical`, `/legal`,
`/contact-us` 0 / 0. `/send` 6 Maps (expected). Tracking routes 0 / 0.

## 24. Homepage height **[measured]**

Without reviews (the state this environment serves): **3,996 px at 1440** —
unchanged. With five reviews: 5,042 → **4,619 px**, because the track is 424 px
shorter than the grid.

## 25. Accessibility results **[measured]**

| Check | Result |
|---|---|
| Semantic section heading | `<h2>` "Rated X on Google" |
| Heading order with reviews | `H1 H2×6 H3×3 H2×3` — **no skips** |
| `<h1>` count | 1 |
| Each review announced once | ✅ 5 of 10 cards accessible |
| Duplicate hidden | ✅ `aria-hidden="true"` |
| Pause button semantics | ✅ real `<button>`, `aria-pressed`, visible label |
| **Focus treatment missing** | **0 / 25** |
| Keyboard trap | none |
| `aria-live` on moving content | **none** |
| Rating expressed accessibly | ✅ `aria-label="N out of 5"`; stars `aria-hidden` |
| Duplicate ids | 0 |
| Horizontal overflow | none at 390/430/768/1024/1440 |
| Visible clipping at 200 % zoom | **0** — 5 reported, all `sr-only` |
| False interactive affordances | none |

⚠️ **Four raw contrast findings on the star glyphs, classified as not failures.**
The **unfilled** stars are `#d9d2e2` on white = **1.47:1**. They are the rating
meter's *track*: `aria-hidden`, decorative, and deliberately receding. The
meaningful boundary — filled against unfilled — measures **12.45:1**, and the
filled star measures **18.32:1** on white, both far above the 3:1 non-text
floor. The rating itself is exposed as text (`aria-label`), never by stars alone.
**Pre-existing and unchanged**; it surfaced now only because this is the first
audit run with reviews rendering.

## 26. Keyboard results **[measured]**

Tab order on `/`: skip link → wordmark → nav → Send a package → pickup →
drop-off → Talk to our team → **See all reviews → Pause motion** → … The control
is reached before the moving region. Every stop shows a visible indicator; no
trap; focus inside the track pauses it.

## 27. CLS results **[measured]** — three isolated contexts

| Width | Before | After (reviews present) |
|---|---|---|
| 390 | 0.002 | **0.002 · 0.002 · 0.002** |
| 1440 | 0.0001 | **0.0001 · 0.0001 · 0.0001** |

No regression. The track animates `transform` only, which does not trigger
layout.

## 28. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | **0** |
| `/medical` · `/legal` · `/contact-us` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` · `/track-partner/[token]` | 200 | 1 | **0** | 0 |

## 29. Screenshots captured

`scratchpad/phase8/before/` and `after/`: static grid before implementation at
390/768/1024/1440 · the track at all four widths · **deterministically paused**
captures · reduced-motion static · JavaScript-disabled static. Motion captures
were taken paused or under reduced motion, never mid-animation.

## 30. Deviations from the plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **The governing plan line was amended** | The plan forbids resolving a document conflict silently in code (§0) |
| 2 | **No partner work at all** | Gate B unmet; the brief requires continuing reviews and recording it |
| 3 | **Truncation is CSS, not string editing** | Editing review text breaks Google's terms; `line-clamp` bounds the box while the DOM keeps the verbatim string |
| 4 | **Motion threshold is four, not "sufficient"** | Derived from card width against the 1200 px column, not chosen |

## 31. Remaining weaknesses

| # | Item | Status |
|---|---|---|
| **W20** | **Gate B unmet** — no partner treatment exists. Blocked on founder evidence, not on engineering | New, blocked |
| **W21** | Equal-height cards mean a short review shows whitespace beside a five-line one. Inherent to a strip with variable-length verbatim content | New, accepted |
| **W22** | The motion path could not be verified against **real** Google data in this environment (no key). It was verified against the real integration's contract using reverted stubs | New, environmental |
| W17–W19 | Second queue row hidden below sm · 768 at 1.30 viewports · CLS 0.002 at 390 | Unchanged |
| W11 | E1 (≤ 5 mobile screens) still unmet | Unchanged; the track *reduces* mobile height by 1,023 px when reviews render |

## 32. Acceptance criteria

| Criterion | Status |
|---|---|
| Real reviews only, no fabricated content | ✅ no stub committed |
| Section absent when no real reviews | ✅ measured |
| Reviews move left to right | ✅ |
| Movement restrained, seamless, constant speed | ✅ derived duration, linear, no reset flash |
| Pause control, correct semantics, keyboard reachable | ✅ `aria-pressed`, visible label |
| Hover and focus pause; explicit pause wins | ✅ measured |
| Reduced motion static and complete | ✅ |
| JavaScript-disabled static and complete | ✅ no inert control |
| Each review announced once | ✅ 5 of 10 |
| No duplicate ids, no duplicate tab stops | ✅ 0 / 0 |
| Partner gate honoured | ✅ nothing rendered |
| Homepage static · First Load ≈ 101 kB · shared 87.2 kB | ✅ |
| One small client boundary added | ✅ |
| Zero Maps/Places before interaction | ✅ |
| No new dependency · no CLS regression · zero console errors | ✅ |
| Section order preserved | ✅ |

**Phase 8 meets its acceptance criteria for the review portion. The partner
portion is correctly blocked, not failed.**

## 33. Next phase

**Not begun.** No final launch QA, footer restructuring, integrations,
chain-of-custody artifact, new compliance claims, booking-flow expansion,
pricing changes or new product functionality.
