import Link from 'next/link'

import { formatMoney } from '@/components/send/PriceBreakdown'

// A backend-authoritative DropBatch quote rendered as an explicit pricing-mode
// choice. It remains outside VehiclePicker because it is a service mode, not a
// vehicle. Selection carries no amount; both payment and order are re-priced by
// the backend from pricingMode and shipment inputs.
//
// ⚠️ CLAIMS ARE BOUNDED. senderPays is the only figure shown — never driverEarns,
// platformFee or any breakdown component. It is never called cheapest, discounted or
// best value, and no saving is computed, even when it happens to be lower than the
// standard fare. The price is stated; the customer compares.
const UNAVAILABLE_COPY = {
  below_minimum_distance: 'Available for routes of 80 km or more.',
  unsupported_vehicle: 'The selected vehicle is not eligible for DropBatch.',
  schedule_incomplete:
    'Choose a future pickup date and time to price scheduled DropBatch.',
  network_failure:
    'DropBatch pricing is unavailable right now. Standard delivery remains available.',
}

export function DropBatchQuoteCard({
  senderPays,
  selected,
  onSelect,
  status,
  reason,
  pickupTiming,
}) {
  const eligible = Number.isFinite(senderPays)
  const loading = status === 'loading'

  return (
    <div
      className={`rounded-2xl border-[1.5px] bg-white transition-colors ${
        selected
          ? 'border-brand-600 ring-2 ring-brand-100'
          : 'border-[#e3dfe8] hover:border-brand-300'
      }`}
    >
      <label
        className={`block p-5 ${eligible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="pricing-mode"
            value="dropbatch"
            checked={selected}
            onChange={onSelect}
            disabled={!eligible}
            className="mt-1 h-5 w-5 shrink-0 accent-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                id="dropbatch-quote-heading"
                className="text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]"
              >
                DROPBATCH · LONG-DISTANCE OPTION
              </h2>
              <div className="text-right text-[18px] font-extrabold tracking-[-0.01em] text-[#17131c] sm:text-[22px]">
                {eligible
                  ? formatMoney(senderPays)
                  : loading
                    ? 'Calculating…'
                    : 'Not available'}
              </div>
            </div>

            <p className="mt-2 max-w-[52ch] text-[15px] text-[#5f5868]">
              {eligible
                ? pickupTiming === 'scheduled'
                  ? 'Choose your preferred pickup time. Eligible drivers can accept the delivery ahead of pickup when the route fits.'
                  : 'Your delivery is posted to eligible Druppr drivers immediately after booking. A driver may accept quickly when the route fits, but pickup and delivery may take longer while drivers look for deliveries heading in the same direction.'
                : loading
                  ? 'Checking the authoritative DropBatch price for this route.'
                  : UNAVAILABLE_COPY[reason] ??
                    'DropBatch is unavailable for these delivery details. Standard delivery remains available.'}
            </p>
            {eligible && (
              <p className="mt-2 text-[13px] text-[#756d7e]">
                Your price does not depend on a driver already being assigned.
                Driver acceptance is not guaranteed.
              </p>
            )}
          </div>
        </div>
      </label>

      <div className="mx-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#f0eef2] py-3 text-[13px] font-semibold">
        <Link className="text-brand-700 underline-offset-4 hover:underline" href="/drop-batch">
          Learn about DropBatch
        </Link>
        <Link className="text-brand-700 underline-offset-4 hover:underline" href="/drop-batch/request">
          Get DropBatch price
        </Link>
      </div>
    </div>
  )
}
