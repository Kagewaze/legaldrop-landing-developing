# Pass 5: native marketing route transitions

Branch codex/web-motion-system. Committed HEAD 5ec5761d97f8f701200a7dbb5f83dcbde4d674c9. Passes 2-5 remain uncommitted. No push, merge or deployment.

## Architecture

One persistent MarketingNavigation client coordinator in the root layout, with an explicit forwardRef MarketingLink adapter around Next Link. The provider adds no DOM wrapper and receives server children without converting them to client components. No global anchor or document click interceptor. Header/footer/mobile links and marketing CTAs use the adapter; non-eligible links retain normal Next handling. Existing Headless UI handlers run first. replace and scroll=false options bypass enhancement.

The native update callback initiates router.push and returns a pending promise. usePathname observed in useLayoutEffect supplies React commit evidence; the promise resolves only when the destination's exact data-marketing-route server DOM marker also exists. A temporary child-list MutationObserver handles streamed content arriving after pathname, then disconnects. No elapsed-time guesses, animation-frame waits, timers, custom scroll, image/data waits, fetch or form handlers. The observer does not implement scroll or reveal effects.

Native startViewTransition waits on that promise before capturing new content (https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition). Only the named druppr-page marketing surface is animated. The document root has no transition name while active; header/footer are outside the named surface.

## Motion and fallback

- Old snapshot yields upward 8px over 180ms, with a brief 0.94 opacity stage before fading away.
- New snapshot moves from 18px over 300ms. A true crossfade begins transparent over the still-visible old snapshot, reaches 0.96 opacity at 60%, then settles to 1. Starting nearly opaque would hide the outgoing page immediately. These opacity changes affect browser snapshots, never live marketing DOM.
- Native-active styling suppresses only Pass 4's global container entrance. A data-native-arrived marker persists on that destination DOM instance so native cleanup does not restart fallback. Scroll, hero, hover, card sway and the thin purple accent remain.
- Direct visits, refreshes, unsupported browsers and ordinary non-native navigation retain Pass 4. Native API absence/throw or coordinator setup failure leaves normal Next Link activation available. Snapshot/update failures skip native motion, release pending coordination and preserve navigation; superseded callbacks cannot push stale routes.
- Reduced motion bypasses startViewTransition entirely. CSS is also no-preference gated.
- No popstate/history interception. Back/Forward retains Next/browser handling and scroll restoration, with no native transition promised; a remounted page may use Pass 4 fallback. Browser visual/history checks remain for human review.

## Scope

Both current and destination must exactly match /, /medical, /legal, /drop-batch or /contact-us. External origins, operational routes (including /drop-batch/request), modifier/middle/right clicks, non-self targets, downloads, mail/tel, hashes, same-page and query navigation bypass coordination. Forms have no new handlers. Marketing-to-operational and operational-to-marketing are ordinary navigation. Contact's whole marketing content participates in the native snapshot, but its live form receives no entrance: Pass 4's fallback stays intro-only.

## Performance and validation

- Pass 4 -> Pass 5 homepage: 5.17 kB -> 5.17 kB route size; 110 kB -> 111 kB First Load JS (Next's rounded build output).
- Homepage stays static/prerendered. All 18 static pages generated.
- Coordinator plus link adapter compile to module 4081: 2,632-2,645 minified bytes / 1,267-1,279 gzip bytes depending on entry context. Webpack includes the module in multiple entry chunks; these module-only measurements are not a standalone transfer size.
- Root/shared-shell use also adds small client overhead on non-marketing destinations: /send reports 110 -> 111 kB and /drop-batch/request 112 -> 114 kB, without operational interception. /contact-us reports 155 -> 156 kB.
- No dependencies or upgrades. Manifest/lockfile, backend/API/config/pricing, send/tracking/payment code, metrics and rail mechanics have no diff against committed HEAD.
- 148 tests pass, including 10 new native tests. All existing Pass 2/3/4 tests remain intact. Diff check, encoding, vehicle-capacity, DropBatch containment, lint and production build pass. Existing Browserslist/module-format warnings remain.
- Automated tests cover both commit/DOM ordering cases, reduced/unsupported/setup failure, snapshot failure, cancellation, stale callbacks, route scope, link exceptions, CSS guards and fallback suppression. They do not substitute for browser visual approval.

## Files changed in Pass 5

- src/components/MarketingNavigation.jsx (new coordinator and link adapter)
- src/components/marketing-navigation.mjs (new state/eligibility module)
- src/styles/native-route-motion.css (new)
- tests/native-route-motion.test.mjs (new)
- src/app/layout.jsx
- src/app/(main)/page.jsx
- src/app/(main)/medical/page.jsx
- src/app/(main)/legal/page.jsx
- src/app/(main)/drop-batch/page.jsx
- src/app/contact-us/page.jsx
- src/components/Header.jsx
- src/components/HeaderMobileNav.jsx
- src/components/Footer.jsx
- src/components/home/VerticalSection.jsx
- src/components/home/TrustAndAccountability.jsx
- src/components/home/HeroNetwork.jsx
- src/components/home/HeroAddressEntry.jsx
- docs/HOMEPAGE.md
- docs/WEB_ROUTE_MOTION_REPORT.md
- docs/WEB_NATIVE_ROUTE_MOTION_REPORT.md (new)

Fresh production preview target: http://127.0.0.1:3188.
Human review: Home -> Medical -> Legal -> DropBatch -> Contact -> Home; check old snapshot visibility, no blank flash/hard cut, stable header, fast navigation, retained hover/scroll, modified links, immediate /send navigation and reduced motion.
