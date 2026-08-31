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
export function DropBatchQuoteCard({ senderPays, selected, onSelect }) {
  return (
    <div
      className={`rounded-2xl border-[1.5px] bg-white transition-colors ${
        selected
          ? 'border-brand-600 ring-2 ring-brand-100'
          : 'border-[#e3dfe8] hover:border-brand-300'
      }`}
    >
      <label className="block cursor-pointer p-5">
        <div className="flex items-start gap-3">
          <input
            type="radio"
            name="pricing-mode"
            value="dropbatch"
            checked={selected}
            onChange={onSelect}
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
              <div className="text-[22px] font-extrabold tracking-[-0.01em] text-[#17131c]">
                {formatMoney(senderPays)}
              </div>
            </div>

            <p className="mt-2 max-w-[52ch] text-[15px] text-[#5f5868]">
              Your price does not depend on a driver already being assigned. After
              booking, eligible Druppr drivers can accept the scheduled job quickly
              when it fits, or it may take longer while drivers look for deliveries
              heading in the same direction.
            </p>
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
