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
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.42fr)] lg:gap-8">
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
          <section className="overflow-hidden rounded-card border border-[#d9c7e6] bg-surface-raised shadow-[0_2px_4px_rgba(82,28,130,0.06),0_18px_42px_-24px_rgba(82,28,130,0.32)]">
            <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f5edfa_56%,#eee0f8_100%)] px-6 py-12 text-center lg:min-h-[clamp(400px,50vh,520px)]">
              <span
                aria-hidden="true"
                className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-brand-600/10 blur-3xl"
              />
              <svg
                viewBox="0 0 88 32"
                aria-hidden="true"
                focusable="false"
                className="relative h-12 w-24"
              >
                <circle
                  cx="8"
                  cy="24"
                  r="6"
                  fill="#7B2FBE"
                  fillOpacity="0.72"
                />
                <path
                  d="M 16 23 C 34 22, 35 8, 55 10 S 70 19, 78 8"
                  fill="none"
                  stroke="#7B2FBE"
                  strokeOpacity="0.45"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="2 6"
                />
                <circle
                  cx="79"
                  cy="7"
                  r="7"
                  fill={status === 'delivered' ? '#e2f2e7' : '#ffffff'}
                  stroke={status === 'delivered' ? '#1c6742' : '#7B2FBE'}
                  strokeWidth="2.5"
                />
                {status === 'delivered' ? (
                  <path
                    d="m75.5 7 2.3 2.3 4.2-4.6"
                    fill="none"
                    stroke="#1c6742"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
              </svg>
              <p className="relative mt-6 text-xs font-bold uppercase tracking-label text-brand-700">
                {status === 'delivered'
                  ? 'Delivery completed'
                  : isTerminalStatus(status)
                    ? 'Delivery location'
                    : 'Live driver location'}
              </p>
              <h2 className="relative mt-2 font-display text-2xl font-extrabold text-[#281632]">
                {status === 'delivered'
                  ? 'Your delivery is complete'
                  : isTerminalStatus(status)
                    ? 'Final location unavailable'
                    : 'Location will appear here'}
              </h2>
              <p className="relative mt-3 max-w-sm text-[15px] leading-6 text-[#62566a]">
                {status === 'delivered'
                  ? 'No final driver location is available for this delivery.'
                  : isTerminalStatus(status)
                    ? 'No final driver location is available for this delivery.'
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
