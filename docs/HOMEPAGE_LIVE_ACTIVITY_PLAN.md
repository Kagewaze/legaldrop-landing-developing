# Homepage Live Activity — Architecture Decision Record

> Replacing the synthetic content inside the homepage `NetworkDemo` with real,
> anonymized city-to-city delivery activity.

**This is a decision record, not a proposal.** The decisions in §4 are made. What
remains open is listed in §11 and is owner action or measurement, not design.

---

## On citations in this document

Two repositories were investigated. They are cited differently and the difference
is load-bearing:

| Source | Citations | Verification status |
|---|---|---|
| **Landing** (this repo) | `src/…`, `docs/…` | **Verified in this repo** at `main` @ `aa851af`. Every line number below was read directly. |
| **Backend** (NestJS, separate repo) | `order.service.ts`, `app.module.ts`, `*.entity.ts` … | **Recorded as reported** by the backend investigation. Not re-verified here — this repository has no access to that codebase. Re-confirm before relying on any line number. |

Quoted material is marked as such and attributed to its source: **§3 (B1–B5)**
quotes the backend investigation report, and **§5** quotes the founder direction.
Everything else is this document's own reasoning. Nothing has been invented to
fill a gap.

---

## 1. Status

**Phase: architecture and evidence gathering complete. NOT APPROVED FOR BUILD.**

- **Backend destination-city work is approved to proceed.** It is independently
  valuable and is not gated on this feature — see **D1**.
- **Homepage consumption is deferred**, pending order volume — see **B6** and the
  volume threshold item in §11.

No production order data is connected. No homepage file has been modified. See
§12.

---

## 2. Backend capability found

*All citations in this section are recorded as reported by the backend
investigation and were not re-verified from this repository.*

### 2.1 Order creation path

Order creation runs through `order.service.ts:96`. It performs **nine inline side
effects** in sequence within the create path.

**No domain event is published on create** — despite `EventEmitterModule` being
registered in the application module (`app.module.ts:5`, `app.module.ts:47`). The
infrastructure for an event-driven hook exists and is wired up; nothing emits on
this path. That is the seam a publication job would attach to, and it is
currently unused.

### 2.2 Pickup city — EXISTS

| Property | Detail |
|---|---|
| Column | `order.city` — `order.entity.ts:142-143` |
| Written at | `order.service.ts:200-207` |
| Source | `GoogleMapsService.getCity` — `googlemaps.service.ts:66-104` |
| Nullability | **Nullable** |
| Normalisation | `trim().toLowerCase()` |
| Caching | Redis, 24h TTL |

The write is already additive and failure-tolerant. That existing shape is the
template for the destination-city write — see the warning in §9.

### 2.3 Destination city — DOES NOT EXIST

**This is the primary gap.** `delivery_point` has no `city` or `locality` column
anywhere in its definition (`delivery_point.entity.ts:25-102`).

There is therefore no destination half of a city-to-city pair today. Every other
part of this feature is blocked behind closing that gap.

### 2.4 Route exposure and public precedent

Routes are **public by default**; there is no global guard
(`app.module.ts:103`). An existing public controller establishes the pattern to
follow: `public-order.controller.ts:10-19`.

### 2.5 CORS

`main.ts:14` calls `app.enableCors()` **with no arguments** — wide open, all
origins. Recorded as a fact about current state; see **B3**.

### 2.6 Rate limiting

Hand-rolled Redis guard at `public-track-throttle.guard.ts:19-40`.
**`@nestjs/throttler` is not installed.** Any new public endpoint must either
reuse that guard or add the package deliberately.

### 2.7 Redis

Injectable per-module via `@nestjs-modules/ioredis`. A cache-with-TTL precedent
already exists at `googlemaps.service.ts:155-167` and is the pattern D4 follows.

### 2.8 Delayed jobs

BullMQ delayed jobs are established, with **four existing uses** — for example
`order.service.ts:433-437`. The delay mechanism §8 requires is proven in this
codebase; nothing new is introduced.

### 2.9 ID generation

`randomBytes` is used at `otp.utils.ts:8-10`.

> ⚠️ **`OtpHelper.generateOTP` uses `Math.random()` and MUST NOT be used as an ID
> source.** `Math.random()` is not cryptographically random and its output is
> predictable from prior values. Public event IDs use `randomBytes` only — see
> §8.

---

## 3. Blockers

