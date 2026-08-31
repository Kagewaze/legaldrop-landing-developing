'use client'

import { useEffect, useRef, useState } from 'react'

import { API_BASE_URL, DROPBATCH_SEND_COMPARISON_ENABLED } from '@/lib/config'
import {
  apiKeyFor,
  isDropBatchSupportedVehicle,
} from '@/components/send/vehicles'
import { isFutureInstant } from '@/lib/toronto-time'

// The one and only place the web asks for a DropBatch price.
//
// ⚠️ THE BACKEND IS THE ONLY AUTHORITY. POST /drop-batch/public/quote decides
// eligibility, the 80 km floor, OSRM route distance, vehicle compatibility and the
// price. Nothing here re-derives any of that — this
// hook builds the DTO, guards when it is safe to ask, and throws away answers that
// have been overtaken. If you find yourself writing `>= 80` or a fare formula in
// this file, stop.
//
// ⚠️ SCHEDULED PICKUPS ONLY. DropBatch is a planned long-distance product, so a
// quote needs the moment the customer actually chose. An ASAP order has no such
// moment. So ASAP never quotes, and the card never appears for it.
//
// ⚠️ THE RESULT IS INFORMATIONAL. There is no verified App Store, Play Store or
// public projection carries no order or payment authority, so the web cannot book
// the quoted delivery. Links may explain the product or open another read-only quote;
// they must never imply a reservation or checkout.

const IDLE = { status: 'idle', quote: null }

// Every input the backend's answer depends on. When this string changes the previous
// answer is wrong by definition, so it is dropped in the same render rather than
// lingering while a replacement loads.
function inputSignature(input) {
  if (!input) return ''
  return [
    input.pickup?.lat,
    input.pickup?.lng,
    input.dropoff?.lat,
    input.dropoff?.lng,
    input.pickupTiming,
    input.scheduledPickupAt,
    input.vehicle,
    input.packageCount,
    input.requestKey,
  ].join('|')
}

// Everything the DTO requires must be present and committed. A typed address with no
// committed place has no coordinates and is therefore not enough.
export function buildDropBatchQuoteRequest(input, enabled = true) {
  // The containment switch, applied where the question is formed rather than
  // where the answer is rendered: returning null here means no DTO, so no
  // request is ever sent to /drop-batch/public/quote and the hook stays IDLE —
  // `show` is false and the card never mounts. Gating the JSX instead would
  // still have quoted a hidden feature on every scheduled pickup. See
  // the independent exposure flags in lib/config.
  if (!enabled) return null

  const { pickup, dropoff, pickupTiming, scheduledPickupAt, vehicle, packageCount } = input ?? {}

  if (pickupTiming !== 'scheduled') return null
  if (!scheduledPickupAt || !isFutureInstant(scheduledPickupAt)) return null

  const coordsValid = (place) =>
    place && Number.isFinite(place.lat) && Number.isFinite(place.lng)

  if (!coordsValid(pickup) || !coordsValid(dropoff)) return null
  if (!isDropBatchSupportedVehicle(vehicle)) return null
  if (!Number.isInteger(packageCount) || packageCount < 1) return null

  return {
    pickupLatitude: pickup.lat,
    pickupLongitude: pickup.lng,
    dropoffLatitude: dropoff.lat,
    dropoffLongitude: dropoff.lng,
    // ⚠️ pickupTime, LOWERCASE u — the DropBatch quote DTO. POST /order uses
    // pickUpTime with a capital U. Different endpoints, different contracts; see
    // buildOrderPayload.
    pickupTime: scheduledPickupAt,
    mode: 'package',
    // Normalised on the wire exactly as the order payload does. The backend maps
    // car -> sedan, cargovan -> cargo_van and so on. Unsupported vehicles such as
    // bike are rejected before this request is built.
    vehicle: apiKeyFor(vehicle),
    packageCount,
  }
}

export function useDropBatchQuote(
  input,
  { enabled = DROPBATCH_SEND_COMPARISON_ENABLED } = {},
) {
  const [state, setState] = useState(IDLE)

  // Monotonic id. A slow earlier request must never overwrite a faster later one,
  // and a request in flight when the customer clears an address must not be able to
  // restore a price for an address that no longer exists.
  const seq = useRef(0)
  const controller = useRef(null)

  const signature = inputSignature(input)
  const currentRequest = buildDropBatchQuoteRequest(input, enabled)

  useEffect(() => {
    // Abort whatever was in flight for the previous inputs. Combined with the seq
    // check below this is belt and braces: even a response that escapes the abort
    // cannot be applied.
    controller.current?.abort()

    const request = currentRequest

    // Not enough committed information — or an ASAP order. Either way there is no
    // question to ask, and any previous answer is stale. Clear it immediately.
    if (!request) {
      seq.current += 1
      setState(IDLE)
      return undefined
    }

    const id = ++seq.current
    const abort = new AbortController()
    controller.current = abort

    // The previous price is dropped the moment inputs change, never left on screen
    // next to a new address while a replacement loads.
    setState({ status: 'loading', quote: null, signature })

    ;(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/drop-batch/public/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: abort.signal,
        })

        if (!response.ok) throw new Error(`DropBatch quote failed (${response.status})`)

        const payload = await response.json()
        const data = payload?.data

        if (id !== seq.current) return

        // A malformed envelope is treated as "no DropBatch", not as an error the
        // customer has to read. Standard delivery is unaffected either way.
        if (!data || typeof data !== 'object') {
          setState({ status: 'unavailable', quote: null, signature })
          return
        }

        setState({ status: 'ready', quote: data, signature })
      } catch (error) {
        if (abort.signal.aborted || id !== seq.current) return

        // ⚠️ ISOLATED FAILURE. DropBatch is a supplementary comparison; if it cannot
        // be reached the customer still has full standard pricing and checkout. This
        // deliberately does not surface a page-level error.
        setState({ status: 'unavailable', quote: null, signature })
      }
    })()

    return () => abort.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, enabled])

  // Effects clear/replace internal state after render. Tie outward state to the
  // exact current request identity as well, so a previous success/error cannot
  // render for even one frame after inputs invalidate or change.
  const visibleState =
    currentRequest && state.signature === signature ? state : IDLE
  const quote = visibleState.quote

  // THE SHOW RULE, and the whole of it. The backend has already established route
  // eligibility and calculated this finite non-negative amount. There is no browser
  // distance threshold or fare formula and no driver/trip prerequisite.
  const senderPays = quote?.senderPays
  const show =
    quote?.eligible === true &&
    typeof senderPays === 'number' &&
    Number.isFinite(senderPays) &&
    senderPays >= 0

  return {
    status: visibleState.status,
    quote,
    show,
    senderPays: show ? senderPays : null,
  }
}
