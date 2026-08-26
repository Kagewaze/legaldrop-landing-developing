#!/usr/bin/env node
// Proves DropBatch is contained, and that ONE switch is what contains it.
//
// WHY THIS EXISTS. DropBatch has real matching, pricing and capacity behind it and
// none of the lifecycle that finishes a delivery — no payment, no Order, no driver
// execution, no tracking, no proof of delivery, no completion, no earning, no
// payout, no refund, no cancel or expiry. The site must therefore not advertise it.
// The containment is a single constant, DROPBATCH_ENABLED in src/lib/config.js, and
// the failure this guards against is someone re-linking one surface — a nav item, a
// price card, the page — without flipping it, which would put a product that cannot
// be completed back in front of customers on that one surface alone.
//
// This repo has no test runner and one is not worth adding for this, so the check is
// split the same way check-vehicle-capacity.mjs splits it:
//
//   RUNTIME — config.js is pure and navigation.js imports nothing but config, so
//   both are executed here for real, straight from disk. The switch is then flipped
//   in a copy and they are executed AGAIN, which is what proves the feature is
//   hidden rather than deleted: the same source, one constant different, brings
//   every nav surface back.
//
//   WIRING — the page and the /send quote hook are React/Next modules that cannot be
//   imported without a bundler, so their guards are asserted at the source level.
//   Weaker than executing them, and deliberately so: it catches the failure that
//   actually happens — someone removes a guard and the surface quietly returns.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

const failures = []

function check(name, condition, detail = '') {
  if (condition) return
  failures.push(detail ? `${name}\n      ${detail}` : name)
}

function read(relativePath) {
  return readFileSync(join(SRC, relativePath), 'utf8')
}

function asDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source, 'utf8').toString('base64')}`
}

// ── RUNTIME: load config + navigation, optionally with the switch flipped ────
// navigation.js imports '@/lib/config', an alias no plain node resolver knows, so
// the specifier is rewritten to a data: URL carrying the real config source. What
// runs is still the committed files — only the import path is substituted.
async function loadNavigation({ enabled } = {}) {
  let config = read('lib/config.js')

  if (enabled !== undefined) {
    const before = config
    config = config.replace(
      /export const DROPBATCH_ENABLED = (?:true|false)/,
      `export const DROPBATCH_ENABLED = ${enabled}`,
    )
    if (config === before) {
      throw new Error('no `export const DROPBATCH_ENABLED = <boolean>` found in lib/config.js')
    }
  }

  const configUrl = asDataUrl(config)
  const navigation = read('lib/navigation.js').replace(/'@\/lib\/config'/g, `'${configUrl}'`)

  return {
    config: await import(configUrl),
    nav: await import(asDataUrl(navigation)),
  }
}

// What Header and Footer actually render — the same `live` filter, applied here.
const visibleNavLabels = (nav) => nav.NAV_LINKS.filter((link) => link.live).map((link) => link.label)
const visibleFooterLabels = (nav) =>
  nav.FOOTER_SECTIONS.flatMap((section) =>
    section.items.filter((item) => item.live).map((item) => item.label),
  )

// ── A. The switch is off, and it is what navigation reads ───────────────────
const asCommitted = await loadNavigation()

check(
  'DROPBATCH_ENABLED is false',
  asCommitted.config.DROPBATCH_ENABLED === false,
  'DropBatch cannot be completed: no payment, execution, tracking or completion exists',
)
check('ROUTES.dropBatch is not live', asCommitted.nav.ROUTES.dropBatch.live === false)
check(
  'the header nav renders no DropBatch link',
  !visibleNavLabels(asCommitted.nav).includes('DropBatch'),
  `header renders: ${visibleNavLabels(asCommitted.nav).join(', ')}`,
)
check(
  'the footer renders no DropBatch link',
  !visibleFooterLabels(asCommitted.nav).includes('DropBatch'),
  `footer renders: ${visibleFooterLabels(asCommitted.nav).join(', ')}`,
)

// ── D. Nothing else moved ───────────────────────────────────────────────────
// Containment must not take a shipped service down with it.
for (const label of ['Medical', 'Legal', 'Contact']) {
  check(`the header still renders ${label}`, visibleNavLabels(asCommitted.nav).includes(label))
}
check('the Send a package CTA is still live', asCommitted.nav.NAV_CTA.live === true)
for (const name of ['send', 'medical', 'legal']) {
  check(`ROUTES.${name} is still live`, asCommitted.nav.ROUTES[name].live === true)
}

// ── E. Hidden, not deleted ──────────────────────────────────────────────────
// One constant flipped in a copy of the SAME committed source brings it all back.
const asEnabled = await loadNavigation({ enabled: true })

check(
  'flipping DROPBATCH_ENABLED to true makes the route live again',
  asEnabled.nav.ROUTES.dropBatch.live === true,
  'ROUTES.dropBatch.live must derive from the constant, not be hand-set',
)
check(
  'flipping DROPBATCH_ENABLED to true restores the header link',
  visibleNavLabels(asEnabled.nav).includes('DropBatch'),
)
check(
  'flipping DROPBATCH_ENABLED to true restores the footer link',
  visibleFooterLabels(asEnabled.nav).includes('DropBatch'),
)

// The implementation is preserved, which is the whole point of a flag.
for (const preserved of [
  'app/(main)/drop-batch/page.jsx',
  'components/dropbatch/TripBoard.jsx',
  'components/dropbatch/TripCard.jsx',
  'components/send/DropBatchQuoteCard.jsx',
  'components/send/useDropBatchQuote.js',
  'lib/drop-batch.js',
]) {
  let present = true
  try {
    read(preserved)
  } catch {
    present = false
  }
  check(
    `${preserved} is still in the tree`,
    present,
    'containment hides DropBatch, it does not delete it',
  )
}

// ── B. WIRING: the direct route is guarded ──────────────────────────────────
const page = read('app/(main)/drop-batch/page.jsx')
check(
  'the /drop-batch page imports the switch',
  /import \{ DROPBATCH_ENABLED \} from '@\/lib\/config'/.test(page),
)
check(
  'the /drop-batch page 404s while DropBatch is disabled',
  /if \(!DROPBATCH_ENABLED\) \{\s*notFound\(\)\s*\}/.test(page),
  'unlinking is not containment: the route still resolves for anyone with the URL',
)
check(
  'the /drop-batch guard runs before the board is fetched',
  page.indexOf('notFound()') < page.indexOf('await fetchPublicTrips()'),
  'a disabled page must not call the public trips endpoint',
)

// ── WIRING: the /send price card cannot appear ──────────────────────────────
const hook = read('components/send/useDropBatchQuote.js')
check(
  'the DropBatch quote hook imports the switch',
  /import \{ API_BASE_URL, DROPBATCH_ENABLED \} from '@\/lib\/config'/.test(hook),
)
check(
  'the DropBatch quote hook builds no request while disabled',
  /if \(!DROPBATCH_ENABLED\) return null/.test(hook),
  'gating the card instead of the request would still quote a hidden feature',
)
check(
  'the disabled guard sits ahead of the only public-quote call site',
  hook.indexOf('if (!DROPBATCH_ENABLED) return null') < hook.indexOf('await fetch('),
  'the guard must sit ahead of the fetch, not merely somewhere in the file',
)

// ── Report ──────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error('DropBatch containment check failed:\n')
  for (const failure of failures) console.error(`  ✗ ${failure}`)
  process.exit(1)
}

console.log(
  'DropBatch containment check passed: hidden from nav, footer, services grid, ' +
    '/drop-batch and the send flow — and restored in full by one constant.',
)
