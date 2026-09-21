'use client'

import { useEffect, useRef, useState } from 'react'

import { DROPBATCH_SEND_COMPARISON_ENABLED } from '@/lib/config'
import { referralDropBatchQuoteFetch } from '@/lib/guest-session'
import {
  apiKeyFor,
  isDropBatchSupportedVehicle,
} from '@/components/send/vehicles'
import { isFutureInstant } from '@/lib/toronto-time'
import { weightKgFor } from '@/lib/send-flow'

// The one and only place the web asks for a DropBatch price.
//
// ⚠️ THE BACKEND IS THE ONLY AUTHORITY. POST /drop-batch/public/quote decides
// eligibility, OSRM route distance, vehicle compatibility and the
// price. Nothing here re-derives any of that — this
// hook builds the DTO, guards when it is safe to ask, and throws away answers that
// have been overtaken. If you find yourself writing `>= 80` or a fare formula in
// this file, stop.
//
// ⚠️ TIMING IS FULFILMENT METADATA, NOT PRICE ELIGIBILITY. Scheduled requests carry
// the chosen future instant; instant requests carry no fabricated timestamp.
//
// The public response is display authority only. Selecting DropBatch persists the
// mode and request signature; /order/get-fee and POST /order independently re-route
// and re-price before any money or order is accepted.

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
    input.weight,
    input.requestKey,
  ].join('|')
}

export function dropBatchQuoteSignature(request) {
  if (!request) return ''
  return [
    request.pickupLatitude,
    request.pickupLongitude,
    request.dropoffLatitude,
    request.dropoffLongitude,
    request.type,
    request.pickupTime ?? '',
    request.mode,
    request.vehicle,
    request.packageCount,
    request.packageWeightKg,
  ].join('|')
}

export async function fetchDropBatchQuote(request, { signal } = {}) {
  const response = await referralDropBatchQuoteFetch(request, { signal })

  if (!response.ok) {
    throw new Error(`DropBatch quote failed (${response.status})`)
  }

  const payload = await response.json()
  const data = payload?.data
  if (!data || typeof data !== 'object') {
    throw new Error('DropBatch quote returned an unexpected response')
  }
  return data
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

  const { pickup, dropoff, pickupTiming, scheduledPickupAt, vehicle, packageCount, weight } = input ?? {}

  if (pickupTiming !== 'instant' && pickupTiming !== 'scheduled') return null
  if (
    pickupTiming === 'scheduled' &&
    (!scheduledPickupAt || !isFutureInstant(scheduledPickupAt))
  ) return null

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
    type:
      pickupTiming === 'scheduled' ? 'scheduled_pickup' : 'instant_pickup',
    ...(pickupTiming === 'scheduled'
      ? { pickupTime: scheduledPickupAt }
      : {}),
    mode: 'package',
    // Normalised on the wire exactly as the order payload does. The backend maps
    // car -> sedan, cargovan -> cargo_van and so on. Unsupported vehicles such as
    // bike are rejected before this request is built.
    vehicle: apiKeyFor(vehicle),
    packageCount,
    packageWeightKg: weightKgFor(weight),
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
  const unsupportedVehicle = Boolean(
    enabled && input?.vehicle && !isDropBatchSupportedVehicle(input.vehicle),
  )
  const incompleteSchedule = Boolean(
    enabled &&
      input?.pickupTiming === 'scheduled' &&
      (!input?.scheduledPickupAt || !isFutureInstant(input.scheduledPickupAt)),
  )

  useEffect(() => {
    // Abort whatever was in flight for the previous inputs. Combined with the seq
    // check below this is belt and braces: even a response that escapes the abort
    // cannot be applied.
    controller.current?.abort()

    const request = currentRequest

    // Not enough committed information. There is no question to ask, and any previous
    // answer is stale. Clear it immediately.
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
        const data = await fetchDropBatchQuote(request, { signal: abort.signal })

        if (id !== seq.current) return

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
    status: unsupportedVehicle || incompleteSchedule
      ? 'ineligible'
      : visibleState.status,
    quote,
    show,
    senderPays: show ? senderPays : null,
    requestKey: dropBatchQuoteSignature(currentRequest),
    reason: unsupportedVehicle
      ? 'unsupported_vehicle'
      : incompleteSchedule
        ? 'schedule_incomplete'
        : quote?.eligible === false
          ? quote.reason
          : visibleState.status === 'unavailable'
            ? 'network_failure'
            : null,
  }
}
