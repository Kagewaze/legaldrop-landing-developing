# Druppr Homepage Specification

> **This document is the authoritative specification for the Druppr homepage.** Read it, and [`VISION.md`](VISION.md), before changing anything on the home route.
>
> **Relationship to VISION.md.** `VISION.md` defines *what* Druppr is and *why*. This document defines *how the homepage argues it*. Where the two overlap, `VISION.md` wins on principle and this document wins on execution detail. Nothing here restates the vision — where a rule here is downstream of a vision principle, it cites it rather than repeating it. The final section, *Relationship to VISION.md*, states precisely where the two documents complement each other and where this one deliberately narrows the vision.
>
> **This document does not describe the homepage that exists today.** It describes the homepage we are building toward. Every section carries a **Ships when** gate — the conditions under which that section may appear at all. A section whose gate is unmet does not ship in a weakened form; it does not ship. This is the Trust Philosophy applied to a page: *if we cannot show it, we have not built it, and we do not claim it.*

---

## Homepage Mission

The homepage has exactly one job: **convert a stranger's first five seconds into an accurate understanding that Druppr is software that coordinates same-day logistics — and then give them the shortest honest path to the next step.**

It is a proof surface, not a brochure. It does not describe capability; it exhibits it.

**What a visitor must understand within five seconds.** In priority order, from the first screen alone, without scrolling and without reading body copy:

1. **Druppr is a platform, not a courier.** The category is software-coordinated logistics. This must be legible from the composition alone — before a single sentence is read.
2. **It moves time-sensitive and regulated things** — specimens, filings, parcels — with proof.
3. **It is operating right now**, at real volume, in a real place.
4. **There are two doors**: one for businesses, one for individuals, and it is obvious which is which.

**What a visitor must feel.** Three adjectives, in order: **credible**, **calm**, **current**. Credible because there is evidence on the screen, not adjectives. Calm because the page is confident enough not to shout — restraint reads as competence in infrastructure. Current because something on the page is demonstrably live, and a live system is a working system.

The feeling to avoid, above all others, is **hustle**. Urgency badges, price shouting, exclamation points, "book now!", stock delivery imagery and crowded service menus all signal a business competing on price and availability. Our buyers read that as commodity and price us accordingly.

**What action a visitor takes.** One of exactly two, matched to who they are:

- **Business / regulated buyer** → *Talk to our team* or *Set up an account*.
- **Individual** → *See your price* / *Book a delivery*.

The page never routes a cold consumer into an enterprise flow or a regulated buyer into a consumer checkout. A third "action" — read on — is legitimate and is served by making every subsequent section more concrete than the one above it.

---

## Success Criteria

Success is measurable or it is opinion. These are the tests. A homepage change that regresses any **hard gate** does not ship.

### The Five-Second Test (primary, hard gate)

Protocol: unmoderated, minimum five participants drawn from the target segments (clinic/lab operations, legal operations, SMB owner), shown the first screen at both 1440×900 and 390×844 for five seconds, then asked one unprompted question: *"What does this company do?"*

| Measure | Target |
|---|---|
| Identify Druppr as a **technology-enabled logistics platform, logistics network, or logistics software company** | **≥ 80%** |
| Understand Druppr as **only** a traditional courier service | **≤ 20%** |
| Answers naming a regulated vertical (medical, legal, specimens, filings) | ≥ 60% |
| Participants who can state a next action | ≥ 80% |

**How to score the first two rows.** Participants may recognise that Druppr performs deliveries — that is accurate and is not a failure. The test is whether **software, coordination, tracking and operational infrastructure register as central to the product**, not incidental to it. An answer such as *"they deliver medical samples and you can track everything through their system"* passes the first row. An answer such as *"a delivery company"* or *"they bike packages across town"*, with no mention of software, coordination, tracking or a platform, counts toward the second.

The second row is a ceiling, not a prohibition: a minority reading us as a conventional courier is tolerable, a majority is not. Note also that this measures **visitor perception**, which is distinct from content gate C1 below — the page's own copy must never self-describe as a courier regardless of how participants answer.

### Content gates (hard)

| # | Criterion | Test |
|---|---|---|
| C1 | The page never self-describes as a courier or delivery service | Text audit: no first-person "courier"/"delivery company" |
| C2 | Real product interface visible within the first 1.5 screens | Render + measure at 1440 and 390 |
| C3 | Every published number is true, sourced and dated | Each metric traces to a system query; see *Operational Proof* |
| C4 | Zero unprovable claims | Every capability claim maps to a shipped feature |
| C5 | No service is presented that cannot be booked today | Route-liveness audit |
| C6 | Two segmented CTAs present and distinguishable above the fold | Visual + keyboard audit |
| C7 | No section exists that fails the Decision Framework | Review checklist |

