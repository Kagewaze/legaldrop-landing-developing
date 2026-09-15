# Booking workflow motion - release audit

Base: current production origin/main 828ef555fadb775c60eb171973b3bcc1813328f9, fetched and confirmed before edits. Worktree codex-web-motion, branch codex/web-motion-system. Release authorized by the human after local Maps prevented visual testing; that limitation is explicitly not a release blocker. Commit and fast-forward promotion require all automated gates and a fresh remote race check.

## Actual route map

1. /send: addresses. Existing Continue is enabled only with both committed addresses.
2. /send/details: package, vehicle, weight, pickup timing and legitimate backend quotes. Continue to payment retains every existing eligibility/timing guard.
3. /send/pay: quote/setup, contact details, confirm/create-intent, then Stripe Elements and charge/order handling. Existing recovery/redirect paths remain unchanged.
4. /drop-batch/request: standalone quote form with four on-page numbered sections, not a fourth send route. Its existing Standard Delivery CTA starts /send; it does not transfer local quote form state or submit a booking.

No additional booking-step routes were found. /pay/[orderId]/payment/[trackingCode], /payment/success, /payment/cancelled, tracking and partner/onboarding routes are excluded.

## Architecture and behavior

Extend the existing persistent MarketingNavigation coordinator, retaining its marketing default policy and all marketing CSS unchanged. The booking policy is separate, exact-route allowlisted and uses the distinct native name druppr-booking and data-druppr-booking flag. Existing explicit link adapters initiate it; there is no new global click, scroll, submit or history handler, no timer, animation library or dependency.

The existing native update callback starts router.push, then waits for both usePathname commit and the destination data-booking-route DOM marker. It never waits for images, quotes, maps, Stripe readiness or payment results. Setup/snapshot failure retains ordinary navigation; reduced motion bypasses the native API and CSS movement entirely.

- Forward /send -> /send/details -> /send/pay: old snapshot moves left 28px, opacity 1 -> .72 over 220ms ease-out; new enters from right 36px, opacity 0 -> 1 over 320ms cubic-bezier(.2,.65,.3,1).
- Explicit backward /send/details -> /send uses reversed direction. The two existing payment error/requote return links are specifically opted into reverse motion to /send/details. Other payment exits navigate normally.
- /drop-batch/request -> /send uses a 260ms neutral fade with a 12px vertical incoming settle, because changing product flows is not reversing a numbered step.
- Marketing links to booking use a short booking-style bridge. Existing programmatic form submissions, query/hash navigation, router.replace guards, redirects and browser Back/Forward remain normal; no custom history or scroll restoration. The homepage address form's programmatic handoff remains untouched.
- Modified clicks, external links, downloads and non-self targets bypass the adapter.
- Outgoing snapshot geometry is measured once before navigation, then positioned against the new snapshot once at commit. Only browser snapshot geometry is set; no live layout or scroll changes. This avoids stretching differently sized safe panels into each other.

## Safe surfaces and exclusions

- /send: left address/Continue panel only; SendMap is outside the snapshot.
- /send/details: details/quote step container. Fields are never individually animated or remounted by the motion implementation.
- /send/pay: only the existing StepChrome heading; the template adds a commit marker around page content but never a snapshot name. Contact fields, payment actions and Elements remain outside the animated surface. Only already-rendered error/requote links may animate an exit, and presence of a Stripe iframe bypasses it.
- /drop-batch/request: quote/result aside only. Input, timing, package and map sections stay outside.
- Visible listboxes or Google .pac-container overlays bypass snapshot initialization; no autocomplete/menu code changes.
- Existing step heading focus behavior stays intact. A 3px purple aria-hidden progress fill scales to the current step over 300ms; reduced motion shows the final fill immediately.
- Only final-value price labels get a 180ms .7 -> 1 opacity and 6px -> 0 vertical settle keyed to the actual value. No counting, delayed calculations or obsolete displayed amount. No validation animation was added: messages and existing accessibility semantics remain immediate.

## Validation and bundle impact

The prior preview passed 157/157 tests. Release adds one presentation assertion test for the authorized stronger amplitudes; full gates must pass again before promotion. Source-freeze checks verify all pre-existing calculations, inline input handlers, validation, payment handling and API logic in edited files after removing only the explicitly allowed presentation/link additions. Maps, autocomplete, Stripe PaymentForm, booking state store, quote hooks, config, dependency files and all three approved marketing stylesheets remain byte-identical after line-ending normalization.

git diff --check, encoding, vehicle-capacity, DropBatch containment, lint and production build pass. All 18 static pages generated. Existing Browserslist/Node module-format warnings remain. No backend, pricing, booking calculation, tracking, payment result or rail changes.

Next build First Load JS (rounded):

| Route | Production base | Booking preview |
| --- | ---: | ---: |
| / | 111 kB | 112 kB |
| /send | 111 kB | 111 kB |
| /send/details | 106 kB | 107 kB |
| /send/pay | 111 kB | 113 kB |
| /drop-batch/request | 114 kB | 114 kB |

All remain prerendered. Route sizes: / 6.83 kB, /send 2.56 kB, details 5.72 kB, pay 11.5 kB, request 5.29 kB. Shared coordinator code affects route-chunk allocation; no package was added.

## Changed files

- src/app/(main)/drop-batch/page.jsx (link adapter only)
- src/app/layout.jsx (booking stylesheet import)
- src/app/send/page.jsx
- src/app/send/details/page.jsx
- src/app/send/pay/page.jsx (link adapter and two safe-return attributes only)
- src/app/send/pay/template.jsx (new commit marker)
- src/components/MarketingNavigation.jsx
- src/components/marketing-navigation.mjs
- src/components/booking-navigation.mjs (new booking policy/snapshot helpers)
- src/components/dropbatch/DropBatchRequestFlow.jsx
- src/components/send/StepChrome.jsx
- src/components/send/PriceBreakdown.jsx
- src/components/send/DropBatchQuoteCard.jsx
- src/styles/booking-motion.css (new)
- tests/booking-motion.test.mjs (new)
- docs/BOOKING_MOTION_REPORT.md (new)

Local preview used http://127.0.0.1:3188. Local Maps were unavailable; no map fix was attempted. Automated checks do not constitute visual approval or an end-to-end payment test. The human explicitly authorized release subject to automated gates and an ordinary fast-forward race check. No manual deployment is part of this work.
