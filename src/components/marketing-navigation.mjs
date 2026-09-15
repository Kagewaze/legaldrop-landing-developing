import { bookingTransitionPlan, bookingSurfaceAvailable, bookingSurfaceRect, positionBookingSnapshot, clearBookingSnapshot } from './booking-navigation.mjs'

// Exact allowlist, shared by link eligibility and commit verification.
export const MARKETING_ROUTES = ['/', '/medical', '/legal', '/drop-batch', '/contact-us']

export function eligibleMarketingHref(event, anchor, current, location) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  if (!MARKETING_ROUTES.includes(current) || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null
  const raw = anchor.getAttribute('href')
  if (!raw || raw.startsWith('#')) return null
  let url
  try { url = new URL(raw, location.href) } catch { return null }
  if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol) || url.hash || url.search || url.pathname === current || !MARKETING_ROUTES.includes(url.pathname)) return null
  return url.pathname
}

// Imperative state is confined to one native transition. DOM observation lasts
// only until the route marker commits (streamed children can follow pathname).
export function createMarketingNavigation({ doc, push, observe, reduced }) {
  let pending = null
  let pathname = null
  function cleanup(job) {
    job.disconnect?.()
    job.resolve?.()
    if (pending === job) {
      pending = null
      doc.documentElement.removeAttribute(job.booking ? 'data-druppr-booking' : 'data-druppr-vt')
      if (job.booking) clearBookingSnapshot(doc)
    }
  }
  function cancel() {
    if (!pending) return
    const job = pending
    job.transition?.skipTransition()
    cleanup(job)
  }
  function checkCommit() {
    const job = pending
    if (!job || !job.resolve || pathname !== job.href) return
    const surface = doc.querySelector(`[${job.booking ? 'data-booking-route' : 'data-marketing-route'}="${job.href}"]`)
    if (!surface) return
    if (job.booking) {
      try {
        if (!positionBookingSnapshot(doc, job.bookingRect)) { cancel(); return }
      } catch { cancel(); return }
    }
    // Persist on this DOM instance after native completion, so removing the
    // active flag cannot restart Pass 4's fallback entrance a second time.
    if (!job.booking) surface.setAttribute('data-native-arrived', '')
    job.disconnect?.()
    job.resolve()
    job.resolve = null
  }
  return {
    commit(nextPathname) {
      pathname = nextPathname
      if (pending && pathname !== pending.from && pathname !== pending.href) cancel()
      checkCommit()
    },
    cancel,
    navigate(href, workflow = false) {
      const booking = workflow ? bookingTransitionPlan(pathname, href, MARKETING_ROUTES) : null
      if (workflow ? !booking : (!MARKETING_ROUTES.includes(pathname) || !MARKETING_ROUTES.includes(href) || href === pathname)) return false
      if (reduced() || typeof doc.startViewTransition !== 'function') return false
      let bookingRect
      try {
        if (booking) {
          if (!bookingSurfaceAvailable(doc, pathname)) return false
          bookingRect = bookingSurfaceRect(doc)
          if (!bookingRect) return false
        }
      } catch { return false }
      cancel()
      const job = { href, from: pathname, started: false, booking, bookingRect }
      pending = job
      try {
        // Initialize observation before taking over a link; setup failure leaves
        // the original Next Link activation intact.
        job.disconnect = observe(checkCommit)
        doc.documentElement.setAttribute(booking ? 'data-druppr-booking' : 'data-druppr-vt', booking?.direction ?? '')
        job.transition = doc.startViewTransition(() => {
          // A superseded/skipped callback must never push an obsolete route.
          if (pending !== job) return
          return new Promise((resolve, reject) => {
            job.resolve = resolve
            try {
              push(href)
              job.started = true
              checkCommit()
            } catch (error) {
              reject(error)
            }
          })
        })
        const failed = () => {
          const ownsNavigation = pending === job
          job.transition.skipTransition()
          cleanup(job)
          // API failure before its update callback must not swallow the link.
          if (ownsNavigation && !job.started) push(href)
        }
        job.transition.ready.catch(failed)
        job.transition.updateCallbackDone.catch(failed)
        job.transition.finished.then(() => cleanup(job), failed)
        return true
      } catch {
        cleanup(job)
        return false
      }
    },
  }
}
