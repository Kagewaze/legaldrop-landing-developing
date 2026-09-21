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
  return {
    lineItems: {
      base: number(lineItems.base),
      distance: number(lineItems.distance),
      extraPackage: number(lineItems.extraPackage),
      labour: number(lineItems.labour),
      heavyFee: number(lineItems.heavyFee),
      serviceFee: number(lineItems.serviceFee),
    },
    total,
    finalCustomerTotalMinor: hasMinor ? minor : Math.round(total * 100),
    distanceKm: raw.distanceKm != null && Number.isFinite(Number(raw.distanceKm))
      ? Number(raw.distanceKm) : null,
  }
}
