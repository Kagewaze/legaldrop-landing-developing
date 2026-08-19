'use client'

import { useEffect, useRef, useState } from 'react'

import { API_BASE_URL } from '@/lib/config'
import { apiKeyFor } from '@/components/send/vehicles'
import { isFutureInstant } from '@/lib/toronto-time'

// The one and only place the web asks for a DropBatch price.
//
// ⚠️ THE BACKEND IS THE ONLY AUTHORITY. POST /drop-batch/public/quote decides
// eligibility, the 80 km floor, OSRM route distance, trip matching, vehicle
// compatibility, capacity and the price. Nothing here re-derives any of that — this
// hook builds the DTO, guards when it is safe to ask, and throws away answers that
// have been overtaken. If you find yourself writing `>= 80` or a fare formula in
// this file, stop.
//
// ⚠️ SCHEDULED PICKUPS ONLY. A DropBatch trip departs at a specific time, so a
// quote needs the moment the customer actually chose. An ASAP order has no such
// moment, and inventing `new Date()` would ask the backend to match against a time
// nobody requested. So ASAP never quotes, and the card never appears for it.
//
// ⚠️ THE RESULT IS INFORMATIONAL. There is no verified App Store, Play Store or
// deep-link destination in this repository, and the public projection carries no
// trip id, so the web cannot address or book a specific trip. The card shows a real
// price and says booking happens in the app. Do not add a CTA here.

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
  ].join('|')
}

// Everything the DTO requires must be present and committed. A typed address with no
// committed place has no coordinates and is therefore not enough.
function buildRequest(input) {
  const { pickup, dropoff, pickupTiming, scheduledPickupAt, vehicle, packageCount } = input ?? {}

  if (pickupTiming !== 'scheduled') return null
  if (!scheduledPickupAt || !isFutureInstant(scheduledPickupAt)) return null

  const coordsValid = (place) =>
    place && Number.isFinite(place.lat) && Number.isFinite(place.lng)

  if (!coordsValid(pickup) || !coordsValid(dropoff)) return null
  if (!vehicle) return null
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
    // car -> sedan, cargovan -> cargo_van and so on, and returns no matches for a
    // vehicle that is not a DropBatch class (bike) — which is its decision, not ours.
    vehicle: apiKeyFor(vehicle),
    packageCount,
  }
}

export function useDropBatchQuote(input) {
  const [state, setState] = useState(IDLE)

  // Monotonic id. A slow earlier request must never overwrite a faster later one,
  // and a request in flight when the customer clears an address must not be able to
  // restore a price for an address that no longer exists.
  const seq = useRef(0)
  const controller = useRef(null)

  const signature = inputSignature(input)

  useEffect(() => {
    // Abort whatever was in flight for the previous inputs. Combined with the seq
    // check below this is belt and braces: even a response that escapes the abort
    // cannot be applied.
    controller.current?.abort()

    const request = buildRequest(input)

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
    setState({ status: 'loading', quote: null })

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
          setState({ status: 'unavailable', quote: null })
          return
        }

        setState({ status: 'ready', quote: data })
      } catch (error) {
        if (abort.signal.aborted || id !== seq.current) return

        // ⚠️ ISOLATED FAILURE. DropBatch is a supplementary comparison; if it cannot
        // be reached the customer still has full standard pricing and checkout. This
        // deliberately does not surface a page-level error.
        setState({ status: 'unavailable', quote: null })
      }
    })()

    return () => abort.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  const quote = state.quote

  // THE SHOW RULE, and the whole of it. No distance check, no price check.
  const matches = Array.isArray(quote?.matches) ? quote.matches : []
  const show = quote?.eligible === true && matches.length > 0

  // ⚠️ ONE PRICE, BY CONSTRUCTION — NOT A "CHEAPEST" CHOICE.
  // matchTrip prices on the route distance, the SENDER's requested vehicle and the
  // package count. None of those vary by trip, so every match in a single quote
  // carries the same senderPays. Showing one figure is therefore accurate, and
  // picking a "best" match would be inventing a policy the product does not have.
  const senderPays = show ? matches[0].senderPays : null

  // Soonest departure among the matches, purely as context for the price. Matches
  // are not re-ordered or filtered.
  const soonestWindow = show
    ? matches
        .map((match) => match.departureWindow)
        .filter(Boolean)
        .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0] ?? null
    : null

  // Backend returns an over-capacity match flagged rather than hidden, so the sender
  // can still ask. Only when EVERY match is flagged does the space question apply to
  // the option as a whole.
  const allOverCapacity = show && matches.every((match) => match.overCapacity === true)

  return {
    status: state.status,
    show,
    senderPays,
    matchCount: matches.length,
    soonestWindow,
    allOverCapacity,
  }
}
