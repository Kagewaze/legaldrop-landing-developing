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
