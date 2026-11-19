import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// D7c / M-1 — THE OWNER OF AN UNRESOLVED CHECKOUT IS NEVER REPLACED, ON ANY PAGE.
//
// The backend accepts POST /order for a paid intent only from the user that owns its checkout.
// Every page of the booking flow reaches the guest credential through src/lib/guest-session.js:
// /send (referralQuoteFetch), details (referralQuoteFetch via useVehicleQuotes,
// referralDropBatchQuoteFetch via useDropBatchQuote) and pay (referralQuoteFetch,
// referralCheckoutFetch, submitPaidOrder). Before D7c, any of them could clear a guest older
// than the 12-hour local TTL or re-mint one on a 401, so a customer who paid and then returned
// through /send could no longer recover the order (the fresh-context review's M-1).
//
// While a payment record exists in this tab ("a PaymentIntent exists and no order has been
// created for it yet"), the stored guest is kept whatever its age and is never replaced by a
// re-mint. A new guest may still be minted only when NONE is stored (nothing to lose). The record
// also names its owner; submitPaidOrder refuses to send as anyone else. That client-side owner
// check is a fail-closed convenience only — the backend remains the authority on ownership.
//
// Network safety: API base pinned to an unresolvable .invalid host; fetch replaced before import.

process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.d7c.invalid'
register(new URL('./helpers/module-alias-hooks.mjs', import.meta.url).href, import.meta.url)

const store = new Map()
globalThis.window = globalThis.window ?? {}
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}
const calls = []
let respond = () => new Response('{}', { status: 200 })
let mintCounter = 0
globalThis.fetch = async (url, init = {}) => {
  const u = String(url)
  if (u === 'https://api.d7c.invalid/auth/guest') {
    mintCounter += 1
    calls.push({ url: u, method: init.method })
    return new Response(
      JSON.stringify({ data: { token: `minted-${mintCounter}`, userId: `minted-user-${mintCounter}` } }),
      { status: 201 },
    )
  }
  if (!u.startsWith('https://api.d7c.invalid/') && !u.startsWith('/api/referral/')) {
    throw new Error(`unexpected request: ${u}`)
  }
  calls.push({ url: u, method: init.method, authorization: init.headers?.Authorization })
  return respond(u)
}

const guest = await import('../src/lib/guest-session.js')
const {
  currentGuestUserId,
  getGuestSession,
  OrderIdentityUnavailableError,
  referralDropBatchQuoteFetch,
  referralQuoteFetch,
  submitPaidOrder,
} = guest

const GUEST_KEY = 'legaldrop.guest-session.v1'
const PAYMENT_KEY = 'legaldrop.send-payment.v1'
const HOUR = 60 * 60 * 1000
const seedGuest = (token, userId, ageMs) =>
  store.set(GUEST_KEY, JSON.stringify({ token, userId, createdAt: Date.now() - ageMs }))
const seedPayment = (over = {}) =>
  store.set(
    PAYMENT_KEY,
    JSON.stringify({
      inputsHash: 'h',
      paymentIntentId: 'pi_owned',
      clientSecret: 'pi_owned_secret',
      ownerUserId: 'owner-1',
      orderPayload: { paymentIntent: 'pi_owned', receivers: [{}], senderLocation: {} },
      ...over,
    }),
  )
const storedToken = () => JSON.parse(store.get(GUEST_KEY) ?? 'null')?.token ?? null
const mints = () => calls.filter((c) => c.url.endsWith('/auth/guest')).length
const reset = () => {
  store.clear()
  calls.length = 0
  mintCounter = 0
  respond = () => new Response('{}', { status: 200 })
}

test('the guest-session payment key mirrors send-flow.js exactly', () => {
  const sendFlow = readFileSync(
    fileURLToPath(new URL('../src/lib/send-flow.js', import.meta.url)),
    'utf8',
  )
  assert.match(sendFlow, /const PAYMENT_STORAGE_KEY = 'legaldrop\.send-payment\.v1'/)
  const source = readFileSync(
    fileURLToPath(new URL('../src/lib/guest-session.js', import.meta.url)),
    'utf8',
  )
  assert.match(source, /const PAYMENT_RECORD_KEY = 'legaldrop\.send-payment\.v1'/)
})