**B1–B5 below are quoted verbatim from the backend investigation report.** Their
section markers (§2, §3) refer to that report, not to this document. Like every
other backend citation here, they are **recorded as reported and not re-verified
from this repository** — see *On citations* above. B6 is landing-side and was
verified here.

### B1 — Destination city does not exist in the database

> The destination city does not exist in the database. `delivery_point` has no
> city/locality/municipality column (§2, grep confirms). Only `receiverAddress`
> (free text) and `receiverLocation` (geometry) are stored. The requested
> `{ origin, destination }` shape cannot be produced today for the destination
> half without either a new column populated at write time, or per-request
> reverse-geocoding on a public endpoint — the latter being a billed Google call
> on an unauthenticated route. Pickup city is fine (`order.city`,
> `order.entity.ts:142-143`).

**Primary blocker.** Note the rejected alternative is rejected on two independent
grounds: cost (a billed Google call per request) and exposure (on an
unauthenticated route, i.e. a metered external dependency any caller can drive).
D4 — Redis-only reads — is the direct consequence.

### B2 — No way to exclude test, demo, or internal orders

> No way to exclude test, demo, or internal orders. No `isTest`/`isDemo`/
> `environment`/`source` column exists on `Order` (§3), and no convention filters
> by creator role. Every order in the database would be a candidate for the
> marketing homepage.

> ⚠️ **This invalidates one of the eligibility rules in §7 as originally
> drafted.** That rule listed `isTest is false` as an inclusion condition; no such
> column exists, so the rule is not implementable today. §7 has been corrected to
> record it as blocked rather than satisfied. **B2 must be closed before any
> publication job runs**, and it compounds B3 — see below.

### B3 — Unknown whether dev/staging share the production database

> Unknown whether dev/staging share the production database. No `.env`, no
> `.env.example`, no deployment manifest exists in the repo (§3). `DATABASE_URL`
> is entirely host-supplied. If any non-production deploy points at the production
> DB, developer test orders publish to the marketing homepage the moment this
> ships. This is answerable only from the hosting console, and B2 means there is
> currently no mitigation if the answer is "yes."

**Owner action, DigitalOcean console.** This is the canonical entry for the
dev/prod database question; **B7 is a cross-reference to it, not a second
blocker.**

The final clause is the one that matters: B2 and B3 are individually serious and
jointly unmitigable. If the answer is "yes, they share", there is no column to
filter developer orders out with.

### B4 — `order.city` is nullable and lowercased

> `order.city` is nullable and lowercased. NULL whenever the geocode fails
> (`order.entity.ts:139-141`; `getCity` returns null on any error,
> `googlemaps.service.ts:97-103`). Such orders must be excluded, not rendered with
> a blank origin. Values are `trim().toLowerCase()`, so display casing must be
> derived. Rows predating the column are NULL (a backfill script exists at
> `src/scripts/backfill-order-city.ts`).

Consistent with §6 rule 3 (display casing derived from the allowlist) and §7
(both cities must resolve). The backfill script is new information relative to
§2.2 and is noted in §9.

### B5 — Toronto's former boroughs are not derivable