### Experience gates (hard)

| # | Criterion | Target |
|---|---|---|
| E1 | Mobile total scroll | **≤ 5 phone screens** |
| E2 | Regulated-vertical content reachable | by screen **2** on mobile |
| E3 | LCP | ≤ 2.0 s on a mid-tier device, 4G |
| E4 | CLS | ≤ 0.05 |
| E5 | Client JS on the home route | ≤ 2 interactive islands |
| E6 | `prefers-reduced-motion` | every animation degrades to no motion |
| E7 | Contrast | every text/ground pair measured ≥ 4.5:1 |
| E8 | Keyboard | full traversal, visible focus on every interactive element |
| E9 | No horizontal overflow | 320 px → 2560 px |

### Outcome measures (tracked, not gating)

Qualified business enquiries per 1,000 sessions · consumer booking-start rate · scroll depth to the regulated-vertical section · product-showcase engagement · bounce from the first screen. These inform iteration; they never justify violating a content gate.

---

## Audience Priority

The homepage serves several audiences, but it is **designed for one and made legible to the rest**. Priority is not traffic volume — it is *whose understanding, if we get it wrong, costs the most*.

### 1. Medical organizations — clinics, labs, pharmacies

**Why first.** The densest, most predictable, highest-retention volume on the platform, and the segment whose standards raise the floor for everyone (`VISION.md` → Customer Philosophy). They are compliance-bound and audited themselves, so designing for them forces every honest thing we want to be true anyway.

**What they need to see:** proof of custody, driver certification (TDG), handling discipline, standing-route capability, an accurate compliance posture (Ontario PHIPA — never borrowed vocabulary), and evidence of reliability at volume. They are looking for reasons to disqualify you; give them none.

### 2. Law firms

**Why second.** The other flagship profit-and-trust segment. They buy provability, not speed. Winning legal makes the entire platform more trustworthy.

**What they need to see:** the exact proof artifact we produce — a timestamped custody trail and a drop-off confirmation code — described precisely and never overstated. Cut-off reliability. Confidentiality posture. A record they could put in front of someone else.

### 3. Enterprise buyers — multi-site organizations

**Why third, not first.** Enterprise is the long-term ceiling and the reason the operating-system positioning matters. It is placed third because enterprise is won by the *proof* that segments 1 and 2 generate; a homepage that leads with enterprise language before that proof exists is a claim, not a position.

**What they need to see:** integration surface (API, programmatic dispatch), SLA and reliability posture, reporting and exportable proof, security, and multi-site capability. They speak a different register — integration and reliability, not speed and price.

### 4. Business customers — SMBs, shops, single-clinic operators

**Why fourth.** They convert consumer-grade ease into recurring commercial volume and are the on-ramp to the portal relationship — density with better margin and retention.

**What they need to see:** self-serve setup with no integration required, saved addresses and recipients, order history, invoice-grade records, no sales call needed.

### 5. Consumers

**Why fifth, and deliberately not higher.** Consumers are the substrate — density, habit, top-of-funnel trust. They matter enormously to the business and must be served well. But **consumer needs must never define the brand's visual or verbal register**, because the register that converts a consumer (price, speed, ease) is the register that disqualifies a regulated buyer. Serve them in a contained, excellent band.

**What they need to see:** price up front, two addresses, live tracking, proof on delivery. Nothing else.

### 6. Investors and prospective employees

**Why sixth, and why we never design for them directly.** Investors and senior candidates are a **secondary evaluation audience**. They read the same page as segment 1–3 buyers and assess the same evidence, asking the same underlying question: *does this team understand its own business?* A homepage that persuades a lab operations manager persuades an investor as a side effect. A homepage built to impress investors persuades neither. **Never create a homepage section for this audience.**

**What they evaluate** — the same artifacts the buyers above are already shown, read through a different lens:

- **Operational traction** — the metrics in the proof bar, and whether they are real, current and sourced
- **Product maturity** — the interfaces in the product showcase, and whether they look like shipped software
- **Customer credibility** — named customers, case studies, the calibre of the verticals we serve
- **Trust** — the compliance posture, the proof artifact, and whether claims are stated with discipline
- **Market focus** — whether the page argues one thesis or lists many, which is read directly as strategic clarity
- **Execution quality** — typography, performance, accessibility, interaction detail; the page is itself a work sample

