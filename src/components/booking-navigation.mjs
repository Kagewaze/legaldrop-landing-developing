export const BOOKING_ROUTES = ['/send', '/send/details', '/send/pay', '/drop-batch/request']
const SEND_STEPS = ['/send', '/send/details', '/send/pay']

export function bookingTransitionPlan(from, to, marketingRoutes) {
  if (from === to || !BOOKING_ROUTES.includes(to)) return null
  if (marketingRoutes.includes(from)) return { direction: 'forward', bridge: true }
  if (!BOOKING_ROUTES.includes(from)) return null
  const previous = SEND_STEPS.indexOf(from)
  const next = SEND_STEPS.indexOf(to)
  // The standalone quote form is not a fourth send step. Its handoff is neutral.
  return { direction: previous < 0 || next < 0 ? 'neutral' : next > previous ? 'forward' : 'back', bridge: false }
}

export function eligibleBookingHref(event, anchor, current, location, marketingRoutes) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null
  // Only the existing error/requote return links leave payment with motion.
  // Header exits and all payment actions retain immediate normal navigation.
  if (current === '/send/pay' && !anchor.hasAttribute('data-booking-return')) return null
  const raw = anchor.getAttribute('href')
  if (!raw || raw.startsWith('#')) return null
  let url
  try { url = new URL(raw, location.href) } catch { return null }
  if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol) || url.hash || url.search) return null
  return bookingTransitionPlan(current, url.pathname, marketingRoutes) ? url.pathname : null
}

export function bookingSurfaceAvailable(doc, current) {
  // Snapshot only closed form states, never an open address/selection overlay.
  const overlays = doc.querySelectorAll('[role="listbox"], .pac-container')
  if (Array.from(overlays).some(node => node.getClientRects().length > 0)) return false
  if (current === '/send/pay' && doc.querySelector('[data-booking-route="/send/pay"] iframe')) return false
  return true
}

// Different steps intentionally name different safe panels. Retain the old
// bitmap's original geometry instead of stretching it into the new panel.
// These are one-time snapshot coordinates, never live layout or scrolling.
export function bookingSurfaceRect(doc) {
  return doc.querySelector('[data-booking-surface], [data-marketing-route]')?.getBoundingClientRect()
}

export function positionBookingSnapshot(doc, oldRect) {
  const nextRect = bookingSurfaceRect(doc)
  if (!oldRect || !nextRect) return false
  doc.documentElement.style.setProperty('--booking-old-x', `${oldRect.left - nextRect.left}px`)
  doc.documentElement.style.setProperty('--booking-old-y', `${oldRect.top - nextRect.top}px`)
  doc.documentElement.style.setProperty('--booking-old-width', `${oldRect.width}px`)
  return true
}

export function clearBookingSnapshot(doc) {
  for (const property of ['--booking-old-x', '--booking-old-y', '--booking-old-width']) doc.documentElement.style.removeProperty(property)
}
