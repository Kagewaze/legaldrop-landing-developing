import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// D7c — pay-page wiring for the fresh-context review's M-1 (checkout owner continuity) and M-2
// (accurate uncertain-payment messaging), plus guards that keep H-2 and H-3 rejected.
//
// Static and bounded to the regions they describe (pay/page.jsx is a client component node --test
// cannot execute). The behaviour behind them is tested in paid-identity-continuity.test.mjs,
// paid-order-outcome.test.mjs and paid-booking-recovery.test.mjs.

const SRC = fileURLToPath(new URL('../src/', import.meta.url))
const PAGE = readFileSync(join(SRC, 'app/send/pay/page.jsx'), 'utf8').replace(/\r\n/g, '\n')

const region = (startMarker, endMarker) => {
  const start = PAGE.indexOf(startMarker)
  assert.ok(start >= 0, `missing ${startMarker}`)
  const end = PAGE.indexOf(endMarker, start + startMarker.length)
  assert.ok(end > start, `missing ${endMarker} after ${startMarker}`)
  return PAGE.slice(start, end)
}
const count = (text, needle) => text.split(needle).length - 1

// ── M-1: the record names its owner, and submission never sends as anyone else ──────────────

test('the payment record written at get-fee names the checkout owner', () => {
  const confirm = region('const confirmAndCreateIntent = useCallback(', '\n  }, [')
  const write = confirm.slice(confirm.indexOf('writePaymentSession({'))
  assert.match(write.slice(0, write.indexOf('})')), /ownerUserId: currentGuestUserId\(\)/)
})

test('the record re-written before confirm keeps that owner', () => {
  const persist = region('const persistBeforeConfirm = useCallback(', '\n  }, [')
  assert.match(persist, /ownerUserId:\s*readPaymentSession\(\)\?\.ownerUserId \?\? currentGuestUserId\(\)/)
})

test('every POST /order names the stored owner, and a refusal carries its HTTP status', () => {
  const create = region('const createOrder = useCallback(', '\n  )\n')
  assert.match(create, /submitPaidOrder\(payload, \{\s*ownerUserId: readPaymentSession\(\)\?\.ownerUserId \?\? null,?\s*\}\)/)
  assert.match(create, /throw new OrderRefusedError\(response\.status\)/)
})

test('identity and non-retryable refusals of a confirmed payment go to support, never a retry loop', () => {
  const finish = region('const finishOrder = useCallback(', '\n  )\n')
  assert.match(finish, /error instanceof OrderIdentityUnavailableError/)
  assert.match(finish, /error\?\.outcome === ORDER_SUBMISSION\.NEEDS_SUPPORT/)
  assert.ok(finish.indexOf("setPhase('paidNeedsSupport')") < finish.indexOf("setPhase('orderFailed')"))
})

// ── M-2: "charged" only when Stripe confirmed it; never "not charged" while unknown ─────────

test('an unknown confirmation outcome has its own state and is never shown as charged', () => {
  const indeterminate = region('const handleIndeterminate = useCallback(', '\n  }, [')
  assert.match(indeterminate, /setPhase\('paymentIndeterminate'\)/)
  assert.equal(indeterminate.includes('orderFailed'), false)
})

test('the "charged" screen is reachable only from order creation after a confirmed payment', () => {
  assert.equal(count(PAGE, "setPhase('orderFailed')"), 1)
  const finish = region('const finishOrder = useCallback(', '\n  )\n')
  assert.match(finish, /setPhase\('orderFailed'\)/)
})

test('the indeterminate screen makes no charge claim either way, keeps the reference and blocks paying again', () => {
  const screen = region("if (phase === 'paymentIndeterminate')", '\n  }\n')
  assert.equal(/charged/i.test(screen), false)
  assert.match(screen, /don&rsquo;t pay again/)
  assert.match(screen, /paymentIntentIdRef\.current/)
  assert.match(screen, /contact-us/)
  assert.match(screen, /window\.location\.reload\(\)/)
  assert.equal(screen.includes('PaymentForm'), false)
})

test('the confirmed-payment failure screen no longer says nothing is needed while asking for a retry', () => {
  const screen = region("if (phase === 'orderFailed')", '\n  }\n')
  assert.equal(screen.includes('Nothing further is needed from you'), false)
  // R-M2 (fresh-context review): "you have not been charged twice" cannot be substantiated — the page
  // cannot see other tabs, devices or lost records. It now states only what it can prove: the payment
  // was confirmed, and retrying does not start another payment.
  assert.equal(/twice/i.test(screen), false)
  assert.match(screen, /payment was confirmed/)
  assert.match(screen, /doesn&rsquo;t start another payment/)
})

// ── H-2 and H-3 stay rejected ───────────────────────────────────────────────────────────────

test('no website code depends on an unimplemented recovery endpoint (H-3)', () => {
  const files = []
  const walk = (p) => {
    for (const name of readdirSync(p)) {
      const full = join(p, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.(m?js|jsx)$/.test(name)) files.push(full)
    }
  }
  walk(SRC)
  for (const file of files) {
    assert.equal(readFileSync(file, 'utf8').includes('recover-checkout'), false, file)
  }
})

test('an unpaid stored intent is reused only after a fresh quote succeeds (H-2)', () => {
  const boot = region('async function boot()', '\n    boot()\n')
  const quote = boot.indexOf('referralQuoteFetch(')
  const reuse = boot.indexOf('setClientSecret(stored.clientSecret)')
  assert.ok(quote > 0 && reuse > quote)
  assert.match(boot.slice(quote, reuse), /if \(!quoteResponse\.ok\)\s*\{\s*throw/)
})
