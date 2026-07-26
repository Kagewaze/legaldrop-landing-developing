'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { guestFetch } from '@/lib/guest-session'
import { hasBothAddresses, useSendFlow, weightKgFor } from '@/lib/send-flow'
import { AddressAutocomplete } from '@/components/send/AddressAutocomplete'
import { SendMap } from '@/components/send/SendMap'

// Step 1 — addresses.
//
// Deliberately NOT ported from the design:
//
//   "about 22 min in current traffic"
//     There is no duration to show. quote-itemized returns none, and only
//     get-fee does — which creates a real PaymentIntent. Google's Directions
//     result carries one, but see the note on distance below: it would be a
//     second number from a different engine.
//
//   "+ Add a stop"
//     v1 is single-stop. The API takes a receivers[] array so multi-stop is
//     possible later, but it changes pricing, the map and the order payload,
//     and it is not in this build.

// Trip distance, from the BACKEND.
//
// ─── DO NOT SOURCE THIS FROM THE DIRECTIONS RESULT ──────────────────────────
//
// SendMap already has a Google route object in hand, and it carries a distance.
// Using it would be free and wrong. The customer's fare is computed by the
// backend from OSRM, and the two routing engines disagree — different road
// graphs, different snapping. Printing Google's distance on the page that leads
// to an OSRM-derived price shows a number the price was not calculated from,
// and the first person to divide the fare by the distance finds it does not
// reconcile. The only distance safe to display is the one the pricing came from.
//
// quote-itemized is side-effect-free — no Stripe object, no order row — so
// calling it purely to read distanceKm is safe. vehicle 'car' and packageCount
// 1 are a probe: distance does not vary by vehicle or package count, and none
// of the price fields from this response are used or shown.
function useBackendDistanceKm(pickup, dropoff) {
  const [distanceKm, setDistanceKm] = useState(null)

  // Dedupe key — the effect only re-runs when the coordinates themselves
  // change, so re-renders cost nothing.
  const coordinateKey =
    pickup && dropoff
      ? `${pickup.lat},${pickup.lng}>${dropoff.lat},${dropoff.lng}`
      : null

  useEffect(() => {
    // Clear immediately on any change: a distance belonging to the previous
    // pair of addresses is worse than no distance at all.
    setDistanceKm(null)

    if (!coordinateKey) {
      return undefined
    }

    let cancelled = false

    async function probe() {
      try {
        // Uses the shared guest session — same token as step 2, minted once.
        const response = await guestFetch('/order/quote-itemized', {
          method: 'POST',
          body: {
            senderLocation: { latitude: pickup.lat, longitude: pickup.lng },
            receivers: [
              {
                receiverLocation: {
                  latitude: dropoff.lat,
                  longitude: dropoff.lng,
                },
                weight: weightKgFor('light'),
              },
            ],
            vehicle: 'car',
            packageCount: 1,
          },
        })

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        const value = Number((payload?.data ?? payload)?.distanceKm)

        if (!cancelled && Number.isFinite(value)) {
          setDistanceKm(value)
        }
      } catch (error) {
        // Fail soft — the line simply does not appear. Continue is unaffected.
      }
    }

    probe()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinateKey])

  return distanceKm
}

export default function SendAddressesPage() {
  const flow = useSendFlow()
  const canContinue = hasBothAddresses(flow)
  const distanceKm = useBackendDistanceKm(flow.pickup, flow.dropoff)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
      <div className="border-b border-[#f0eef2] px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          Send a package
        </h1>
        <p className="mt-2 text-[15px] text-[#5f5868]">Where is it going?</p>

        {/* ONE container holding both rows. The rows carry no border of their
            own — this is the only frame, which is what stops the field reading
            as a box inside a box. Soft shadow plus a hairline ring for
            definition against the white card, rather than a hard border. */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_1px_2px_rgba(23,19,28,0.04),0_6px_20px_rgba(23,19,28,0.06)] ring-1 ring-[#efecf2]">
          <AddressAutocomplete
            label="Pickup address"
            variant="pickup"
            selected={flow.pickup}
            onSelect={flow.setPickup}
          />
          <AddressAutocomplete
            label="Dropoff address"
            variant="dropoff"
            selected={flow.dropoff}
            onSelect={flow.setDropoff}
          />
        </div>

        {/* Quiet — it confirms the trip is understood, it is not a headline.
            Absent entirely until the backend answers, and absent for good if
            it does not. */}
        {distanceKm != null && (
          <p className="mt-3 px-1 text-[13px] text-[#8d8695]">
            {distanceKm.toFixed(1)} km trip
          </p>
        )}

        {canContinue ? (
          <Link
            href="/send/details"
            className="mt-6 block w-full rounded-xl bg-brand-600 px-5 py-[18px] text-center text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Continue
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-xl bg-[#ece7f1] px-5 py-[18px] text-[16px] font-bold text-[#9b93a5]"
          >
            Continue
          </button>
        )}
      </div>

      <SendMap pickup={flow.pickup} dropoff={flow.dropoff} />
    </div>
  )
}
