// The send flow's STORAGE CONTRACT, with no React in it.
//
// Extracted from src/lib/send-flow.js in Phase 7. That module is the booking
// flow's React context — createContext at module scope, hooks, a provider, a
// persistence effect — and importing it just to reuse a four-line validator
// would have pulled the whole context into the homepage bundle, on a page that
// must never mount SendFlowProvider.
//
// So the pieces that are pure data live here, and send-flow.js imports them.
// There is still exactly ONE definition of each; this file is the source and
// send-flow.js re-exports `hasBothAddresses` so its existing callers are
// untouched.
//
// ⚠️ ANY WRITER OF THIS KEY MUST SATISFY isPlace() FOR BOTH ENDPOINTS. The
// provider re-validates on read (send-flow.js readStored) and nulls anything
// that fails, so a malformed write does not corrupt the flow — it silently
// discards the address, which looks to a customer like the form lost their
// input. Validate before writing, not after.

// sessionStorage, not localStorage: one booking, one tab. The rationale is
// recorded in src/lib/guest-session.js — session lifetime matches one booking.
//
// The `.v1` suffix is a version marker with NO migration mechanism behind it.
// Forward compatibility is handled by readStored() merging the parsed object
// over EMPTY_STATE, so a record written before a field existed still yields
// every key. If the SHAPE of pickup/dropoff ever changes incompatibly, bump to
// .v2 with an explicit migration rather than mutating .v1 in place — there are
// live sessions holding the old shape.
export const SEND_FLOW_STORAGE_KEY = 'legaldrop.send-flow.v1'

// The address object every surface of the flow agrees on:
//
//   { address: string, lat: number, lng: number }
//
// Number.isFinite rather than a truthiness check on purpose: it rejects NaN,
// Infinity and null, all of which are what a failed geocode actually produces,
// and all of which would otherwise sail into a quote request as coordinates.
export function isPlace(value) {
  return (
    value &&
    typeof value.address === 'string' &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng)
  )
}

// Both endpoints of the journey are known. Every downstream step depends on
// this, so it lives here rather than being re-derived per page.
export function hasBothAddresses(state) {
  return isPlace(state?.pickup) && isPlace(state?.dropoff)
}
