# Homepage Phase 7 — Booking Entry and Address Handoff

> **Status: Phase 7 complete, awaiting approval. Phase 8 has not begun.**
>
> **[measured]** from a production build against a running server. Nothing
> estimated. Branch `homepage-redesign`; five commits, nothing pushed, nothing
> merged. All earlier claim and architecture decisions treated as binding.
>
> Every address used in testing and in committed screenshots is a **generic
> public landmark** — Union Station and the CN Tower. No personal address
> appears anywhere.

---

## 1. Preflight results **[measured]**

| Check | Result |
|---|---|
| Branch | `homepage-redesign` |
| Working tree | clean |
| Commit `d3a40f7` present | ✅ |
| Lint · production build | ✅ both clean |

**Baseline:**

| Metric | Value |
|---|---|
| `/` route type | `○ (Static)` |
| `/` route size · First Load JS | 1.98 kB · **96 kB** |
| Shared JS | **87.2 kB** |
| Client islands on `/` | **2** (`HeaderMobileNav`, `NetworkDemo`) |
| Maps / Places on initial load | **0 / 0** |
| Hero height | 390 **843** · 768 1,063 · 1024 696 · 1440 **696** |
| CLS | 0.0001 |
| Hero CTAs | `Book a delivery` → `/send`, `Talk to our team` → `/contact-us` |

⚠️ **Correction to the Phase 6 report.** It recorded "1 reachable client island
(`HeaderMobileNav`)". That was wrong — `NetworkDemo.jsx` is `'use client'` too,
so the correct baseline is **2**, as the Phase 4 report had it. Phase 7 adds one,
making **3**.

## 2. Existing `/send` architecture inspected

All fourteen required items, before any implementation:

| # | Question | Finding |
|---|---|---|
| 1 | Maps/Places loading mechanism | `src/lib/maps-loader.js` — hand-rolled inline bootstrap, exports `importMapsLibrary(name)` and `loadMaps()`. No npm Maps package |
| 2 | Browser key env var | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, with a documented transitional hardcoded browser-key fallback |
| 3 | Autocomplete implementation | `send/AddressAutocomplete.jsx` (588 lines) wrapping Google's **`PlaceAutocompleteElement`** web component |
| 4 | Address object shape | `{ address: string, lat: number, lng: number }` |
| 5 | Session-storage key | **`legaldrop.send-flow.v1`** |
| 6 | How `/send` initialises | `SendFlowProvider` reads once on mount via `readStored()`, merging the parsed object over `EMPTY_STATE` |
| 7 | Malformed / stale state | **Safe.** `readStored()` is wrapped in try/catch returning `null`, and re-validates both places with `isPlace()`, nulling anything that fails |
| 8 | Coordinates required to advance | Yes — `hasBothAddresses(flow)` gates Continue on `/send` and guards `/send/details` and `/send/pay` |
| 9 | Typed text vs selected place | Distinguished. Only a `gmp-select` commit produces a place; typed text never becomes one |
| 10 | Loader reusable without initial load | **Yes.** The bootstrap defines `importLibrary` synchronously but fetches nothing until the first `importLibrary()` call, and Google memoises that fetch |
| 11 | Global provider / context | `SendFlowProvider` + `useSendFlow` — **must not** be mounted on the homepage |
| 12 | Redirect route | **`/send`** (step 1; it links forward to `/send/details`) |
| 13 | Other fields to preserve | `packageCount`, `weight`, `vehicle`, `section`, `contact{…}` |
| 14 | Version / migration | Key is `.v1`; **no migration mechanism**. Forward compatibility comes from merging over `EMPTY_STATE` |

**No stop condition was triggered.** The contract is determinable, the loader can
be reused lazily, a browser key is available, `/send` initialises safely from
storage, no state needs to go in the URL, no provider needs mounting, no booking
flow needs duplicating, and no new dependency was required.

## 3. Storage key and object contract

```
legaldrop.send-flow.v1
{ pickup: { address, lat, lng }, dropoff: { address, lat, lng }, … }
```

Validated by `isPlace()`: `address` is a string, `lat` and `lng` are
`Number.isFinite`. **The contract was not changed for the homepage.**

## 4. Existing Google loader architecture

