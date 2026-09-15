# Marketing motion — Pass 2, pending human review

Branch: `codex/web-motion-system`.
Working HEAD remains `5ec5761d97f8f701200a7dbb5f83dcbde4d674c9`.
Preflight confirmed this exact HEAD and a clean worktree before edits.
All Pass 2 changes are uncommitted. No push, merge or deployment.

## Motion changes

- Fully opaque 44px block/copy entrances; headings travel 36px. No contrast dip.
- Peer groups travel 36px with short scroll-progress offsets; narrow-mobile
  items use independent entry with 28px travel and no cascade offset.
- Media enters from the actual desktop composition side (48px horizontally,
  16px vertically, scale .96). Mobile uses centered 36px/.96 entrances.
- ProductStory alternates right/left/right and shares stage timing on desktop:
  label/copy resolves first, media runs from 12% to 70% of entry. Stacked mobile
  copy/media use independent viewport timelines. No hidden or load-gated frame.
- ProductStory, medical, legal and trust receive thin purple chapter rules;
  the rule's geometry is static and only scaleX animates. DropBatch's handoff
  section uses the same punctuation. No new layout space or section redesign.
- The hero text enters in 420/520ms. The first demonstration card is now present
  in server HTML instead of waiting 1.6 seconds after hydration. Subsequent hero
  card timing and both social-proof rail implementations are unchanged.
- Explicit existing CTA controls lift 2px with elevation over 180ms on fine
  pointer hover. Press returns toward rest. Disabled and focus-visible controls
  are excluded; no hover treatment on static screenshots or non-clickable cards.
- Contact remains intro-only. Forms, operational maps, payment/tracking controls,
  metrics data fetching and actual number values do not receive new behavior.

CSS entrances require scroll-animation support AND no reduced-motion preference.
Hover motion requires no-preference, hover capability and a fine pointer.
Unsupported and reduced-motion cases retain visible content at final positions.
No animation dependency, client island, observer or scroll listener was added.

## Image audit

HeroNetwork and ProductStory use HTML/SVG product compositions, not downloaded
photographs/screenshots. Their content is present in server HTML. The hero's
previous delayed initial state was a real cause of perceived loading delay.

| Asset | Source dimensions | Original bytes | Treatment |
| --- | --- | ---: | --- |
| medical-specimen.jpg | 2000x1500 | 142,285 | Next/Image, q75, lazy; corrected sizes and blur placeholder |
| legal-lawoffices.jpg | 2000x1500 | 203,901 | Next/Image, q75, lazy; corrected sizes and blur placeholder |
| medical-pharma.jpg | 2000x1500 | 172,484 | Next/Image service panels; corrected two-column sizes, lazy |
| legal-courthouse.jpg | 2000x1500 | 423,343 | Only /legal's first hero panel gains priority/preload |
| legal-document.jpg | 2000x1500 | 302,735 | Next/Image, lazy; corrected three-column sizes |
| dropbatch-hero.png | 1536x1024 | 2,329,652 | Lossless WebP derivative: 1,526,518 bytes (-34.5%); existing priority retained |
| dropbatch-handoff.png | 1672x941 | 2,994,448 | Lossless WebP derivative: 1,441,474 bytes (-51.9%); stays lazy |
| Six partner WebP logos | 400x160 each | 2,034–14,692 each | Existing native img/lazy/async rendering unchanged |

The large PNG findings were reported before derivative creation. Decoded RGBA
buffers match exactly for each PNG/WebP pair (verified with sharp); original PNGs
are retained as source assets. These savings are SOURCE-byte reductions, not a
claim that browsers previously downloaded the full originals: Next/Image already
serves negotiated resized images.

