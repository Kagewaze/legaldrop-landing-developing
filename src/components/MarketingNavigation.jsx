"use client"

import { createContext, forwardRef, useContext, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createMarketingNavigation, eligibleMarketingHref, MARKETING_ROUTES } from './marketing-navigation.mjs'

import { eligibleBookingHref } from './booking-navigation.mjs'

const Navigation = createContext(null)

// One persistent coordinator; server-rendered children pass through unchanged.
export function MarketingNavigation({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const coordinator = useRef(null)
  useLayoutEffect(() => {
    const controller = createMarketingNavigation({
      doc: document,
      push: (href) => router.push(href),
      reduced: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      observe: (check) => {
        const observer = new MutationObserver(check)
        observer.observe(document.body, { childList: true, subtree: true })
        return () => observer.disconnect()
      },
    })
    coordinator.current = controller
    return () => { controller.cancel(); coordinator.current = null }
  }, [router])
  // Layout effects run after React's DOM mutations. Pathname alone is not
  // enough: the controller also requires the destination's server DOM marker.
  useLayoutEffect(() => { coordinator.current?.commit(pathname) }, [pathname, router])
  return <Navigation.Provider value={coordinator}>{children}</Navigation.Provider>
}

// Explicit adapter only; no document click handler and no form interception.
export const MarketingLink = forwardRef(function MarketingLink({ onClick, replace, scroll, ...props }, ref) {
  const coordinator = useContext(Navigation)
  const pathname = usePathname()
  return <Link {...props} ref={ref} replace={replace} scroll={scroll} onClick={(event) => {
    onClick?.(event)
    // Preserve special Link navigation options without attempting to emulate them.
    if (replace || scroll === false || !coordinator?.current) return
    const href = eligibleMarketingHref(event, event.currentTarget, pathname, window.location)
    if (href && coordinator.current.navigate(href)) event.preventDefault()
    if (!href) {
      const bookingHref = eligibleBookingHref(event, event.currentTarget, pathname, window.location, MARKETING_ROUTES)
      if (bookingHref && coordinator.current.navigate(bookingHref, true)) event.preventDefault()
    }
  }} />
})
