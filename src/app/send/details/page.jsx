'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  PACKAGE_COUNT_MAX,
  PACKAGE_COUNT_MIN,
  WEIGHT_OPTIONS,
  hasBothAddresses,
  useSendFlow,
} from '@/lib/send-flow'
import { PriceBreakdown } from '@/components/send/PriceBreakdown'
import { VehiclePicker } from '@/components/send/VehiclePicker'
import { PickupTiming, pickupTimingIsComplete } from '@/components/send/PickupTiming'
import { useVehicleQuotes } from '@/components/send/useVehicleQuotes'
import { vehicleById } from '@/components/send/vehicles'

// Step 2 â€” packages, vehicle and live price.

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= PACKAGE_COUNT_MIN}
        aria-label="One fewer package"
        className="h-12 w-12 rounded-full border-[1.5px] border-[#e3dfe8] bg-white text-[22px] font-bold leading-none text-brand-600 transition-colors hover:bg-[#faf7fd] disabled:cursor-not-allowed disabled:text-[#c9c3d0] disabled:hover:bg-white"
      >
        âˆ’
      </button>
      <div
        className="min-w-[32px] text-center text-[20px] font-extrabold text-[#17131c]"
        aria-live="polite"
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= PACKAGE_COUNT_MAX}
        aria-label="One more package"
        className="h-12 w-12 rounded-full border-[1.5px] border-[#e3dfe8] bg-white text-[22px] font-bold leading-none text-brand-600 transition-colors hover:bg-[#faf7fd] disabled:cursor-not-allowed disabled:text-[#c9c3d0] disabled:hover:bg-white"
      >
        +
      </button>
    </div>
  )
}

export default function SendDetailsPage() {
  const router = useRouter()
  const flow = useSendFlow()

  const complete = hasBothAddresses(flow)

  // Precondition guard.
  //
  // Waits for `hydrated` â€” sessionStorage cannot be read during render, so on
  // the first frame the addresses are always absent and redirecting there would
  // bounce every refresh straight back to step 1.
  //
  // `replace`, not `push`: a guard redirect must not add a history entry, or
  // the back button lands the customer on a page that immediately forwards them
  // again, trapping them.
  useEffect(() => {
    if (flow.hydrated && !complete) {
      router.replace('/send')
    }
  }, [flow.hydrated, complete, router])

  // Scheduled pickups must resolve to a future instant before payment.
  const timingReady = pickupTimingIsComplete(flow)

  const { quotes, unavailable, status, distanceKm } = useVehicleQuotes({
    pickup: flow.pickup,
    dropoff: flow.dropoff,
    packageCount: flow.packageCount,
    weight: flow.weight,
  })

  if (!flow.hydrated || !complete) {
    return (
      <div className="px-6 py-16 text-center text-[15px] text-[#5f5868] sm:px-8">
        Loading your detailsâ€¦
      </div>
    )
  }

  const vehicle = vehicleById(flow.vehicle)
  const quote = quotes[flow.vehicle] ?? null
  const weightLabel = WEIGHT_OPTIONS.find(
    (option) => option.id === flow.weight,
  )?.label

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
      <div className="px-6 py-8 sm:px-8">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[#17131c]">
          Details and vehicle
        </h1>
        {/* Addresses only â€” no distance here. Distance comes from the quote and
            is shown with the fare, where it is a real number. */}
        <p className="mt-2 text-[15px] text-[#5f5868]">
          {flow.pickup.address} â†’ {flow.dropoff.address}
        </p>

        <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border-[1.5px] border-[#eeebf1] px-4 py-4 sm:px-5">
          <div>
            <div className="text-[15px] font-bold text-[#17131c]">
              Number of packages
            </div>
            <div className="mt-0.5 text-[13px] text-[#5f5868]">
              Same pickup and dropoff
            </div>
          </div>
          <Stepper value={flow.packageCount} onChange={flow.setPackageCount} />
        </div>

        <div className="mb-3 text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]">
          VEHICLE
        </div>
        <VehiclePicker
          selected={flow.vehicle}
          onSelect={flow.setVehicle}
          quotes={quotes}
          unavailable={unavailable}
          distanceKm={distanceKm}
          status={status}
        />

        <label className="mt-6 block max-w-[420px]">
          <span className="mb-2.5 block text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]">
            PACKAGE WEIGHT
          </span>
          <select
            value={flow.weight}
            onChange={(event) => flow.setWeight(event.target.value)}
            className="w-full appearance-none rounded-xl border-[1.5px] border-[#e3dfe8] bg-white px-4 py-3.5 text-[16px] font-semibold text-[#17131c] focus:border-brand-600 focus:outline-none focus:ring-0"
          >
            {WEIGHT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-[13px] text-[#5f5868]">
            Heavier packages may add a handling charge.
          </span>
        </label>

        {/* Pickup timing sits with the other delivery choices rather than on the
            address step: it is an option about the delivery, not part of naming
            where it goes. Default is ASAP, so a customer who ignores it keeps the
            existing instant flow untouched. */}
        <div className="mt-8">
          <PickupTiming
            pickupTiming={flow.pickupTiming}
            scheduledDate={flow.scheduledDate}
            scheduledTime={flow.scheduledTime}
            scheduledPickupAt={flow.scheduledPickupAt}
            onTimingChange={flow.setPickupTiming}
            onScheduleChange={flow.setScheduledPickup}
          />
        </div>
      </div>

      <div className="flex flex-col border-t border-[#f0eef2] bg-[#faf7fd] px-6 py-8 sm:px-8 lg:border-l lg:border-t-0">
        {quote ? (
          <PriceBreakdown
            quote={quote}
            vehicleName={vehicle.name}
            packageCount={flow.packageCount}
            weightLabel={weightLabel}
          />
        ) : (
          <div>
            <div className="text-[12px] font-extrabold tracking-[0.1em] text-[#8d8695]">
              FARE ESTIMATE
            </div>
            {/* "Please try again shortly" is only true of a transient
                failure. When the backend has specifically REFUSED this vehicle
                â€” bike over its 10 km cap â€” retrying can never succeed, and
                telling someone to wait leaves them on a dead end with no hint
                that another vehicle would work. Say which it is. */}
            <p className="mt-3 text-[15px] text-[#5f5868]">
              {status === 'loading' || status === 'idle'
                ? 'Calculating your priceâ€¦'
                : unavailable[flow.vehicle]
                  ? `${vehicleById(flow.vehicle).name} canâ€™t take this trip. Choose another vehicle above to see its price.`
                  : 'We couldnâ€™t price this route right now. Please try again shortly.'}
            </p>
          </div>
        )}

        <div className="mt-auto pt-6">
          {/* Enabled only with a real quote in hand â€” continuing without one
              would land on the payment step with nothing to charge for.
              A scheduled pickup must also be RESOLVED and still in the future:
              the backend rejects scheduled_pickup without a future pickUpTime,
              and discovering that after the card is charged is the failure mode
              this whole step exists to avoid. */}
          {quote && timingReady ? (
            <Link
              href="/send/pay"
              className="block w-full rounded-xl bg-brand-600 px-5 py-4 text-center text-[16px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Continue to payment
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-[#ece7f1] px-5 py-4 text-[16px] font-bold text-[#9b93a5]"
            >
              Continue to payment
            </button>
          )}

          {quote && !timingReady && (
            <p className="mt-2 text-center text-[13px] text-[#5f5868]" role="status">
              Choose a future pickup date and time to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