Next/Image quality remains its default 75. Global AVIF-first/WebP-fallback
configuration is unchanged so operational routes do not change. Existing intrinsic
dimensions/fill frames reserve layout; no client-only image discovery was found.
Before Pass 2 the homepage photographs advertised 640px desktop/100vw mobile,
overstating their actual slots. The revised sizes account for gutters and capped
columns. /medical and /legal panel sizes now account for two versus three columns.
DropBatch sizes also account for the 1200px cap and gutters. Blur placeholders use
the imported image's small inline preview, avoiding an empty image frame while
the full source loads. Priority was NOT added to below-fold homepage photographs.

### Local response measurements

An isolated uncached 1080px/q74 specimen probe returned AVIF in 609ms (10,592
bytes) versus WebP in 167ms (17,762 bytes), both MISS. q74 was chosen to obtain
separate cold entries; site quality remains q75. At actual 640px/q75, cached AVIF
was 5ms/6,574 bytes after the first 57ms request, and WebP was 370ms MISS then
3ms HIT/9,378 bytes. This identifies cold optimizer work as a contributor, not
proof of the human browser's entire loading timeline. No browser network trace
or currentSrc measurement was available. Browser/device visual review remains
the human's next gate; no claim of a visual pass is made.

## Validation

- `git diff --check`: passed.
- `npm test`: 134/134 passed.
- Encoding, vehicle-capacity, DropBatch containment: passed.
- `npm run lint`: passed; existing outdated Browserslist warning remains.
- `npm run build`: passed; all 18 static pages generated.
- `/` remains static/prerendered with 120-second revalidation.
- Homepage route size: 5.19 kB (Pass 1) to 5.17 kB (Pass 2).
- Homepage First Load JS remains 110 kB. Its own chunk is 16,212 bytes
  versus 16,263; an existing shared chunk gains 50 bytes (combined net -1 byte).
- Dependency manifest/lockfile, pricing/API/config/data code, send/tracking/payment
  routes, OperationalProof, Reviews, PartnerStrip, ReviewsMotion and
  useAutoScrollRail have no diff against the working HEAD.
- Four original motion tests remain; five further tests enforce server rendering,
  no observer/scroll listener, final metric values, operational-route exclusion,
  guarded hover, immediate initial demonstration and dependency-file freezing.
- The two DropBatch image assertions now require the exact .webp derivative names;
  no pricing, matching, exposure, vehicle or booking assertion was relaxed.

The old preview process was stopped before the build. The freshly built preview
is to be served at http://127.0.0.1:3188 for human review. No commit is authorized
until that review succeeds.


## Human-requested hover follow-up (uncommitted)

- All three ProductStory stages lift 6px, their media sways in alternating directions with a 0.3-degree rotation, and their copy lifts 2px with subtle depth.
- Homepage medical and legal scenes use a shared parent hover: photographs move left 12px and supporting record cards right 12px, with opposing 0.35-degree rotations.
- All WhyBrand benefit cards on medical/legal, shared service panels, homepage trust pillars and DropBatch step/capability cards lift 6px with shadow emphasis.
- Contact remains intro-only; no suitable presentational card group warrants moving its form or controls. Other information pages have no matching opted-in patterns.
- All new hover is CSS-only, 220ms ease-out, explicitly scoped to marketing roots, fine hover pointers and no reduced-motion preference. Card semantics and cursors are unchanged. Focus within suppresses decorative hover.
- Independent CSS translate/rotate properties compose with scroll transform animation rather than competing for the same transform property. No new dependency or client island.
- Final validation: diff check, 135/135 tests, encoding, vehicle-capacity, DropBatch containment, lint and production build passed. Existing Browserslist/Node module-format warnings remain.
- Homepage remains static/prerendered: 5.17 kB route and 110 kB First Load JS, unchanged from the preceding Pass 2 build.
- No backend, pricing, tracking, payment, metrics or review/partner rail code changed. Image optimizations from Pass 2 are retained; this follow-up makes no asset changes.
- Build/source checks do not constitute a visual pass. Human desktop/mobile/reduced-motion verification remains pending on the restarted local preview.
- Branch codex/web-motion-system; committed HEAD 5ec5761d97f8f701200a7dbb5f83dcbde4d674c9. No commit, push, merge or deployment.