`maps-loader.js` installs Google's official inline bootstrap once per document,
guarded by a module flag and by adopting any pre-existing
`window.google.maps.importLibrary`. Version pinned to `3.64` — verified live as
**3.64.14a**. Concurrent `importLibrary()` calls share one network request and
one script tag by Google's own memoisation.

## 5. New component architecture

| Component | Boundary | Role |
|---|---|---|
| `home/HeroNetwork.jsx` | **server** (unchanged) | hero shell; renders the island and the no-JS fallback |
| `home/HeroAddressEntry.jsx` | **client** (new) | the whole form: two fields, loader, validation, handoff |
| `home/NetworkDemo.jsx` | client (unchanged) | independently scoped, untouched |
| `lib/send-flow-contract.js` | **no React** (new) | `SEND_FLOW_STORAGE_KEY`, `isPlace`, `hasBothAddresses` |

**Why a custom autocomplete.** `AddressAutocomplete.jsx` wraps
`PlaceAutocompleteElement`, whose dropdown lives in **its own shadow DOM** — a
list that cannot be restyled. Phase 7 requires a Druppr-styled suggestion list,
so this uses the **programmatic** API instead,
`AutocompleteSuggestion.fetchAutocompleteSuggestions`, which returns predictions
as data. Verified present at the pinned version alongside `Place`.

**The commit path is copied, not reinvented** — `prediction.toPlace()` →
`fetchFields(['location','formattedAddress'])` → `location.lat()` / `lng()` →
`Number.isFinite`. Including the trap `AddressAutocomplete.jsx:314` documents:
on a `LatLng`, **`lat` and `lng` are functions, not properties.**

**No new dependency.** The combobox is hand-rolled.

## 6. Lazy-loading trigger

**First focus of either address field**, and nothing else. Not module scope, not
server render, not mount, not idle, not intersection, not hover, not an
unrelated CTA. The promise is cached on a ref so a second field joins it rather
than starting a second import.

## 7. Initial Maps and Places request counts **[measured]**

| Moment | Maps | Places | `window.google` present |
|---|---|---|---|
| **Initial load** | **0** | **0** | **false** |
| After focusing pickup | 4 | 0 | true |
| After also focusing drop-off | 6 | 0 | true |
| **`maps/api/js` bootstrap entries** | **1 after pickup · 1 after both** | — | — |

The 4→6 growth is Google's own internal module fetches, **not a second loader**:
the bootstrap entry script count stays at exactly **1**. Zero `places.googleapis.com`
requests at any point — that host is the server-side Places API used by reviews;
the browser autocomplete goes through `maps.googleapis.com`.

## 8. Address-selection state model

Per field: `text`, `selected` place, `suggestions`, `open`, `activeIndex`,
`status` (`idle` / `searching` / `resolving` / `no-results` / `failed`).
Shared: one loader promise, one `loaderState`, one `degraded` flag.

**Typed text is never an address.** Editing after a selection immediately
invalidates it and clears its coordinates, so stale coordinates can never sit
under new text. Submission requires **both** fields to satisfy `isPlace()`.

**Request restraint:** 250 ms debounce · 3-character minimum · monotonic request
ids so a slower earlier response cannot overwrite a faster later one · a
`mounted` ref so a response arriving after unmount is dropped · place details
fetched **only** on selection · every path caught so no unhandled rejection
reaches the console.

## 9. Keyboard interaction model **[measured]**

| Key | Behaviour | Verified |
|---|---|---|
| ArrowDown / ArrowUp | move the active option, wrapping | ✅ `option-0` → `option-1` → `option-0` |
| Enter | selects the active option when one is highlighted; otherwise falls through to submit | ✅ |
| Escape | closes the list, clears the active option | ✅ `aria-expanded` → `false`, activedescendant → null |
| Tab | moves to the next control, no trap | ✅ pickup → drop-off |
| Pointer | `mousedown` commits before blur closes the list | ✅ |

**Focus does not auto-select:** `aria-activedescendant` is null until an arrow
key is pressed.

## 10. ARIA implementation

