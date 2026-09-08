#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, 'src', path), 'utf8')
const failures = []
const check = (label, value) => { if (!value) failures.push(label) }

// Banned-phrase rules must judge what the page RENDERS, not what the source explains
// about itself. Without this, the comment above a rule documenting why "job board" is
// wrong would itself trip that rule. Leaves `https://` alone.
const prose = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const configSource = read('lib/config.js')
const config = await import(`data:text/javascript;base64,${Buffer.from(configSource).toString('base64')}`)
const navigationSource = read('lib/navigation.js').replace(
  /'@\/lib\/config'/g,
  `'data:text/javascript;base64,${Buffer.from(configSource).toString('base64')}'`,
)
const navigation = await import(`data:text/javascript;base64,${Buffer.from(navigationSource).toString('base64')}`)
const hook = read('components/send/useDropBatchQuote.js')
const page = read('app/(main)/drop-batch/page.jsx')
const requestPage = read('app/(main)/drop-batch/request/page.jsx')
const requestFlow = read('components/dropbatch/DropBatchRequestFlow.jsx')
const card = read('components/send/DropBatchQuoteCard.jsx')
const services = read('components/home/Services.jsx')
const copy = read('lib/dropbatch-copy.js')
const detailsPage = read('app/send/details/page.jsx')
const requestBuilder = hook.slice(
  hook.indexOf('export function buildDropBatchQuoteRequest'),
  hook.indexOf('export function useDropBatchQuote'),
)

const visibleNavLabels = navigation.NAV_LINKS.filter((link) => link.live).map(
  (link) => link.label,
)

check('explainer is enabled', config.DROPBATCH_EXPLAINER_ENABLED === true)
check('public quote is enabled', config.DROPBATCH_PUBLIC_QUOTE_ENABLED === true)
check('send comparison is enabled', config.DROPBATCH_SEND_COMPARISON_ENABLED === true)
check('reserved marketplace control remains false', config.DROPBATCH_MARKETPLACE_ENABLED === false)
check('reserved booking control remains false', config.DROPBATCH_BOOKING_ENABLED === false)
check('transactional compatibility flag remains disabled', config.DROPBATCH_ENABLED === false)
check('DropBatch navigation follows explainer flag', navigation.ROUTES.dropBatch.live === true)
for (const label of ['Medical', 'Legal', 'Contact']) {
  check(`${label} remains discoverable`, visibleNavLabels.includes(label))
}
check('normal Send CTA remains live', navigation.NAV_CTA.live === true)
for (const route of ['send', 'medical', 'legal']) {
  check(`ROUTES.${route} remains live`, navigation.ROUTES[route].live === true)
}
check(
  'explainer has its exact direct-route guard',
  /if \(!DROPBATCH_EXPLAINER_ENABLED\)\s*(?:\{\s*)?notFound\(\)/.test(page),
)
check(
  'request page has its exact direct-route guard',
  /if \(!DROPBATCH_PUBLIC_QUOTE_ENABLED\)\s*(?:\{\s*)?notFound\(\)/.test(requestPage),
)
check('send hook defaults to comparison flag', hook.includes('DROPBATCH_SEND_COMPARISON_ENABLED'))
check('send hook does not use marketplace flag', !hook.includes('DROPBATCH_MARKETPLACE_ENABLED'))
check('send hook does not use booking flag', !hook.includes('DROPBATCH_BOOKING_ENABLED'))
check(
  'comparison disable guard precedes public quote fetch',
  requestBuilder.indexOf('if (!enabled) return null') <
    requestBuilder.indexOf('return {'),
)
check(
  'unsupported vehicle guard precedes public quote fetch',
  requestBuilder.indexOf('if (!isDropBatchSupportedVehicle(vehicle)) return null') <
    requestBuilder.indexOf('return {'),
)
check('marketplace board remains absent from explainer', !/TripBoard|fetchPublicTrips/.test(page))
check(
  'public surfaces expose no booking mutation',
  !/fetch\([\s\S]{0,300}(?:drop-batch\/book|\/order)/.test(
    [page, requestPage, requestFlow, hook, card].join('\n'),
  ),
)
check(
  'homepage DropBatch copy names the route match',
  /already heading your way/.test(services) &&
    !services.includes('Many stops on one optimised route'),
)

// ⚠️ THIS RULE WAS INVERTED ON PURPOSE — DO NOT PUT IT BACK.
//
// It used to assert the OPPOSITE: that no public surface mentioned matching,
// compatible trips or a driver already travelling. That was correct for the
// 2026-08-31 build, in which a booked DropBatch order really did go to the normal
// driver job board. It stopped being correct on 2026-09-08, when the backend was
// consolidated so that DropBatch is excluded from the jobs-board query
// (driver.service.ts) and refused generic dispatch (dispatch-eligibility.ts), and is
// instead matched against already-posted driver trips by DropBatchService.
//
// From that day the guard was enforcing a false statement about how Druppr fulfils
// the order — and a customer choosing between DropBatch and Standard was never told
// the one fact that distinguishes them. Route sharing is why DropBatch costs less
// and why it can take longer; the guard now requires it to be said out loud.
check(
  'canonical DropBatch copy states the route match, the wait and the absence of a promise',
  /already heading along your route/.test(copy) &&
    /existing trip is compatible/.test(copy) &&
    /pickup may take longer/.test(copy) &&
    /does not mean a driver has been found/.test(copy),
)
check(
  'canonical copy contrasts DropBatch with dedicated dispatch',
  /dispatched specifically for your delivery/.test(copy),
)
check(
  'the decision point itself carries the explanation, not just a Learn More link',
  card.includes("from '@/lib/dropbatch-copy'") &&
    /DROPBATCH_EXPLANATION/.test(card) &&
    /DROPBATCH_NO_PROMISE/.test(card),
)
check(
  'the DropBatch alternative is described where it is chosen',
  detailsPage.includes("from '@/lib/dropbatch-copy'") &&
    /STANDARD_EXPLANATION/.test(detailsPage),
)
check(
  'the explainer names the route match',
  /DROPBATCH_EXPLANATION/.test(page) && /already posted/.test(page),
)

// The superseded fulfilment model, banned everywhere it used to be asserted. A
// DropBatch order never reaches the job board; saying it does is the exact defect
// this file now exists to prevent.
check(
  'no public surface claims DropBatch joins the driver job board',
  !/job board/i.test(
    [page, requestPage, requestFlow, hook, card, services, detailsPage]
      .map(prose)
      .join('\n'),
  ),
)

if (failures.length) {
  console.error(`DropBatch exposure check failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('DropBatch exposure check passed: public explanation and quotes are isolated from marketplace and booking.')
