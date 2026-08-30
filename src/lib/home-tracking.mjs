export function normalizeTrackingCode(value) {
  return String(value ?? '').trim().toUpperCase()
}

export function customerTrackingPath(value) {
  const trackingCode = normalizeTrackingCode(value)

  return trackingCode ? `/track/${encodeURIComponent(trackingCode)}` : null
}
