import { API_BASE_URL } from '@/lib/config'

// Guest session for the send flow.
//
// The booking flow is usable without an account: the backend mints a throwaway
// guest identity, and the resulting token authenticates the three calls the
// flow needs (quote, fee/PaymentIntent, order creation).
//
// Browser-only. Nothing here runs or makes sense on the server.

const GUEST_ENDPOINT = `${API_BASE_URL}/auth/guest`

// sessionStorage, deliberately — NOT localStorage.
//
// sessionStorage matches the lifetime of the thing it represents: one booking,
// in one tab. It survives a refresh (so refreshing mid-flow does not silently
// mint a second guest user, which is the whole point) and dies when the tab
// closes, so a guest identity is not left behind on a shared or public machine.
//
// localStorage would persist for weeks, inviting expired-token errors long after
// the booking, and would leak the identity across sessions on a shared device.
// A cookie would not help: the API is a different origin, so nothing is attached
// automatically and the token has to travel in an Authorization header anyway.
const STORAGE_KEY = 'legaldrop.guest-session.v1'

// A booking takes minutes. This bound exists for the tab left open overnight —
// past it, a fresh token is cheaper than a confusing 401 mid-payment.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

// Module-level promise singleton. THE important part of this file.
//
// Without it, every concurrent caller mints its own guest user: React
// StrictMode double-invokes effects in development, and two steps of the flow
// can ask for a token in the same tick. That silently creates duplicate guest
// users on the backend on every page load, and burns the rate limit below.
let inFlightRequest = null

