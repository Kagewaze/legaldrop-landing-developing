import Link from 'next/link'

import { formatMoney } from '@/components/send/PriceBreakdown'

// A backend-authoritative DropBatch price — shown for comparison only.
//
// ⚠️ INFORMATIONAL BY CONSTRUCTION, NOT A DISABLED CONTROL.
// There is no verified App Store, Play Store, download or deep-link destination
// anywhere in this repository, and the public quote deliberately carries no order id
// or payment authority, so the web cannot book the quoted delivery. A button would
// therefore be a dead control, and a greyed-out one would imply
// the flow exists and is merely unavailable.
//
// So this renders as a <section>, not a <button>: no onClick, no role="button", no
// tabIndex, no aria-disabled. Nothing here is focusable, because nothing here does
// anything. Add a CTA only when a verified destination exists.
//
// ⚠️ DROPBATCH IS A DELIVERY MODE, NOT A VEHICLE. It is deliberately outside
// VehiclePicker: putting it among sedan/SUV/minivan would make it selectable-looking
// and imply it can be checked out like the others. Standard vehicle selection and
// checkout are completely unaffected by this card's presence.
//
// ⚠️ CLAIMS ARE BOUNDED. senderPays is the only figure shown — never driverEarns,
// platformFee or any breakdown component. It is never called cheapest, discounted or
// best value, and no saving is computed, even when it happens to be lower than the
// standard fare. The price is stated; the customer compares.
export function DropBatchQuoteCard({ senderPays }) {
  return (
    <section
      aria-labelledby="dropbatch-quote-heading"
      className="mt-8 rounded-2xl border-[1.5px] border-[#e3dfe8] bg-white p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="dropbatch-quote-heading"
          className="text-[13px] font-extrabold tracking-[0.08em] text-[#8d8695]"
        >
          DROPBATCH · LONG-DISTANCE OPTION
        </h2>
        {/* Price and label sit together so the figure is never read without the mode
            it belongs to. */}
        <div className="text-[22px] font-extrabold tracking-[-0.01em] text-[#17131c]">
          {formatMoney(senderPays)}
        </div>
      </div>

      <p className="mt-2 max-w-[52ch] text-[15px] text-[#5f5868]">
        Scheduled long-distance pricing for a delivery that will be posted to
        eligible Druppr drivers after booking. No driver is required before you
        receive this price.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#f0eef2] pt-3 text-[13px] font-semibold">
        <Link className="text-brand-700 underline-offset-4 hover:underline" href="/drop-batch">
          Learn about DropBatch
        </Link>
        <Link className="text-brand-700 underline-offset-4 hover:underline" href="/drop-batch/request">
          Get DropBatch price
        </Link>
      </div>
    </section>
  )
}
