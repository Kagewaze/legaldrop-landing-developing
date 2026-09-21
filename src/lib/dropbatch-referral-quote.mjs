// Positive allowlist for the public DropBatch quote. No referral capability or
// commercial identity may cross the server/browser boundary.
export function customerDropBatchQuote(value, referralPresent) {
  if (value?.eligible === false)
    return { eligible: false, reason: typeof value.reason === 'string' ? value.reason : 'unavailable' }
  if (value?.eligible !== true || !Number.isFinite(value.routeDistanceKm) ||
      !Number.isFinite(value.senderPays) || value.senderPays < 0) return null
  if (!referralPresent)
    return { eligible: true, routeDistanceKm: value.routeDistanceKm, senderPays: value.senderPays }

  const minor = value.finalCustomerTotalMinor
  const fare = value.lineItems?.deliveryFare
  const fee = value.lineItems?.serviceFee
  if (!Number.isSafeInteger(minor) || minor < 0 || value.currency !== 'CAD' ||
      !Number.isFinite(fare) || fare < 0 || !Number.isFinite(fee) || fee < 0 ||
      Math.round(fare * 100) + Math.round(fee * 100) !== minor ||
      Math.round(value.senderPays * 100) !== minor) return null
  return {
    eligible: true,
    routeDistanceKm: value.routeDistanceKm,
    senderPays: minor / 100,
    finalCustomerTotalMinor: minor,
    currency: 'CAD',
    lineItems: { deliveryFare: fare, serviceFee: fee },
  }
}
