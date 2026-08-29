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
  driverSummary,
  routeSummary,
  pickupDetails,
  destinationsDetails,
  deliveryDetails,
}) {
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState(initialMessage)
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation)
  const [eta, setEta] = useState(initialEta)
  // Keep accepting refreshed geography from the existing payload. The map's
  // pickup, stop and route objects intentionally remain first-load geometry
  // until the deferred dynamic-geography batch; driver updates remain live.
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
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)] lg:gap-7">
      <div className="lg:col-start-1 lg:row-start-1">
        <TrackingLiveStatus status={status} message={message} eta={eta} />
      </div>

      <div className="lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <PartnerTrackingMap
          driverLocation={driverLocation}
          senderLocation={senderLocation}
          receivers={receivers}
          route={route}
          isLive={!isTerminalStatus(status)}
        />
      </div>

      <div className="space-y-5 lg:col-start-1 lg:row-start-2">
        {driverSummary}
        {routeSummary}
        {pickupDetails}
        {destinationsDetails}
        {deliveryDetails}
        <TrackingLiveFooter status={status} />
      </div>
    </div>
  )
}
