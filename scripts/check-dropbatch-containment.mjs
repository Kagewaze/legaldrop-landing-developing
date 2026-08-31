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

check('explainer is enabled', config.DROPBATCH_EXPLAINER_ENABLED === true)
check('public quote is enabled', config.DROPBATCH_PUBLIC_QUOTE_ENABLED === true)
check('send comparison is enabled', config.DROPBATCH_SEND_COMPARISON_ENABLED === true)
check('marketplace remains disabled', config.DROPBATCH_MARKETPLACE_ENABLED === false)
check('booking remains disabled', config.DROPBATCH_BOOKING_ENABLED === false)
check('transactional compatibility flag remains disabled', config.DROPBATCH_ENABLED === false)
check('DropBatch navigation follows explainer flag', navigation.ROUTES.dropBatch.live === true)
check('explainer has its own route guard', page.includes('DROPBATCH_EXPLAINER_ENABLED'))
check('request page has its own quote guard', requestPage.includes('DROPBATCH_PUBLIC_QUOTE_ENABLED'))
check('send hook defaults to comparison flag', hook.includes('DROPBATCH_SEND_COMPARISON_ENABLED'))
check('send hook does not use marketplace flag', !hook.includes('DROPBATCH_MARKETPLACE_ENABLED'))
check('send hook does not use booking flag', !hook.includes('DROPBATCH_BOOKING_ENABLED'))

if (failures.length) {
  console.error(`DropBatch exposure check failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('DropBatch exposure check passed: public explanation and quotes are isolated from marketplace and booking.')