export class GuestSessionError extends Error {
  constructor(message, { status = null, cause = null } = {}) {
    super(message)
    this.name = 'GuestSessionError'
    this.status = status
    this.cause = cause
  }
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

// The send flow's payment record (send-flow.js PAYMENT_STORAGE_KEY; a test keeps the two equal).
// While it exists, "a PaymentIntent exists and no order has been created for it yet" — and the
// backend will create that order only for the guest that owns its checkout. So, while it exists,
// the stored guest is kept whatever its age and is never replaced by a re-mint, on every page of
// the flow. Read raw: a corrupt record still counts, so the owner is kept (fail closed).
const PAYMENT_RECORD_KEY = 'legaldrop.send-payment.v1'

function paymentRecordPresent() {
  if (!isBrowser()) {
    return false
  }

  try {
    return sessionStorage.getItem(PAYMENT_RECORD_KEY) !== null
  } catch (error) {
    return false
  }
}

// Never log or serialise the token beyond this module. It is a bearer
// credential: anything holding it can act as this guest.
function readStoredSession() {
  if (!isBrowser()) {
    return null
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    if (
      typeof parsed?.token !== 'string' ||
      parsed.token.length === 0 ||
      typeof parsed?.createdAt !== 'number'
    ) {
      return null
    }

    // The TTL never retires the owner of an unresolved checkout (see PAYMENT_RECORD_KEY).
    if (Date.now() - parsed.createdAt > SESSION_TTL_MS && !paymentRecordPresent()) {
      clearGuestSession()
      return null
    }

    return parsed
  } catch (error) {
    // Corrupt or unreadable (private mode, quota, hostile extension) — treat as
    // absent rather than throwing.
    return null
  }
}

function writeStoredSession(session) {
  if (!isBrowser()) {
    return
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch (error) {
    // Storage unavailable. The session still works for this page's lifetime;
    // only refresh-survival is lost. Not worth failing the booking over.
  }
}

export function clearGuestSession() {
  if (!isBrowser()) {
    return
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    // Nothing useful to do.
  }
}

async function mintGuestSession() {
  let response

  try {
    response = await fetch(GUEST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
    })
  } catch (error) {
    throw new GuestSessionError(
      'Could not reach the server to start your session.',
      { cause: error },
    )
  }

  if (!response.ok) {
    // NEVER retry here, and never in a loop.
    //
    // This endpoint is throttled to 20 requests per 60s PER IP. Everyone behind
    // one NAT — an office, a clinic, a coffee shop — shares that budget. A
    // retry loop does not just fail for this visitor, it locks out every other
    // visitor on the same network. Fail closed and surface it.
    const message =
      response.status === 429
        ? 'Too many requests from your network. Please wait a minute and try again.'
        : 'Could not start your session. Please try again.'

    throw new GuestSessionError(message, { status: response.status })
  }

  let payload

  try {
    payload = await response.json()
  } catch (error) {
    throw new GuestSessionError('The server returned an unreadable response.', {
      cause: error,
    })
  }

  // Documented as { token, userId }. Other endpoints in this backend wrap
  // responses in { success, data }, so accept either rather than breaking if
  // this one is normalised later.
  const source = payload?.data ?? payload
  const token = typeof source?.token === 'string' ? source.token : null
  const userId = source?.userId ?? null

  if (!token) {
    throw new GuestSessionError('The server did not return a session token.')
  }

  const session = { token, userId, createdAt: Date.now() }
  writeStoredSession(session)

  return session
}

// Returns { token, userId, createdAt }, reusing the stored session when valid.
//
// Pass { forceRefresh: true } to discard the stored session and mint a new one
// — used by the 401 path in guestFetch, and nowhere else.
export function getGuestSession({ forceRefresh = false } = {}) {
  if (!isBrowser()) {
    return Promise.reject(
      new GuestSessionError('Guest sessions are browser-only.'),
    )
  }

  if (forceRefresh) {
    // Never replace the owner of an unresolved checkout: keep it and mint nothing. A caller's
    // retry then meets the same answer from the backend and reports it. Only when no guest is
    // stored at all may a new one be minted below — there is nothing to lose.
    const owner = paymentRecordPresent() ? readStoredSession() : null

    if (owner) {
      return Promise.resolve(owner)
    }

    clearGuestSession()
  } else {
    const stored = readStoredSession()

    if (stored) {
      return Promise.resolve(stored)
    }
  }

  // Share any request already in flight — including across a forceRefresh,
  // since an in-flight mint is already producing a fresh token.
  if (!inFlightRequest) {
    inFlightRequest = mintGuestSession().finally(() => {
      inFlightRequest = null
    })
  }

  return inFlightRequest
}

// Authenticated fetch against the backend.
//
//   const response = await guestFetch('/order/quote-itemized', {
//     method: 'POST',
//     body: { senderLocation, receivers, vehicle },
//   })
//
// `path` is relative to API_BASE_URL and should start with '/'. `body` is a
// plain object and is serialised here. Returns the raw Response so callers own
// status handling — this helper deliberately does not decide what a non-200
// means for a quote versus an order.
export async function guestFetch(
  path,
  { method = 'GET', body, headers = {}, ...rest } = {},
) {
  const send = (session) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        Authorization: `Bearer ${session.token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    })

  const session = await getGuestSession()
  const response = await send(session)

  if (response.status !== 401) {
    return response
  }

  // Expired or rejected token: re-mint ONCE, retry ONCE, then stop regardless
  // of the outcome. No loop — see the rate-limit note in mintGuestSession.
  const refreshed = await getGuestSession({ forceRefresh: true })

  return send(refreshed)
}

// The stored guest could not be used to submit an order for a paid intent: there is none, it is
// unreadable, or it is not the guest that owns the checkout.
export class OrderIdentityUnavailableError extends Error {
  constructor() {
    super(
      'Your original booking session is no longer available on this device. Contact us with the payment reference and we will complete your order.',
    )
    this.name = 'OrderIdentityUnavailableError'
  }
}

function readStoredSessionAnyAge() {
  if (!isBrowser()) {
    return null
  }

  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    return typeof parsed?.token === 'string' && parsed.token.length > 0 ? parsed : null
  } catch (error) {
    return null
  }
}

// The stored guest's user id, read without clearing, minting or sending — recorded in the
// payment record as the checkout's owner. A label for a fail-closed client-side check only: the
// backend alone decides who owns a checkout.
export function currentGuestUserId() {
  const userId = readStoredSessionAnyAge()?.userId
  return typeof userId === 'string' && userId.length > 0 ? userId : null
}

// POST /order for an ALREADY-PAID intent, as the guest that created its checkout.
//
// The backend accepts it only from the user that owns the checkout (and returns an existing order
// idempotently, to that user only). Backend guest tokens carry no expiry, so the stored token is
// used whatever its age — the 12-hour TTL above is a convenience for NEW bookings and must not
// replace the owner of a paid one. It sends ONCE: no mint when nothing is stored, no re-mint on
// 401. A new guest could never recover this payment, and minting one would overwrite the only
// credential that can.
//
// `ownerUserId` is the owner recorded with the payment. When both it and the stored guest's id are
// known and differ, nothing is sent: that guest is a stranger to this checkout. When either is
// unknown (a record written before owners were recorded), the request is sent and the backend's
// ownership check decides — the client never treats its own record as authorization.
export async function submitPaidOrder(body, { ownerUserId = null } = {}) {
  const session = readStoredSessionAnyAge()

  if (!session) {
    throw new OrderIdentityUnavailableError()
  }

  if (
    typeof ownerUserId === 'string' &&
    typeof session.userId === 'string' &&
    session.userId !== ownerUserId
  ) {
    throw new OrderIdentityUnavailableError()
  }

  return fetch(`${API_BASE_URL}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
}

// Same-origin checkout proxy keeps the HttpOnly referral reference outside browser JavaScript.
export async function referralCheckoutFetch(body) {
  const send = async (forceRefresh = false) => {
    const session = await getGuestSession({ forceRefresh })
    return fetch('/api/referral/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.token,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  }
  const response = await send(false)
  return response.status === 401 ? send(true) : response
}

// DropBatch uses the same guest identity and a separate, pure server-side proxy.
export async function referralDropBatchQuoteFetch(body, { signal } = {}) {
  const send = async (forceRefresh = false) => {
    const session = await getGuestSession({ forceRefresh })
    return fetch('/api/referral/dropbatch-quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.token,
      },
      body: JSON.stringify(body),
      signal,
      cache: 'no-store',
    })
  }
  const response = await send(false)
  return response.status === 401 ? send(true) : response
}

// Pure same-origin quote proxy; the referral capability remains in the HttpOnly cookie.
export async function referralQuoteFetch(body) {
  const send = async (forceRefresh = false) => {
    const session = await getGuestSession({ forceRefresh })
    return fetch('/api/referral/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + session.token,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  }
  const response = await send(false)
  return response.status === 401 ? send(true) : response
}