**The rule:** the homepage is **not designed around investors, but it must withstand investor scrutiny.** Every one of those six is already produced by serving segments 1–3 honestly and well. If an investor-facing need ever appears that is *not* satisfied by that evidence, it belongs in a deck or on a dedicated page — never as a homepage section.

### 7. Marketplace sellers

**Why seventh.** A real part of the ecosystem, but a second-order homepage concern. Until the marketplace is live and material, it does not occupy homepage space.

### 8. Drivers

**Why last on this page — and why they belong on their own.** Driver experience is a first-class product surface (`VISION.md` → Customer Philosophy) and driver supply is existential. But supply-side recruitment on a demand-side homepage signals *labour marketplace* to exactly the buyers in segments 1–3, and it competes for attention with the conversion we want.

**Rule: driver recruitment lives on a dedicated page.** The homepage carries at most one footer link to it — **and no link at all until that page exists**, since a link to a nonexistent route violates content gate C5. Phase 0 (OQ-4) confirmed no driver page exists today, so the current homepage carries no driver link. This is not a demotion of drivers; it is a correct separation of two different sales.

---

## Homepage Narrative

The page is an argument, and each section is a step in it. Every section below is tagged with the reason(s) it exists — **Clarity**, **Trust**, **Conversion** — and a **Ships when** gate. Sections appear in this order because each one earns the next: *this is what it is* → *it is real* → *here it is working* → *here is what it is for* → *here is the evidence* → *here is how to start*.

Each step must be **more concrete than the one above it.** If a section is more abstract than its predecessor, it is in the wrong place.

| # | Section | Reason | Ships when |
|---|---|---|---|
| 1 | **Hero — the network in operation** | Clarity, Conversion | Always. See *Hero Philosophy* for what it may contain |
| 2 | **Operational proof bar** | Trust | ≥ 3 metrics are true, computed from system data and current |
| 3 | **Product showcase** | Clarity, Trust | ≥ 2 real interfaces can be shown from shipped product |
| 4 | **Regulated verticals — medical & legal** | Clarity, Conversion | Always (destination pages exist) |
| 5 | **Evidence — the proof artifact** | Trust | A real custody record can be shown, redacted |
| 6 | **Platform surface — integrations & API** | Clarity | A real integration or documented API exists. **Otherwise omitted entirely** |
| 7 | **Trust & compliance** | Trust | Each signal is individually true; section renders with whatever subset qualifies |
| 8 | **Consumer band** | Conversion | The consumer booking flow is live |
| 9 | **Close — dual CTA** | Conversion | Always |

**Sections that must not exist**, and why — recorded here so they are not reinvented:

- **A service catalogue.** Breadth expressed as a menu of services, any of which is not bookable today, fails C5 and reads as unfocus to every priority audience. Breadth is expressed through the *spine* — one network, one pricing engine, one proof record serving several verticals — not through a list. See *Relationship to VISION.md*, where this narrowing is made explicit.
- **A generic "how it works" ladder.** *Enter address → see price → pay → track* is the universal courier funnel and differentiates nothing. If the mechanics are worth showing, show the **system state machine** inside the product showcase instead, built from the product's verified status model: *Requested → Dispatched → In transit → Delivered → Record issued*. (A drop-off-code step is **excluded** until the code is verified — see Phase 0, *Unverified Operational Claims*.)
- **A "why choose us" feature grid** of table stakes (same-day, live tracking, trained drivers). Stating table stakes as differentiators tells an informed buyer we do not know what is table stakes. Replace with metrics (§2) and evidence (§5).
- **A coverage/neighbourhood list.** Enumerated service areas are a local-services SEO pattern and the single strongest small-business signal available. Coverage is expressed as network density in the hero visual, or as a figure in the proof bar.
- **Driver recruitment.** See *Audience Priority* §8.
- **Anything added because a competitor has it.** Not a reason. See *Homepage Decision Framework*.

---

## Hero Philosophy

The hero is the whole argument compressed. If the hero fails, nothing below it is read.

**Its job:** establish category, demonstrate that the system is live, and open two correctly-labelled doors. It demonstrates; it does not oversell.

### Headline

- States the **category and the domain**, not the action. It answers *what is this*, not *what can I do here*.
- **Never uses the verb "send" as the primary frame** — a send-verb headline defines a courier service.
- Never contains the words *courier*, *delivery company*, *delivery app*, or *fast/cheap/easy*.
- Names the real domain: same-day, time-sensitive, regulated movement.
- Short, sentence case, confident, no exclamation. One line at desktop, two at mobile.
- Vague geography is a liability, not a growth story. Name the market we actually serve; expanding it later is a happy edit.

