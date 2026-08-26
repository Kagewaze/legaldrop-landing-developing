// Shared primitives for the two public tracking surfaces:
//
//   /track/[trackingCode]         → GET /public/track/:trackingCode
//   /track-partner/[trackingToken] → GET /public/track-partner/:trackingToken
//
// The two routes are keyed by DIFFERENT credentials. The customer route is
// keyed by the short, human-readable tracking code. The partner route is keyed
// by an opaque tracking token that the backend issues separately; the partner
// payload also carries the short `trackingCode`, but only as a display value.
// Substituting one for the other produces a URL the backend cannot resolve.
//
// This module is `.mjs` so Node's built-in test runner can import it directly
// (the package is CommonJS-typed for the PostCSS/Tailwind/Next config files).

// Terminal order statuses — confirmed against the backend's authoritative
// TaskStatusType (legal_drop_be, src/modules/order/entities/delivery_point.entity.ts),
// the 9-value type order.status is declared as. These 4 are the complete
// terminal set; the other 5 (pending, assigned, ongoing,
// awaiting_seller_confirmation, awaiting_handoff) are all non-terminal.
// Deliberately an allowlist (not "anything that isn't 'ongoing'") — an
// ACTIVE_STATUS === 'ongoing' check would freeze polling on 'assigned',
// 'awaiting_seller_confirmation', and 'awaiting_handoff', which are real
// states orders pass through.
export const TERMINAL_STATUSES = ['delivered', 'cancelled', 'failed', 'refunded']

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status)
}

// Builds the poll URL for either surface. `credential` is whatever keys that
// endpoint — the short code for /public/track, the opaque token for
// /public/track-partner. Encoded so a malformed path segment can never splice
// extra path into the request.
export function trackingPollUrl(endpoint, credential) {
  return `${endpoint}/${encodeURIComponent(credential ?? '')}`
}

// ⚠️ THE PARTNER PAGE USED TO PASS `trackingCode ?? trackingToken` AS THE
// POLLING CREDENTIAL. `buildPublicTracking` always returns a `trackingCode`,
// so that expression always selected the short display code — the server
// render (which correctly used the route token) succeeded and every
// subsequent client poll then 404'd against /public/track-partner/<code>,
// freezing the map, status and ETA on the page.
//
// The credential is the route token and nothing else. The payload is consulted
// only for the display code. Do not reintroduce a fallback here: if the
// payload has no code there is nothing to display, and the token is not a
// display value — it must not be rendered into visible labels.
export function partnerTrackingIdentity({ routeTrackingToken, payload }) {
  return {
    pollCredential: routeTrackingToken,
    displayCode: payload?.trackingCode ?? null,
  }
}

const defaultTimers = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
}

/**
 * Single-flight polling loop.
 *
 * INVARIANT: at most one request is in flight at any moment, and an older
 * response can never overwrite state produced by a newer one.
 *
 * It holds because the next tick is scheduled only in the `finally` of the
 * current tick — never on a fixed interval — so request N+1 cannot start until
 * request N has settled. A response therefore cannot arrive after a response
 * issued later than it. The `stopped` guard closes the remaining case: a
 * request still in flight when the loop is torn down (unmount, or the effect
 * restarting on a status change) is aborted, and its result is discarded even
 * if it resolves anyway.
 *
 * This replaced a `setInterval(poll, 6000)` in both tracking components, where
 * a slow request stayed outstanding while later ticks fired: a 14s response
 * could land after a 2s one issued 6s later and roll the driver's position,
 * status and ETA backwards.
 *
 * The first request fires one interval after start — the initial state comes
 * from the server render, so there is nothing to fetch on mount.
 *
 * @returns {() => void} stop — clears the pending timer and aborts any
 *   in-flight request. Safe to call more than once.
 */
export function startTrackingPoll({
  url,
  intervalMs,
  onData,
  fetchImpl,
  timers = defaultTimers,
  createAbortController = () => new AbortController(),
}) {
  const request = fetchImpl ?? ((...args) => globalThis.fetch(...args))

  let stopped = false
  let timerId = null
  let controller = null

  const schedule = () => {
    if (stopped || timerId !== null) {
      return
    }

    timerId = timers.setTimeout(tick, intervalMs)
  }

  async function tick() {
    timerId = null
    controller = createAbortController()

    try {
      const response = await request(url, {
        cache: 'no-store',
        signal: controller.signal,
      })

      if (stopped || !response?.ok) {
        return
      }

      const payload = await response.json()

      if (stopped || !payload?.success || !payload.data) {
        return
      }

      onData(payload.data)
    } catch (error) {
      // Transient failure or an abort from stop(). Keep the last known good
      // state on screen; the next tick retries.
    } finally {
      controller = null
      schedule()
    }
  }

  schedule()

  return function stop() {
    stopped = true

    if (timerId !== null) {
      timers.clearTimeout(timerId)
      timerId = null
    }

    if (controller) {
      controller.abort()
      controller = null
    }
  }
}