The **input** owns `role="combobox"` with `aria-expanded`, `aria-controls`,
`aria-autocomplete="list"`, `aria-describedby` and `aria-activedescendant`; the
list is a real `role="listbox"` of `role="option"` items with `aria-selected`.
IDs are namespaced by `useId()`, so two fields never collide.

**The status line is `aria-describedby`, not `aria-live`** — announcing a
changing suggestion count on every keystroke is exactly the noise the brief
rules out. **The active option is not colour alone:** the tint is joined by a
`brand-600` rule down the leading edge.

## 11. Session-storage merge behaviour

On valid submission: read → `JSON.parse` inside try/catch → accept only a
non-array object → **replace only `pickup` and `dropoff`** → serialise → write →
`router.push('/send')`.

`packageCount`, `weight`, `vehicle`, `section` and `contact` survive untouched.
This is exactly what the flow's own `setPickup`/`setDropoff` do, which is the
"same reset semantics as the existing `/send` flow" the brief requires.

**Nothing stale is left behind, and this was checked rather than assumed.** The
`.v1` record holds **no price, distance or quote** — `useVehicleQuotes` derives
those at runtime from the coordinates, so new addresses produce a new quote. The
PaymentIntent recovery record lives under a **separate** key
(`legaldrop.send-payment.v1`) and is already invalidated by `paymentInputsHash`,
which includes all four coordinates. No downstream reset was therefore needed,
and none was invented.

**Writes happen only on submit** — never on keystroke.

## 12. Existing-state behaviour **[measured]**

Read once on mount, never during render. Only a place passing `isPlace()` is
adopted.

| Stored state | Result |
|---|---|
| Both valid | both fields prefilled, submit **enabled** |
| Malformed JSON (`{not json`) | fields empty, form renders, **no crash**, 0 console errors |
| Half-valid (drop-off `lat: null`) | pickup prefilled, **drop-off empty, submit disabled** |
| Absent | fields empty |

## 13. Successful handoff results **[measured]**

Both suggestions selected by keyboard, then submitted:

```
pickup  { "address": "55 Front St W, Toronto, ON M5J 1E6, Canada",
          "lat": 43.6454842, "lng": -79.3808301 }
dropoff { "address": "290 Bremner Blvd, Toronto, ON M5V 3L9, Canada",
          "lat": 43.6425662, "lng": -79.3870568 }
```

| Check | Result |
|---|---|
| Redirect | `http://localhost:3000/send` |
| Query string / hash | **empty** — no address data in the URL |
| Seeded unrelated state | **preserved** — `packageCount=4`, `weight=mid`, `vehicle=suv`, `section=medical_supply`, `contact.senderName` |
| **`/send` prefilled** | **both** `PlaceAutocompleteElement` values read back the exact addresses |
| `/send` Continue control | **enabled** |
| Console errors | **0** |

**Selection integrity, measured:** with both selected, submit enabled → typing
one character into pickup → **submit disabled** → re-selecting a suggestion →
**submit enabled**.

## 14. Failure and fallback behaviour **[measured]**

| Scenario | Behaviour |
|---|---|
| **Google blocked at the network layer** | typed text kept; "Address suggestions are unavailable right now."; submit stays disabled; **both** `/contact-us` and `/send` links offered |
| **No results** | list closes, "No matching addresses.", 0 console errors |
| **Missing / rejected key** | same degraded path; the key name and configuration are never exposed |
| **Slow-then-fast requests** | monotonic sequence ids discard the stale response |
| **Unmount during a request** | `mounted` ref drops the result |
| **Incomplete place details** | fails `isPlace()`, reported, **not committed** |
| **sessionStorage unavailable** | write is wrapped; navigation still proceeds to `/send`, which shows empty fields |

⚠️ **One console entry in the blocked-network test**: `net::ERR_FAILED`. That is
the **browser** reporting an aborted request, not application code — the promise
rejection is caught and no unhandled rejection occurs. Recorded rather than
glossed, because "zero console errors" is otherwise true everywhere.

**A gap found and fixed during testing.** The degraded path originally offered
only "Talk to our team" → `/contact-us`. Task 9 requires a route to the full
booking flow, so a `degraded` flag now reveals "Continue on the full booking
page" → `/send`. Shown only when lookup is degraded; the happy path is unchanged.

## 15. JavaScript-disabled behaviour **[measured]**