*Directionally:* "Same-day logistics infrastructure for the GTA." The specific words are a copy decision; the constraints above are not.

### Subheadline

One sentence. Names **what moves** (specimens, filings, parcels) and **what the platform does to it** (dispatch, track, evidence). It is where breadth lives — expressed as verticals sharing one system, never as a service menu.

### Visual

The hero visual is **the product or the network, in operation**. In descending order of preference:

1. A live or faithfully-simulated dispatch/network view — jobs resolving, a route drawing, a status advancing.
2. A real product interface, shown large and legibly.
3. Real photography of our own operation, with a product interface composited honestly.

**Stock photography is not permitted in the hero.** In particular, imagery borrowed from the food-delivery category (thermal backpacks, scooters, riders with insulated bags) is prohibited under any circumstances: it imports the visual vocabulary of the lowest-margin, least-regulated logistics category into the first impression of a regulated-logistics platform.

If the visual is simulated rather than live, it must depict **behaviour the product genuinely has**, and it must not be presented as live data.

### Booking experience

**A hero booking affordance must be functional or must not look functional.** This is a hard rule.

- If the consumer flow is live and the hero shows input fields, those fields **accept input** and carry the real autocomplete and the real quote.
- If we choose not to put a live form in the hero, the hero shows a **button**, not a picture of a form.
- A non-functional element styled as an input is prohibited. It teaches the visitor, in their first interaction, that our surfaces do not do what they appear to do — and it is a direct violation of *"every interactive element looks interactive; nothing that isn't clickable pretends to be"* (`VISION.md` → Design Philosophy).
- A live hero form must not put the Maps/Places SDK on the critical rendering path. Lazy-load on first interaction; keep the static render fast.

### Calls to action

Exactly two, visually distinguishable, both above the fold:

- **Primary (business):** *Talk to our team* / *Set up an account*
- **Secondary (consumer):** *Book a delivery* / *See your price*

Which is visually primary is a business decision, not a design one; the default is **business primary**, because enterprise defines the brand and consumers convert regardless of button hierarchy.

### Product positioning

The hero is where the brand ladder is set (`VISION.md` → Brand Positioning). Every word is chosen one rung above courier. If a phrase in the hero could appear unchanged on a local courier's homepage, it is wrong.

### Never in the hero

- The words *courier*, *delivery app*, *cheap*, *fast* as the headline claim
- A price as the dominant numeral — anchoring on cheapness caps the category
- A non-functional form (see above)
- Stock delivery/food-delivery imagery
- A service catalogue, a carousel, or rotating headlines
- Supply-side (driver) recruitment
- Trust badges as decoration, urgency banners, countdowns
- Any animation that delays the visitor reaching the product or the price
- More than one idea. The hero makes one argument

---

## Product Showcase

**The single most persuasive asset we own is the real product working.** This section exists because "technology-enabled" is a claim until a visitor sees software, at which point it is an observation.

### What to show

At most **three** surfaces, chosen for what they prove:

| Surface | What it proves |
|---|---|
| **Dispatch** — live map, offers broadcasting, jobs resolving | There is a system, and it is coordinating |
| **Chain of custody** — a real timestamped record | The proof is an artifact, not an adjective |
| **Partner portal / business dashboard** — standing routes, order history, invoice-grade records | This is infrastructure a business runs on |

Reserve for later phases as they ship: **tracking** (public trust surface), **driver app** (proves the supply side is a real product), **reporting** (the artifact a buyer takes into their own audit).

**Three is a ceiling, not a target.** Two excellent, legible interfaces outperform five thumbnails. A screenshot too small to read is decoration.

### How to show it

- **Real UI from the shipped product**, with real data, redacted where necessary. Never a mock-up of an unbuilt screen; never invented data presented as real.
- Redaction must be visibly a redaction — never substituted with plausible fake values.
- Shown large enough that the interface is **actually readable** at the width it renders. If it cannot be legible on mobile, crop to a meaningful region rather than shrinking the whole frame.
- Accompanied by at most two lines of copy naming what the visitor is looking at and why it matters.
- Device framing is optional and must never dominate the interface it frames.
- Every screenshot carries descriptive alt text stating what the interface shows.
- Screenshots are versioned assets: when the product UI changes materially, the homepage screenshot is updated. **A stale screenshot is a false claim.**
- Performance: screenshots are heavy. Modern formats, correct `sizes`, intrinsic dimensions to prevent layout shift, lazy below the fold, and no screenshot on the LCP path unless it *is* the LCP element.

