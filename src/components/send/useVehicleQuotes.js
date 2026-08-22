'use client'

import { useEffect, useState } from 'react'

import { guestFetch } from '@/lib/guest-session'
import { weightKgFor } from '@/lib/send-flow'
import { VEHICLES, packageCapacityRefusal } from '@/components/send/vehicles'

// Live pricing for every vehicle.
//
// Uses POST /order/quote-itemized ONLY. That endpoint is side-effect-free, so
// calling it repeatedly as the customer changes options is safe.
//
// It must never be swapped for /order/get-fee: get-fee creates a real Stripe
// PaymentIntent on every call. Previewing a price with it would litter Stripe
// with abandoned intents and put a payment object behind a screen the customer
// has not agreed to pay from.

const DEBOUNCE_MS = 400

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// The documented response is { lineItems: {...}, platformFee, total, distanceKm,
// vehicle } — note lineItems is NESTED while platformFee/total/distanceKm are
// top level. Other endpoints in this backend wrap in { success, data }, so
// accept either envelope.
function normalizeQuote(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const total = Number(raw.total)

  if (!Number.isFinite(total)) {
    return null
  }

  const lineItems = raw.lineItems ?? {}

  return {
    lineItems: {
      base: toNumber(lineItems.base),
      distance: toNumber(lineItems.distance),
      extraPackage: toNumber(lineItems.extraPackage),
      labour: toNumber(lineItems.labour),
      heavyFee: toNumber(lineItems.heavyFee),
    },
    platformFee: toNumber(raw.platformFee),
    total,
    distanceKm: Number.isFinite(Number(raw.distanceKm))
      ? Number(raw.distanceKm)
      : null,
  }
}

// The trip distance, taken from whichever vehicles DID price.
//
// Distance does not vary by vehicle — it is the same road route whatever is
// driving it — so any successful quote reports the same figure. That matters
// because it lets the picker explain a vehicle that failed: bike 500s above a
// 10 km cap, and the only way to know the trip is over that cap is to read the
// distance off a sibling quote that succeeded.
function distanceFromQuotes(quotes) {
  for (const quote of Object.values(quotes)) {
    if (quote && Number.isFinite(quote.distanceKm)) {
      return quote.distanceKm
    }
  }

  return null
}

export function useVehicleQuotes({ pickup, dropoff, packageCount, weight }) {
  const [quotes, setQuotes] = useState({})
  // Vehicles the backend refused to price for THIS trip, as a set of ids.
  // Distinct from "not fetched yet": a null in `quotes` cannot tell the two
  // apart, which is why a bike over the cap used to render as a bare dash.
  const [unavailable, setUnavailable] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | ready | error

  const ready = Boolean(pickup && dropoff)

  // One key describing every input that changes the price. Re-quoting is keyed
  // to this, so moving between vehicles does not re-fetch — all vehicles were
  // already priced in the same pass.
  const inputKey = ready
    ? [
        pickup.lat,
        pickup.lng,
        dropoff.lat,
        dropoff.lng,
        packageCount,
        weight,
      ].join('|')
    : null

  useEffect(() => {
    if (!inputKey) {
      return undefined
    }

    let cancelled = false
    setStatus('loading')
    // Cleared immediately, unlike `quotes` — a lingering price is a harmless
    // stale number, but "not available over 10 km" carried onto a trip that is
    // now under 10 km is an untrue statement about the new route.
    setUnavailable({})

    // Debounced so holding the package stepper does not fire a burst of
    // requests (one per vehicle, per press).
    const timer = setTimeout(async () => {
      const requestFor = (vehicle) => ({
        senderLocation: { latitude: pickup.lat, longitude: pickup.lng },
        receivers: [
          {
            receiverLocation: { latitude: dropoff.lat, longitude: dropoff.lng },
            // Weight is PER RECEIVER in the API, not per order — the single UI
            // selection is fanned into the receiver entry here.
            weight: weightKgFor(weight),
          },
        ],
        // Normalised key, never the local design id.
        vehicle: vehicle.apiKey,
        packageCount,
      })

      try {
        // All vehicles in parallel. Every call shares one guest token: the
        // session module's promise singleton means these six requests trigger
        // exactly one POST /auth/guest, not six (which would also eat into the
        // 20/60s per-IP throttle).
        const entries = await Promise.all(
          VEHICLES.map(async (vehicle) => {
            // Over its package capacity: not asked for, so no price exists to
            // go stale. The backend would 400 this exact request anyway (the
            // rule is enforced there, not here) — skipping it saves a round
            // trip and, more importantly, guarantees `quotes[car]` is empty
            // rather than holding the fare from the last count that fit.
            if (packageCapacityRefusal(vehicle.id, packageCount)) {
              return [vehicle.id, null, true]
            }

            try {
              const response = await guestFetch('/order/quote-itemized', {
                method: 'POST',
                body: requestFor(vehicle),
              })

              if (!response.ok) {
                // The backend refused THIS vehicle for THIS trip. It answers
                // with a bare 500 and no reason, so the reason is inferred
                // from the distance in VehiclePicker rather than guessed here.
                return [vehicle.id, null, true]
              }

              const payload = await response.json()

              return [
                vehicle.id,
                normalizeQuote(payload?.data ?? payload),
                false,
              ]
            } catch (error) {
              // Network failure rather than a refusal — do not claim the
              // vehicle is unavailable on the strength of a dropped request.
              return [vehicle.id, null, false]
            }
          }),
        )

        if (cancelled) {
          return
        }

        const next = Object.fromEntries(
          entries.map(([id, quote]) => [id, quote]),
        )
        const refused = Object.fromEntries(
          entries
            .filter(([, quote, wasRefused]) => quote === null && wasRefused)
            .map(([id]) => [id, true]),
        )

        setQuotes(next)
        setUnavailable(refused)
        setStatus(
          Object.values(next).some((quote) => quote !== null)
            ? 'ready'
            : 'error',
        )
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputKey])

  return { quotes, unavailable, status, distanceKm: distanceFromQuotes(quotes) }
}