| Check | Result |
|---|---|
| `[data-hero-entry]` (the form) | `display: none` |
| `[data-hero-nojs]` (the fallback) | `display: flex` |
| Fallback links | `Book a delivery` → `/send`, `Talk to our team` → `/contact-us` |
| H1, lead, network demonstration | all present |

Implemented as a `<noscript><style>` pair — CSS the browser applies only when
scripting is off. **The alternative was rejected deliberately:** rendering a
button on the server and swapping to the form on mount is a ~150 px height
change at hydration, i.e. a CLS regression on the largest element of the first
screen. There are never two inert-looking fields without explanation.

## 16. Privacy handling

| Requirement | Status |
|---|---|
| No addresses in URLs | ✅ query and hash empty after redirect |
| No addresses in console | ✅ nothing logged |
| No addresses in static HTML | ✅ values exist only in client state and sessionStorage |
| Sent only to Google + the existing send flow | ✅ |
| No localStorage | ✅ sessionStorage only, the contract the flow already uses |
| No new analytics, no prefetch carrying addresses | ✅ |
| No privacy or security claims added to the page | ✅ |

## 17. Files modified

| File | Change |
|---|---|
| `src/lib/send-flow-contract.js` | **new** — React-free storage contract |
| `src/lib/send-flow.js` | imports the contract; re-exports `hasBothAddresses` |
| `src/components/home/HeroAddressEntry.jsx` | **new** — the form |
| `src/components/home/HeroNetwork.jsx` | renders the island + `<noscript>` fallback |

## 18. Components created or refactored

Created `HeroAddressEntry` (with an internal `AddressField`) and
`send-flow-contract`. Refactored `send-flow.js` to source its contract, and
`HeroNetwork` to host the island. **`AddressAutocomplete.jsx` was not touched.**

## 19. Client-island count

**2 → 3.** `HeaderMobileNav`, `NetworkDemo`, and now `HeroAddressEntry`.
`HeroNetwork` remains a server component; no page-wide provider was mounted.

## 20–21. Bundle measurements and where the growth is **[measured]**

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** | unchanged |
| `/` route size | 1.98 kB | **6.79 kB** | +4.81 kB |
| **`/` First Load JS** | 96 kB | **101 kB** | **+5 kB** |
| **Shared JS** | 87.2 kB | **87.2 kB** | **0** |
| `/send`, `/send/details`, `/send/pay` | 102 / 101 / 108 kB | **unchanged** | 0 |

Growth by module:

| Source | Contribution |
|---|---|
| `HeroAddressEntry.jsx` — combobox, state, ARIA, merge logic | the bulk of the +4.81 kB route size |
| `next/navigation` `useRouter` | small; first use on this route |
| `maps-loader.js` | ~1 kB of module code — **the Maps API itself is not bundled**, it is fetched on interaction |
| `send-flow-contract.js` | ~200 bytes; deliberately excludes the React context |

**101 kB is within the ~110 kB ceiling**, and the growth is entirely the
functional form. Shared JS did not move.

## 22. Hero height, before and after **[measured]**

Live DOM measurement, viewport height 844.

| Width | Before | After | Δ | H1 · lead · form · submit · secondary all in first screen | Demo visible in first screen |
|---|---:|---:|---:|---|---|
| 390 | 843 | **1,101** | **+258** | ✅ all five | top 724 — ~120 px visible |
| 768 | 1,063 | **1,194** | +131 | ✅ all five | top 582 — ~262 px visible |
| 1024 | 696 | **773** | +77 | ✅ all five | fully visible (203–706) |
| 1440 | 696 | **696** | **0** | ✅ all five | fully visible (164–668) |

**At 1440 the hero did not grow at all** — the form fits the space the two
buttons occupied. Page height at 390: 6,155 → 6,413.

Inputs measure **52 px tall** at every width (≥ 44 px target). Suggestions fit
the viewport at 390 (left 32, right 358 of 390) and cause **no page-width
expansion**.

## 23. Maps and Places, before and after interaction

Covered in §7. Initial **0 / 0**; after interaction one bootstrap, reused by both
fields.

## 24. Accessibility results **[measured]**

