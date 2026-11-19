import assert from 'node:assert/strict'
import { register } from 'node:module'
import test from 'node:test'

// D7 — AN ORDER FOR A PAID INTENT IS SUBMITTED AS THE GUEST THAT CREATED THE CHECKOUT.
//
// The backend accepts POST /order for a paid intent only from the user that owns its checkout
// (and returns an existing order idempotently, to that user only). Guest JWTs carry no expiry on
// the backend, while the site's 12-hour local TTL — and its 401 re-mint — would silently replace
// that owner with a NEW guest, which can never recover the payment and discards the one
// credential that could. submitPaidOrder therefore uses the stored token whatever its age, sends
// once, never mints and never re-mints.
//
// Network safety: the API base is pinned to an unresolvable .invalid host and fetch is replaced
// before the module loads; any request to another host fails the test instead of leaving the box.

process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.d7-recovery.invalid'
register(new URL('./helpers/module-alias-hooks.mjs', import.meta.url).href, import.meta.url)

const store = new Map()
globalThis.window = globalThis.window ?? {}
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}
const calls = []
let respond = () => new Response(JSON.stringify({ data: { trackingCode: 'TRK123' } }), { status: 201 })
globalThis.fetch = async (url, init = {}) => {
  const u = String(url)
  if (!u.startsWith('https://api.d7-recovery.invalid/')) throw new Error(`unexpected host: ${u}`)
  calls.push({ url: u, method: init.method, authorization: init.headers?.Authorization, body: init.body })
  return respond(u)
}

const { submitPaidOrder, OrderIdentityUnavailableError } = await import('../src/lib/guest-session.js')

const KEY = 'legaldrop.guest-session.v1'
const HOUR = 60 * 60 * 1000
const seedGuest = (token, ageMs) =>
  store.set(KEY, JSON.stringify({ token, userId: 'guest-1', createdAt: Date.now() - ageMs }))
const body = { paymentIntent: 'pi_test_original', receivers: [{ receiverName: 'Dana' }] }
const reset = () => {
  store.clear()
  calls.length = 0
  respond = () => new Response(JSON.stringify({ data: { trackingCode: 'TRK123' } }), { status: 201 })
}

test('submits POST /order once, as the stored guest, with the body unchanged', async () => {
  reset()
  seedGuest('token-original', 1 * HOUR)
  const response = await submitPaidOrder(body)
  assert.equal(response.status, 201)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.d7-recovery.invalid/order')
  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].authorization, 'Bearer token-original')
  assert.deepEqual(JSON.parse(calls[0].body), body)
})

test('a guest older than the 12-hour local TTL is still used, not replaced (backend guest tokens carry no expiry)', async () => {
  reset()
  seedGuest('token-from-yesterday', 30 * HOUR)
  await submitPaidOrder(body)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].authorization, 'Bearer token-from-yesterday')
  // The original credential is still there for a later retry.
  assert.equal(JSON.parse(store.get(KEY)).token, 'token-from-yesterday')
})

test('no stored guest (tab closed, storage lost): nothing is sent and no new guest is minted', async () => {
  reset()
  await assert.rejects(() => submitPaidOrder(body), OrderIdentityUnavailableError)
  assert.equal(calls.length, 0)
  assert.equal(store.has(KEY), false)
})

test('a 401 is returned as-is: no re-mint, no second request, the original guest is kept', async () => {
  reset()
  seedGuest('token-original', 1 * HOUR)
  respond = () => new Response('{}', { status: 401 })
  const response = await submitPaidOrder(body)
  assert.equal(response.status, 401)
  assert.equal(calls.length, 1)
  assert.equal(calls.filter((c) => c.url.endsWith('/auth/guest')).length, 0)
  assert.equal(JSON.parse(store.get(KEY)).token, 'token-original')
})

test('a corrupt stored guest is unavailable, never replaced', async () => {
  reset()
  store.set(KEY, '{not json')
  await assert.rejects(() => submitPaidOrder(body), OrderIdentityUnavailableError)
  assert.equal(calls.length, 0)
})