### Why screenshots beat stock photography

Stock photography communicates a *category* — and the category it communicates for a company that moves boxes is *courier*. It is, by construction, imagery that is not ours: any competitor can license the same frame. It proves nothing, differentiates nothing, and occupies the most valuable space on the page.

A screenshot does the opposite. It is unfalsifiable in the right direction — you cannot screenshot software you have not built. It answers *what is it like to use this* in less time than a paragraph. It shifts the visitor's mental comparison set from "other couriers" to "other software", which is the entire positioning objective. And it survives scrutiny: a sophisticated buyer will zoom in, and finding real, coherent, well-designed software is exactly the outcome we want.

Photography still has a role — real, specific, our own operation — for scene and credibility. It never substitutes for showing the product.

---

## Operational Proof

Marketing claims are discounted to zero by the buyers who matter; they have been burned by "fastest, most secure, fully compliant" before. **Numbers that are checkable are the only claim that survives contact with a procurement process.**

### What to publish

Candidate metrics, in rough order of persuasiveness for our priority audiences:

- **Deliveries completed** — total, or in a stated window
- **On-time performance** — as a percentage, against a stated definition of on-time
- **Median pickup time** — the operational figure a clinic actually cares about
- **Active business accounts** — recurring commercial relationships
- **Standing routes run per week** — density and predictability in one number
- **Coverage** — expressed as network density, not a list of neighbourhoods
- **Vehicle/driver network size** — capacity, stated honestly
- **Custody records issued** — the proof spine's own volume; uniquely ours to claim

### Rules for every published number

1. **It is computed from system data**, not estimated, not aspirational, not rounded up.
2. **It states its window and its definition.** "98.7% on time" is meaningless without *on time against what*. Define it on the page or in an accessible footnote.
3. **It is current.** Metrics carry an as-of date or refresh automatically. A stale metric is a false claim.
4. **It degrades honestly.** If a number cannot be computed, it is removed — never frozen at its last good value.
5. **A modest true number beats an impressive false one**, because our buyers check (`VISION.md` → Trust Philosophy).
6. **Never a fabricated, illustrative or placeholder figure**, at any stage, including in staging or design comps that could be mistaken for the real page.

### When the numbers are small

Small real numbers still beat none, and early-stage buyers are more forgiving than the vision's caution implies — what they punish is *inflation*, not *modesty*. A young company stating "3,400 deliveries, 99.2% on time since March" reads as traction and confidence. Silence reads as zero.

If fewer than three metrics qualify, **the proof bar does not ship.** It is replaced with the next-best true evidence — the product showcase moves up, or a single verifiable operational statement takes its place. It is never filled with capability claims dressed as metrics.

### Presentation

Tabular figures, generous space, no decoration, no icons, no gradient numerals. The number is the design. If motion is used, it must aid comprehension (a figure resolving into place, once, on entry) and never be theatrical — and only where the figure is real (`VISION.md` → Motion Philosophy).

---

## Trust

Trust is the product for the customers who fund this company (`VISION.md` → Trust Philosophy). On the homepage it is not one section — it is a layer distributed by *how early a visitor needs it to keep reading*.

### Signal inventory and placement

| Signal | Placement | Why there |
|---|---|---|
| **Real operational metrics** | **Early** — screen 1–2 | The fastest credibility available; answers "is this real" before any other question |
| **The product itself, shown** | **Early** — screen 1–2 | Existence proof; nothing builds trust faster than visible software |
| **Compliance posture** (PHIPA, TDG) | **Early, compact** — a line, not a section | Regulated buyers disqualify fast; they need the signal early. Detail belongs on vertical pages |
| **Chain of custody / proof of delivery** | **Middle** — as the evidence artifact | The differentiating trust claim; needs the setup of the sections above it to land |
| **Customer logos** | **Middle** — only with written consent | Powerful but conditional; never invented, never "representative" |
| **Case studies** | **Middle/late** — one, deep, real | High-value for enterprise; costs scroll depth, so only when genuinely strong |
| **Insurance** | **Late** — or on vertical/FAQ pages | Rarely a homepage decision driver; must describe coverage that actually exists, in terms that are actually true |
| **Security posture** | **Late** — link out to depth | Matters intensely to enterprise, at evaluation stage rather than first impression |
| **Reviews (consumer)** | **Late** — never the only proof | Local-business trust currency. Consumer-appropriate, insufficient for regulated buyers |
| **Platform reliability / status** | **Late** — footer link | A software-company signal; cheap to give, quietly persuasive |

