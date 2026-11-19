// Adopted, test-only, from the fresh-context D7c review (review-evidence/d7c-final-independent-review/runtime/harness.mjs).
// Real-React runtime harness for the D7c pay page (independent review, test-only).
//
// SAFETY, established BEFORE any worktree module is imported:
//   - NEXT_PUBLIC_API_BASE_URL is pinned to an unresolvable .invalid host (config.js otherwise
//     falls back to the PRODUCTION API host);
//   - globalThis.fetch is replaced by a router that answers only the review's synthetic routes and
//     throws (and records a violation) for anything else, so no request can leave the process;
//   - Stripe is a fake (mocks/stripe-js.mjs); no Stripe script, key or network is involved.
import { register } from 'node:module'
import { installDom, all, reactProps } from './dom-shim.mjs'

export const API = 'https://api.d7c-review.invalid'
process.env.NEXT_PUBLIC_API_BASE_URL = API
process.env.NODE_ENV = 'development'
process.env.NEXT_TELEMETRY_DISABLED = '1'

const { document, window } = installDom()
export { document, window, reactProps as reactPropsOf }
globalThis.IS_REACT_ACT_ENVIRONMENT = true

export const store = new Map()
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)) },
  removeItem: (k) => { store.delete(k) },
}

export const violations = []
export const requests = []
globalThis.fetch = async (url, init = {}) => {
  const u = String(url)
  const entry = {
    url: u,
    method: init.method ?? 'GET',
    authorization: init.headers?.Authorization ?? init.headers?.authorization ?? null,
    body: init.body === undefined ? undefined : JSON.parse(init.body),
  }
  requests.push(entry)
  const handler = globalThis.__T?.route
  const response = handler ? await handler(entry) : undefined
  if (!response) {
    violations.push(u)
    throw new TypeError(`review harness: unexpected request ${entry.method} ${u}`)
  }
  return response
}

register(new URL('./hooks.mjs', import.meta.url).href, import.meta.url)

export const React = await import('react')
const ReactDOMClient = await import('react-dom/client')
const TestUtils = await import('react-dom/test-utils')
export const act = TestUtils.act ?? TestUtils.default.act
const createRoot = ReactDOMClient.createRoot ?? ReactDOMClient.default.createRoot

const config = await import('@/lib/config')
if (config.API_BASE_URL !== API) throw new Error('API base not pinned: ' + config.API_BASE_URL)

export const sendFlow = await import('@/lib/send-flow')
export const { buildOrderPayload } = await import('@/components/send/buildOrderPayload')
const pageModule = await import('@/app/send/pay/page.jsx')
export const SendPayPage = pageModule.default

export const KEYS = {
  guest: 'legaldrop.guest-session.v1',
  payment: 'legaldrop.send-payment.v1',
  flow: 'legaldrop.send-flow.v1',
}
export const HOUR = 60 * 60 * 1000

export const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export function flowState(over = {}) {
  return {
    pickup: { address: '1 Synthetic Origin St', lat: 43.65, lng: -79.38 },
    dropoff: { address: '2 Synthetic Dest Ave', lat: 43.7, lng: -79.4 },
    packageCount: 1,
    weight: 'light',
    vehicle: 'car',
    pricingMode: 'standard',
    dropBatchSelectionKey: null,
    section: 'other',
    pickupTiming: 'instant',
    scheduledPickupAt: null,
    scheduledDate: '',
    scheduledTime: '',
    contact: {
      senderName: 'Test Sender',
      senderPhone: '+15555550101',
      receiverName: 'Test Receiver',
      receiverPhone: '+15555550102',
      receiverEmail: '',
      receiverNote: '',
    },
    ...over,
  }
}

export const QUOTE = { finalCustomerTotalMinor: 2575, total: 25.75, lineItems: { base: 20, serviceFee: 5.75 }, distanceKm: 7.4 }

