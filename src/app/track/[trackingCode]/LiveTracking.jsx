'use client'

import { useEffect, useState } from 'react'

import { TrackingMap } from './TrackingMap'

const API_BASE_URL =
  'https://seal-app-9hhnm.ondigitalocean.app/api/public/track'

// Poll cadence for live driver location + ETA updates.
const POLL_INTERVAL_MS = 6000
// Only an in-progress order is worth polling; terminal states are final.
const ACTIVE_STATUS = 'ongoing'

// Small formatting helpers, mirrored from page.jsx so the live status card
// renders identically. Kept local to avoid a shared-module refactor.
function titleCase(value) {
  if (!value || typeof value !== 'string') {
    return value || '--'
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function statusBadgeClass(status) {
  if (status === 'delivered') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (['cancelled', 'failed', 'refunded'].includes(status)) {
    return 'bg-rose-50 text-rose-700 ring-rose-200'
  }

  return 'bg-amber-50 text-amber-700 ring-amber-200'
}

function formatEta(eta) {
  const parts = []

  if (eta?.durationText) {
    parts.push(`${eta.durationText} away`)
  }

  if (eta?.distanceText) {
    parts.push(eta.distanceText)
  }

  return parts.join(' · ')
}

export function LiveTracking({
  trackingCode,
  initialStatus,
  initialMessage,
  initialDriverLocation,
  initialEta,
  children,
}) {
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState(initialMessage)
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation)
  const [eta, setEta] = useState(initialEta)

  useEffect(() => {
    // Never start (or immediately stop) polling once the order is no longer
    // in progress — a delivered/cancelled/failed order will not change again.
    if (status !== ACTIVE_STATUS) {
      return undefined
    }

    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/${trackingCode}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const payload = await response.json()

        if (cancelled || !payload?.success || !payload.data) {
          return
        }

        const data = payload.data
        setStatus(data.status)
        setMessage(data.message)
        setDriverLocation(data.driverLocation)
        setEta(data.eta)
      } catch (error) {
        // Ignore transient polling errors; the next tick will retry.
      }
    }

    const intervalId = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [trackingCode, status])

  const etaText = formatEta(eta)

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${statusBadgeClass(
            status,
          )}`}
        >
          {titleCase(status)}
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          {message?.header ?? 'Order status'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {message?.description ??
            'We’ll keep this page updated as your order progresses.'}
        </p>
      </section>

      {children}

      {driverLocation ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Estimated Arrival
            </p>
            {etaText ? (
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {etaText}
              </p>
            ) : (
              <p className="mt-3 text-lg font-medium text-slate-400">
                Calculating…
              </p>
            )}
          </section>

          <TrackingMap driverLocation={driverLocation} />
        </>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Driver Location
          </p>
          <p className="mt-4 text-2xl" role="img" aria-hidden>
            📍
          </p>
          <p className="mt-2 text-sm text-slate-500">
            We&rsquo;ll show your driver&rsquo;s location here once they&rsquo;re
            on the way.
          </p>
        </section>
      )}

      <footer className="pt-4 text-center text-xs text-slate-500">
        {status === ACTIVE_STATUS
          ? 'This page updates automatically as your driver moves.'
          : 'This order is complete — no further updates.'}
      </footer>
    </>
  )
}
