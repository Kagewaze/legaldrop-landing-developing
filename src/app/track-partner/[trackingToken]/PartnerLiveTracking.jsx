'use client'

import { useEffect, useState } from 'react'

import { API_BASE_URL } from '@/lib/config'
// TERMINAL_STATUSES and the polling loop are shared with the customer route so
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

import { PartnerTrackingMap } from './PartnerTrackingMap'

const TRACK_PARTNER_ENDPOINT = `${API_BASE_URL}/public/track-partner`

// Poll cadence for live driver location + ETA updates.
const POLL_INTERVAL_MS = 6000

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
    if (isTerminalStatus(status)) {
      return undefined
    }

    // `trackingToken` is the opaque credential from the route, never the short
    // display code — /public/track-partner is keyed by the token alone.
    return startTrackingPoll({
      url: trackingPollUrl(TRACK_PARTNER_ENDPOINT, trackingToken),
      intervalMs: POLL_INTERVAL_MS,
      onData: (data) => {
        setStatus(data.status)
        setMessage(data.message)
        setDriverLocation(data.driverLocation)
        setEta(data.eta)
        setSenderLocation(data.senderLocation)
        setReceivers(Array.isArray(data.receivers) ? data.receivers : [])
        setRoute(data.route)
      },
    })
  }, [trackingToken, status])

  return (
    <>
      <TrackingLiveStatus status={status} message={message} eta={eta} />

      {children}

      <PartnerTrackingMap
        driverLocation={driverLocation}
        senderLocation={senderLocation}
        receivers={receivers}
        route={route}
      />

      <TrackingLiveFooter status={status} />
    </>
  )
}
