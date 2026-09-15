# Public marketing motion system — Pass 1

Human visual review of this commit FAILED for insufficient motion.
See WEB_MOTION_PASS2_REPORT.md for the uncommitted second pass.

## Repository and scope

- Repository: Kagewaze/legaldrop-landing-developing
- Branch: codex/web-motion-system
- Worktree: C:/Users/Abdul/LegalDrop/worktrees/codex-web-motion
- Base: 8fb31c5fd72b601a57b4c79e0e7fc10e173ebf3c, verified after fetching origin.
- Local main was clean but divergent (ahead 1, behind 37) and was not changed.
- No push, merge, deployment or backend change.

## Motion

The page-level data-marketing-motion opt-in exists only on /, /medical, /legal,
/drop-batch and /contact-us. Shared components remain static outside that scope.
One reveal primitive moves 24px and resolves from 0.98 opacity to 1. Copy shares
a local view timeline to order labels, headings and paragraphs. Peer groups use
small progress offsets, capped at three steps; narrow mobile groups reset the
offset and each item follows its own viewport entry. Media uses the same travel
with scale 0.985 to 1 and finishes at 45% of entry.

| Surface | Treatment |
| --- | --- |
| HeroNetwork | Fully opaque heading and copy enter over 380/480ms, with no delay; booking surface stays fixed. |
| HomeTrackingBar | Heading/copy sequence only; input, submit and validation remain stationary. |
| OperationalProof | Label and metric-group entrances; final server-rendered values and data fetching unchanged. No count-up. |
| ProductStory | Shared intro/stage copy sequence and one media settle per existing product demonstration. Restores the unused data-stage-media hook; overflow-clip allows viewport timelines without a trapping scroll container. |
| Medical/legal homepage verticals | Copy sequence and whole media composition settle; CTA hit targets remain stationary. |
| TrustAndAccountability | Intro sequence and short pillar cascade; closing links receive opacity feedback. |
| Reviews/PartnerStrip | Heading reveal only. No animation on rail containers, items or ancestors; autoplay/swipe code is unchanged. |
| /medical and /legal | Service-panel/reason/credential groups, coverage and closing copy enter using the shared vocabulary; links receive fast feedback. |
| /drop-batch | Copy, imagery, steps and capability groups enter; quote links stay stationary. No request-page or pricing change. |
| /contact-us | Intro heading/copy only; the entire form and its behavior are unchanged. |

New keyframes use only transform and opacity and live inside both supports and
no-preference guards. Hover/press feedback also requires no-preference. Focused
targets suppress entrance motion and retain existing focus styles. No new
dependencies, client islands, hydration effects, observers, scroll handlers,
Maps/Places requests, continuous decorative animation or non-clickable hover
movement were added. The existing hero flashcard lifecycle is unchanged.

The CSS mechanism follows the [CSS scroll-driven animations specification](https://www.w3.org/TR/scroll-animations-1/).

## Validation

| Gate | Baseline | Final |
| --- | --- | --- |
| npm ci | Passed (394 packages) | Lockfile/dependencies unchanged |
| npm test | 125/125 | 129/129, including four motion safeguards |
| check:encoding | Passed | Passed |
| check:vehicle-capacity | Passed | Passed |
| check:dropbatch | Passed | Passed |
| npm run lint | Passed | Passed |
| npm run build | Passed | Passed |
| Homepage rendering | Static, 120s revalidation | Static, 120s revalidation |
| Homepage route size | 5.17 kB | 5.19 kB |
| Homepage First Load JS | 110 kB | 110 kB |
| Homepage own JS chunk, uncompressed | 16,218 bytes | 16,263 bytes (+45) |
| git diff --check | Clean | Clean |

Initial build/lint attempts ran before npm had linked Next and returned
"next is not recognized". Both passed after installation finished, before
source edits. Existing warnings: outdated Browserslist data, Node module-type
warnings in existing tests, and npm's 21 dependency vulnerabilities (1 low,
4 moderate, 14 high, 2 critical). No unrelated repair or dependency update.

The production HTML was compared before/after for all five routes: rendered
text, semantic attributes, image dimensions/sources, controls and structure are
identical after removing motion attributes and normalizing the clipping class.
This is an HTML regression check, not a browser screenshot or CLS measurement.

Computed sRGB contrast for the lightest affected DropBatch note (#756d7e on
#fbf9fc) is 4.541:1 at the 0.98 entrance opacity. The initial 0.96 proposal
measured 4.365:1 and was raised before completion. Hero text remains fully opaque.

## Visual verification limits

The supplied recording was not attached to the accessible conversation.
The implementation uses the user's written motion brief.

The browser connector reported no enabled browsers; attempts to open both iab
and Chrome returned "Browser is not available". Therefore 1440x900, 390x844,
320px (and contract 768/1024px) screenshots, actual scroll rhythm, clipping,
horizontal overflow, mobile jank, measured CLS/LCP, reduced-motion browser
rendering, disabled-JS rendering, fast scroll, mid-page refresh and history
restoration were not visually verified. No measured visual pass is claimed.
The source gates establish visible fallbacks and containment, but cannot replace
these browser checks. The change is for local review, not a verified release.

Five-second read is unchanged: same-day GTA logistics on one platform, with
immediate booking and tracking access. Brand, typography, colors, content,
screenshots/product demos, information architecture and operational behavior
are preserved.
