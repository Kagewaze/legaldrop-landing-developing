'use client'

import { useEffect, useState } from 'react'

import { guestFetch } from '@/lib/guest-session'
import { weightKgFor } from '@/lib/send-flow'
import { VEHICLES } from '@/components/send/vehicles'

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

export function useVehicleQuotes({ pickup, dropoff, packageCount, weight }) {
  const [quotes, setQuotes] = useState({})
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
            try {
              const response = await guestFetch('/order/quote-itemized', {
                method: 'POST',
                body: requestFor(vehicle),
              })

              if (!response.ok) {
                return [vehicle.id, null]
              }

              const payload = await response.json()

              return [vehicle.id, normalizeQuote(payload?.data ?? payload)]
            } catch (error) {
              return [vehicle.id, null]
            }
          }),
        )

        if (cancelled) {
          return
        }

        const next = Object.fromEntries(entries)
        setQuotes(next)
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

  return { quotes, status }
}