test('paid, then back through /send: a 401 on the quote does not replace the checkout owner', async () => {
  reset()
  seedGuest('owner-token', 'owner-1', 1 * HOUR)
  seedPayment()
  respond = (u) => (u.startsWith('/api/referral/quote') ? new Response('{}', { status: 401 }) : new Response('{}'))
  const response = await referralQuoteFetch({ vehicle: 'car' })
  assert.equal(response.status, 401)
  assert.equal(mints(), 0)
  assert.equal(storedToken(), 'owner-token')
})

test('paid, then through details more than 12 hours later: vehicle and DropBatch quotes keep the owner', async () => {
  reset()
  seedGuest('owner-token', 'owner-1', 30 * HOUR)
  seedPayment()
  await referralQuoteFetch({ vehicle: 'car' })
  await referralDropBatchQuoteFetch({ vehicle: 'car' })
  const used = calls.filter((c) => c.url.startsWith('/api/referral/')).map((c) => c.authorization)
  assert.deepEqual(used, ['Bearer owner-token', 'Bearer owner-token'])
  assert.equal(mints(), 0)
  assert.equal(storedToken(), 'owner-token')
})

test('a guest older than 12 hours is kept while a payment record exists, and recovery sends as that owner', async () => {
  reset()
  seedGuest('owner-token', 'owner-1', 48 * HOUR)
  seedPayment()
  const session = await getGuestSession()
  assert.equal(session.token, 'owner-token')
  const forced = await getGuestSession({ forceRefresh: true })
  assert.equal(forced.token, 'owner-token')
  assert.equal(mints(), 0)
  respond = () => new Response(JSON.stringify({ data: { trackingCode: 'T1' } }), { status: 201 })
  await submitPaidOrder({ paymentIntent: 'pi_owned' }, { ownerUserId: 'owner-1' })
  assert.equal(calls.at(-1).authorization, 'Bearer owner-token')
})

test('without a payment record, a NEW booking keeps today\'s rules: stale guests are cleared and 401s re-mint once', async () => {
  reset()
  seedGuest('stale-token', 'stale-user', 30 * HOUR)
  const fresh = await getGuestSession()
  assert.equal(fresh.token, 'minted-1')
  respond = (u) => (u.startsWith('/api/referral/quote') && calls.filter((c) => c.url.startsWith('/api/')).length === 1
    ? new Response('{}', { status: 401 })
    : new Response('{}'))
  await referralQuoteFetch({ vehicle: 'car' })
  assert.equal(mints(), 2)
  assert.equal(storedToken(), 'minted-2')
})

test('when no guest is stored at all, a new-booking call may still mint (nothing to lose); recovery never does', async () => {
  reset()
  seedPayment()
  await referralQuoteFetch({ vehicle: 'car' })
  assert.equal(mints(), 1)
  store.delete(GUEST_KEY)
  await assert.rejects(() => submitPaidOrder({ paymentIntent: 'pi_owned' }, { ownerUserId: 'owner-1' }), OrderIdentityUnavailableError)
  assert.equal(mints(), 1)
})

test('the stored guest is not the checkout owner: recovery refuses to send at all', async () => {
  reset()
  seedGuest('someone-else-token', 'someone-else', 1 * HOUR)
  seedPayment({ ownerUserId: 'owner-1' })
  await assert.rejects(
    () => submitPaidOrder({ paymentIntent: 'pi_owned' }, { ownerUserId: 'owner-1' }),
    OrderIdentityUnavailableError,
  )
  assert.equal(calls.filter((c) => c.url.endsWith('/order')).length, 0)
})

test('a record without an owner (written before D7c) still recovers; the backend remains the authority', async () => {
  reset()
  seedGuest('owner-token', 'owner-1', 1 * HOUR)
  respond = () => new Response(JSON.stringify({ data: { trackingCode: 'T1' } }), { status: 201 })
  const response = await submitPaidOrder({ paymentIntent: 'pi_owned' }, { ownerUserId: null })
  assert.equal(response.status, 201)
})

test('currentGuestUserId reads the stored owner without clearing, minting or sending', () => {
  reset()
  seedGuest('owner-token', 'owner-1', 30 * HOUR)
  assert.equal(currentGuestUserId(), 'owner-1')
  assert.equal(storedToken(), 'owner-token')
  assert.equal(calls.length, 0)
  store.set(GUEST_KEY, '{corrupt')
  assert.equal(currentGuestUserId(), null)
})
