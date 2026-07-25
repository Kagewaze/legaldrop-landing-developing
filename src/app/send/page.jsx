'use client'

import Link from 'next/link'

import { hasBothAddresses, useSendFlow } from '@/lib/send-flow'
import { AddressAutocomplete } from '@/components/send/AddressAutocomplete'
import { SendMap } from '@/components/send/SendMap'

// Step 1 — addresses.
//
// Deliberately NOT ported from the design:
//
//   "6.2 km · about 22 min in current traffic"
//     Both halves are unavailable here. quote-itemized needs a vehicle, which
//     has not been chosen yet, and it returns no duration at all — only
//     get-fee does, and get-fee creates a real PaymentIntent. Distance appears
//     on step 2, where it is actually known. Duration does not appear at all.
//
//   The route polyline
//     Needs the Directions/Routes API. See SendMap.
//
//   "+ Add a stop"
//     v1 is single-stop. The API takes a receivers[] array so multi-stop is
//     possible later, but it changes pricing, the map and the order payload,
//     and it is not in this build.

export default function SendAddressesPage() {
  const flow = useSendFlow()
  const canContinue = hasBothAddresses(flow)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
      <div className="border-b border-[#f0eef2] px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          Send a package
        </h1>
        <p className="mt-2 text-[15px] text-[#5f5868]">Where is it going?</p>

        <div className="mt-6 flex gap-3.5">
          {/* Pickup/dropoff connector, as in the design. */}
          <div
            aria-hidden
            className="hidden flex-col items-center pt-[18px] sm:flex"
          >
            <span className="h-[11px] w-[11px] rounded-full border-[2.5px] border-brand-600" />
            <span className="my-1.5 w-[2px] flex-1 bg-[#e3dfe8]" />
            <span className="h-[10px] w-[10px] bg-brand-600" />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <AddressAutocomplete
              label="PICKUP"
              placeholder="Search for a pickup address"
              selected={flow.pickup}
              onSelect={flow.setPickup}
            />
            <AddressAutocomplete
              label="DROPOFF"
              placeholder="Search for a dropoff address"
              selected={flow.dropoff}
              onSelect={flow.setDropoff}
              tone="accent"
            />
          </div>
        </div>

        {canContinue ? (
          <Link
            href="/send/details"
            className="mt-7 block w-full rounded-xl bg-brand-600 px-5 py-4 text-center text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
          >
            Continue
          </Link>
        ) : (
          <>
            <button
              type="button"
              disabled
              className="mt-7 w-full cursor-not-allowed rounded-xl bg-[#e6e1ea] px-5 py-4 text-[16px] font-bold text-[#8d8695]"
            >
              Continue
            </button>
            <p className="mt-2.5 text-center text-[13px] text-[#8d8695]">
              Choose both addresses from the suggestions to continue.
            </p>
          </>
        )}
      </div>

      <SendMap pickup={flow.pickup} dropoff={flow.dropoff} />
    </div>
  )
}
