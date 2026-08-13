'use client'

import { useEffect, useState } from 'react'

import { API_BASE_URL } from '@/lib/config'
import { statusPillClass } from '@/components/track/TrackingChrome'

import { TrackingMap } from './TrackingMap'

const TRACK_ENDPOINT = `${API_BASE_URL}/public/track`

// Poll cadence for live driver location + ETA updates.
const POLL_INTERVAL_MS = 6000

// Terminal order statuses — confirmed against the backend's authoritative
// TaskStatusType (legal_drop_be, src/modules/order/entities/delivery_point.entity.ts),
// the 9-value type order.status is declared as. These 4 are the complete
// terminal set; the other 5 (pending, assigned, ongoing,
// awaiting_seller_confirmation, awaiting_handoff) are all non-terminal.
// Deliberately an allowlist (not "anything that isn't 'ongoing'") — an
// ACTIVE_STATUS === 'ongoing' check would freeze polling on 'assigned',
// 'awaiting_seller_confirmation', and 'awaiting_handoff', which are real
// states orders pass through.
const TERMINAL_STATUSES = ['delivered', 'cancelled', 'failed', 'refunded']

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
    // Keep polling for any non-terminal status (pending, assigned, ongoing,
    // and any future in-between status this frontend doesn't explicitly
    // know about) — only stop once the order has actually reached a
    // terminal state.
    if (TERMINAL_STATUSES.includes(status)) {
      return undefined
    }

    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`${TRACK_ENDPOINT}/${trackingCode}`, {
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
        <>
          <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 text-center shadow-card">
            <p className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
              Estimated arrival
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

          <TrackingMap driverLocation={driverLocation} />
        </>
      ) : (
        // ⚠️ THIS REPLACED A 📍 EMOJI RENDERED AT 24px.
        //
        // No location exists yet, so there is nothing to map. The panel now
        // says that with the same route motif the rest of the product uses,
        // drawn on the tint rather than borrowing a map's appearance — it must
        // not imply geography it does not have.
        //
        // ⚠️ AND IT IS HIDDEN ONCE THE ORDER IS TERMINAL. Previously a
        // DELIVERED order still displayed "we'll show your driver's location
        // here once they're on the way", promising a future event for a job
        // that had already finished. Display-only: the status logic above is
        // untouched.
        TERMINAL_STATUSES.includes(status) ? null : (
        <section className="rounded-card border border-[#eeebf1] bg-surface-raised p-6 text-center shadow-card">
          <p className="text-xs font-semibold uppercase tracking-label text-[#5f5868]">
            Driver location
          </p>
          <div className="mt-4 flex h-32 items-center justify-center rounded-[14px] bg-surface-tint">
            <svg
              viewBox="0 0 64 12"
              aria-hidden="true"
              focusable="false"
              className="h-3 w-16"
            >
              <circle cx="5" cy="6" r="4" fill="#7B2FBE" fillOpacity="0.55" />
              <path
                d="M 12 6 H 46"
                fill="none"
                stroke="#7B2FBE"
                strokeOpacity="0.28"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="3 5"
              />
              <circle
                cx="57"
                cy="6"
                r="4"
                fill="none"
                stroke="#7B2FBE"
                strokeOpacity="0.55"
                strokeWidth="2"
              />
            </svg>
          </div>
          <p className="mt-4 text-[15px] text-[#5f5868]">
            We&rsquo;ll show your driver&rsquo;s location here once they&rsquo;re
            on the way.
          </p>
        </section>
        )
      )}

      <footer className="pt-2 text-center text-[13px] text-[#5f5868]">
        {TERMINAL_STATUSES.includes(status)
          ? 'This order is complete — no further updates.'
          : 'This page updates automatically as your driver moves.'}
      </footer>
    </>
  )
}
