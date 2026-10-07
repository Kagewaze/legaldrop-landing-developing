// Positive allowlist for a referral quote, and the reconciliation that guards it.
//
// A referral quote is only forwarded to the browser when the lines the backend returned add up,
// to the cent, to the total it will charge. A stale backend release, an expired session or a
// response shape this site does not understand must never underquote a referral: anything that
// does not reconcile is refused, and the proxy answers 503.
//
// THE BACKEND IS THE ONLY PRICING AUTHORITY. Nothing here prices anything. Every amount below is
// read from the backend response and compared with the backend's own total; none is derived.
//
// MINIMUM FARE. When the backend holds a delivery to its minimum fare it reports what it added as
// `lineItems.minimumAdjustment`. That is a legitimate pricing component, so it takes part in the
// reconciliation exactly like the lines beside it. It is forwarded only when it is positive: a
// quote where it is absent or zero produces the very object it always did.
//
// The allowlist is deliberately explicit. A component that is not named here is not summed, so a
// quote carrying one falls short of its total and is refused — the same fail-closed answer an
// old-contract quote has always had. Admitting a new component means naming it here.
const FARE_LINES = [
  'base',
  'distance',
  'extraPackage',
  'labour',
  'heavyFee',
  'serviceFee',
]

const isAmount = (value) =>
  value === undefined || (Number.isFinite(value) && value >= 0)
const toMinor = (value) => Math.round((value ?? 0) * 100)

export function customerReferralQuote(quote) {
  const minor = quote?.finalCustomerTotalMinor
  const lines = quote?.lineItems
  const validLines =
    lines &&
    FARE_LINES.every((key) => isAmount(lines[key])) &&
    isAmount(lines.minimumAdjustment)
  const minimumAdjustmentMinor = validLines
    ? toMinor(lines.minimumAdjustment)
    : NaN
  const sumMinor = validLines
    ? FARE_LINES.reduce(
        (sum, key) => sum + toMinor(lines[key]),
        minimumAdjustmentMinor,
      )
    : NaN

  if (
    !Number.isSafeInteger(minor) ||
    minor < 0 ||
    quote?.currency !== 'CAD' ||
    sumMinor !== minor ||
    !Number.isFinite(quote?.distanceKm)
  ) {
    return null
  }

  const lineItems = Object.fromEntries(
    FARE_LINES.map((key) => [key, lines[key] ?? 0]),
  )
  if (minimumAdjustmentMinor > 0) {
    lineItems.minimumAdjustment = lines.minimumAdjustment
  }

  return {
    lineItems,
    total: minor / 100,
    finalCustomerTotalMinor: minor,
    currency: 'CAD',
    distanceKm: quote.distanceKm,
    vehicle: quote.vehicle,
  }
}