### Rules

- **Every trust signal is independently gated.** The section renders whatever subset is currently true and lays out correctly with any number of them — including one. No layout may depend on a signal that can disappear.
- **No signal is load-bearing for the page's credibility if it can vanish.** A trust layer whose only element is an external API's response is not a trust layer.
- **Never fabricate** a logo, testimonial, case study, count, certification or compliance term. This is not a growth tactic; it is a claim a regulated buyer will check, and being caught converts a sale into a disqualification permanently.
- **Compliance vocabulary is jurisdiction-accurate.** Ontario PHIPA, not HIPAA. TDG for dangerous goods. We do not borrow another jurisdiction's terminology because it sounds more impressive.
- **Proof claims describe exactly what we produce** — a timestamped custody trail and a drop-off confirmation code — and never sworn service, captured signatures, tamper-evident seals or affidavits unless and until those genuinely exist. **The drop-off confirmation code is itself pending verification** (Phase 0, *Unverified Operational Claims*): it is not rendered anywhere in this repository, and is excluded from homepage proof claims until the founder confirms where it is generated, who receives it, how it is validated, whether it is active in production, and what record is retained.

### Why trust outperforms marketing claims

Every competitor can write the adjectives. None of them can hand a buyer a real record, a real compliance posture, and a real product to inspect. Each time we choose the smaller provable statement over the larger hollow one, we widen the only gap that compounds. **Honesty is not a constraint on the homepage's persuasiveness — it is the source of it.**

---

## Consumer vs Enterprise

Both belong on this page. They are not equal, and the imbalance is deliberate.

**The principle: consumer logistics contributes network density; enterprise logistics defines the brand.**

Consumers are the substrate — volume, habit, warm network, top-of-funnel trust. They are commercially essential and must be served excellently. But the *register* that converts a consumer (price, speed, ease, urgency) is precisely the register that disqualifies a clinic or a firm. So consumers get **excellent service in a contained space**, and enterprise gets **the page's voice**.

### How the balance appears visually

| Dimension | Enterprise / regulated | Consumer |
|---|---|---|
| **Share of page** | Dominant — hero register, product showcase, evidence, verticals | One contained band + one CTA |
| **Position** | Screens 1–3 | After the evidence, before the close |
| **Typography** | Sets the page's voice — display face, confident scale | Same system, no special treatment |
| **Imagery** | Product interfaces, custody records, real operations | Minimal; the form *is* the visual |
| **Colour** | Restrained, neutral ground | May carry the accent — it is an action moment |
| **Density** | Generous, calm, evidence-led | Efficient, transactional, fast |
| **Copy register** | Integration, reliability, proof, compliance | Price, speed, tracking |

### Rules

- The consumer band is **one section**. It does not recur, and it never precedes the evidence layer.
- Consumer price points never appear above the fold as the dominant numeral.
- **CTAs are segmented and never crossed.** A consumer clicking *Book a delivery* reaches a booking flow; a buyer clicking *Talk to our team* reaches a human or a qualification form. Routing either into the other's path is a defect, not a growth experiment.
- The consumer band must be genuinely good. Containing it is not an excuse to neglect it — it is a high-conversion surface and the top of the trust funnel.
- Nothing in the consumer band may leak upward into the page's brand register.

---

## Motion Philosophy

Motion on the homepage exists to **demonstrate that a system is operating**. Nothing else justifies it. This is the homepage-specific application of `VISION.md` → Motion Philosophy; where that document sets the principle, this one sets the permission list.

Every animation must demonstrate at least one of: **movement**, **technology**, **activity**, **trust**, or **conversion** — and must survive the question *"if this were removed, what would the visitor understand less well?"* If the answer is "nothing", remove it.

### Acceptable motion

| Motion | What it earns |
|---|---|
| **A route drawing between two points** | Movement, technology — makes coordination legible in space |
| **Dispatch cards appearing / an offer arriving** | Activity, trust — communicates real system state |
| **A status advancing** (*Requested → Dispatched → In transit → Delivered*) | Clarity, trust — makes a state change legible |
| **A real metric resolving into place, once, on entry** | Trust — draws the eye to evidence. Only if the number is real |
| **Progress within a multi-step flow** | Clarity — reduces anxiety, shows advancement |
| **Hover and focus feedback** | Clarity, conversion — confirms interactivity |
| **A single orchestrated hero sequence on load** | Technology — the page's one signature moment |

