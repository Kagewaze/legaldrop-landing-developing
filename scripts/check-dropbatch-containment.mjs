#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, 'src', path), 'utf8')
const failures = []
const check = (label, value) => { if (!value) failures.push(label) }

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
  'homepage DropBatch copy describes flexible delivery',
  services.includes('Flexible delivery when matching and pickup timing can vary') &&
    !services.includes('Many stops on one optimised route'),
)
check(
  'active public quote surfaces do not depend on legacy matching',
  !/matches|departureWindow|overCapacity|remaining capacity|compatible (?:active )?trip|matching trip|already travelling|unused vehicle capacity/.test(
    [page, requestFlow, hook, card].join('\n'),
  ),
)

if (failures.length) {
  console.error(`DropBatch exposure check failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('DropBatch exposure check passed: public explanation and quotes are isolated from marketplace and booking.')
