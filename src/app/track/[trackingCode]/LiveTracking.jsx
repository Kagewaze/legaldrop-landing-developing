'use client'

import { useEffect, useState } from 'react'

import { API_BASE_URL } from '@/lib/config'
// TERMINAL_STATUSES and the polling loop are shared with the partner route so
// the two surfaces cannot drift apart. See src/lib/tracking.mjs for why the
// terminal set is an allowlist and why polling is single-flight.
import {
  isTerminalStatus,
  startTrackingPoll,
  trackingPollUrl,
} from '@/lib/tracking.mjs'
import {
  TrackingLiveFooter,
  TrackingLiveStatus,
} from '@/components/track/TrackingPresentation'

import { TrackingMap } from './TrackingMap'

const TRACK_ENDPOINT = `${API_BASE_URL}/public/track`

// Poll cadence for live driver location + ETA updates.
const POLL_INTERVAL_MS = 6000

export function LiveTracking({
  trackingCode,
  initialStatus,
  initialMessage,
  initialDriverLocation,
  initialEta,
  driverSummary,
  deliveryDetails,
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
    if (isTerminalStatus(status)) {
      return undefined
    }

    // The customer endpoint is keyed by the short tracking code — the opaque
    // partner token has no meaning on this route and never reaches it.
    return startTrackingPoll({
      url: trackingPollUrl(TRACK_ENDPOINT, trackingCode),
      intervalMs: POLL_INTERVAL_MS,
      onData: (data) => {
        setStatus(data.status)
        setMessage(data.message)
        setDriverLocation(data.driverLocation)
        setEta(data.eta)
      },
    })
  }, [trackingCode, status])

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)] lg:gap-7">
      <div className="lg:col-start-1 lg:row-start-1">
        <TrackingLiveStatus status={status} message={message} eta={eta} />
      </div>

      <div className="lg:sticky lg:top-8 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:self-start">
        {driverLocation ? (
          <TrackingMap
            driverLocation={driverLocation}
            isLive={!isTerminalStatus(status)}
          />
        ) : (
          // No location exists yet, so there is nothing to map. The neutral
          // route motif must not imply geography the consumer API does not
          // provide.
          <section className="overflow-hidden rounded-card border border-[#e5dfea] bg-surface-raised shadow-card">
            <div className="flex min-h-[220px] flex-col items-center justify-center bg-surface-tint px-6 py-10 text-center sm:min-h-[260px]">
              <svg
                viewBox="0 0 64 12"
                aria-hidden="true"
                focusable="false"
                className="h-3 w-16"
              >
                <circle
                  cx="5"
                  cy="6"
                  r="4"
                  fill="#7B2FBE"
                  fillOpacity="0.55"
                />
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
              <p className="mt-5 text-xs font-semibold uppercase tracking-label text-[#5f5868]">
                Live driver location
              </p>
              <p className="mt-2 max-w-sm text-[15px] text-[#5f5868]">
                {isTerminalStatus(status)
                  ? 'No live location is available for this delivery.'
                  : 'Live location will appear when your driver is on the way.'}
              </p>
            </div>
          </section>
        )}
      </div>

      {driverSummary ? (
        <div className="lg:col-start-1 lg:row-start-2">{driverSummary}</div>
      ) : null}

      <div
        className={
          driverSummary
            ? 'lg:col-start-1 lg:row-start-3'
            : 'lg:col-start-1 lg:row-start-2'
        }
      >
        {deliveryDetails}
      </div>

      <div
        className={
          driverSummary
            ? 'lg:col-start-1 lg:row-start-4'
            : 'lg:col-start-1 lg:row-start-3'
        }
      >
        <TrackingLiveFooter status={status} />
      </div>
    </div>
  )
}