> Toronto's former boroughs are not derivable from the current `getCity` logic. It
> selects `locality` → `postal_town` → `administrative_area_level_2`
> (`googlemaps.service.ts:90-93`). Google returns `locality: "Toronto"` for North
> York, Scarborough, and Etobicoke — they will never appear as distinct values.
> The `administrative_area_level_2` fallback yields regional names ("Regional
> Municipality of Peel"), not "Brampton". Any homepage list treating those as peer
> municipalities needs a mapping decision.

**This is the evidentiary basis for D2.** The final sentence is addressed by §6
rule 2: regional fallback values such as "Regional Municipality of Peel" are not
on the allowlist, so they do not match and the event is excluded. That is the
correct outcome — a regional name is a *coarser* geography than the allowlist
represents, and silently mapping it to a member municipality would assert a
precision the geocoder did not supply.

> ⚠️ **Unsafe ID source, carried forward from §2.9.** `OtpHelper.generateOTP` uses
> `Math.random()`, adjacent to the `randomBytes` helper at `otp.utils.ts:8-10`.
> The two sit side by side, so the wrong one is easy to reach for. Public event
> IDs use `randomBytes` only — see §8. This was numbered B5 in an earlier draft of
> this document; it is a standing constraint rather than one of the backend
> report's blockers, and is retained here so it is not lost in renumbering.

### B6 — Order volume
**~50 completed deliveries on record** — `src/components/home/OperationalProof.jsx:67`:

```js
const METRICS = [
  { value: '50+', label: 'Completed deliveries' },
```

After eligibility filtering (§7) and a 5–15 minute delay with expiry (§6), **the
event list is expected to be empty the large majority of the time.**

This is the reason homepage consumption is deferred rather than built. It is not
a defect to engineer around; it is the honest state of the business today, and
D5 is the design response to it.

### B7 — dev/prod database separation → **see B3**

**Cross-reference, not a separate blocker.** This was raised independently during
the landing-side investigation and turned out to be the same finding the backend
report records as **B3**. B3 is canonical: it carries the evidence
(`DATABASE_URL` is host-supplied, no `.env`, no `.env.example`, no deployment
manifest) and the compounding relationship with B2.

Retained as a numbered entry so that references to "B7" elsewhere resolve, rather
than deleted.

---

## 4. Decisions

### D1 — Two workstreams, decoupled

**The backend destination-city column proceeds independently. Homepage
consumption is deferred.**

*Reasoning.* Closing B1 has value well beyond this feature — dispatch routing,
coverage analytics, and per-city operational reporting all want a destination
city, and none of them depend on a homepage panel. Coupling the column to a
feature that B6 says cannot yet be populated would stall a useful piece of
schema behind an order-volume problem it has nothing to do with.

The column ships. The panel waits for volume.

### D2 — Municipality granularity only

**`getCity` is not modified.**

*Reasoning, and a direction conflict resolved.* Google's geocoder returns
`locality` — and it returns **"Toronto"** for North York, Scarborough and
Etobicoke (`googlemaps.service.ts:90-93`). Those are former municipalities
amalgamated into Toronto in 1998; they are not localities the geocoder will
return.

> ⚠️ **The founder direction's worked example, "North York → Brampton", is
> therefore not producible.** The truthful output for the same delivery is
> **"Toronto → Brampton"**.
>
> This conflict is resolved **in favour of the geocoder's actual behaviour.**
> Producing "North York" would require a bespoke sub-municipal lookup layered on
> top of `getCity` — new code, a new failure mode, and a finer geographic
> granularity than §7's privacy rules can support at current volume. It would
> also make the panel *less* anonymous, not more.
>
> Note the landing site already uses `Downtown → North York` as **synthetic**
> copy (`src/components/home/NetworkDemo.jsx:73`). Real mode will not reproduce
> it, and that difference is expected.

### D3 — No client-side polling

**Server component with `next: { revalidate: 60 }`.** Rendered rows pass into
`NetworkDemo` as `children`.

*Reasoning.* This mirrors the only data-fetching precedent in the landing repo,
`src/lib/google-reviews.js:171-178`:

```js
    const response = await fetch(PLACE_DETAILS_ENDPOINT, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    })
```

The children-passing shape is the one `SocialProofMotion` already uses: the
client island receives server-rendered markup and owns only interaction state,
so **no feed data enters the client bundle.**

**Risks eliminated by this decision** (numbering from the investigation report):

| Risk | Why it is gone |
|---|---|
| **R2** — no server proxy; browser would hit the backend directly | The browser never calls the backend. The Next server does, once per revalidation window, shared across all visitors. CORS (B3) and public rate limiting (B4) stop being homepage concerns. |
| **R4** — hydration mismatch and first-paint content pop | Rows are server-rendered into the HTML. There is no client-side swap and no empty first frame. |
| **R6** — reduced-motion would freeze stale data presented as current | No client timer exists to suppress. Reduced motion removes motion only, never information — satisfying `docs/HOMEPAGE.md:77` (E6). |
| **R8** — self-updating content needs `aria-live` and a pause control | Content does not update within a session. WCAG 2.2.2 (Pause, Stop, Hide) is not engaged. The existing refusal of `aria-live` at `NetworkDemo.jsx:352-354` stands unchanged. |
| **R9** — poll clock vs. display clock, silent staleness | There is one clock, server-side, and its staleness bound is the revalidate window. |

**Risks NOT eliminated:** R1 (island budget — see §11), R3 (layout shift from
variable-length city names — a rendering concern that survives any fetch
strategy), R5 (honesty gate — addressed by D5), R7 (empty state — addressed by
D5).

### D4 — Public endpoint reads Redis only, never Postgres

A **delayed BullMQ job** writes the anonymized event at publication time. The
public endpoint reads that list and nothing else.

- List capped at **10 entries**
- **6h TTL**
- Pattern precedent: `googlemaps.service.ts:155-167`
- Job precedent: `order.service.ts:433-437`

*Reasoning.* A public endpoint that queries the orders table is one query-shape
change away from leaking a field it was never meant to expose. Reading a
purpose-built, pre-anonymized Redis list means **the prohibited fields in §5 are
not merely filtered at the boundary — they were never loaded.** It also caps
public-endpoint cost at one Redis read regardless of traffic.

### D5 — Demo mode retained as the empty state

**Zero eligible events → the current simulated frame, unchanged.**

| State | What renders |
|---|---|
| **Zero eligible events** | Current synthetic frame, with `DEMO_LABEL` (`NetworkDemo.jsx:75`), the `"Sample data"` chip (`:183`) and the sr-only disclaimer (`:355-364`) **all intact** |
| **One or more eligible events** | Real rows. Demo label, chip and disclaimer **all dropped** |

*Reasoning.* B6 says the empty state is the *common* case, not the edge case, so
it must be a designed state rather than a fallback. Retaining the existing frame
means there is no empty panel in any condition — preserving the property
`NetworkDemo.jsx:27` already claims ("There is no empty panel in any failure
mode").

**Phase 0 D4's honesty condition is satisfied in both states, by opposite
means:** in demo mode the labels are present and true; in real mode the data is
real and the labels would be false, so they go. What is never permitted is real
labelling over synthetic data, or demo labelling over real data.

---

## 5. Public event contract

**Exact response shape:**

```json
{
  "events": [
    {
      "id": "kQ7mZ2rF9xTb",
      "origin": "Toronto",
      "destination": "Brampton",
      "label": "Recent delivery request"
    }
  ]
}
```

Four fields. No envelope metadata, no counts, no timestamps, no pagination.

| Field | Source | Varies per event? |
|---|---|---|
| `id` | `randomBytes(9)` at publication (§8) | yes — random |
| `origin` | allowlist display casing (§6) | yes |
| `destination` | allowlist display casing (§6) | yes |
| `label` | **fixed constant** — see *The `label` field* below | **NO — identical for every event** |

`label` is shown with a real value above rather than a placeholder deliberately:
it is a constant, and a `"…"` invites a reader to assume it carries per-order
content. It does not.

### Governing principle

**Anything not in the four-field contract above is prohibited.**

This is the rule that governs, and it is deliberately stronger than any
enumeration: a list can be outrun by a new column, a closed contract cannot. The
explicit list below is the **floor**, not the boundary — a field's absence from it
is not permission.

### Prohibited fields — explicit floor

Quoted from the founder direction. The public event must never include:

> customer name; company name; sender name; recipient name; email; telephone
> number; exact pickup address; exact destination address; unit number; postal
> code; latitude or longitude; tracking code; tracking token; order ID; payment
> ID; package description; medical/legal classification; specimen type; filing
> type; driver name; vehicle; price; notes; requested pickup time; exact creation
> timestamp.

As a table, grouped for review:

| Category | Prohibited |
|---|---|
| **People** | customer name · company name · sender name · recipient name · email · telephone number |
| **Location** | exact pickup address · exact destination address · unit number · postal code · latitude or longitude |
| **Identifiers** | tracking code · tracking token · order ID · payment ID |
| **Contents** | package description · medical/legal classification · specimen type · filing type · notes |
| **Operational** | driver name · vehicle · price |
| **Temporal** | requested pickup time · exact creation timestamp |

**These fields must not be sent to the browser and merely hidden in the UI; the
endpoint itself must return only the anonymized contract.**

Under **D4** this is structural rather than procedural: the public endpoint reads
a purpose-built Redis payload and never touches Postgres, so the prohibited
fields are **never loaded in the first place**. There is no boundary at which a
filter could be forgotten, no over-fetch to trim, and nothing recoverable from a
raw response, a proxy log, or a cached body.

> ⚠️ **Two entries interact with the rest of this document and are easy to get
> wrong:**
>
> - **"medical/legal classification; specimen type; filing type"** — this is what
>   fixes `label` to a constant string rather than a category. It is the entry an
>   earlier draft of this document violated. See *The `label` field* below.
> - **"exact creation timestamp"** — the word *exact* is the operative one. §8's
>   randomised 5–15 minute delay exists precisely so that publication time is not
>   a reversible function of creation time. The contract carries **no timestamp at
>   all**, exact or otherwise.

### The `label` field

**`label` is a FIXED PUBLIC STRING.** It is not a category, and it is not an
enumeration derived from order data.

**Permitted values — nothing else:**

| Value | |
|---|---|
| `"Recent delivery request"` | **recommended default** |
| `"New delivery request"` | permitted alternative |

**It is not derived from `orderCategory`, vehicle, package contents, business
type, or any per-order field.** It is a **constant chosen at render time**. No
order attribute reaches it, so there is no mapping table, no lookup, and nothing
to filter — the value is the same for every event in the list.

**The public contract therefore carries NO service-category signal of any kind.**

> **This is a requirement of the founder direction, not a conservative reading of
> it.** The direction forecloses the question directly:
>
> > "Because medical and legal volumes may be identifiable when activity is
> > sparse, do not expose the service category."
>
> The instruction is unconditional. It is not a threshold to be tuned, and it is
> not satisfied by aggregation, coarsening, or a k-anonymity floor — the category
> is simply not exposed.

> ⚠️ **CORRECTED — do not reintroduce.**
>
> An earlier draft of this document specified `label` as carrying the job category
> drawn from `NetworkDemo.jsx:59-64` (`Medical specimen`, `Legal filing`,
> `Business delivery`, `Same-day parcel`), and justified the two regulated-vertical
> values by arguing that §7's k-anonymity threshold made any single labelled event
> unattributable.
>
> **That was wrong on both counts.** The direction quoted above forecloses the
> permission outright, so the k-anonymity argument was answering a question that
> was already settled. Worse, it was *internally* inconsistent: the exclusion list
> in this same section bans **"medical/legal classification; specimen type; filing
> type"**, and the spec then permitted `Medical specimen` and `Legal filing` as
> contract values. **The contract contradicted its own exclusion list.**
>
> The k-anonymity permission argument is deleted, not softened. §7's threshold
> remains in force for its actual purpose — suppressing rare `origin → destination`
> pairs — and has no bearing on `label`.

**The category vocabulary at `NetworkDemo.jsx:59-64` is DEMO-MODE CONTENT ONLY.**

Under **D5** it stays exactly where it is: in the simulated frame, where
`DEMO_LABEL` (`NetworkDemo.jsx:75`), the `"Sample data"` chip (`:183`) and the
sr-only disclaimer (`:355-364`) declare on the panel's face that nothing shown is
real. A category naming a regulated vertical is unobjectionable there precisely
because it describes no actual delivery.

**It must never cross into the real-mode contract.** The two modes do not share a
label vocabulary — the same separation D5 already establishes for stage
vocabulary (§5, *Animation stages*), and for the same reason: a demonstration may
show what a real feed may not, because it says it is a demonstration.

**Consistency check — this correction is what makes the contract coherent.** The
prohibited-field table above already bans *"medical/legal classification;
specimen type; filing type"*. With `label` fixed to a constant string, the
four-field contract now genuinely contains no prohibited field. **Under the
previous spec it did not** — the contract and its own exclusion list were in
direct conflict, and the exclusion list is the one that governs.

### Terminology

Quoted from the founder direction.

**Prefer:**

> "Recent delivery request" / "New delivery request".

**Do not use:**

> "Live customer order"; "Customer just ordered"; "Medical delivery requested";
> "Legal filing requested"; "Package from [exact address]"; "Driver assigned";
> "Collected within minutes".

Each prohibition asserts something the endpoint cannot evidence: that the event is
live, that it is an order rather than a request, that a specific vertical was
involved *for this event*, an exact address, a driver state, or a collection time.

**"Just requested" is prohibited for this implementation.** The direction permits
it only where the event is genuinely near-real-time and the display delay is
documented. **D-delay (§8) applies a randomised 5–15 minute offset**, so an event
on screen is between five and fifteen minutes old and the viewer cannot know
which. "Just" would be false for every event this system publishes. Recorded as
an explicit prohibition rather than a conditional, so no future reader has to
re-derive it.

### Animation stages

**Permitted stages: `Requested` and `Added to network` — those two only.**

Fabricated operational stages are **prohibited unless the endpoint supplies
verified state, which it does not**:

| Stage | Status |
|---|---|
| Requested | ✅ permitted |
| Added to network | ✅ permitted |
| Driver assigned | ❌ prohibited |
| Collected | ❌ prohibited |
| In transit | ❌ prohibited |
| Delivered | ❌ prohibited |

> ⚠️ **The current component animates exactly the four prohibited stages.**
> `NetworkDemo.jsx:43-48`:
>
> ```js
> const SEQUENCE = [
>   { status: 'pending', label: 'Pending', caption: 'Request received' },
>   { status: 'assigned', label: 'Assigned', caption: 'Driver assigned' },
>   { status: 'ongoing', label: 'Ongoing', caption: 'In transit' },
>   { status: 'delivered', label: 'Delivered', caption: 'Completed' },
> ]
> ```
>
> **Real mode therefore cannot reuse `SEQUENCE`.** This is a larger change than
> swapping data into the existing panel: the four-step progress bar
> (`NetworkDemo.jsx:315-324`), the status chip (`:291`), the marker progression
> (`:168`) and the route-drawing logic (`:167`) are all driven by that array and
> all express stages the endpoint cannot verify.
>
> The permitted two-stage vocabulary is not a subset of `SEQUENCE` either —
> "Added to network" has no equivalent in the product's real status model
> (`NetworkDemo.jsx:29-42`). It describes the *panel's* state, not the delivery's.
>
> **Under D5 this cuts cleanly:** demo mode keeps `SEQUENCE` intact and truthfully
> labelled as a demonstration; real mode uses the two permitted stages and drops
> the demo labelling. The two modes do not share a stage vocabulary, and that is
> the correct outcome — a simulated journey may legitimately show stages a real
> feed cannot evidence, precisely because it says on its face that it is simulated.

---

## 6. Location allowlist

```
Toronto, Mississauga, Brampton, Vaughan, Markham, Richmond Hill,
Oakville, Burlington, Hamilton, Pickering, Ajax, Whitby, Oshawa,
Kitchener, Waterloo, Guelph, Barrie
```

**Rules:**

1. **Match against the lowercased `getCity` output.** `order.service.ts:200-207`
   already stores `trim().toLowerCase()`, so the comparison is against the stored
   form directly. No re-normalisation, no fuzzy matching, no aliases.
2. **Unmatched → the event is excluded.** There is **never** a raw-address
   fallback, never a "nearest match", never a truncated postal region, never the
   stored value passed through unrecognised. An unrecognised city means no event.
3. **Display casing is derived from the allowlist**, never from the stored value.
   The allowlist is the single source of presentation. This prevents a stored
   value from reaching the browser even in casing.

Rule 2 is the one that matters most: it makes the allowlist a **closed set**. The
worst case for an unexpected geocoder result is a missing event, never an
unintended disclosure.

---

## 7. Eligibility rules

### Inclusion — all must hold

| Rule | Condition |
|---|---|
| Payment | `paid = true` |
| Cities | **Both** origin and destination resolved **and** allowlisted (§6) |
| Status | **NOT** in `cancelled`, `failed`, `refunded`, `awaiting_seller_confirmation` |
| Deletion | Not soft-deleted |
| Test data | `isTest` is false — ⚠️ **BLOCKED, NOT IMPLEMENTABLE TODAY. See B2.** |

> ⚠️ **The test-data rule cannot be satisfied as written.** B2 records that no
> `isTest`/`isDemo`/`environment`/`source` column exists on `Order`, and no
> convention filters by creator role. The rule is retained here because it states
> the requirement correctly — it is the *implementation* that is blocked, not the
> intent.
>
> **B2 must be closed before any publication job runs.** Until then every order in
> the database is a candidate for the marketing homepage, and per B3 it is not
> even established that developer orders live in a different database. This pair
> is the hardest blocker in this document: B6 defers the feature for lack of
> volume, but B2+B3 would make it *unsafe* even at volume.

The excluded statuses come from the product's real status model, which the
landing repo already documents at `NetworkDemo.jsx:29-42`.

### Additional privacy rules

1. **Maximum one published event per `businessId` per rolling hour.** Without
   this, a single active business becomes a visible activity stream — its
   competitors, and its own customers, could infer volume and cadence.

2. **Suppress any `origin → destination` pair whose historical count is below a
   configurable threshold.** A route pair that has occurred once identifies that
   delivery to anyone who knows it happened — including its recipient.

> **At current volume, nearly every route pair will be suppressed. That is the
> correct behaviour, not a bug.**
>
> With ~50 completed deliveries (`OperationalProof.jsx:67`) spread across 17
> allowlisted municipalities, most origin→destination pairs have occurred once or
> twice. A k-anonymity threshold is *supposed* to reject them. The rule is not
> mis-tuned and must not be relaxed to make the panel populate — a panel that
> populates by weakening anonymity is worse than an empty one, which is exactly
> why **D5** makes the empty state a designed outcome rather than a failure.
>
> This is the same finding as **B6**, arriving from the privacy side rather than
> the volume side, and it is the substantive reason homepage consumption is
> deferred.

---

## 8. Delay, retention, and public event ID

These three exist for one reason and are specified together because they only
work together: **severing the link between a published event and the order that
produced it.** The delay breaks the temporal link, retention bounds how much
material is available for correlation, and the ID ensures the event carries no
derived identifier. Weakening any one of them defeats the other two.

### Delay: randomised 5–15 minutes, enforced server-side via BullMQ delay

Uses the existing delayed-job mechanism (`order.service.ts:433-437`).

**Why randomised rather than fixed.** A fixed offset makes publication time a
**reversible function of creation time**: an observer who sees an event appear at
14:32 knows the order was created at exactly 14:22. Combined with a route pair,
that is often enough to identify a specific delivery — which defeats the
anonymisation entirely.

A 10-minute random window makes creation time recoverable only to within that
window, and the jitter cannot be cancelled by observing many events.

**Server-side enforcement is essential.** A client-side or presentation-layer
delay leaves the true timestamp in the payload; the delay must be the moment of
*writing*, not the moment of *showing*.

### Retention

| Property | Value |
|---|---|
| List cap | **10 events** |
| TTL | **6 hours** |

Both are Redis-native (`googlemaps.service.ts:155-167` precedent). Expiry is
enforced by the store, not by application logic, so a stalled reader cannot serve
records past their lifetime. The cap bounds the corpus available for
cross-event correlation.

### Public event ID

```
randomBytes(9).toString('base64url')
```

- Generated **at publication time**, not at order creation
- Stored **only in the Redis payload**
- **Never derived** from order ID, tracking code, or tracking token

*Reasoning.* Derivation from any internal identifier makes the public ID an
oracle: given an event, an observer could recover or confirm an internal
identifier, and a tracking code is a live credential — both public tracking
routes accept one with no login.

`randomBytes` per the safe helper at `otp.utils.ts:8-10`.

> ⚠️ **`OtpHelper.generateOTP` (`Math.random()`) must not be used here.** See
> **B5**. The two helpers live in the same file, so this is a realistic mistake
> to make.

9 bytes → 12 base64url characters, no padding, URL-safe. The ID is a render key
only; it addresses nothing and grants nothing.

---

## 9. Files expected to change

### Workstream A — Backend destination city (**approved to proceed**, D1)

| File | Status |
|---|---|
| `delivery_point.entity.ts` | **CHANGED** — add nullable `city` column, mirroring `order.entity.ts:142-143` |
| Migration (new) | **CHANGED** — additive, nullable, no backfill in the migration itself |
| Backfill script (new) | **CHANGED** — mirroring `src/scripts/backfill-order-city.ts`, which B4 confirms already exists for the pickup side. Run out-of-band, never inside the migration |
| `order.service.ts` (~`:200-207` region) | **CHANGED** — additive city write. See the warning below |
| `googlemaps.service.ts` | **UNTOUCHED** — D2; `getCity` is not modified |

> ### ⚠️ LOAD-BEARING WARNING — `OrderService.create` is shared
>
> `order.service.ts:96` is the creation path for **every order in the system**,
> not only ones eligible for this feature. It already runs nine inline side
> effects.
>
> The destination-city write **must**:
>
> - be **additive** — a new call, not a change to any existing branch
> - be **non-throwing** — resolve to `null` on any failure, exactly as the
>   existing pickup-city write does
> - follow the **existing `order.service.ts:200-207` pattern** rather than
>   introducing a second convention
>
> It **must not**:
>
> - throw, reject, or propagate an error into the create path
> - become a required field, or gate order creation on geocoding success
> - modify, reorder, or wrap any of the nine existing side effects
>
> **A geocoding failure must never prevent an order from being created.** This
> feature is a homepage decoration; order creation is the business. If the
> geocoder is down, `city` is `null`, the order succeeds, and the event is simply
> ineligible under §7.

### Workstream B — Publication and endpoint (**deferred**, D1)

| File | Status |
|---|---|
| Publication job (new) | **DEFERRED** — delayed BullMQ writer, §7 filters, §8 delay |
| Public activity controller (new) | **DEFERRED** — Redis-only read (D4), `public-order.controller.ts:10-19` pattern |
| Allowlist module (new) | **DEFERRED** — §6 |
| `public-track-throttle.guard.ts` | **DEFERRED** — reuse, or resolve B4 |
| `main.ts` (CORS) | **DEFERRED** — must resolve B3 before any public read endpoint |

### Workstream C — Landing consumption (**deferred**, D1)

| File | Status |
|---|---|
| `src/lib/live-activity.js` (new) | **DEFERRED** — server-only fetch, `revalidate: 60`, modelled on `src/lib/google-reviews.js:171-178` |
| `src/components/home/NetworkDemo.jsx` | **DEFERRED** — accept `children`; D5 dual mode |
| `src/components/home/HeroNetwork.jsx` | **DEFERRED** — pass rendered rows through |
| `src/app/(main)/page.jsx` | **DEFERRED** — server fetch at the page level |
| `docs/HOMEPAGE.md` | **UNTOUCHED** — E5 reconciliation is separate (§11) |

**Every file in Workstreams B and C is untouched today.** Only Workstream A is
approved to begin.

---

## 10. Risk carry-forward

Risks from the investigation not eliminated by D3, and where they now sit:

| Risk | Status |
|---|---|
| **R1** — island budget | Open. D3 adds no island, but the page is at 4 of 4. See §11. |
| **R3** — layout shift from variable-length city names | Open. Survives any fetch strategy. `docs/HOMEPAGE.md:75` sets CLS ≤ 0.05; the page measures 0 today. Must be designed for in Workstream C. |
| **R5** — honesty gate | Addressed by **D5**. |
| **R7** — empty and failure states | Addressed by **D5** — the empty state is now the *designed default*. |

---

## 11. Unresolved

1. **Owner — confirm dev/prod database separation** from the DigitalOcean
   console. **B7.** Blocks any publication job: a shared database means
   development activity publishing to the production homepage.

2. **Owner — confirm municipality-only granularity.** **D2.** The founder
   direction's "North York → Brampton" example is not producible; "Toronto →
   Brampton" is the truthful output (`googlemaps.service.ts:90-93`). This
   decision is recorded as made, but it contradicts a worked example in the
   direction and should be acknowledged explicitly rather than absorbed silently.

3. **Island budget — E5 needs reconciling independently.** `docs/HOMEPAGE.md:76`:

   > | E5 | Client JS on the home route | **≤ 3 interactive islands, or ≤ 4 while the verified Google Reviews motion wrapper renders** |

   The homepage runs **4 of 4** today: `HeaderMobileNav`, `HeroAddressEntry`,
   `NetworkDemo`, `SocialProofMotion`. **The fourth slot is currently held open by
   partner logos, not by the Google Reviews wrapper the gate names** — reviews
   return `null` without an API key, while `APPROVED_PARTNERS` holds six records
   and `partnersMove` requires three.

   **D3 adds no island.** But E5's wording does not describe the page's actual
   state, and that is a pre-existing discrepancy this feature inherits rather than
   creates. It should be resolved on its own terms — not folded into this
   feature's approval, and not by editing the gate to match the code.

4. **Volume threshold — define and instrument before building consumption.**
   Decide the eligible-event rate that would justify enabling real mode, and
   **instrument for it first.** Per B6 and §7 the current expected rate is
   approximately zero, and that estimate is inferred rather than measured. The
   publication job can be built and left un-consumed to produce this measurement
   — which is a further argument for D1's split.

---

## 12. Phase boundary

- **No production order data is connected.** Nothing reads, writes, or publishes
  any real delivery.
- **No homepage file is modified.** `NetworkDemo.jsx`, `HeroNetwork.jsx`,
  `page.jsx`, `config.js` and `HOMEPAGE.md` are untouched.
- **No implementation code has been written** in either repository.
- **Nothing is deployed. Nothing is pushed.**
- The homepage continues to render the synthetic demonstration with
  `DEMO_LABEL` (`NetworkDemo.jsx:75`), the `"Sample data"` chip (`:183`) and the
  sr-only disclaimer (`:355-364`) intact and accurate.

This document records decisions. It authorises **Workstream A only** (D1).