// Fresh per-scenario state. `route` answers the synthetic network.
export function resetScenario(over = {}) {
  store.clear()
  requests.length = 0
  window.location.reloads = 0
  let orderCounter = 0
  globalThis.__T = {
    redirects: [],
    elementsOptions: [],
    retrieveCalls: [],
    confirmCalls: [],
    loadStripeCalls: [],
    contactOnChange: null,
    retrieve: async () => { throw new Error('retrieve not configured') },
    confirm: async () => { throw new Error('confirm not configured') },
    order: () => json(201, { data: { trackingCode: 'TRKSYNTH' + ++orderCounter } }),
    quote: () => json(200, { data: QUOTE }),
    checkout: () => json(200, {
      data: { fee: 25.75, amountMinor: 2575, referralAdjustmentMinor: 0, paymentIntentId: 'pi_synth_A', paymentIntentSecret: 'pi_synth_A_secret_x' },
    }),
    mint: () => json(201, { data: { token: 'tok-minted', userId: 'user-minted' } }),
    route: async (r) => {
      const T = globalThis.__T
      if (r.url === API + '/base/config') return json(200, { data: { stripe: { STRIPE_PUB_KEY: 'pk_test_synthetic_review' } } })
      if (r.url === '/api/referral/quote') return T.quote(r)
      if (r.url === '/api/referral/checkout') return T.checkout(r)
      if (r.url === API + '/order' && r.method === 'POST') return T.order(r)
      if (r.url === API + '/auth/guest') return T.mint(r)
      return undefined
    },
    ...over,
  }
  return globalThis.__T
}

export function seedGuest({ token = 'tok-owner', userId = 'user-owner', ageMs = HOUR } = {}) {
  store.set(KEYS.guest, JSON.stringify({ token, userId, createdAt: Date.now() - ageMs }))
}
export function seedFlow(over = {}) {
  const state = flowState(over)
  store.set(KEYS.flow, JSON.stringify(state))
  return state
}
export function seedPayment(record) { store.set(KEYS.payment, JSON.stringify(record)) }
export const readPayment = () => (store.has(KEYS.payment) ? JSON.parse(store.get(KEYS.payment)) : null)
export const readGuest = () => (store.has(KEYS.guest) ? JSON.parse(store.get(KEYS.guest)) : null)

export function paidRecord(state, over = {}) {
  const quote = { ...QUOTE }
  return {
    inputsHash: sendFlow.paymentInputsHash(state),
    paymentIntentId: 'pi_synth_A',
    clientSecret: 'pi_synth_A_secret_x',
    fee: 25.75,
    referralAdjustment: 0,
    ownerUserId: 'user-owner',
    orderPayload: buildOrderPayload({ flow: state, quote, paymentIntentId: 'pi_synth_A' }),
    ...over,
  }
}

export async function settle(rounds = 40) {
  for (let i = 0; i < rounds; i++) {
    await act(async () => { await new Promise((r) => setImmediate(r)) })
  }
}

// A "tab": a fresh React root around the real SendFlowProvider + the real pay page.
export async function mountTab() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(sendFlow.SendFlowProvider, null, React.createElement(SendPayPage)))
  })
  await settle()
  const tab = {
    container,
    root,
    text: () => container.textContent,
    buttons: () => all(container, (n) => n.nodeType === 1 && n.tagName === 'BUTTON'),
    button(label) {
      return tab.buttons().find((b) => b.textContent.includes(label)) ?? null
    },
    async click(label) {
      const b = tab.button(label)
      if (!b) throw new Error(`no button "${label}" in: ${tab.text().slice(0, 300)}`)
      const props = reactProps(b)
      if (props.disabled) throw new Error(`button "${label}" is disabled`)
      await act(async () => { props.onClick({ preventDefault() {}, stopPropagation() {} }) })
      await settle()
    },
    // Fires onClick twice in the same tick (a double click before React re-renders).
    async doubleClick(label) {
      const b = tab.button(label)
      const props = reactProps(b)
      await act(async () => {
        props.onClick({ preventDefault() {}, stopPropagation() {} })
        props.onClick({ preventDefault() {}, stopPropagation() {} })
      })
      await settle()
    },
    async unmount() {
      await act(async () => { root.unmount() })
      document.body.removeChild(container)
    },
  }
  return tab
}

// Browser reload: the tab's React state is gone, sessionStorage survives.
export async function reload(tab) {
  await tab.unmount()
  return mountTab()
}

export const count = (pred) => requests.filter(pred).length
export const orderPosts = () => requests.filter((r) => r.url === API + '/order')
export const mints = () => count((r) => r.url === API + '/auth/guest')
export const quoteCalls = () => count((r) => r.url === '/api/referral/quote')
export const checkoutCalls = () => count((r) => r.url === '/api/referral/checkout')