### Prohibited motion

- **Decorative motion of any kind** — background particles, floating shapes, gradient drift, spinning logos, animated blobs
- **Parallax** used for depth rather than meaning
- **Scroll-jacking**, pinned sections that steal scroll, or any hijacking of native scrolling
- **Auto-advancing carousels** — a conversion, accessibility and trust failure simultaneously
- **Counters on numbers that are not real**
- **Anything that delays the visitor reaching the product or the price** — speed to value beats delight, always
- **Motion that moves a control** the user may be about to click
- **Anything a user must wait through** to reach content
- **Anything that causes layout shift** (E4)
- **Anything that violates `prefers-reduced-motion`** — a hard accessibility floor, not a preference (E6)

### Technical rules

- Reveal animations render content **visible by default** and animate as enhancement, so a JS failure never hides the page.
- One reveal primitive, applied at **section** level. Never per-card staggers cascading down the page — scattered effects read as generated, not designed.
- Motion never blocks LCP and never runs on the critical path.
- Total motion budget: **one orchestrated moment** (the hero) plus quiet section-level reveals. Spend boldness once.

---

## Design Principles

The homepage should feel **confident, minimal, technology-first, operational, premium — and never gimmicky.** Each of those is delivered by specific decisions, not by taste.

### Confident

Confidence is what you leave out. Short headlines, no exclamation, no urgency, no badge clutter, no reassurance stacking. One idea per section, stated once. A page that repeats its value proposition three times is a page that does not believe it the first time.

### Minimal

Minimal is not sparse — it is *nothing unnecessary*. Every element on the page survives the Decision Framework. Whitespace is generous and rhythmic, applied from a consistent scale, so the page reads as one hand made it. Cramped screens read as cheap.

### Technology-first

The product is visible within the first 1.5 screens (C2). Interfaces, state, and system behaviour are the primary imagery. If a visitor scrolls the entire page and has not seen software, the page has failed regardless of what it said.

### Operational

Real numbers, real records, real place names, real state. Specificity is the texture of an operating company: *"median pickup 34 minutes"* is operational; *"lightning fast"* is marketing. Prefer the concrete noun to the abstract one, always.

### Premium

