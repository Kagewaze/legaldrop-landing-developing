'use client'

import { useEffect, useRef, useState } from 'react'
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
  // 'idle' | 'loading' | 'ready' | 'error'. Previously this probe reported
  // nothing at all: the line was simply absent until it answered and absent
  // for good if it failed, so on a slow connection step 1 looked frozen with
  // no indication anything was happening.
  const [distanceStatus, setDistanceStatus] = useState('idle')

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
      setDistanceStatus('idle')
      return undefined
    }

    setDistanceStatus('loading')

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
          throw new Error('Distance probe rejected')
        }

        const payload = await response.json()
        const value = Number((payload?.data ?? payload)?.distanceKm)

        if (cancelled) {
          return
        }

        if (Number.isFinite(value)) {
          setDistanceKm(value)
          setDistanceStatus('ready')
        } else {
          setDistanceStatus('error')
        }
      } catch (error) {
        // STILL fails soft — Continue is deliberately unaffected by this probe,
        // because the distance is a confirmation, not a precondition. The only
        // change is that the customer is told the number is unavailable rather
        // than being left watching an empty space.
        if (!cancelled) {
          setDistanceStatus('error')
        }
      }
    }

    probe()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinateKey])

  return { distanceKm, distanceStatus }
}

// Section presets, arriving as /send?section=…
//
// Read from window.location rather than useSearchParams: the param is only
// consumed in an effect, after mount, so the hook would buy nothing and would
// force this page out of static prerendering (Next 14 requires a Suspense
// boundary around useSearchParams in a prerendered route).
//
// A STRICT whitelist, not a passthrough. Whatever comes back from here is sent
// verbatim to the backend as `section` on get-fee and POST /order, so an
// unrecognised value is dropped rather than forwarded. A malformed param must
// never break the flow — every failure path returns null and the store's
// default 'other' stands.
const SECTION_PRESETS = ['medical_supply', 'legal_document', 'other']

function readSectionParam() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const value = new URLSearchParams(window.location.search).get('section')

    return SECTION_PRESETS.includes(value) ? value : null
  } catch (error) {
    return null
  }
}

export default function SendAddressesPage() {
  const flow = useSendFlow()
  const canContinue = hasBothAddresses(flow)
  const { distanceKm, distanceStatus } = useBackendDistanceKm(
    flow.pickup,
    flow.dropoff,
  )

  // Apply the preset once, on entry.
  //
  // GATED ON `hydrated`, and that is not optional. React runs child effects
  // before parent ones, so this fires before the provider restores
  // sessionStorage — and that restore replaces the whole state object, which
  // would silently discard the section we just set. It only misbehaves when a
  // stored record exists (a refresh or a re-entry), so the ungated version
  // looks fine on a cold visit and loses the preset in real use.
  //
  // Running after hydration also settles precedence: an explicit URL param wins
  // over whatever the tab was carrying. The ref keeps this to one write, so
  // re-renders never clobber a section chosen later in the flow.
  const { setSection } = flow
  const presetApplied = useRef(false)

  useEffect(() => {
    if (!flow.hydrated || presetApplied.current) {
      return
    }

    presetApplied.current = true

    const preset = readSectionParam()

    // No param, or an unrecognised one: leave the store alone so the existing
    // value (default 'other') stands.
    if (preset) {
      setSection(preset)
    }
  }, [flow.hydrated, setSection])

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
          {/* onClear sets the address back to null, which is the only way the
              store can lose one — nothing else in the flow ever does it. That
              flips hasBothAddresses false, so Continue disables, the distance
              line goes, and the map drops back to a single pin. */}
          <AddressAutocomplete
            label="Pickup address"
            variant="pickup"
            selected={flow.pickup}
            onSelect={flow.setPickup}
            onClear={() => flow.setPickup(null)}
          />
          <AddressAutocomplete
            label="Dropoff address"
            variant="dropoff"
            selected={flow.dropoff}
            onSelect={flow.setDropoff}
            onClear={() => flow.setDropoff(null)}
          />
        </div>

        {/* Quiet — it confirms the trip is understood, it is not a headline.
            A live region because it resolves asynchronously: this is exactly
            the kind of status StepChrome's focus move is NOT for. */}
        <p
          className="mt-3 px-1 text-[13px] text-[#8d8695]"
          role="status"
          aria-live="polite"
        >
          {distanceStatus === 'loading' && 'Measuring the trip…'}
          {distanceStatus === 'ready' &&
            distanceKm != null &&
            `${distanceKm.toFixed(1)} km trip`}
          {distanceStatus === 'error' &&
            'Trip distance unavailable — you can still continue.'}
        </p>

        {canContinue ? (
          <Link
            href="/send/details"
            className="mt-6 block w-full rounded-xl bg-brand-600 px-5 py-[18px] text-center text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Continue
          </Link>
        ) : (
          /* aria-disabled rather than the `disabled` attribute. A disabled
             button is removed from the tab order entirely, so a keyboard user
             tabbing through the form never landed on it and was never told why
             they could not proceed — the button was simply missing. This stays
             focusable and carries its reason, while remaining inert: there is
             no onClick, so activating it does nothing. */
          <>
            <button
              type="button"
              aria-disabled="true"
              aria-describedby="continue-blocked-reason"
              className="mt-6 w-full cursor-not-allowed rounded-xl bg-[#ece7f1] px-5 py-[18px] text-[16px] font-bold text-[#9b93a5] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Continue
            </button>
            <p
              id="continue-blocked-reason"
              className="mt-2.5 px-1 text-center text-[13px] text-[#8d8695]"
            >
              Enter both a pickup and a dropoff address to continue.
            </p>
          </>
        )}
      </div>

      <SendMap pickup={flow.pickup} dropoff={flow.dropoff} />
    </div>
  )
}