| Check | `/` |
|---|---|
| `<h1>` count | **1** |
| Heading order | `H1 H2×5 H3×3 H2×3` — no skips, unchanged |
| **Contrast failures (alpha-composited)** | **0** |
| **Focus treatment missing** | **0 / 23** |
| Duplicate IDs | none — `useId()` namespaces both fields |
| Labelled controls | ✅ visible `<label htmlFor>`; placeholders do not substitute |
| False interactive affordances | none — the submit is genuinely `disabled` until valid, so it is not a focusable no-op |
| Keyboard trap | none |
| Text below 12 px | 0 |
| Horizontal overflow | none at 390/768/1024/1440 |
| Reduced motion | content stable across 2.5 s |

Regression across the other six routes is unchanged from Phase 6.1.

## 25. 200 % zoom results **[measured]**

720 × 450 viewport: **no horizontal overflow**, and **0 visible clipped nodes**.
Four nodes report as clipped; all four are `sr-only` — the skip link,
`NetworkDemo`'s description, and the **two new field status lines**, which clip
by design.

## 26. CLS results **[measured]**

Three isolated contexts per width.

| Width | Before | After |
|---|---|---|
| 1440 | 0.0001 | **0.0001 · 0.0001 · 0.0001** |
| 390 | — | **0 · 0 · 0** |

No regression. The `<noscript>` fallback approach is what keeps it there.

