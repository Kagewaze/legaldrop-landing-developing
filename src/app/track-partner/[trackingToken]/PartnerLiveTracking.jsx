'use client'

import { useEffect, useState } from 'react'

import { API_BASE_URL } from '@/lib/config'
import { statusPillClass } from '@/components/track/TrackingChrome'

import { PartnerTrackingMap } from './PartnerTrackingMap'

const TRACK_PARTNER_ENDPOINT = `${API_BASE_URL}/public/track-partner`

// Poll cadence for live driver location + ETA updates.
const POLL_INTERVAL_MS = 6000

// Terminal order statuses — confirmed against the backend's authoritative
// TaskStatusType (legal_drop_be, src/modules/order/entities/delivery_point.entity.ts),
// the 9-value type order.status is declared as. These 4 are the complete
// terminal set; the other 5 (pending, assigned, ongoing,
// awaiting_seller_confirmation, awaiting_handoff) are all non-terminal.
// Deliberately an allowlist (not "anything that isn't 'ongoing'") — the old
// ACTIVE_STATUS === 'ongoing' check would have frozen polling on 'assigned',
// 'awaiting_seller_confirmation', and 'awaiting_handoff', which are real
// states orders pass through.
const TERMINAL_STATUSES = ['delivered', 'cancelled', 'failed', 'refunded']

// Small formatting helpers, mirrored from the private view so the live status
// card renders identically. Kept local to avoid a shared-module refactor
// (same convention as LiveTracking.jsx on the /track/[trackingCode] route).
function titleCase(value) {
  if (!value || typeof value !== 'string') {
    return value || '--'
  }

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// Reuse the backend's precomputed ETA (durationText / distanceText); never
// recompute from the route geometry client-side.
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

export function PartnerLiveTracking({
  trackingToken,
  initialStatus,
  initialMessage,
  initialDriverLocation,
  initialEta,
  initialSenderLocation,
  initialReceivers,
  initialRoute,
  children,
}) {
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState(initialMessage)
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation)
  const [eta, setEta] = useState(initialEta)
  // Sender / receivers / route are stable for an order, but we refresh them
  // from each poll anyway so a mid-flight backend correction is reflected.
  const [senderLocation, setSenderLocation] = useState(initialSenderLocation)
  const [receivers, setReceivers] = useState(initialReceivers ?? [])
  const [route, setRoute] = useState(initialRoute)

  useEffect(() => {
    // Keep polling for any non-terminal status (pending, ongoing, and any
    // future in-between status this frontend doesn't explicitly know about)
    // — only stop once the order has actually reached a terminal state.
    if (TERMINAL_STATUSES.includes(status)) {
      return undefined
    }

    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`${TRACK_PARTNER_ENDPOINT}/${trackingToken}`, {
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
        setSenderLocation(data.senderLocation)
        setReceivers(Array.isArray(data.receivers) ? data.receivers : [])
        setRoute(data.route)
      } catch (error) {
        // Ignore transient polling errors; the next tick will retry.
      }
    }

    const intervalId = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [trackingToken, status])

  const etaText = formatEta(eta)

  return (
    <>
      <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-8 text-center shadow-card">
        <span
          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-label ring-1 ring-inset ${statusPillClass(
            status,
          )}`}
        >
          {titleCase(status)}
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold tracking-[-0.02em] text-[#17131c]">
          {message?.header ?? 'Order status'}
        </h2>
        <p className="mt-2 text-[15px] text-[#5f5868]">
          {message?.description ??
            'We’ll keep this page updated as your order progresses.'}
        </p>
      </section>

      {children}

      {driverLocation ? (
        <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 text-center shadow-card">
          <p className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
            Estimated Arrival
          </p>
          {etaText ? (
            <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-[#17131c]">
              {etaText}
            </p>
          ) : (
            <p className="mt-3 text-lg font-semibold text-[#8d8695]">
              Calculating…
            </p>
          )}
        </section>
      ) : null}

      <PartnerTrackingMap
        driverLocation={driverLocation}
        senderLocation={senderLocation}
        receivers={receivers}
        route={route}
      />

      <footer className="pt-2 text-center text-[13px] text-[#5f5868]">
        {TERMINAL_STATUSES.includes(status)
          ? 'This order is complete — no further updates.'
          : 'This page updates automatically as your driver moves.'}
      </footer>
    </>
  )
}
