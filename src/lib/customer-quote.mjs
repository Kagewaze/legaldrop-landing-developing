// Display values only. The backend owns all referral pricing and rounding.
export function normalizeCustomerQuote(raw) {
  if (!raw || typeof raw !== 'object') return null
  const minor = raw.finalCustomerTotalMinor
  const hasMinor = minor !== undefined
  if (hasMinor && (!Number.isSafeInteger(minor) || minor < 0)) return null
  const total = hasMinor ? minor / 100 : Number(raw.total)
  if (!Number.isFinite(total)) return null
  const lineItems = raw.lineItems ?? {}
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0
  // The backend's minimum fare adjustment. Kept only when it is positive, so a quote without
  // one is the very object it always was. Never computed here.
  const minimumAdjustment = number(lineItems.minimumAdjustment)
  return {
    lineItems: {
      base: number(lineItems.base),
      distance: number(lineItems.distance),
      extraPackage: number(lineItems.extraPackage),
      labour: number(lineItems.labour),
      heavyFee: number(lineItems.heavyFee),
      serviceFee: number(lineItems.serviceFee),
      ...(minimumAdjustment > 0 && { minimumAdjustment }),
    },
    total,
    finalCustomerTotalMinor: hasMinor ? minor : Math.round(total * 100),
    distanceKm: raw.distanceKm != null && Number.isFinite(Number(raw.distanceKm))
      ? Number(raw.distanceKm) : null,
  }
}
