# Public route entrance - human review pending

Branch: codex/web-motion-system. Committed HEAD: 5ec5761d97f8f701200a7dbb5f83dcbde4d674c9. Approved Pass 2/3 edits preserved, all work uncommitted.

## Architecture audit and decision

Installed Next.js 14.2.18, React 18 App Router. Header/mobile links use next/link. Root layout owns fonts and document; (main)/layout uses the shared Layout with Header/main/Footer. Contact is outside (main) and renders its own Layout. No pre-existing template or marketing loading indicator; loading components are operational only.

Selected incoming-only CSS animation with a server (main)/template.jsx returning children unchanged. Next keys templates beneath the persistent layout; no extra DOM, client component, router interception or transition package is needed. Reference: https://nextjs.org/docs/14/app/api-reference/file-conventions/template

No native View Transition: this installed router has no integrated startViewTransition commit hook. A click-wrapped router push cannot reliably synchronize snapshots with the eventual React commit without extra coordination. True outgoing animation is omitted rather than delaying navigation. Incoming animation also plays on initial mounting/direct visits; it does not distinguish the previous route.

## Treatment and containment

- /, /medical, /legal, /drop-batch: fully opaque 18px page-content settle, 360ms ease-out. Header/main landmark/footer remain unanimated. The page wrapper carries the shallow entrance, including its presentational sections; existing rail autoplay and scroll/hover mechanisms remain unchanged.
- /contact-us: left intro column only; form is outside the animated subtree. Its existing shell remount behavior is unchanged, with no shell animation.
- Empty CSS pseudo-element: 2px brand-purple accent, max 240px, 420ms resolve/fade, no pointer events, no accessible text/focus target, no claimed progress.
- Hero travel is reduced to 8px and starts alongside the route entrance. Below-fold scroll and approved hover motion remain unchanged.
- All rules/keyframes live inside prefers-reduced-motion: no-preference. No hiding, navigation/image waits, focus scripting, scroll listeners, link handlers, hash/history overrides or perpetual animation. Focus within cancels the content settle.
- Operational /send, /track/*, /track-partner/*, /pay/*, /payment/*, /drop-batch/request and other unlisted routes have no route-motion opt-in. A marketing destination still settles if reached from an operational page; navigation to operational destinations is unchanged.

## Validation

Diff check, 138/138 tests, encoding, vehicle-capacity, DropBatch containment, lint and production build passed. Existing outdated Browserslist and Node module-format warnings remain. Three new tests cover gating, scope, server template and untouched navigation handling; previous motion safeguards still pass.

Homepage remains static/prerendered, route 5.17 kB and First Load JS 110 kB, unchanged at build report precision. No new client code/dependency/island. Contact remains 33.6 kB/155 kB. Shared other-chunks report changes from 1.95 to 1.96 kB with the stylesheet import; no material JS increase. No backend, config, booking, pricing, payment, tracking, metrics or rail source changes.

## Files for this pass

- src/app/(main)/template.jsx (new)
- src/app/(main)/page.jsx
- src/app/(main)/medical/page.jsx
- src/app/(main)/legal/page.jsx
- src/app/(main)/drop-batch/page.jsx
- src/app/contact-us/page.jsx
- src/app/layout.jsx
- src/styles/route-motion.css (new)
- tests/route-motion.test.mjs (new)
- docs/WEB_ROUTE_MOTION_REPORT.md (new)

Preview target: http://127.0.0.1:3188. Browser motion/history/scroll behavior remains for human verification; build/source checks are not a visual approval. No commit, push, merge or deployment.

## Pass 5 status

Human review found that this incoming-only implementation still had a hard cut. Its CSS/template are retained unchanged as the fallback. The explicitly authorized native coordinator now handles eligible in-app marketing transitions; see WEB_NATIVE_ROUTE_MOTION_REPORT.md. The earlier no-client-code statement describes Pass 4 only.
