// Node ESM loader hooks for the pay-page runtime harness.
//
// Adopted, test-only, from the fresh-context D7c review (review-evidence\d7c-final-independent-review\
// runtime\hooks.mjs, sha256 9082412f…). Changes on adoption: the repository root is derived from this
// file's location instead of a fixed path, and the in-memory mutant switch is RUNTIME_MUTANT.
//
// - Imports the repository's source READ-ONLY (readFileSync), transforms JSX in memory with sucrase
//   (installed as a locked dependency of tailwindcss), and never writes a file anywhere.
// - Resolves the Next "@/" alias to <worktree>/src, adding implicit extensions.
// - Resolves bare packages (react, react-dom, ...) from the worktree's node_modules.
// - Redirects exactly six boundaries to review-owned mocks: next/navigation, the two Stripe
//   packages, and three purely presentational components (ViaLink, ContactFields,
//   PriceBreakdown). Everything else on the pay page (page.jsx, PaymentForm.jsx, guest-session.js,
//   paid-booking-recovery.mjs, send-flow.js, buildOrderPayload.js, ...) is the real code.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const WT = fileURLToPath(new URL('../../', import.meta.url)).replace(/[\\/]$/, '')
const SRC_URL = pathToFileURL(WT + '/src/').href
const PKG_URL = pathToFileURL(WT + '/package.json').href
const MOCKS = new URL('./mocks/', import.meta.url).href
const { transform } = createRequire(WT + '/package.json')('sucrase')

const MOCK_MAP = new Map([
  ['next/navigation', MOCKS + 'next-navigation.mjs'],
  ['@stripe/react-stripe-js', MOCKS + 'stripe-react.mjs'],
  ['@stripe/stripe-js', MOCKS + 'stripe-js.mjs'],
  ['@/components/send/ViaLink', MOCKS + 'ViaLink.mjs'],
  ['@/components/send/ContactFields', MOCKS + 'ContactFields.mjs'],
  ['@/components/send/PriceBreakdown', MOCKS + 'PriceBreakdown.mjs'],
])

function withExtension(url) {
  const path = fileURLToPath(url)
  if (existsSync(path) && statSync(path).isFile()) return url
  for (const ext of ['.js', '.mjs', '.jsx']) {
    if (existsSync(path + ext)) return url + ext
  }
  return url
}

export async function resolve(specifier, context, next) {
  if (MOCK_MAP.has(specifier)) return { url: MOCK_MAP.get(specifier), shortCircuit: true }
  if (specifier.startsWith('@/')) {
    return { url: withExtension(new URL(specifier.slice(2), SRC_URL).href), shortCircuit: true }
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith(SRC_URL)) {
    return { url: withExtension(new URL(specifier, context.parentURL).href), shortCircuit: true }
  }
  const bare = !/^(\.|\/|file:|node:|data:)/.test(specifier) && !/^[A-Za-z]:[\\/]/.test(specifier)
  if (bare) return next(specifier, { ...context, parentURL: PKG_URL })
  return next(specifier, context)
}

// In-memory mutants (RUNTIME_MUTANT=<id>) prove the runtime scenarios are not vacuous. They are
// applied to the transformed source in this process only; no file is ever written.
const MUTANTS = {
  T1: ['src/lib/guest-session.js', '> SESSION_TTL_MS && !paymentRecordPresent()', '> SESSION_TTL_MS'],
  T2: ['src/app/send/pay/page.jsx', "setPhase('paymentIndeterminate')\n  }, [])", "setPhase('orderFailed')\n  }, [])"],
  T3: ['src/app/send/pay/page.jsx', 'error?.outcome === ORDER_SUBMISSION.NEEDS_SUPPORT', 'false'],
  T4: ['src/lib/guest-session.js', 'session.userId !== ownerUserId', 'false'],
  // T5 re-anchored on adoption: the same-booking RECOVER branch (R-M1 split it from the earlier one).
  T5: ['src/app/send/pay/page.jsx', 'if (decision.action === STORED_PAYMENT.RECOVER && !earlier) {', 'if (false) {'],
  T6: ['src/lib/guest-session.js', "const owner = paymentRecordPresent() ? readStoredSession() : null", 'const owner = null'],
  T7: ['src/app/send/pay/page.jsx', 'if (reuseUnpaid) {\n          if (Math.round', 'if (reuseUnpaid) {\n          if (false && Math.round'],
  T8: ['src/lib/paid-booking-recovery.mjs', 'new Set([408, 425, 429])', 'new Set([401, 408, 425, 429])'],
  T9: ['src/app/send/pay/page.jsx', 'ownerUserId: currentGuestUserId(),', 'ownerUserId: null,'],
  // R-M1 / R-M2 (pay-recovery.test.mjs).
  U1: ['src/app/send/pay/page.jsx', 'if (decision.action === STORED_PAYMENT.RECOVER && !earlier) {', 'if (decision.action === STORED_PAYMENT.RECOVER) {'],
  U2: ['src/app/send/pay/page.jsx', "if (earlier) {\n          setPhase('earlierBookingDone')", "if (false) {\n          setPhase('earlierBookingDone')"],
  U3: ['src/app/send/pay/page.jsx', 'doesn&rsquo;t start another payment. If it keeps', 'doesn&rsquo;t start another payment, and you have not been charged twice. If it keeps'],
  U4: ['src/app/send/pay/page.jsx', "completedBooking?.pricingMode === 'dropbatch'", "flow.pricingMode === 'dropbatch'"],
  U5: ['src/app/send/pay/page.jsx', 'summary: strangerToRecord\n              ? null', 'summary: false\n              ? null'],
  U6: ['src/app/send/pay/page.jsx', 'if (finishingEarlierRef.current) {', 'if (false) {'],
  U7: ['src/app/send/pay/page.jsx', 'if (!booking?.earlier) {\n    return null', 'if (true) {\n    return null'],
}

export async function load(url, context, next) {
  if (url.startsWith(SRC_URL) && /\.(m?js|jsx)$/.test(url)) {
    const filePath = fileURLToPath(url)
    let source = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n')
    const mutant = MUTANTS[process.env.RUNTIME_MUTANT ?? '']
    if (mutant && filePath.replace(/\\/g, '/').endsWith(mutant[0])) {
      if (!source.includes(mutant[1])) throw new Error('mutant anchor not found: ' + process.env.RUNTIME_MUTANT)
      source = source.replace(mutant[1], mutant[2])
    }
    const code = transform(source, {
      transforms: ['jsx'],
      jsxRuntime: 'automatic',
      production: true,
      filePath,
    }).code
    return { format: 'module', source: code, shortCircuit: true }
  }
  return next(url, context)
}
