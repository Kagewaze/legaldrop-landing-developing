import 'server-only'

import { API_BASE_URL } from '@/lib/config'

// Public operational metrics for the home page's proof band.
//
// SERVER ONLY, and modelled deliberately on src/lib/google-reviews.js — same
// shape, same failure discipline, same revalidate mechanism. The two are the
// only data feeds the marketing site has, and they should not drift into two
// different conventions. If you change the error handling here, read that file
// first and change both.
//
// The 'server-only' import is a build-time guard: pulling this into a Client
// Component fails the build loudly instead of quietly shipping a fetch into the
// browser bundle. Nothing here is secret — the endpoint is public and
// unauthenticated — but the whole point of this module is that the homepage
// makes NO runtime request from the browser, and the guard is what stops that
// invariant being broken by accident.
//
// ── WHY revalidate AND NOT POLLING ──────────────────────────────────────────
//
// The home route is `○ (Static)`. With `next: { revalidate: SECONDS }` the
// response is cached by Next's Data Cache and shared across every visitor: the
// fetch runs at build time and then at most once per window, with the first
// request after expiry triggering a background regeneration while the cached
// page is still served. Steady-state cost is one request per 120s regardless of
// traffic, and the browser makes none.
//
// A client-side poll would have cost an interactive island. docs/HOMEPAGE.md
// gate E5 caps the home route at 4 and it is at 4 — see the note in
// OperationalProof.jsx. This module exists so that ceiling is not touched.
const METRICS_ENDPOINT = `${API_BASE_URL}/public/metrics`

// 120s. Short enough that a new delivery is reflected within a couple of
// minutes, long enough that the backend sees one request per window rather than
// one per visitor. These are counts that move a few times a day at current
// volume; there is nothing to gain from a tighter window.
const REVALIDATE_SECONDS = 120

// Returns { deliveriesCompleted, driversRegistered } or null.
//
// NULL ON EVERY FAILURE PATH — non-2xx, network error, malformed JSON, a body
// that is not an object, `success` not true, a missing `data` envelope, or a
// value that is not a finite non-negative number.
//
// The caller renders the section WITHOUT those two figures when this is null.
// It never renders 0, a dash, or a placeholder: a proof band exists to be
// believed, and a fabricated or defaulted figure on it is worse than an absent
// one. `0` is the dangerous case specifically — it is a plausible-looking real
// number, and "0 completed deliveries" is a claim this business would never
// make on purpose.
//
// ALL OR NOTHING, deliberately. If either figure fails validation the whole
// result is null rather than a partial object. Mixing one live figure with one
// silently-missing one would leave the band internally inconsistent with no
// way for a reader to tell which is which. google-reviews.js takes the same
// position on rating vs. userRatingCount.
export async function getOperationalMetrics() {
  try {
    const response = await fetch(METRICS_ENDPOINT, {
      next: { revalidate: REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()

    // The API wraps its result: { success, data, message }. A 200 carrying
    // success:false is a failure, and checking the status alone would miss it.
    if (!payload || typeof payload !== 'object' || payload.success !== true) {
      return null
    }

    const data = payload.data

    if (!data || typeof data !== 'object') {
      return null
    }

    const deliveriesCompleted = Number(data.deliveriesCompleted)
    const driversRegistered = Number(data.driversRegistered)

    // Number() turns null, undefined and '' into 0 or NaN, so this guard is
    // what separates "the field was absent" from "the field was genuinely 0".
    // Both figures must be finite AND non-negative; a negative count is a
    // backend fault, not a number to publish.
    if (
      !Number.isFinite(deliveriesCompleted) ||
      !Number.isFinite(driversRegistered) ||
      deliveriesCompleted < 0 ||
      driversRegistered < 0
    ) {
      return null
    }

    return { deliveriesCompleted, driversRegistered }
  } catch (error) {
    // Network failure, DNS, timeout, invalid JSON — all handled identically,
    // and all silently. A marketing proof band is not important enough to log
    // noise on every ISR regeneration, and not important enough to break a page
    // over.
    return null
  }
}