## 27. Regression results **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | **0** |
| `/medical` | 200 | 1 | **0** | 0 |
| `/legal` | 200 | 1 | **0** | 0 |
| `/contact-us` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` | 200 | 1 | **0** | 0 |
| `/track-partner/[token]` | 200 | 1 | **0** | 0 |

## 28. Screenshots captured

In `scratchpad/phase7/before/` and `after/`: hero at 390/768/1024/1440 before and
after · empty fields · pickup suggestions open at 390 and 1440 · both valid
selections · invalidated selection after editing · no-results state ·
API-unavailable state · keyboard-focused suggestion · JavaScript-disabled
fallback · 200 % zoom · prefilled-from-session state · homepage immediately
before submission · `/send` immediately after redirect with both addresses
prefilled.

**Generic public landmarks only** — Union Station and the CN Tower.

## 29. Deviations from the plan

| # | Deviation | Reason |
|---|---|---|
| 1 | **Programmatic Places API instead of reusing `AddressAutocomplete`** | Its dropdown is in shadow DOM and cannot be Druppr-styled. The commit path was copied verbatim so the two agree on how a place becomes coordinates |
| 2 | **A React-free contract module was extracted** | Reusing `isPlace` would otherwise have pulled `SendFlowProvider`'s context onto the homepage. This keeps one definition and no context |
| 3 | **Region restricted to `['ca']`, not the GTA** | Matches the existing product's own restriction. No approved service-boundary rule exists, and narrowing further would reject legitimate supported deliveries |
| 4 | **A sixth link — "Continue on the full booking page"** | Found in testing; Task 9 requires a route to the full flow when lookup fails |
| 5 | **`<noscript>` CSS rather than a mount-time swap** | The swap is a ~150 px hydration height change, i.e. a CLS regression |

## 30. Remaining weaknesses

| # | Item | Status |
|---|---|---|
| **W13** | **Hero is +258 px at 390**, pushing the network demonstration mostly below the fold (~120 px visible) | ✅ **CLOSED by Phase 7.1** — hero 912 px, demo 199 px visible including the complete route and the active status |
| **W14** | At 1440 an open suggestion list extends ~100 px below the fold with five results. Nothing is clipped and the page scrolls normally | New, minor |
| **W15** | The homepage and `/send` now run **two different autocomplete implementations** against the same service. Deliberate, and the commit path is shared — but a future change to how a place becomes coordinates must be made in both | New, documented in-file |
| **W16** | `net::ERR_FAILED` appears in the console when the network blocks Google. Browser-level, not application code | New, benign |
| W11 | `/` is 7.6 mobile screens; E1 (≤ 5) still unmet at 390 | Slightly worse (+258 px) |
| — | `/privacy-policy` security sentence | Unchanged — privacy counsel |
| R5 | LCP / FCP **[not captured]** | Unchanged |

## 31. Acceptance criteria

| Criterion | Status |
|---|---|
| Visitor can enter, select and submit both addresses | ✅ measured end to end |
| Stored using the existing contract, unchanged | ✅ `legaldrop.send-flow.v1` |
| `/send` continues with both addresses prefilled | ✅ both element values read back |
| No price calculated, no order created | ✅ |
| Custom Druppr-styled suggestion UI | ✅ no Google dropdown visible |
| **0 Maps and 0 Places on initial load** | ✅ **and no `google` object present** |
| Library loads once, reused by both fields | ✅ 1 bootstrap entry |
| Typed text never accepted as an address | ✅ invalidation measured |
| Full combobox keyboard model | ✅ all keys verified |
| No addresses in URL, logs or analytics | ✅ |
| Meaningful JavaScript-disabled fallback | ✅ `<noscript>` swap to real links |
| Homepage remains static | ✅ `○ (Static)` |
| First Load ≤ ~110 kB · shared ≈ 87.2 kB | ✅ **101 kB / 87.2 kB** |
| No new dependency | ✅ hand-rolled combobox |
| No material CLS regression | ✅ 0.0001 / 0 |
| Zero console errors | ✅ except the browser's own `net::ERR_FAILED` under a blocked network |
| Approved Phase 4–6 work untouched | ✅ nothing below the hero changed |

**Phase 7 meets its acceptance criteria.**

## 32. Phase 8

**Phase 8 has not begun.** No review animation, partner-logo animation,
integrations, chain-of-custody artifact, footer restructuring, broad motion work
or final launch optimisation.

---

# Phase 7.1 — Mobile Product-Balance Refinement

> A narrowly scoped composition pass. No change to the address architecture,
> Places implementation, storage contract, tracking language, section order,
> metrics, Platform Showcase, verticals or Trust section. **Phase 8 has not
> begun.**
>
> **[measured]** from a production build, live DOM. Screenshots were never used
> as the measurement; all captures suppress motion.

## 1. Initial height breakdown at 390 (viewport 844) **[measured]**

| Element | Height |
|---|---:|
| hero padding-top | 40 |
| H1 | 108 |
| supporting statement (+16 margin) | 77 |
| grid gap before the form | 28 |
| form top margin | 24 |
| pickup control (label + input) | 79 |
| inter-field gap | 16 |
| drop-off control | 79 |
| submit row (+20 margin) — submit 58, gap 12, secondary 44 | **114** |
| helper region (+12 margin) — **two lines** | **43** |
| **`NetworkDemo` panel** | 404 |
| ├ panel padding | 16 |
| ├ header (label + Sample data) | 36 |
| ├ route diagram | 153 |
| ├ active dispatch block | ~110 |
| └ secondary queue (2 rows) | ~70 |
| hero padding-bottom | 40 |
| **Hero total** | **1,101 (1.30 viewports)** |
| **Demo visible in first viewport** | **120** |

**Three sources, not one:** a stacked submit row spending 114 px on two actions,
a helper sentence wrapping to two lines, and a diagram whose `viewBox` carries
an almost empty band above Y = 45 (the route lives at Y 68–188).

**Reductions ruled out** as harmful: input height (52 px, target size), visible
labels, the secondary business action, failure messages, the `/send` degraded
link, combobox semantics, H1 or supporting copy (both required complete), and
body text size.

## 2. Form changes — mobile only

Field gap `4→3` · label margin `1.5→1` · submit padding `py-4→py-3` · submit row
gap `3→2` with a tighter top margin · form top margin `6→4` · helper margin
`3→2` · **both helper strings shortened to one line at 390**.

The ready message mattered beyond its own height: *"Both addresses set. Continue
to choose a vehicle."* wrapped to two lines, so selecting the second address
nudged the whole panel down ~21 px — **a layout shift caused by the user
succeeding.** Now *"Ready — continue to choose a vehicle."*, one line in both
states.

**Unchanged:** labels, control heights, the custom autocomplete, every validation
rule, keyboard behaviour, the degraded fallback, the no-JavaScript fallback, and
the `/contact-us` action. Fields were **not** placed on one narrow row.

## 3. Network-demo responsive changes — CSS variants only

**No new client island, no JavaScript, no dependency.**

| Change | Effect |
|---|---|
| Panel padding `4→3` below sm | −8 |
| Tighter internal margins (active block, progress bars, queue) | −10 |
| **Queue shows one row below sm**, both from sm | −26 |
| **Diagram's dead top band clipped** — wrapper with `-mt-[42px]` below sm | −42 |

**Nothing of the route is lost.** The route runs viewBox Y 68–188 with the
marker at 120; the crop stops well clear of P3. A wrapper rather than a second
`viewBox` because `viewBox` is an attribute, not a class — changing it
responsively would need JavaScript, and this phase adds none.

Retained: the `Product demonstration` and `Sample data` labels, the route,
pickup and destination, the active category, the current status, evidence that
other jobs exist, the `sr-only` description, and the no-JS and reduced-motion
completed states. **No disclosure control, carousel, tabs or horizontal scroll.**

**Tablet.** Between sm and lg the demo took the full 1200 px column — 656 px wide
at 768, and since the diagram keeps its 400×210 ratio its height followed to
~344 px. Capped at **520 px below lg**, which is exactly the ceiling the lg grid
already gives that column, so the two ranges agree rather than adding a rule.

## 4. Hero height, before and after **[measured]**

| Width | Before | After | Δ | Viewports |
|---|---:|---:|---:|---|
| **390** | 1,101 | **912** | **−189** | 1.30 → **1.08** |
| **430** | 1,054 | **897** | **−157** | 1.25 → **1.06** |
| **768** | 1,194 | **1,098** | **−96** | 1.41 → **1.30** |
| **1024** | 773 | **773** | **0** | 0.92 — unchanged |
| **1440** | 696 | **696** | **0** | 0.82 — unchanged |

Page height at 390: 6,413 → **6,223**.

## 5. First-viewport elements at 390, before and after **[measured]**

| Element | Before | After |
|---|---|---|
| Complete H1 | ✅ | ✅ |
| Complete supporting statement | ✅ | ✅ |
| Pickup field | ✅ | ✅ |
| Drop-off field | ✅ | ✅ |
| Submit control | ✅ | ✅ |
| Business CTA | ✅ | ✅ |
| `Product demonstration` + `Sample data` | 36 px — label only | ✅ 26 px, fully legible |
| **Complete route diagram** | ❌ 55 of 153 px | ✅ **158 of 158 px** |
| **Active dispatch row + status chip** | ❌ 0 px | ✅ **23 px** |
| Secondary queue row | ❌ 0 px | 12 px |

At 430: demo visible **235 px**, diagram complete, active row **38 px**.

**This is the preferred outcome, not the minimum** — the route diagram and the
active status are both substantially visible, rather than one or the other.

## 6. Visible network-demo height **[measured]**

| Width | Before | After |
|---|---:|---:|
| 390 | **120** | **199** |
| 430 | 177 | **235** |
| 768 | 262 | 262 |
| 1024 | 504 | 504 |
| 1440 | 504 | 504 |

## 7. Booking-regression results **[measured]**

| Check | Result |
|---|---|
| Maps / Places before interaction | **0 / 0**, no `google` object |
| Bootstrap entries after focusing both fields | **1** — no duplicate script |
| Suggestion selection | ✅ 5 options, keyboard and pointer |
| Stale-response protection | ✅ monotonic ids |
| Edit-after-selection invalidation | ✅ submit disables, re-selection re-enables |
| Keyboard combobox | ✅ arrows, Enter, Escape, Tab — no trap |
| Valid submit → session merge | ✅ real coordinates written |
| Unrelated state preserved | ✅ `packageCount`, `weight`, `vehicle`, `section`, `contact` |
| Address data in URL | ✅ none — query and hash empty |
| `/send` redirect and prefill | ✅ both element values read back exactly |
| Degraded-network escape link | ✅ `/send` and `/contact-us` both offered |
| Malformed session state | ✅ empty fields, no crash |
| No-JavaScript fallback | ✅ form hidden, real links shown |

**The storage contract and the loader were not touched.**

## 8. Keyboard and accessibility results **[measured]**

| Check | `/` |
|---|---|
| Visible labels retained | ✅ |
| Control targets | inputs 52 px, submit ≥ 44, secondary 44 |
| Focus treatment | **0 / 23** missing |
| Active option distinguishable without colour | ✅ `brand-600` leading rule + tint |
| Duplicate IDs | none — `useId()` |
| Focus trap | none |
| Horizontal overflow | none at 390/430/768/1024/1440 |
| **Visible clipping at 200 % zoom** | **0** — 4 reported, all `sr-only` |
| Unnecessary announcements | none — status is `aria-describedby`, not `aria-live` |
| `sr-only` network description | retained |
| `<h1>` count · heading order | 1 · `H1 H2×5 H3×3 H2×3`, unchanged |
| **Contrast (alpha-composited)** | **0 failures** |

## 9. JavaScript-disabled results **[measured]**

`[data-hero-entry]` `display:none`, `[data-hero-nojs]` `display:flex`, links to
`/send` and `/contact-us`, H1, lead and the demonstration's completed state all
present. 3,620 characters of body text.

## 10. Reduced-motion results **[measured]**

Content identical across 2.5 s on `/`, `/medical` and `/legal`. The demo's
completed state renders; the crop is a static wrapper and does not animate.

## 11. Bundle measurements **[measured]**

| Metric | Phase 7 | Phase 7.1 |
|---|---:|---:|
| `/` route type | `○ (Static)` | **`○ (Static)`** |
| `/` route size | 6.79 kB | **6.85 kB** |
| **`/` First Load JS** | 101 kB | **101 kB** |
| **Shared JS** | 87.2 kB | **87.2 kB** |
| **Client islands** | 3 | **3** |

**Zero JavaScript added** — the +0.06 kB is Tailwind variant classes in the
markup. No new dependency.

## 12. Maps and Places **[measured]**

`/` **0 / 0** on initial load. `/medical`, `/legal`, `/contact-us` 0 / 0.
`/send` 6 Maps (expected). Both tracking routes 0 / 0.

## 13. CLS results **[measured]** — three isolated contexts

| Width | Before | After |
|---|---|---|
| 1440 | 0.0001 | **0.0001 · 0.0001 · 0.0001** |
| 390 | 0 | **0.002 · 0.002 · 0.002** |

⚠️ **390 moved from 0 to 0.002.** Immaterial against the 0.05 budget — ~25×
inside it — but it is a change, and it is recorded rather than rounded away.

## 14. Regression **[measured]**

| Route | HTTP | `<h1>` | Console errors | Maps |
|---|---|---|---|---|
| `/` | 200 | 1 | **0** | **0** |
| `/medical` · `/legal` · `/contact-us` | 200 | 1 | **0** | 0 |
| `/send` | 200 | 1 | **0** | 6 (expected) |
| `/track/[code]` · `/track-partner/[token]` | 200 | 1 | **0** | 0 |

## 15. Remaining mobile weaknesses

| # | Item | Status |
|---|---|---|
| **W13** | **Closed.** The demo is no longer a label and a border; the complete route and the active status are in the first viewport | Resolved |
| **W17** | The **second queue row is hidden below sm**. One row still carries "other jobs exist", but a phone visitor sees less breadth than a desktop one | New, accepted |
| **W18** | **768 is still 1.30 viewports.** Better than 1.41, but the single-column range remains the tallest hero | Improved, open |
| **W19** | CLS at 390 is 0.002 rather than 0 | New, immaterial |
| W11 | `/` is 7.37 mobile screens; E1 (≤ 5) still unmet | Improved from 7.60 |
| W14–W16 | Suggestion list extends below the fold at 1440 · two autocomplete implementations · browser `net::ERR_FAILED` under a blocked network | Unchanged |

## 16. Is the platform-versus-booking balance restored?

**Yes, at 390 and 430.** A first-time mobile visitor now sees a usable delivery
entry *and* a coordination system: the labelled demonstration, a complete route
between two points, and a live job with its status — the evidence that Druppr
coordinates rather than merely takes bookings. The form did not lose a label, a
target size, a validation rule or a fallback to get there.

**At 768 the balance is better but the hero is still 1.30 viewports**, which is
the honest remaining gap.

**Phase 8 has not begun.** No reviews movement, partner movement, integrations,
broad motion, footer restructuring or launch optimisation.