Premium comes from restraint and precision, not ornament: a rigorous type scale, consistent radii and elevation from a token set, measured contrast, optical alignment, and no ad-hoc values where a token exists. Brand purple (**#7B2FBE**) is spent deliberately — it marks action and the one or two moments per page that deserve emphasis, on a warm near-neutral ground (**#fbf9f8**). The scarcity of the accent is what makes it land; a page painted in the brand colour reads as a template.

### Never gimmicky

No effect that draws attention to itself. No trend borrowed without a reason. No animation as personality. The test: *would this element look dated in three years, and is it load-bearing?* If it would date and it is decorative, it does not ship.

### How the elements deliver it

- **Typography** carries the hierarchy — size, weight and spacing do the work, not decoration. Display face for headlines with deliberate tracking; a quiet workhorse for body. Sentence case throughout; never Title Case marketing shouting. Tabular figures for all metrics.
- **Spacing** comes from one scale, applied consistently. Section rhythm is deliberate rather than uniform — the page should have crescendo, not nine equally-weighted rectangles. If everything has the same weight, nothing is important.
- **Imagery** is product first, own-operation photography second, stock never. Illustration only where it explains something a screenshot cannot (a network, a flow) and always custom.
- **Layout** varies with intent. Not every section is the same column at the same width — the hero, the evidence artifact and the consumer band are structurally different because they do different jobs. Asymmetry is permitted where it encodes importance; variation for its own sake is not.
- **Chrome** (header/footer) is quiet. Saturated colour across the full navigation bar reads dated; the accent belongs on actions and moments, not chrome.

---

## Homepage Decision Framework

Every proposed homepage change — a section, an element, a sentence, an animation — must be answered against these four questions **before** implementation:

1. **Does this improve clarity?** Does it make what Druppr is, what it costs, what state a job is in, or what proof exists easier to understand?
2. **Does this improve trust?** Does it make Druppr more provably reliable, honest or compliant?
3. **Does this improve conversion?** Does it help the *right* audience take the *right* next step with less friction?
4. **Does this strengthen Druppr's positioning as a logistics platform?** Does it move us up the brand ladder, or does it read as something a courier would also do?

**If the answer to all four is no, it is not implemented.** *"It would look good", "a competitor has it", "the page feels empty"* and *"we have the asset already"* are not answers.

### Additional gates — a change may not ship if it

- Introduces a claim we cannot prove, or a number we cannot source (C3, C4)
- Presents a service that cannot be booked today (C5)
- Adds a non-functional element styled as an interactive one
- Regresses any hard gate in *Success Criteria*
- Adds a client-side island without a stated interaction that requires it (E5)
- Adds motion that fails the *Motion Philosophy* permission list
- Uses stock photography in place of showing the product

### Required evidence for any homepage change

Verify by rendering and measuring, never by trusting a diff:

1. Before/after screenshots at **390 / 768 / 1024 / 1440**
2. Measured contrast for every new text/ground pair
3. Confirmation that reduced-motion degrades correctly
4. Mobile total scroll height, before and after
5. A restated five-second read: *what does this page now say in five seconds?*
6. An explicit blast radius: what changed, and what was deliberately left untouched

### Deletion is a valid change

Removing a section that fails the framework is as legitimate as adding one, and usually higher-leverage. **The homepage's default state is fewer sections, each stronger.** A section that cannot show something true does not ship.

---

## Relationship to VISION.md

### Where this document complements the vision

| `VISION.md` establishes | `HOMEPAGE.md` operationalises |
|---|---|
| Brand ladder: courier → … → logistics operating system | Concrete word-level rules for the hero; the prohibition on self-describing as a courier (C1) |
| *"Show the product"* | A ceiling of three surfaces, screenshot sourcing rules, staleness as a false claim, legibility and performance requirements |
| Trust Philosophy — never ship unprovable claims | Per-section **Ships when** gates, per-metric sourcing rules, and the rule that an ungated section does not ship in weakened form |
| Homepage Philosophy — the five-second test and seven section roles | A measurable five-second protocol with pass thresholds, plus a fixed narrative order with reason codes |
| Customer Philosophy — density vs profit-and-trust segments | An explicit homepage **audience priority order** and what each audience must see |
| Motion Philosophy — motion must earn its place | An explicit permission list, prohibition list, technical rules and a total motion budget |
| Engineering Philosophy — performance, a11y, minimal client JS | Numeric budgets: LCP, CLS, island count, scroll depth, contrast, overflow range |
| Product Decision Framework — four questions | The same four questions plus homepage-specific blocking gates and a required evidence checklist |

### Where this document intentionally differs

Three deliberate narrowings. Each is a case where applying the vision *literally* to a homepage would violate a different part of the same vision. These are recorded so they are not "corrected" later by someone reading only one document.

**1. Breadth is expressed through the spine, not through a service list.**
`VISION.md` → Homepage Philosophy says a visitor should grasp *"one app for many kinds of movement (not a single-trick courier)"*, and the Product Ecosystem describes ten products. Rendering that breadth as a homepage catalogue collides with the Trust Philosophy the moment any listed service is not bookable — and reads as unfocus to every priority audience. **Resolution:** breadth is demonstrated by showing several verticals running on *one visible system* (one network, one pricing engine, one proof record), and only services that are live are ever named. Breadth as architecture, not breadth as menu.

**2. Enterprise leads the register, even though enterprise is a later roadmap rung.**
`VISION.md` → Long-Term Roadmap places enterprise and the operating system *after* the current multi-vertical platform stage. A homepage that mirrored that sequencing would lead with consumer volume. **Resolution:** the homepage leads in the enterprise/regulated *register* now, while making only claims that are true now. Positioning runs ahead of the roadmap; **claims do not.** This is the distinction between speaking one rung above courier (required) and claiming capabilities we lack (prohibited).

**3. Consumers are prioritised lower here than their commercial importance.**
`VISION.md` → Customer Philosophy is explicit that consumers are the substrate the whole flywheel stands on. This document places them fifth. **Resolution:** the ranking is about *whose understanding the page is designed around*, not whose revenue matters. Consumers convert on a well-built contained band regardless of page voice; regulated buyers are lost permanently if the voice is wrong. Serving consumers excellently in a smaller space is not a demotion of the segment — it is the only arrangement in which both audiences are served at all.

### Precedence

On principle — mission, positioning, trust, ethics — **`VISION.md` governs.** On homepage execution — order, gates, budgets, permissions, measurement — **this document governs.** If a genuine conflict emerges that is not one of the three narrowings above, it is a defect in one of the two documents: resolve it in the document, then build. Do not resolve it silently in code.
